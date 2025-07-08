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

class NavigationManager {
  constructor() {
    this.navbar = document.getElementById("navbar");
    this.navToggle = document.getElementById("navToggle");
    this.navMenu = document.getElementById("navMenu");
    this.navOverlay = document.getElementById("navOverlay");
    this.navLinks = document.querySelectorAll(".nav-link");

    this.isMenuOpen = false;
    this.lastScrollY = window.scrollY;

    this.init();
  }

  init() {
    this.setupEventListeners();
    this.handleActiveLink();
    this.handleScrollEffects();
  }

  setupEventListeners() {
    // Toggle mobile menu
    this.navToggle?.addEventListener("click", () => this.toggleMobileMenu());

    // Close menu when clicking overlay
    this.navOverlay?.addEventListener("click", () => this.closeMobileMenu());

    // Close menu when clicking nav links
    this.navLinks.forEach((link) => {
      link.addEventListener("click", () => {
        this.closeMobileMenu();
        this.setActiveLink(link);
      });
    });

    // Handle scroll effects
    window.addEventListener("scroll", () => this.handleScrollEffects());

    // Handle escape key
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && this.isMenuOpen) {
        this.closeMobileMenu();
      }
    });

    // Handle window resize
    window.addEventListener("resize", () => {
      if (window.innerWidth > 768 && this.isMenuOpen) {
        this.closeMobileMenu();
      }
    });

    // Prevent scroll when menu is open
    document.addEventListener(
      "touchmove",
      (e) => {
        if (this.isMenuOpen) {
          e.preventDefault();
        }
      },
      { passive: false }
    );
  }

  toggleMobileMenu() {
    if (this.isMenuOpen) {
      this.closeMobileMenu();
    } else {
      this.openMobileMenu();
    }
  }

  openMobileMenu() {
    this.isMenuOpen = true;
    this.navToggle?.classList.add("active");
    this.navMenu?.classList.add("active");
    this.navOverlay?.classList.add("active");

    // Update ARIA attributes
    this.navToggle?.setAttribute("aria-expanded", "true");

    // Prevent body scroll
    document.body.style.overflow = "hidden";

    // Add staggered animation to menu items
    this.animateMenuItems(true);
  }

  closeMobileMenu() {
    this.isMenuOpen = false;
    this.navToggle?.classList.remove("active");
    this.navMenu?.classList.remove("active");
    this.navOverlay?.classList.remove("active");

    // Update ARIA attributes
    this.navToggle?.setAttribute("aria-expanded", "false");

    // Restore body scroll
    document.body.style.overflow = "";

    // Remove animation classes
    this.animateMenuItems(false);
  }

  animateMenuItems(isOpening) {
    const menuItems = this.navMenu?.querySelectorAll(".nav-item");

    menuItems?.forEach((item, index) => {
      if (isOpening) {
        setTimeout(() => {
          item.style.opacity = "1";
          item.style.transform = "translateX(0)";
        }, index * 100);
      } else {
        item.style.opacity = "";
        item.style.transform = "";
      }
    });
  }

  handleScrollEffects() {
    const currentScrollY = window.scrollY;

    // Add scrolled class for navbar styling
    if (currentScrollY > 50) {
      this.navbar?.classList.add("scrolled");
    } else {
      this.navbar?.classList.remove("scrolled");
    }

    // Hide/show navbar on scroll (optional)
    if (currentScrollY > this.lastScrollY && currentScrollY > 100) {
      // Scrolling down
      this.navbar?.style.setProperty("transform", "translateY(-100%)");
    } else {
      // Scrolling up
      this.navbar?.style.setProperty("transform", "translateY(0)");
    }

    this.lastScrollY = currentScrollY;
  }

  handleActiveLink() {
    // Set active link based on current page
    const currentPage = window.location.pathname;

    this.navLinks.forEach((link) => {
      link.classList.remove("active");

      if (currentPage === "/" || currentPage.includes("index.html")) {
        if (link.getAttribute("href") === "#home") {
          link.classList.add("active");
        }
      } else if (link.getAttribute("href").includes(currentPage)) {
        link.classList.add("active");
      }
    });
  }

  setActiveLink(clickedLink) {
    this.navLinks.forEach((link) => link.classList.remove("active"));
    clickedLink.classList.add("active");
  }
}

// Smooth scroll for anchor links
class SmoothScroll {
  constructor() {
    this.init();
  }

  init() {
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener("click", (e) => {
        e.preventDefault();
        const target = document.querySelector(anchor.getAttribute("href"));

        if (target) {
          const offsetTop = target.offsetTop - 80; // Account for fixed navbar

          window.scrollTo({
            top: offsetTop,
            behavior: "smooth",
          });
        }
      });
    });
  }
}

// Animated counter for stats
class StatsAnimator {
  constructor() {
    this.stats = document.querySelectorAll(".stat-number");
    this.init();
  }

  init() {
    this.observeStats();
  }

  observeStats() {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            this.animateCounter(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );

    this.stats.forEach((stat) => observer.observe(stat));
  }

  animateCounter(element) {
    const target = element.textContent;
    const isInfinity = target === "∞";

    if (isInfinity) {
      element.style.animation = "pulse 2s ease-in-out infinite";
      return;
    }

    const numericTarget = parseInt(target.replace(/\D/g, ""));
    const suffix = target.replace(/[\d]/g, "");
    let current = 0;
    const increment = numericTarget / 50;
    const duration = 2000;
    const stepTime = duration / 50;

    const timer = setInterval(() => {
      current += increment;
      if (current >= numericTarget) {
        current = numericTarget;
        clearInterval(timer);
      }
      element.textContent = Math.floor(current) + suffix;
    }, stepTime);
  }
}

// Theme manager for potential dark mode
class ThemeManager {
  constructor() {
    this.init();
  }

  init() {
    // Check for saved theme preference or default to light mode
    const savedTheme = localStorage.getItem("theme") || "light";
    this.setTheme(savedTheme);
  }

  setTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }

  toggleTheme() {
    const currentTheme = document.documentElement.getAttribute("data-theme");
    const newTheme = currentTheme === "dark" ? "light" : "dark";
    this.setTheme(newTheme);
  }
}

// Initialize all components when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  // Initialize navigation
  new NavigationManager();

  // Initialize smooth scrolling
  new SmoothScroll();

  // Initialize stats animation
  new StatsAnimator();

  // Initialize theme manager
  new ThemeManager();

  // Add loading animation
  document.body.classList.add("loaded");
});

// Performance optimization: Preload critical pages
const preloadPages = () => {
  const criticalPages = [
    "pages/search.html",
    "pages/timeline.html",
    "pages/map.html",
  ];

  criticalPages.forEach((page) => {
    const link = document.createElement("link");
    link.rel = "prefetch";
    link.href = page;
    document.head.appendChild(link);
  });
};

// Preload pages after initial load
window.addEventListener("load", preloadPages);
