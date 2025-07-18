class LiteraryTimeline {
  constructor() {
    this.container = document.getElementById("timelineContainer");
    this.books = [];
    this.filteredBooks = [];
    this.currentFilter = "all";
    this.isLoading = false;
    this.backToTopButton = null; // Nova propriedade
    this.init();
  }

  async init() {
    this.showLoading();
    await this.loadBooks();
    this.setupFilters();
    this.createTimeline();
    this.hideLoading();
    // Inicializar botão "Voltar ao Topo"
    this.initBackToTopButton();
  }

  initBackToTopButton() {
    // Aguardar um pouco para garantir que o DOM está pronto
    setTimeout(() => {
      this.backToTopButton = new BackToTopButton();
    }, 100);
  }

  showLoading() {
    this.isLoading = true;
    this.container.innerHTML = `
            <div class="timeline-loading">
                <div class="loading-spinner"></div>
                <p>Carregando linha do tempo literária...</p>
            </div>
        `;
  }

  hideLoading() {
    this.isLoading = false;
  }

  async loadBooks() {
    try {
      const response = await fetch("../data/books.json");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();

      // Processar dados do JSON (que é um array direto)
      this.books = data
        .map((book) => ({
          id: book.id,
          title: book.titulo,
          author: book.autor,
          year: book.ano_publicacao,
          country: book.pais,
          location: book.local,
          collections: book.colecao,
        }))
        .sort((a, b) => a.year - b.year);

      this.filteredBooks = [...this.books];

      console.log(`Timeline: ${this.books.length} livros carregados`);
    } catch (error) {
      console.error("Erro ao carregar livros:", error);
      this.showError(
        "Erro ao carregar dados dos livros. Tente recarregar a página."
      );
    }
  }

  showError(message) {
    this.container.innerHTML = `
            <div class="timeline-error">
                <div class="error-icon">⚠️</div>
                <h3>Ops! Algo deu errado</h3>
                <p>${message}</p>
                <button onclick="location.reload()" class="retry-btn">Tentar Novamente</button>
            </div>
        `;
  }

  setupFilters() {
    const filterButtons = document.querySelectorAll(".filter-btn");

    filterButtons.forEach((button) => {
      button.addEventListener("click", (e) => {
        // Remove active class from all buttons
        filterButtons.forEach((btn) => btn.classList.remove("active"));

        // Add active class to clicked button
        e.target.classList.add("active");

        // Get filter value
        const filter = e.target.getAttribute("data-filter");
        this.currentFilter = filter;

        // Apply filter
        this.applyFilter(filter);
      });
    });
  }

  applyFilter(filter) {
    if (filter === "all") {
      this.filteredBooks = [...this.books];
    } else {
      const filterMap = {
        main: "Clube Principal",
        vpln: "VPLN",
        opeca: "OPECA",
      };

      const collectionName = filterMap[filter];
      this.filteredBooks = this.books.filter((book) =>
        book.collections.includes(collectionName)
      );
    }

    this.updateTimeline();
  }

  createTimeline() {
    if (this.filteredBooks.length === 0) {
      this.container.innerHTML = `
                <div class="timeline-empty">
                    <div class="empty-icon">📚</div>
                    <h3>Nenhum livro encontrado</h3>
                    <p>Tente selecionar um filtro diferente</p>
                </div>
            `;
      return;
    }

    const timelineHTML = this.generateTimelineHTML();
    this.container.innerHTML = `
            <div class="timeline-line"></div>
            <div class="timeline-stats">
                <div class="stat-item">
                    <span class="stat-number">${
                      this.filteredBooks.length
                    }</span>
                    <span class="stat-label">Livros</span>
                </div>
                <div class="stat-item">
                    <span class="stat-number">${this.getYearRange()}</span>
                    <span class="stat-label">Período</span>
                </div>
                <div class="stat-item">
                    <span class="stat-number">${this.getUniqueAuthors()}</span>
                    <span class="stat-label">Autores</span>
                </div>
            </div>
            ${timelineHTML}
        `;

    this.addScrollAnimations();
    this.addInteractivity();
  }

  updateTimeline() {
    // Smooth transition effect
    this.container.style.opacity = "0.5";

    setTimeout(() => {
      this.createTimeline();
      this.container.style.opacity = "1";
    }, 300);
  }

  generateTimelineHTML() {
    return this.filteredBooks
      .map((book, index) => {
        const isLeft = index % 2 === 0;
        const collections = book.collections.join(", ");
        const decade = Math.floor(book.year / 10) * 10;

        return `
                    <div class="timeline-item ${isLeft ? "left" : "right"}"
                         data-year="${book.year}"
                         data-decade="${decade}"
                         data-collections="${collections}"
                         data-book-id="${book.id}">
                        <div class="timeline-content">
                            <div class="timeline-header">
                                <div class="timeline-year">${book.year}</div>
                                <div class="timeline-collections">
                                    ${book.collections
                                      .map(
                                        (col) =>
                                          `<span class="collection-tag ${this.getCollectionClass(
                                            col
                                          )}">${col}</span>`
                                      )
                                      .join("")}
                                </div>
                            </div>
                            <h3 class="book-title">${book.title}</h3>
                            <p class="book-author">
                                <span class="author-icon">✍️</span>
                                ${book.author}
                            </p>
                            <p class="book-location">
                                <span class="location-icon">📍</span>
                                ${book.location}
                            </p>
                            <p class="book-country">
                                <span class="country-icon">🌍</span>
                                ${book.country}
                            </p>
                            <div class="timeline-actions">
                                <button class="expand-btn" data-book-id="${
                                  book.id
                                }">
                                    <span>Ver mais</span>
                                    <span class="expand-icon">↓</span>
                                </button>
                            </div>
                        </div>
                        <div class="timeline-marker" data-year="${book.year}">
                            <span class="marker-year">${book.year}</span>
                        </div>
                    </div>
                `;
      })
      .join("");
  }

  getCollectionClass(collection) {
    const classMap = {
      "Clube Principal": "main",
      VPLN: "vpln",
      OPECA: "opeca",
    };
    return classMap[collection] || "default";
  }

  getYearRange() {
    if (this.filteredBooks.length === 0) return "0";
    const years = this.filteredBooks.map((book) => book.year);
    const minYear = Math.min(...years);
    const maxYear = Math.max(...years);
    return `${minYear} até ${maxYear}`;
  }

  getUniqueAuthors() {
    const authors = new Set(this.filteredBooks.map((book) => book.author));
    return authors.size;
  }

  addScrollAnimations() {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px",
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("animate");

          // Add staggered animation delay
          const index = Array.from(entry.target.parentNode.children).indexOf(
            entry.target
          );
          entry.target.style.animationDelay = `${index * 0.1}s`;
        }
      });
    }, observerOptions);

    // Observe timeline items
    document.querySelectorAll(".timeline-item").forEach((item) => {
      observer.observe(item);
    });

    // Observe stats
    document.querySelectorAll(".timeline-stats .stat-item").forEach((item) => {
      observer.observe(item);
    });
  }

  addInteractivity() {
    // Expand buttons
    document.querySelectorAll(".expand-btn").forEach((button) => {
      button.addEventListener("click", (e) => {
        const bookId = e.target
          .closest(".expand-btn")
          .getAttribute("data-book-id");
        this.toggleBookDetails(bookId);
      });
    });

    // Timeline item hover effects
    document.querySelectorAll(".timeline-item").forEach((item) => {
      item.addEventListener("mouseenter", () => {
        item.classList.add("highlighted");
        this.highlightRelatedItems(item);
      });

      item.addEventListener("mouseleave", () => {
        item.classList.remove("highlighted");
        this.clearHighlights();
      });
    });

    // Marker click to scroll to decade
    document.querySelectorAll(".timeline-marker").forEach((marker) => {
      marker.addEventListener("click", (e) => {
        const year = e.target.getAttribute("data-year");
        this.showYearInfo(year);
      });
    });
  }

  toggleBookDetails(bookId) {
    const book = this.filteredBooks.find((b) => b.id == bookId);
    if (!book) return;

    const existingModal = document.querySelector(".book-modal");
    if (existingModal) {
      existingModal.remove();
      return;
    }

    const modal = document.createElement("div");
    modal.className = "book-modal";
    modal.innerHTML = `
            <div class="modal-backdrop" onclick="this.parentElement.remove()"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h2>${book.title}</h2>
                    <button class="modal-close" onclick="this.closest('.book-modal').remove()">×</button>
                </div>
                <div class="modal-body">
                    <div class="book-details">
                        <div class="detail-row">
                            <strong>Autor:</strong> ${book.author}
                        </div>
                        <div class="detail-row">
                            <strong>Ano de Publicação:</strong> ${book.year}
                        </div>
                        <div class="detail-row">
                            <strong>País:</strong> ${book.country}
                        </div>
                        <div class="detail-row">
                            <strong>Local da História:</strong> ${book.location}
                        </div>
                        <div class="detail-row">
                            <strong>Coleções:</strong>
                            <div class="collections-list">
                                ${book.collections
                                  .map(
                                    (col) =>
                                      `<span class="collection-tag ${this.getCollectionClass(
                                        col
                                      )}">${col}</span>`
                                  )
                                  .join("")}
                            </div>
                        </div>
                        <div class="detail-row">
                            <strong>Década:</strong> ${
                              Math.floor(book.year / 10) * 10
                            }s
                        </div>
                    </div>
                </div>
            </div>
        `;

    document.body.appendChild(modal);

    // Animate modal in
    setTimeout(() => modal.classList.add("show"), 10);
  }

  highlightRelatedItems(currentItem) {
    const decade = currentItem.getAttribute("data-decade");
    const collections = currentItem.getAttribute("data-collections");

    document.querySelectorAll(".timeline-item").forEach((item) => {
      if (item === currentItem) return;

      const itemDecade = item.getAttribute("data-decade");
      const itemCollections = item.getAttribute("data-collections");

      if (
        itemDecade === decade ||
        this.hasCommonCollection(collections, itemCollections)
      ) {
        item.classList.add("related");
      }
    });
  }

  hasCommonCollection(collections1, collections2) {
    const cols1 = collections1.split(", ");
    const cols2 = collections2.split(", ");
    return cols1.some((col) => cols2.includes(col));
  }

  clearHighlights() {
    document.querySelectorAll(".timeline-item").forEach((item) => {
      item.classList.remove("related");
    });
  }

  showYearInfo(year) {
    const book = this.filteredBooks.find((b) => b.year == year);
    if (!book) return;

    // Create a temporary tooltip
    const tooltip = document.createElement("div");
    tooltip.className = "year-tooltip";
    tooltip.innerHTML = `
            <div class="tooltip-content">
                <strong>${year}</strong><br>
                ${book.title}<br>
                <em>${book.author}</em>
            </div>
        `;

    document.body.appendChild(tooltip);

    // Position tooltip
    const marker = document.querySelector(`[data-year="${year}"]`);
    const rect = marker.getBoundingClientRect();
    tooltip.style.left = `${rect.left + window.scrollX}px`;
    tooltip.style.top = `${rect.top + window.scrollY - 60}px`;

    // Remove tooltip after 3 seconds
    setTimeout(() => {
      if (tooltip.parentNode) {
        tooltip.remove();
      }
    }, 3000);
  }
}

// Initialize timeline when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new LiteraryTimeline();
});

// Classe para gerenciar o botão "Voltar ao Topo"
class BackToTopButton {
  constructor() {
    this.button = document.getElementById('backToTop');
    this.scrollThreshold = 300; // Mostra o botão após 300px de scroll
    this.init();
  }

  init() {
    if (!this.button) return;
    
    this.setupEventListeners();
    this.handleScroll(); // Verificar posição inicial
  }

  setupEventListeners() {
    // Listener para scroll
    window.addEventListener('scroll', this.throttle(this.handleScroll.bind(this), 100));
    
    // Listener para clique no botão
    this.button.addEventListener('click', this.scrollToTop.bind(this));
    
    // Listener para teclado (acessibilidade)
    this.button.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.scrollToTop();
      }
    });
  }

  handleScroll() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    if (scrollTop > this.scrollThreshold) {
      this.showButton();
    } else {
      this.hideButton();
    }
  }

  showButton() {
    if (!this.button.classList.contains('show')) {
      this.button.classList.add('show');
      this.button.setAttribute('aria-hidden', 'false');
    }
  }

  hideButton() {
    if (this.button.classList.contains('show')) {
      this.button.classList.remove('show');
      this.button.setAttribute('aria-hidden', 'true');
    }
  }

  scrollToTop() {
    // Scroll suave para o topo
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });

    // Feedback visual
    this.button.style.transform = 'translateY(-2px) scale(0.95)';
    setTimeout(() => {
      this.button.style.transform = '';
    }, 150);

    // Foco no elemento principal para acessibilidade
    setTimeout(() => {
      const mainElement = document.querySelector('main') || document.querySelector('.timeline-hero h1');
      if (mainElement) {
        mainElement.focus();
      }
    }, 500);
  }

  // Função throttle para otimizar performance do scroll
  throttle(func, limit) {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    }
  }
}

