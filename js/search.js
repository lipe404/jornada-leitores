class BookSearch {
  constructor() {
    this.searchInput = document.getElementById("searchInput");
    this.searchBtn = document.getElementById("searchBtn");
    this.resultsContainer = document.getElementById("resultsContainer");
    this.resultsHeader = document.getElementById("resultsHeader");
    this.resultsCount = document.getElementById("resultsCount");
    this.categoryFilter = document.getElementById("categoryFilter");
    this.sortFilter = document.getElementById("sortFilter");
    this.loadMoreContainer = document.getElementById("loadMoreContainer");
    this.loadMoreBtn = document.getElementById("loadMoreBtn");

    this.clubBooks = [];
    this.currentResults = [];
    this.currentQuery = "";
    this.currentPage = 1;
    this.resultsPerPage = 12;
    this.isLoading = false;

    this.init();
  }

  async init() {
    await this.loadClubBooks();
    this.setupEventListeners();
    this.setupQuickSearches();
    this.setupCollectionCards();
  }

  async loadClubBooks() {
    try {
      const response = await fetch("../data/books.json");
      if (!response.ok) throw new Error("Erro ao carregar dados");

      const data = await response.json();
      this.clubBooks = data.map((book) => ({
        id: book.id,
        title: book.titulo,
        author: book.autor,
        year: book.ano_publicacao,
        country: book.pais,
        location: book.local,
        collections: book.colecao,
        source: "club",
        // Simular dados adicionais para compatibilidade
        cover_i: null,
        subject: this.generateSubjects(book),
        description: this.generateDescription(book),
      }));

      console.log(`${this.clubBooks.length} livros do clube carregados`);
    } catch (error) {
      console.error("Erro ao carregar livros do clube:", error);
      this.clubBooks = [];
    }
  }

  generateSubjects(book) {
    const subjects = [];
    if (book.colecao.includes("Clube Principal"))
      subjects.push("Literatura Clássica");
    if (book.colecao.includes("VPLN")) subjects.push("Clássicos Selecionados");
    if (book.colecao.includes("OPECA")) subjects.push("Grandes Obras");
    if (book.pais === "Brasil") subjects.push("Literatura Brasileira");
    if (book.ano_publicacao <= 1900) subjects.push("Literatura Clássica");
    else if (book.ano_publicacao <= 1950) subjects.push("Literatura Moderna");
    else subjects.push("Literatura Contemporânea");

    return subjects;
  }

  generateDescription(book) {
    const collections = book.colecao.join(", ");
    return `Obra de ${book.autor}, publicada em ${book.ano_publicacao}. Faz parte da(s) coleção(ões): ${collections}. Ambientada em ${book.local}, ${book.pais}.`;
  }

  setupEventListeners() {
    // Busca principal
    this.searchBtn.addEventListener("click", () => this.performSearch());
    this.searchInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") this.performSearch();
    });

    // Sugestões em tempo real
    this.searchInput.addEventListener("input", (e) => {
      this.showSuggestions(e.target.value);
    });

    // Filtros
    this.categoryFilter.addEventListener("change", () => {
      if (this.currentQuery) this.performSearch();
    });

    this.sortFilter.addEventListener("change", () => {
      if (this.currentResults.length > 0) this.sortAndDisplayResults();
    });

    // Load more
    this.loadMoreBtn.addEventListener("click", () => this.loadMoreResults());

    // Fechar sugestões ao clicar fora
    document.addEventListener("click", (e) => {
      if (!e.target.closest(".search-input-wrapper")) {
        this.hideSuggestions();
      }
    });
  }

  setupQuickSearches() {
    const quickTags = document.querySelectorAll(".quick-tag");
    quickTags.forEach((tag) => {
      tag.addEventListener("click", () => {
        const searchTerm = tag.getAttribute("data-search");
        this.searchInput.value = searchTerm;
        this.performSearch();
      });
    });
  }

  setupCollectionCards() {
    const collectionCards = document.querySelectorAll(".collection-card");
    collectionCards.forEach((card) => {
      card.addEventListener("click", () => {
        const collection = card.getAttribute("data-collection");
        this.searchByCollection(collection);
      });
    });
  }

  searchByCollection(collection) {
    const searchTerms = {
      clube: "literatura clássica",
      vpln: "clássicos selecionados",
      opeca: "grandes obras",
    };

    this.searchInput.value = searchTerms[collection] || "";
    this.categoryFilter.value = "club";
    this.performSearch();
  }

  async showSuggestions(query) {
    if (query.length < 2) {
      this.hideSuggestions();
      return;
    }

    const suggestions = this.getClubSuggestions(query);
    const suggestionsContainer = document.getElementById("searchSuggestions");

    if (suggestions.length === 0) {
      this.hideSuggestions();
      return;
    }

    const suggestionsHTML = suggestions
      .map(
        (suggestion) =>
          `<div class="suggestion-item" data-suggestion="${suggestion}">
                ${this.highlightMatch(suggestion, query)}
            </div>`
      )
      .join("");

    suggestionsContainer.innerHTML = suggestionsHTML;
    suggestionsContainer.style.display = "block";

    // Adicionar eventos de clique nas sugestões
    suggestionsContainer
      .querySelectorAll(".suggestion-item")
      .forEach((item) => {
        item.addEventListener("click", () => {
          this.searchInput.value = item.getAttribute("data-suggestion");
          this.hideSuggestions();
          this.performSearch();
        });
      });
  }

  getClubSuggestions(query) {
    const suggestions = new Set();
    const queryLower = query.toLowerCase();

    this.clubBooks.forEach((book) => {
      // Sugestões de títulos
      if (book.title.toLowerCase().includes(queryLower)) {
        suggestions.add(book.title);
      }

      // Sugestões de autores
      if (book.author.toLowerCase().includes(queryLower)) {
        suggestions.add(book.author);
      }

      // Sugestões de países
      if (book.country.toLowerCase().includes(queryLower)) {
        suggestions.add(book.country);
      }
    });

    return Array.from(suggestions).slice(0, 5);
  }

  highlightMatch(text, query) {
    const regex = new RegExp(`(${query})`, "gi");
    return text.replace(regex, "<strong>$1</strong>");
  }

  hideSuggestions() {
    const suggestionsContainer = document.getElementById("searchSuggestions");
    suggestionsContainer.style.display = "none";
  }

  async performSearch() {
    const query = this.searchInput.value.trim();
    if (!query) return;

    this.currentQuery = query;
    this.currentPage = 1;
    this.hideSuggestions();
    this.showLoading();
    this.showResultsHeader();

    try {
      const category = this.categoryFilter.value;
      let results = [];

      if (category === "club" || category === "all") {
        const clubResults = this.searchClubBooks(query);
        results = results.concat(clubResults);
      }

      if (category === "external" || category === "all") {
        const externalResults = await this.fetchExternalBooks(query);
        results = results.concat(externalResults);
      }

      this.currentResults = results;
      this.sortAndDisplayResults();
    } catch (error) {
      console.error("Erro na busca:", error);
      this.showError("Erro ao buscar livros. Tente novamente.");
    }
  }

  searchClubBooks(query) {
    const queryLower = query.toLowerCase();

    return this.clubBooks
      .filter((book) => {
        return (
          book.title.toLowerCase().includes(queryLower) ||
          book.author.toLowerCase().includes(queryLower) ||
          book.country.toLowerCase().includes(queryLower) ||
          book.location.toLowerCase().includes(queryLower) ||
          book.subject.some((subject) =>
            subject.toLowerCase().includes(queryLower)
          )
        );
      })
      .map((book) => ({
        ...book,
        source: "club",
        relevanceScore: this.calculateRelevance(book, queryLower),
      }));
  }

  calculateRelevance(book, query) {
    let score = 0;

    // Título tem maior peso
    if (book.title.toLowerCase().includes(query)) score += 10;
    if (book.title.toLowerCase().startsWith(query)) score += 5;

    // Autor tem peso médio
    if (book.author.toLowerCase().includes(query)) score += 7;
    if (book.author.toLowerCase().startsWith(query)) score += 3;

    // Outros campos têm peso menor
    if (book.country.toLowerCase().includes(query)) score += 2;
    if (book.location.toLowerCase().includes(query)) score += 2;

    return score;
  }

  async fetchExternalBooks(query) {
    try {
      const response = await fetch(
        `https://openlibrary.org/search.json?q=${encodeURIComponent(
          query
        )}&limit=20`
      );
      const data = await response.json();

      return data.docs.map((book) => ({
        ...book,
        source: "external",
        relevanceScore: 1, // Score padrão para livros externos
      }));
    } catch (error) {
      console.error("Erro ao buscar livros externos:", error);
      return [];
    }
  }

  sortAndDisplayResults() {
    const sortBy = this.sortFilter.value;
    let sortedResults = [...this.currentResults];

    switch (sortBy) {
      case "relevance":
        sortedResults.sort((a, b) => {
          // Priorizar livros do clube
          if (a.source === "club" && b.source !== "club") return -1;
          if (b.source === "club" && a.source !== "club") return 1;

          // Depois por relevância
          return (b.relevanceScore || 0) - (a.relevanceScore || 0);
        });
        break;

      case "year":
        sortedResults.sort((a, b) => {
          const yearA = a.year || a.first_publish_year || 0;
          const yearB = b.year || b.first_publish_year || 0;
          return yearB - yearA;
        });
        break;

      case "title":
        sortedResults.sort((a, b) => {
          const titleA = a.title || "";
          const titleB = b.title || "";
          return titleA.localeCompare(titleB);
        });
        break;

      case "author":
        sortedResults.sort((a, b) => {
          const authorA = a.author || (a.author_name && a.author_name[0]) || "";
          const authorB = b.author || (b.author_name && b.author_name[0]) || "";
          return authorA.localeCompare(authorB);
        });
        break;
    }

    this.displayResults(sortedResults);
  }

  displayResults(books) {
    this.updateResultsCount(books.length);

    if (books.length === 0) {
      this.resultsContainer.innerHTML = this.getNoResultsHTML();
      this.hideLoadMore();
      return;
    }

    const startIndex = (this.currentPage - 1) * this.resultsPerPage;
    const endIndex = startIndex + this.resultsPerPage;
    const booksToShow = books.slice(0, endIndex);

    const resultsHTML = booksToShow
      .map((book) => this.createBookCard(book))
      .join("");
    this.resultsContainer.innerHTML = resultsHTML;

    // Configurar load more
    if (books.length > endIndex) {
      this.showLoadMore();
    } else {
      this.hideLoadMore();
    }

    // Adicionar eventos de clique nos cards
    this.addBookCardEvents();
  }

  createBookCard(book) {
    const isClubBook = book.source === "club";
    const year = book.year || book.first_publish_year || "Ano não informado";
    const author =
      book.author ||
      (book.author_name && book.author_name.join(", ")) ||
      "Autor desconhecido";
    const subjects =
      book.subject || (book.subject && book.subject.slice(0, 3)) || [];
    const description =
      book.description || (subjects.length > 0 ? subjects.join(", ") : "");

    return `
            <div class="book-card ${
              isClubBook ? "club-book" : "external-book"
            }" data-book='${JSON.stringify(book)}'>
                <div class="book-cover">
                    ${
                      book.cover_i
                        ? `<img src="https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg" alt="${book.title}" loading="lazy">`
                        : '<div class="no-cover">📚</div>'
                    }
                    ${
                      isClubBook
                        ? '<div class="club-badge">📚 Nosso Clube</div>'
                        : ""
                    }
                </div>
                <div class="book-info">
                    <h3>${book.title}</h3>
                    <p class="author">${author}</p>
                    <p class="year">${year}</p>
                    <p class="description">${description}</p>
                    ${
                      isClubBook
                        ? `<div class="collections">
                        ${book.collections
                          .map(
                            (col) =>
                              `<span class="collection-tag">${col}</span>`
                          )
                          .join("")}
                    </div>`
                        : ""
                    }
                    <button class="details-btn">Ver Detalhes</button>
                </div>
            </div>
        `;
  }

  addBookCardEvents() {
    const bookCards = document.querySelectorAll(".book-card");
    bookCards.forEach((card) => {
      const detailsBtn = card.querySelector(".details-btn");
      detailsBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        const bookData = JSON.parse(card.getAttribute("data-book"));
        this.showBookModal(bookData);
      });

      // Também permitir clique no card inteiro
      card.addEventListener("click", () => {
        const bookData = JSON.parse(card.getAttribute("data-book"));
        this.showBookModal(bookData);
      });
    });
  }

  showBookModal(book) {
    const isClubBook = book.source === "club";
    const year = book.year || book.first_publish_year || "Não informado";
    const author =
      book.author ||
      (book.author_name && book.author_name.join(", ")) ||
      "Autor desconhecido";

    const modal = document.createElement("div");
    modal.className = "book-modal";
    modal.innerHTML = `
            <div class="modal-backdrop"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h2>${book.title}</h2>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="modal-book-info">
                        <div class="modal-cover">
                            ${
                              book.cover_i
                                ? `<img src="https://covers.openlibrary.org/b/id/${book.cover_i}-L.jpg" alt="${book.title}">`
                                : '<div class="modal-no-cover">📚</div>'
                            }
                        </div>
                        <div class="modal-details">
                            <div class="detail-row">
                                <strong>Autor:</strong>
                                <span>${author}</span>
                            </div>
                            <div class="detail-row">
                                <strong>Ano de Publicação:</strong>
                                <span>${year}</span>
                            </div>
                            ${
                              isClubBook
                                ? `
                                <div class="detail-row">
                                    <strong>País:</strong>
                                    <span>${book.country}</span>
                                </div>
                                <div class="detail-row">
                                    <strong>Local da História:</strong>
                                    <span>${book.location}</span>
                                </div>
                                <div class="detail-row">
                                    <strong>Coleções:</strong>
                                    <div class="modal-collections">
                                        ${book.collections
                                          .map(
                                            (col) =>
                                              `<span class="collection-tag">${col}</span>`
                                          )
                                          .join("")}
                                    </div>
                                </div>
                            `
                                : ""
                            }
                            ${
                              book.subject && book.subject.length > 0
                                ? `
                                <div class="detail-row">
                                    <strong>Gêneros:</strong>
                                    <span>${book.subject
                                      .slice(0, 5)
                                      .join(", ")}</span>
                                </div>
                            `
                                : ""
                            }
                            <div class="detail-row">
                                <strong>Fonte:</strong>
                                <span class="source-badge ${
                                  isClubBook ? "club" : "external"
                                }">
                                    ${
                                      isClubBook
                                        ? "📚 Nosso Clube"
                                        : "🌍 Biblioteca Mundial"
                                    }
                                </span>
                            </div>
                        </div>
                    </div>
                    ${
                      book.description
                        ? `
                        <div class="modal-description">
                            <h4>Descrição:</h4>
                            <p>${book.description}</p>
                        </div>
                    `
                        : ""
                    }
                </div>
                <div class="modal-footer">
                    ${
                      isClubBook
                        ? `
                        <button class="modal-btn secondary" onclick="window.open('../pages/timeline.html', '_blank')">
                            Ver na Timeline
                        </button>
                        <button class="modal-btn secondary" onclick="window.open('../pages/map.html', '_blank')">
                            Ver no Mapa
                        </button>
                    `
                        : ""
                    }
                    <button class="modal-btn primary" onclick="this.closest('.book-modal').remove()">
                        Fechar
                    </button>
                </div>
            </div>
        `;

    document.body.appendChild(modal);

    // Eventos do modal
    modal.querySelector(".modal-backdrop").addEventListener("click", () => {
      modal.remove();
    });

    modal.querySelector(".modal-close").addEventListener("click", () => {
      modal.remove();
    });

    // Escape key
    const escapeHandler = (e) => {
      if (e.key === "Escape") {
        modal.remove();
        document.removeEventListener("keydown", escapeHandler);
      }
    };
    document.addEventListener("keydown", escapeHandler);

    // Animar entrada
    setTimeout(() => modal.classList.add("show"), 10);
  }

  loadMoreResults() {
    this.currentPage++;
    this.sortAndDisplayResults();
  }

  updateResultsCount(count) {
    this.resultsCount.textContent = `${count} resultado${
      count !== 1 ? "s" : ""
    } encontrado${count !== 1 ? "s" : ""}`;
  }

  showResultsHeader() {
    this.resultsHeader.style.display = "block";
  }

  showLoadMore() {
    this.loadMoreContainer.style.display = "block";
  }

  hideLoadMore() {
    this.loadMoreContainer.style.display = "none";
  }

  getNoResultsHTML() {
    return `
            <div class="no-results-container">
                <div class="no-results-icon">🔍</div>
                <h3>Nenhum resultado encontrado</h3>
                <p>Tente ajustar sua busca ou usar termos diferentes</p>
                <div class="search-suggestions-alt">
                    <h4>Sugestões:</h4>
                    <ul>
                        <li>Verifique a ortografia das palavras</li>
                        <li>Use termos mais gerais</li>
                        <li>Tente buscar pelo autor</li>
                        <li>Experimente as buscas populares acima</li>
                    </ul>
                </div>
            </div>
        `;
  }

  showLoading() {
    this.resultsContainer.innerHTML =
      '<div class="loading">Buscando livros...</div>';
  }

  showError(message) {
    this.resultsContainer.innerHTML = `<div class="error">${message}</div>`;
  }
}

// Inicializar quando a página carregar
document.addEventListener("DOMContentLoaded", () => {
  new BookSearch();
});
