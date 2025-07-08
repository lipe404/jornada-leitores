class LiteraryMap {
  constructor() {
    this.map = null;
    this.markers = [];
    this.books = [];
    this.currentFilter = "all";
    this.currentPeriod = "all";
    this.coordinates = this.initializeCoordinates();
    this.isLoading = false;
    this.init();
  }

  // Mapeamento de locais para coordenadas
  initializeCoordinates() {
    return {
      // Países principais
      Brasil: [-47.8825, -15.7942],
      "Estados Unidos": [-95.7129, 39.0458],
      "Reino Unido": [-0.1276, 51.5074],
      França: [2.3522, 48.8566],
      Alemanha: [10.4515, 51.1657],
      Espanha: [-3.7038, 40.4168],
      Portugal: [-9.1393, 38.7223],
      Rússia: [37.6173, 55.7558],
      "Áustria-Hungria": [14.4378, 50.0755],
      "República Tcheca": [14.4378, 50.0755],
      Irlanda: [-8.2439, 53.4129],
      Hungria: [19.5033, 47.1625],
      Moçambique: [35.5296, -18.6657],
      Colômbia: [-74.2973, 4.5709],
      "Grécia Antiga": [21.8243, 39.0742],

      // Cidades específicas
      "Nova York": [-74.0059, 40.7128],
      Londres: [-0.1276, 51.5074],
      Paris: [2.3522, 48.8566],
      "Rio de Janeiro": [-43.1729, -22.9068],
      "Salvador, Bahia": [-38.5014, -12.9714],
      Praga: [14.4378, 50.0755],
      Budapeste: [19.0402, 47.4979],
      Alabama: [-86.7916, 32.3617],
      "Yorkshire, Inglaterra": [-1.0873, 54.0633],
      Yorkshire: [-1.0873, 54.0633],
      "Verona, Itália": [10.9916, 45.4384],
      Cuba: [-77.7812, 21.5218],
      Argélia: [1.6596, 28.0339],
      Bahia: [-41.9015, -12.5797],
      Antártica: [0, -90],
      "Bangu, Rio de Janeiro": [-43.4654, -22.8786],
      "Itaguaí, RJ": [-43.7751, -22.852],
      "Nordeste do Brasil": [-40.3, -8.0],
      "Belo Horizonte": [-43.9378, -19.9208],
      "São Petersburgo": [30.3351, 59.9311],
      Escócia: [-4.2026, 56.4907],
      Missouri: [-91.8318, 38.5767],
      Califórnia: [-119.4179, 36.7783],
      "Carolina do Norte": [-79.0193, 35.7596],
      Alasca: [-154.0685, 64.0685],
      Atlântico: [-30.0, 0.0],
      "Lisboa / Jerusalém": [-9.1393, 38.7223],
      "Sertão de Minas Gerais": [-45.0, -18.0],
      "Long Island, Nova York": [-73.209, 40.7891],
      "Atenas / floresta mágica": [23.7275, 37.9838],
      "Mar Mediterrâneo / Grécia": [21.8243, 39.0742],
      "Macondo (ficcional)": [-74.2973, 4.5709], // Colômbia
      "Transilvânia / Londres": [25.0, 46.0],

      // Locais ficcionais (usando coordenadas simbólicas baseadas no país do autor)
      "Inglaterra (ficcional)": [-0.1276, 51.5074],
      Inglaterra: [-0.1276, 51.5074],
      "Planeta do Pequeno Príncipe (ficcional)": [2.3522, 48.8566],
      "Futuro distópico (ficcional)": [-95.7129, 39.0458],
      "País das Maravilhas (ficcional)": [-0.1276, 51.5074],
      "Terra Média (ficcional)": [-0.1276, 51.5074],
      "Florin (ficcional)": [-95.7129, 39.0458],
      "Reino fictício": [-0.1276, 51.5074],
      "Universo (ficcional)": [-0.1276, 51.5074],
      "Futuro (ficcional)": [-95.7129, 39.0458],
      "Ilha desabitada (ficcional)": [-0.1276, 51.5074],
      "Casa da Coraline (ficcional)": [-0.1276, 51.5074],
      "França (ficcional)": [2.3522, 48.8566],
      "Cidade não nomeada (ficcional)": [-9.1393, 38.7223],
      "Cidade sem nome (ficcional)": [-9.1393, 38.7223],
      "Praga (ficcional)": [14.4378, 50.0755],
      "Estados Unidos / mitologia grega": [-95.7129, 39.0458],
      "Mediterrâneo (Segunda Guerra Mundial)": [15.0, 35.0],
      "Islândia/Subsolo terrestre (ficcional)": [-19.0208, 64.9631],
      "Suíça / Alemanha / Reino Unido": [8.2275, 46.8182],
      Global: [0, 0],
      "Diversos lugares do mundo": [0, 0],
      Ficcional: [0, 0],
    };
  }

  async init() {
    this.showLoading();
    try {
      await this.loadBooks();
      this.initMap();
      this.setupControls();
      this.addMarkersToMap();
      this.updateMapStats();
    } catch (error) {
      this.showError("Erro ao inicializar o mapa. Tente recarregar a página.");
    } finally {
      this.hideLoading();
    }
  }

  showLoading() {
    this.isLoading = true;
    const mapContainer = document.getElementById("literaryMap");
    mapContainer.innerHTML = `
            <div class="map-loading">
                <div class="loading-spinner"></div>
                <p>Carregando atlas literário...</p>
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
                <h3>Erro ao carregar mapa</h3>
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

      // Processar dados do JSON
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
    // Primeiro tenta encontrar por local específico
    if (this.coordinates[location]) {
      return this.coordinates[location];
    }

    // Se não encontrar, usa o país
    if (this.coordinates[country]) {
      return this.coordinates[country];
    }

    // Fallback para coordenadas padrão
    console.warn(`Coordenadas não encontradas para: ${location}, ${country}`);
    return [0, 0];
  }

  initMap() {
    // Verificar se o container existe
    const mapContainer = document.getElementById("literaryMap");
    if (!mapContainer) {
      throw new Error("Container do mapa não encontrado");
    }

    // Limpar container
    mapContainer.innerHTML = "";

    // Inicializar o mapa centrado no mundo
    this.map = L.map("literaryMap", {
      zoomControl: false,
      attributionControl: true,
    }).setView([20, 0], 2);

    // Adicionar camada do mapa com estilo personalizado
    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
      {
        attribution: "© OpenStreetMap contributors, © CARTO",
        maxZoom: 18,
        minZoom: 2,
      }
    ).addTo(this.map);

    // Adicionar controles personalizados
    L.control
      .zoom({
        position: "topright",
      })
      .addTo(this.map);

    // Adicionar controle de escala
    L.control
      .scale({
        position: "bottomleft",
      })
      .addTo(this.map);

    // Configurar limites do mapa
    this.map.setMaxBounds([
      [-90, -180],
      [90, 180],
    ]);
  }

  setupControls() {
    const categoryFilter = document.getElementById("categoryFilter");
    const periodFilter = document.getElementById("periodFilter");

    if (categoryFilter) {
      categoryFilter.addEventListener("change", (e) => {
        this.currentFilter = e.target.value;
        this.updateMapMarkers();
      });
    }

    if (periodFilter) {
      periodFilter.addEventListener("change", (e) => {
        this.currentPeriod = e.target.value;
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

    // Ajustar visualização inicial
    if (this.markers.length > 0) {
      const group = new L.featureGroup(this.markers.map((m) => m.marker));
      this.map.fitBounds(group.getBounds().pad(0.1));
    }
  }

  createMarker(book) {
    // Determinar categoria principal do livro
    const category = this.getPrimaryCategory(book.collections);
    const markerColor = this.getMarkerColor(category);

    // Criar ícone personalizado
    const customIcon = L.divIcon({
      className: "custom-marker",
      html: `
                <div class="marker-pin ${category}" style="background-color: ${markerColor};">
                    <div class="marker-icon">📚</div>
                    <div class="marker-pulse"></div>
                </div>
            `,
      iconSize: [30, 30],
      iconAnchor: [15, 30],
    });

    // Criar marcador
    const marker = L.marker([book.coordinates[1], book.coordinates[0]], {
      icon: customIcon,
      title: book.title,
    }).addTo(this.map);

    // Criar popup rico
    const popupContent = this.createPopupContent(book);
    marker.bindPopup(popupContent, {
      maxWidth: 300,
      className: "custom-popup",
    });

    // Adicionar eventos
    marker.on("click", () => {
      this.showBookDetails(book);
      this.highlightMarker(marker);
    });

    marker.on("mouseover", () => {
      marker.openTooltip();
    });

    // Tooltip simples
    marker.bindTooltip(
      `
            <strong>${book.title}</strong><br>
            ${book.author} (${book.year})
        `,
      {
        direction: "top",
        offset: [0, -30],
      }
    );

    return marker;
  }

  createPopupContent(book) {
    const collections = book.collections
      .map(
        (col) =>
          `<span class="popup-collection ${this.getCollectionClass(
            col
          )}">${col}</span>`
      )
      .join("");

    return `
            <div class="custom-popup">
                <div class="popup-header">
                    <div class="popup-title">${book.title}</div>
                    <div class="popup-collections">${collections}</div>
                </div>
                <div class="popup-body">
                    <div class="popup-author">
                        <span class="popup-icon">✍️</span>
                        ${book.author}
                    </div>
                    <div class="popup-year">
                        <span class="popup-icon">📅</span>
                        ${book.year}
                    </div>
                    <div class="popup-location">
                        <span class="popup-icon">📍</span>
                        ${book.location}
                    </div>
                    <div class="popup-country">
                        <span class="popup-icon">🌍</span>
                        ${book.country}
                    </div>
                </div>
                <div class="popup-footer">
                    <button class="popup-btn" onclick="window.literaryMap.focusOnBook(${book.id})">
                        Ver Detalhes
                    </button>
                </div>
            </div>
        `;
  }

  getPrimaryCategory(collections) {
    // Prioridade: Clube Principal > VPLN > OPECA
    if (collections.includes("Clube Principal")) return "main";
    if (collections.includes("VPLN")) return "vpln";
    if (collections.includes("OPECA")) return "opeca";
    return "main";
  }

  getCollectionClass(collection) {
    const classMap = {
      "Clube Principal": "main",
      VPLN: "vpln",
      OPECA: "opeca",
    };
    return classMap[collection] || "default";
  }

  getMarkerColor(category) {
    const colors = {
      main: "#e74c3c",
      vpln: "#3498db",
      opeca: "#2ecc71",
    };
    return colors[category] || "#95a5a6";
  }

  highlightMarker(selectedMarker) {
    // Reset all markers
    this.markers.forEach(({ marker }) => {
      marker.getElement()?.classList.remove("highlighted");
    });

    // Highlight selected marker
    selectedMarker.getElement()?.classList.add("highlighted");
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
                <div class="detail-header">
                    <h4>${book.title}</h4>
                    <div class="detail-collections">${collections}</div>
                </div>
                <div class="detail-body">
                    <div class="detail-row">
                        <span class="detail-icon">✍️</span>
                        <div>
                            <strong>Autor:</strong>
                            <span>${book.author}</span>
                        </div>
                    </div>
                    <div class="detail-row">
                        <span class="detail-icon">📅</span>
                        <div>
                            <strong>Ano:</strong>
                            <span>${book.year}</span>
                        </div>
                    </div>
                    <div class="detail-row">
                        <span class="detail-icon">📍</span>
                        <div>
                            <strong>Local:</strong>
                            <span>${book.location}</span>
                        </div>
                    </div>
                    <div class="detail-row">
                        <span class="detail-icon">🌍</span>
                        <div>
                            <strong>País:</strong>
                            <span>${book.country}</span>
                        </div>
                    </div>
                    <div class="detail-row">
                        <span class="detail-icon">🏷️</span>
                        <div>
                            <strong>Década:</strong>
                            <span>${Math.floor(book.year / 10) * 10}s</span>
                        </div>
                    </div>
                </div>
                <div class="detail-actions">
                    <button class="detail-btn" onclick="window.literaryMap.centerOnBook(${
                      book.id
                    })">
                        <span>📍</span>
                        Centralizar no Mapa
                    </button>
                </div>
            </div>
        `;
  }

  focusOnBook(bookId) {
    const book = this.books.find((b) => b.id === bookId);
    if (!book) return;

    this.showBookDetails(book);
    this.centerOnBook(bookId);
  }

  centerOnBook(bookId) {
    const book = this.books.find((b) => b.id === bookId);
    if (!book) return;

    const markerData = this.markers.find((m) => m.book.id === bookId);
    if (markerData) {
      this.map.setView([book.coordinates[1], book.coordinates[0]], 8);
      markerData.marker.openPopup();
      this.highlightMarker(markerData.marker);
    }
  }

  updateMapMarkers() {
    // Remover todos os marcadores
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

    if (this.currentPeriod !== "all") {
      filteredBooks = this.filterByPeriod(filteredBooks, this.currentPeriod);
    }

    // Adicionar novos marcadores
    filteredBooks.forEach((book) => {
      const marker = this.createMarker(book);
      this.markers.push({ marker, book });
    });

    // Ajustar visualização se houver marcadores
    if (this.markers.length > 0) {
      const group = new L.featureGroup(this.markers.map((m) => m.marker));
      this.map.fitBounds(group.getBounds().pad(0.1));
    }

    // Atualizar estatísticas
    this.updateMapStats();
  }

  filterByPeriod(books, period) {
    switch (period) {
      case "classic":
        return books.filter((book) => book.year <= 1900);
      case "modern":
        return books.filter((book) => book.year > 1900 && book.year <= 1950);
      case "contemporary":
        return books.filter((book) => book.year > 1950);
      default:
        return books;
    }
  }

  updateMapStats() {
    // Atualizar informações na sidebar se não houver livro selecionado
    const detailsContainer = document.getElementById("bookDetails");
    if (
      !detailsContainer ||
      detailsContainer.innerHTML.includes("Clique em um marcador")
    ) {
      const stats = this.getMapStats();
      detailsContainer.innerHTML = `
                <div class="map-stats">
                    <h4>Estatísticas do Mapa</h4>
                    <div class="stats-grid">
                        <div class="stat-item">
                            <span class="stat-number">${stats.totalBooks}</span>
                            <span class="stat-label">Livros no Mapa</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-number">${stats.countries}</span>
                            <span class="stat-label">Países</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-number">${stats.yearRange}</span>
                            <span class="stat-label">Período</span>
                        </div>
                    </div>
                    <p class="stats-description">
                        Clique em qualquer marcador para explorar os detalhes do livro e descobrir sua localização na história literária mundial.
                    </p>
                </div>
            `;
    }
  }

  getMapStats() {
    const visibleBooks = this.markers.map((m) => m.book);
    const countries = new Set(visibleBooks.map((book) => book.country));
    const years = visibleBooks.map((book) => book.year);
    const minYear = Math.min(...years);
    const maxYear = Math.max(...years);

    return {
      totalBooks: visibleBooks.length,
      countries: countries.size,
      yearRange: years.length > 0 ? `${minYear} - ${maxYear}` : "0",
    };
  }
}

// Tornar a instância globalmente acessível para os botões
window.literaryMap = null;

// Inicializar o mapa quando a página carregar
document.addEventListener("DOMContentLoaded", () => {
  window.literaryMap = new LiteraryMap();
});
