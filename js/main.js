// Animações e interações principais do site
class MainSite {
  constructor() {
    this.init();
  }

  init() {
    this.setupNavigation();
    this.setupAnimations();
    this.setupStatsCounter();
  }

  setupNavigation() {
    // Smooth scroll para links internos
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener("click", function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute("href"));
        if (target) {
          target.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      });
    });

    // Highlight do menu ativo
    this.highlightActiveMenu();
  }

  highlightActiveMenu() {
    const currentPage =
      window.location.pathname.split("/").pop() || "index.html";
    const navLinks = document.querySelectorAll(".nav-link");

    navLinks.forEach((link) => {
      const href = link.getAttribute("href");
      if (
        href.includes(currentPage) ||
        (currentPage === "index.html" && href.includes("#home"))
      ) {
        link.classList.add("active");
      }
    });
  }

  setupAnimations() {
    // Animação de entrada para elementos
    const observerOptions = {
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px",
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("animate-in");
        }
      });
    }, observerOptions);

    // Observar elementos que devem ser animados
    document.querySelectorAll(".stat, .hero-content").forEach((el) => {
      observer.observe(el);
    });
  }

  setupStatsCounter() {
    const stats = document.querySelectorAll(".stat-number");

    stats.forEach((stat) => {
      const finalValue = stat.textContent;
      if (finalValue.includes("+")) {
        this.animateCounter(stat, parseInt(finalValue));
      }
    });
  }

  animateCounter(element, target) {
    let current = 0;
    const increment = target / 50;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        element.textContent = target + "+";
        clearInterval(timer);
      } else {
        element.textContent = Math.floor(current) + "+";
      }
    }, 50);
  }
}

// Utilitários globais
class Utils {
  static formatYear(year) {
    return new Date(year, 0).toLocaleDateString("pt-BR", { year: "numeric" });
  }

  static truncateText(text, maxLength) {
    return text.length > maxLength
      ? text.substring(0, maxLength) + "..."
      : text;
  }

  static debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  static showNotification(message, type = "info") {
    const notification = document.createElement("div");
    notification.className = `notification notification-${type}`;
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.classList.add("show");
    }, 100);

    setTimeout(() => {
      notification.classList.remove("show");
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 3000);
  }
}

// CSS adicional para animações
const additionalStyles = `
    .animate-in {
        animation: fadeInUp 0.6s ease forwards;
    }

    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    .nav-link.active {
        color: var(--secondary-color);
        font-weight: 600;
    }

    .notification {
        position: fixed;
        top: 100px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        z-index: 10000;
    }

    .notification.show {
        transform: translateX(0);
    }

    .notification-info {
        background: var(--primary-color);
    }

    .notification-success {
        background: #27ae60;
    }

    .notification-error {
        background: var(--secondary-color);
    }
`;

// Adicionar estilos ao documento
const styleSheet = document.createElement("style");
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet);

// Inicializar quando o DOM estiver carregado
document.addEventListener("DOMContentLoaded", () => {
  new MainSite();
});

// Exportar utilitários para uso global
window.Utils = Utils;
