// Classe para gerenciar os dados dos livros
class BookDataManager {
  constructor() {
    this.books = [];
    this.coordinates = this.initializeCoordinates();
  }

  // Mapeamento de países/locais para coordenadas
  initializeCoordinates() {
    return {
      // Países
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
      "Verona, Itália": [10.9916, 45.4384],
      Cuba: [-77.7812, 21.5218],
      Argélia: [1.6596, 28.0339],
      Bahia: [-41.9015, -12.5797],
      Antártica: [0, -90],
      "Bangu, Rio de Janeiro": [-43.4654, -22.8786],
      "Itaguaí, RJ": [-43.7751, -22.852],
      "Nordeste do Brasil": [-40.3, -8.0],

      // Locais ficcionais (usando coordenadas simbólicas)
      Ficcional: [0, 0],
      Global: [0, 0],
      "Terra Média (ficcional)": [-0.1276, 51.5074], // Reino Unido (origem do autor)
      "Futuro distópico (ficcional)": [0, 0],
      "País das Maravilhas (ficcional)": [-0.1276, 51.5074],
      "Planeta do Pequeno Príncipe (ficcional)": [2.3522, 48.8566],
      "Florin (ficcional)": [-74.0059, 40.7128],
      "Mediterrâneo (Segunda Guerra Mundial)": [15.0, 35.0],
      "Islândia/Subsolo terrestre (ficcional)": [-19.0208, 64.9631],
      "Cidade sem nome (ficcional)": [-9.1393, 38.7223],
      "Diversos lugares do mundo": [0, 0],
      "Suíça / Alemanha / Reino Unido": [8.2275, 46.8182],
      "Inglaterra (ficcional)": [-0.1276, 51.5074],
      Inglaterra: [-0.1276, 51.5074],
      "Transilvânia / Londres": [24.9668, 45.9432],
    };
  }

  // Carregar dados do arquivo JSON
  async loadBooks() {
    try {
      const response = await fetch("../data/books.json");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      this.books = this.processBooks(data);
      return this.books;
    } catch (error) {
      console.error("Erro ao carregar livros:", error);
      throw error;
    }
  }

  // Processar dados dos livros e adicionar coordenadas
  processBooks(rawBooks) {
    return rawBooks.map((book) => ({
      id: book.id,
      title: book.titulo,
      author: book.autor,
      year: book.ano_publicacao,
      country: book.pais,
      location: book.local,
      categories: book.colecao,
      coordinates: this.getCoordinates(book.local, book.pais),
    }));
  }

  // Obter coordenadas baseadas no local ou país
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

  // Obter todos os livros
  getAllBooks() {
    return this.books;
  }

  // Filtrar livros por categoria
  getBooksByCategory(category) {
    if (category === "all") return this.books;

    const categoryMap = {
      main: "Clube Principal",
      vpln: "VPLN",
      opeca: "OPECA",
    };

    const categoryName = categoryMap[category] || category;
    return this.books.filter((book) => book.categories.includes(categoryName));
  }

  // Filtrar livros por período
  getBooksByPeriod(period) {
    switch (period) {
      case "classic":
        return this.books.filter((book) => book.year <= 1900);
      case "modern":
        return this.books.filter(
          (book) => book.year > 1900 && book.year <= 1950
        );
      case "contemporary":
        return this.books.filter((book) => book.year > 1950);
      default:
        return this.books;
    }
  }

  // Obter estatísticas dos livros
  getStatistics() {
    const stats = {
      total: this.books.length,
      byCategory: {},
      byPeriod: {
        classic: 0,
        modern: 0,
        contemporary: 0,
      },
      byCountry: {},
      yearRange: {
        oldest: Math.min(...this.books.map((b) => b.year)),
        newest: Math.max(...this.books.map((b) => b.year)),
      },
    };

    // Contar por categoria
    this.books.forEach((book) => {
      book.categories.forEach((category) => {
        stats.byCategory[category] = (stats.byCategory[category] || 0) + 1;
      });

      // Contar por período
      if (book.year <= 1900) stats.byPeriod.classic++;
      else if (book.year <= 1950) stats.byPeriod.modern++;
      else stats.byPeriod.contemporary++;

      // Contar por país
      stats.byCountry[book.country] = (stats.byCountry[book.country] || 0) + 1;
    });

    return stats;
  }

  // Buscar livros por termo
  searchBooks(term) {
    const searchTerm = term.toLowerCase();
    return this.books.filter(
      (book) =>
        book.title.toLowerCase().includes(searchTerm) ||
        book.author.toLowerCase().includes(searchTerm) ||
        book.country.toLowerCase().includes(searchTerm)
    );
  }
}

// Instância global do gerenciador de dados
const bookDataManager = new BookDataManager();

// Funções de conveniência para compatibilidade
async function getAllBooks() {
  if (bookDataManager.books.length === 0) {
    await bookDataManager.loadBooks();
  }
  return bookDataManager.getAllBooks();
}

async function getBooksByCategory(category) {
  if (bookDataManager.books.length === 0) {
    await bookDataManager.loadBooks();
  }
  return bookDataManager.getBooksByCategory(category);
}

async function getBooksByPeriod(period) {
  if (bookDataManager.books.length === 0) {
    await bookDataManager.loadBooks();
  }
  return bookDataManager.getBooksByPeriod(period);
}

// Utilitários para formatação
const BookUtils = {
  formatYear: (year) => year.toString(),

  getCategoryDisplayName: (category) => {
    const names = {
      main: "Clube Principal",
      vpln: "VPLN",
      opeca: "OPECA",
    };
    return names[category] || category;
  },

  getPeriodDisplayName: (period) => {
    const names = {
      classic: "Clássicos (até 1900)",
      modern: "Modernos (1900-1950)",
      contemporary: "Contemporâneos (1950+)",
    };
    return names[period] || period;
  },

  formatLocation: (location) => {
    return location.replace("(ficcional)", "").trim();
  },
};

// Exportar para uso em outros arquivos
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    BookDataManager,
    bookDataManager,
    getAllBooks,
    getBooksByCategory,
    getBooksByPeriod,
    BookUtils,
  };
}
