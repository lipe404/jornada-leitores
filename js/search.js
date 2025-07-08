class BookSearch {
  constructor() {
    this.searchInput = document.getElementById("searchInput");
    this.searchBtn = document.getElementById("searchBtn");
    this.resultsContainer = document.getElementById("resultsContainer");

    this.init();
  }

  init() {
    this.searchBtn.addEventListener("click", () => this.performSearch());
    this.searchInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") this.performSearch();
    });
  }

  async performSearch() {
    const query = this.searchInput.value.trim();
    if (!query) return;

    this.showLoading();

    try {
      const books = await this.fetchBooks(query);
      this.displayResults(books);
    } catch (error) {
      this.showError("Erro ao buscar livros. Tente novamente.");
    }
  }

  async fetchBooks(query) {
    const response = await fetch(
      `https://openlibrary.org/search.json?q=${encodeURIComponent(
        query
      )}&limit=10`
    );
    const data = await response.json();
    return data.docs;
  }

  displayResults(books) {
    if (books.length === 0) {
      this.resultsContainer.innerHTML =
        '<p class="no-results">Nenhum livro encontrado.</p>';
      return;
    }

    const resultsHTML = books
      .map(
        (book) => `
            <div class="book-card">
                <div class="book-cover">
                    ${
                      book.cover_i
                        ? `<img src="https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg" alt="${book.title}">`
                        : '<div class="no-cover">📚</div>'
                    }
                </div>
                <div class="book-info">
                    <h3>${book.title}</h3>
                    <p class="author">${
                      book.author_name
                        ? book.author_name.join(", ")
                        : "Autor desconhecido"
                    }</p>
                    <p class="year">${
                      book.first_publish_year || "Ano não informado"
                    }</p>
                    <p class="description">${
                      book.subject ? book.subject.slice(0, 3).join(", ") : ""
                    }</p>
                </div>
            </div>
        `
      )
      .join("");

    this.resultsContainer.innerHTML = resultsHTML;
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
