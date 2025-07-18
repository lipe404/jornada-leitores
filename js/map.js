class LiteraryMap {
  constructor() {
    this.map = null;
    this.markers = [];
    this.books = [];
    this.currentFilter = "all";
    this.coordinates = this.initializeCoordinates();
    this.isLoading = false;
    this.isMobile = window.innerWidth <= 768;
    this.sidebarOpen = !this.isMobile;
    this.init();
  }

  // Coordenadas simplificadas (mantém as principais)
  initializeCoordinates() {
    return {
      Brasil: [-47.8825, -15.7942],
      "Estados Unidos": [-95.7129, 39.0458],
      "Reino Unido": [-0.1276, 51.5074],
      França: [2.3522, 48.8566],
      Alemanha: [10.4515, 51.1657],
      Espanha: [-3.7038, 40.4168],
      Portugal: [-9.1393, 38.7223],
      Rússia: [37.6173, 55.7558],
      "República Tcheca": [14.4378, 50.0755],
      Irlanda: [-8.2439, 53.4129],
      Hungria: [19.5033, 47.1625],
      Moçambique: [35.5296, -18.6657],
      Colômbia: [-74.2973, 4.5709],
      "Grécia Antiga": [21.8243, 39.0742],
      Londres: [-0.1276, 51.5074],
      Paris: [2.3522, 48.8566],
      "Rio de Janeiro": [-43.1729, -22.9068],
      "Salvador, Bahia": [-38.5014, -12.9714],
      Praga: [14.4378, 50.0755],
      Budapeste: [19.0402, 47.4979],
      Alabama: [-86.7916, 32.3617],
      Yorkshire: [-1.0873, 54.0633],
      Cuba: [-77.7812, 21.5218],
      Argélia: [1.6596, 28.0339],
      Bahia: [-41.9015, -12.5797],
      "São Petersburgo": [30.3351, 59.9311],
      Escócia: [-4.2026, 56.4907],
      Missouri: [-91.8318, 38.5767],
      Califórnia: [-119.4179, 36.7783],
      // Locais ficcionais usam país do autor
      Inglaterra: [-0.1276, 51.5074],
      "Terra Média (ficcional)": [-0.1276, 51.5074],
      "País das Maravilhas (ficcional)": [-0.1276, 51.5074],
      "Macondo (ficcional)": [-74.2973, 4.5709],
    };
  }

  async init() {
    this.showLoading();
    try {
      await this.loadBooks();
      this.initMap();
      this.setupControls();
      this.addMarkersToMap();
      this.updateQuickStats();
      this.setupResponsive();
    } catch (error) {
      this.showError("Erro ao carregar o mapa. Tente recarregar a página.");
    } finally {
      this.hideLoading();
    }
  }

  setupResponsive() {
    // Controle da sidebar
    const toggleBtn = document.getElementById("toggleSidebar");
    const closeBtn = document.getElementById("closeSidebar");
    const sidebar = document.getElementById("mapSidebar");

    if (toggleBtn) {
      toggleBtn.addEventListener("click", () => this.toggleSidebar());
    }

    if (closeBtn) {
      closeBtn.addEventListener("click", () => this.closeSidebar());
    }

    // Redimensionamento da janela
    window.addEventListener("resize", () => {
      this.handleResize();
    });

    // Configuração inicial da sidebar
    this.updateSidebarState();
  }

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
    this.updateSidebarState();
  }

  closeSidebar() {
    this.sidebarOpen = false;
    this.updateSidebarState();
  }

  updateSidebarState() {
    const sidebar = document.getElementById("mapSidebar");
    const toggleBtn = document.getElementById("toggleSidebar");

    if (!sidebar || !toggleBtn) return;

    if (this.isMobile) {
      // Em mobile, sidebar vira overlay
      if (this.sidebarOpen) {
        sidebar.classList.add("open");
        this.createOverlay();
      } else {
        sidebar.classList.remove("open");
        this.removeOverlay();
      }
    } else {
      // Em desktop, sidebar desliza
      if (this.sidebarOpen) {
        sidebar.classList.remove("sidebar-hidden");
        toggleBtn.textContent = "✕ Fechar";
      } else {
        sidebar.classList.add("sidebar-hidden");
        toggleBtn.textContent = "ℹ️ Info";
      }
    }
  }

  createOverlay() {
    let overlay = document.querySelector(".sidebar-overlay");
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.className = "sidebar-overlay";
      overlay.addEventListener("click", () => this.closeSidebar());
      document.body.appendChild(overlay);
    }
    overlay.classList.add("active");
  }

  removeOverlay() {
    const overlay = document.querySelector(".sidebar-overlay");
    if (overlay) {
      overlay.classList.remove("active");
    }
  }

  handleResize() {
    const wasMobile = this.isMobile;
    this.isMobile = window.innerWidth <= 768;

    if (wasMobile !== this.isMobile) {
      // Mudou de mobile/desktop
      this.removeOverlay();
      if (!this.isMobile) {
        const sidebar = document.getElementById("mapSidebar");
        sidebar?.classList.remove("open");
      }
      this.updateSidebarState();
    }

    // Redimensionar mapa
    if (this.map) {
      setTimeout(() => this.map.invalidateSize(), 300);
    }
  }

  showLoading() {
    this.isLoading = true;
    const mapContainer = document.getElementById("literaryMap");
    mapContainer.innerHTML = `
      <div class="map-loading">
        <div class="loading-spinner"></div>
        <p>Carregando mapa...</p>
      </div>
    `;
  }

  hideLoading() {
    this.isLoading = false;
  }

  showError(message) {
    const mapContainer = document.getElementById("literaryMap");
    mapContainer.innerHTML = `
      <div class="map-error">
        <div class="error-icon">🗺️</div>
        <h3>Erro ao carregar</h3>
        <p>${message}</p>
        <button onclick="location.reload()" class="retry-btn">Tentar Novamente</button>
      </div>
    `;
  }

  async loadBooks() {
    try {
      const response = await fetch("../data/books.json");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();

      this.books = data.map((book) => ({
        id: book.id,
        title: book.titulo,
        author: book.autor,
        year: book.ano_publicacao,
        country: book.pais,
        location: book.local,
        collections: book.colecao,
        coordinates: this.getCoordinates(book.local, book.pais),
      }));

      console.log(`Mapa: ${this.books.length} livros carregados`);
    } catch (error) {
      console.error("Erro ao carregar livros:", error);
      throw error;
    }
  }

  getCoordinates(location, country) {
    if (this.coordinates[location]) {
      return this.coordinates[location];
    }
    if (this.coordinates[country]) {
      return this.coordinates[country];
    }
    console.warn(`Coordenadas não encontradas para: ${location}, ${country}`);
    return [0, 0];
  }

  initMap() {
    const mapContainer = document.getElementById("literaryMap");
    if (!mapContainer) {
      throw new Error("Container do mapa não encontrado");
    }

    mapContainer.innerHTML = "";

    this.map = L.map("literaryMap", {
      zoomControl: false,
      attributionControl: false,
    }).setView([20, 0], 2);

    // Tile layer otimizado
    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
      {
        attribution: "© CARTO",
        maxZoom: 18,
        minZoom: 2,
      }
    ).addTo(this.map);

    // Controles posicionados
    L.control.zoom({ position: "topright" }).addTo(this.map);

    this.map.setMaxBounds([
      [-90, -180],
      [90, 180],
    ]);
  }

  setupControls() {
    const categoryFilter = document.getElementById("categoryFilter");

    if (categoryFilter) {
      categoryFilter.addEventListener("change", (e) => {
        this.currentFilter = e.target.value;
        this.updateMapMarkers();
      });
    }
  }

  addMarkersToMap() {
    this.books.forEach((book) => {
      if (book.coordinates[0] !== 0 || book.coordinates[1] !== 0) {
        const marker = this.createMarker(book);
        this.markers.push({ marker, book });
      }
    });

    if (this.markers.length > 0) {
      const group = new L.featureGroup(this.markers.map((m) => m.marker));
      this.map.fitBounds(group.getBounds().pad(0.1));
    }
  }

  createMarker(book) {
    const category = this.getPrimaryCategory(book.collections);
    const markerColor = this.getMarkerColor(category);

    const customIcon = L.divIcon({
      className: "custom-marker",
      html: `
        <div class="marker-pin ${category}" style="background-color: ${markerColor};">
          <div class="marker-icon">📚</div>
        </div>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 24],
    });

    const marker = L.marker([book.coordinates[1], book.coordinates[0]], {
      icon: customIcon,
      title: book.title,
    }).addTo(this.map);

    // Popup simplificado
    const popupContent = this.createSimplePopup(book);
    marker.bindPopup(popupContent, {
      maxWidth: 250,
      className: "custom-popup",
    });

    marker.on("click", () => {
      this.showBookDetails(book);
      if (this.isMobile && !this.sidebarOpen) {
        this.toggleSidebar();
      }
    });

    return marker;
  }

  createSimplePopup(book) {
    return `
      <div class="popup-content">
        <div class="popup-title">${book.title}</div>
        <div class="popup-author">${book.author}</div>
        <div class="popup-meta">
          <span class="popup-year">${book.year}</span>
        </div>
        <div class="popup-location">${book.location}</div>
      </div>
    `;
  }

  getPrimaryCategory(collections) {
    if (collections.includes("Clube Principal")) return "main";
    if (collections.includes("VPLN")) return "vpln";
    if (collections.includes("OPECA")) return "opeca";
    return "main";
  }

  getMarkerColor(category) {
    const colors = {
      main: "#e74c3c",
      vpln: "#3498db",
      opeca: "#2ecc71",
    };
    return colors[category] || "#95a5a6";
  }

  showBookDetails(book) {
    const detailsContainer = document.getElementById("bookDetails");
    if (!detailsContainer) return;

    const collections = book.collections
      .map(
        (col) =>
          `<span class="collection-tag ${this.getCollectionClass(
            col
          )}">${col}</span>`
      )
      .join("");

    detailsContainer.innerHTML = `
      <div class="book-detail-card">
        <div class="book-title">${book.title}</div>
        <div class="book-author">${book.author}</div>
        <div class="book-meta">
          <span class="meta-tag">${book.year}</span>
          <span class="meta-tag">${Math.floor(book.year / 10) * 10}s</span>
        </div>
        <div class="book-location">📍 ${book.location}, ${book.country}</div>
        <div class="book-collections">${collections}</div>
      </div>
    `;
  }

  getCollectionClass(collection) {
    const classMap = {
      "Clube Principal": "main",
      VPLN: "vpln",
      OPECA: "opeca",
    };
    return classMap[collection] || "default";
  }

  updateMapMarkers() {
    // Limpar marcadores
    this.markers.forEach(({ marker }) => {
      this.map.removeLayer(marker);
    });
    this.markers = [];

    // Filtrar livros
    let filteredBooks = this.books.filter(
      (book) => book.coordinates[0] !== 0 || book.coordinates[1] !== 0
    );

    if (this.currentFilter !== "all") {
      const filterMap = {
        main: "Clube Principal",
        vpln: "VPLN",
        opeca: "OPECA",
      };
      const collectionName = filterMap[this.currentFilter];
      filteredBooks = filteredBooks.filter((book) =>
        book.collections.includes(collectionName)
      );
    }

    // Adicionar novos marcadores
    filteredBooks.forEach((book) => {
      const marker = this.createMarker(book);
      this.markers.push({ marker, book });
    });

    if (this.markers.length > 0) {
      const group = new L.featureGroup(this.markers.map((m) => m.marker));
      this.map.fitBounds(group.getBounds().pad(0.1));
    }

    this.updateQuickStats();
  }

  updateQuickStats() {
    const statsContainer = document.getElementById("quickStats");
    if (!statsContainer) return;

    const visibleBooks = this.markers.map((m) => m.book);
    const countries = new Set(visibleBooks.map((book) => book.country));

    statsContainer.innerHTML = `
      <div class="quick-stats">
        <div class="stats-row">
          <span class="stats-label">Livros no mapa:</span>
          <span class="stats-value">${visibleBooks.length}</span>
        </div>
        <div class="stats-row">
          <span class="stats-label">Países:</span>
          <span class="stats-value">${countries.size}</span>
        </div>
      </div>
    `;
  }
}

// Inicializar
window.literaryMap = null;

document.addEventListener("DOMContentLoaded", () => {
  window.literaryMap = new LiteraryMap();
});
