class LiteraryMap {
  constructor() {
    this.map = null;
    this.markers = [];
    this.books = [];
    this.currentFilter = "all";
    this.currentPeriod = "all";
    this.init();
  }

  async init() {
    await this.loadBooks();
    this.initMap();
    this.setupControls();
    this.addMarkersToMap();
  }

  async loadBooks() {
    try {
      // Se data.js estiver carregado, usar os dados de lá
      if (typeof getAllBooks !== "undefined") {
        this.books = getAllBooks();
      } else {
        // Fallback: carregar do arquivo JSON
        const response = await fetch("../data/books.json");
        const data = await response.json();
        this.books = [...data.clubBooks, ...data.vpln, ...data.opeca];
      }
    } catch (error) {
      console.error("Erro ao carregar livros:", error);
      Utils.showNotification("Erro ao carregar dados dos livros", "error");
    }
  }

  initMap() {
    // Inicializar o mapa centrado no mundo
    this.map = L.map("literaryMap").setView([20, 0], 2);

    // Adicionar camada do mapa
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
      maxZoom: 18,
    }).addTo(this.map);

    // Personalizar controles do mapa
    this.map.zoomControl.setPosition("topright");
  }

  setupControls() {
    const categoryFilter = document.getElementById("categoryFilter");
    const periodFilter = document.getElementById("periodFilter");

    categoryFilter.addEventListener("change", (e) => {
      this.currentFilter = e.target.value;
      this.updateMapMarkers();
    });

    periodFilter.addEventListener("change", (e) => {
      this.currentPeriod = e.target.value;
      this.updateMapMarkers();
    });
  }

  addMarkersToMap() {
    this.books.forEach((book) => {
      const marker = this.createMarker(book);
      this.markers.push({ marker, book });
    });
  }

  createMarker(book) {
    // Definir cor do marcador baseado na categoria
    const markerColor = this.getMarkerColor(book.category);

    // Criar ícone personalizado
    const customIcon = L.divIcon({
      className: "custom-marker",
      html: `<div class="marker-pin ${book.category}" style="background-color: ${markerColor};">
                     <div class="marker-icon">📚</div>
                   </div>`,
      iconSize: [30, 30],
      iconAnchor: [15, 30],
    });

    // Criar marcador
    const marker = L.marker([book.coordinates[1], book.coordinates[0]], {
      icon: customIcon,
    }).addTo(this.map);

    // Criar popup
    const popupContent = `
            <div class="custom-popup">
                <div class="popup-title">${book.title}</div>
                <div class="popup-author">${book.author}</div>
                <div class="popup-year">${book.year}</div>
                <div class="popup-country">${book.country}</div>
            </div>
        `;

    marker.bindPopup(popupContent);

    // Adicionar evento de clique para mostrar detalhes na sidebar
    marker.on("click", () => {
      this.showBookDetails(book);
    });

    return marker;
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

    detailsContainer.innerHTML = `
            <div class="book-detail-card">
                <h4>${book.title}</h4>
                <div class="author">${book.author}</div>
                <div class="year">${book.year}</div>
                <div class="country">${book.country}</div>
                <div class="category">Categoria: ${this.getCategoryName(
                  book.category
                )}</div>
            </div>
        `;
  }

  getCategoryName(category) {
    const names = {
      main: "Clube Principal",
      vpln: "VPLN",
      opeca: "OPECA",
    };
    return names[category] || category;
  }

  updateMapMarkers() {
    // Remover todos os marcadores
    this.markers.forEach(({ marker }) => {
      this.map.removeLayer(marker);
    });
    this.markers = [];

    // Filtrar livros
    let filteredBooks = this.books;

    if (this.currentFilter !== "all") {
      filteredBooks = filteredBooks.filter(
        (book) => book.category === this.currentFilter
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
}

// CSS adicional para os marcadores personalizados
const mapStyles = `
    .custom-marker {
        background: transparent;
        border: none;
    }

    .marker-pin {
        width: 30px;
        height: 30px;
        border-radius: 50%;
        border: 3px solid white;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 10px rgba(0,0,0,0.3);
        cursor: pointer;
        transition: transform 0.2s ease;
    }

    .marker-pin:hover {
        transform: scale(1.1);
    }

    .marker-icon {
        font-size: 14px;
    }

    .leaflet-popup-content-wrapper {
        border-radius: 10px;
        box-shadow: 0 5px 20px rgba(0,0,0,0.2);
    }

    .custom-popup {
        font-family: 'Inter', sans-serif;
        min-width: 200px;
    }

    .popup-title {
        font-family: 'Playfair Display', serif;
        font-size: 1.1rem;
        font-weight: 700;
        color: var(--primary-color);
        margin-bottom: 0.5rem;
    }

    .popup-author {
        font-weight: 600;
        color: var(--secondary-color);
        margin-bottom: 0.25rem;
    }

    .popup-year {
        background: var(--accent-color);
        color: white;
        padding: 0.2rem 0.6rem;
        border-radius: 12px;
        font-size: 0.8rem;
        display: inline-block;
        margin-bottom: 0.25rem;
    }

    .popup-country {
        color: #666;
        font-style: italic;
        font-size: 0.9rem;
    }
`;

// Adicionar estilos específicos do mapa
const mapStyleSheet = document.createElement("style");
mapStyleSheet.textContent = mapStyles;
document.head.appendChild(mapStyleSheet);

// Inicializar o mapa quando a página carregar
document.addEventListener("DOMContentLoaded", () => {
  new LiteraryMap();
});
