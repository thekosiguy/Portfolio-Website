document.addEventListener("DOMContentLoaded", function () {
  var yearSpan = document.getElementById("current-year");
  if (yearSpan) {
    yearSpan.textContent = String(new Date().getFullYear());
  }

  var navToggle = document.querySelector(".nav-toggle");
  var navList = document.querySelector(".nav-list");

  if (navToggle && navList) {
    // Toggle function for reuse
    function toggleNav() {
      var isExpanded = navToggle.getAttribute("aria-expanded") === "true";
      navToggle.setAttribute("aria-expanded", String(!isExpanded));
      navList.classList.toggle("is-open");
      
      // Focus management: focus first nav link when opening menu
      if (!isExpanded) {
        var firstNavLink = navList.querySelector(".nav-link");
        if (firstNavLink) {
          firstNavLink.focus();
        }
      }
    }

    // Click handler
    navToggle.addEventListener("click", toggleNav);

    // Keyboard support: Enter and Space keys
    navToggle.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        toggleNav();
      }
    });

    // Escape key to close menu
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && navList.classList.contains("is-open")) {
        toggleNav();
        navToggle.focus();
      }
    });
  }

  var filterButtons = document.querySelectorAll(".filter-btn");
  var projectCards = document.querySelectorAll(".project-card");

  if (filterButtons.length && projectCards.length) {
    filterButtons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var filter = btn.dataset.filter || "all";

        filterButtons.forEach(function (b) {
          b.classList.remove("is-active");
        });
        btn.classList.add("is-active");

        projectCards.forEach(function (card) {
          var raw = card.dataset.category || "other";
          var categories = raw
            .split(",")
            .map(function (c) {
              return c.trim();
            })
            .filter(Boolean);
          var shouldShow = filter === "all" || categories.indexOf(filter) !== -1;

          if (shouldShow) {
            card.style.display = "";
            requestAnimationFrame(function () {
              card.style.opacity = "1";
              card.style.transform = "translateY(0)";
            });
          } else {
            card.style.opacity = "0";
            card.style.transform = "translateY(8px)";
            setTimeout(function () {
              card.style.display = "none";
            }, 160);
          }
        });
      });
    });
  }

  var scrollTargets = document.querySelectorAll(
    ".section, .home-card, .project-card, .service-card, .testimonial-card, .blog-card, .contact-form-wrapper, .contact-details, .resume-item, .resume-sidebar"
  );

  // Check for reduced motion preference
  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (prefersReducedMotion) {
    // Skip animations - show all elements immediately
    scrollTargets.forEach(function (el) {
      el.classList.add("is-visible");
    });
  } else if ("IntersectionObserver" in window && scrollTargets.length) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.16 }
    );

    scrollTargets.forEach(function (el) {
      el.classList.add("reveal-on-scroll");
      observer.observe(el);
    });
  }

  var backToTop = document.createElement("button");
  backToTop.className = "back-to-top";
  backToTop.type = "button";
  backToTop.setAttribute("aria-label", "Back to top");
  backToTop.textContent = "↑";
  document.body.appendChild(backToTop);

  window.addEventListener("scroll", function () {
    if (window.scrollY > 400) {
      backToTop.classList.add("is-visible");
    } else {
      backToTop.classList.remove("is-visible");
    }
  });

  backToTop.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  // Contact form validation
  initFormValidation();
});

/**
 * Initialize contact form validation with accessible error messaging
 */
function initFormValidation() {
  var form = document.querySelector(".contact-form");
  if (!form) return;

  var fields = form.querySelectorAll("input[required], textarea[required]");
  var submitBtn = form.querySelector('button[type="submit"]');

  // Real-time validation on blur
  fields.forEach(function (field) {
    field.addEventListener("blur", function () {
      validateField(field);
    });

    // Re-validate on input if field was previously invalid
    field.addEventListener("input", function () {
      if (field.classList.contains("is-invalid")) {
        validateField(field);
      }
    });
  });

  // Form submission validation
  form.addEventListener("submit", function (e) {
    var isValid = true;
    var firstInvalidField = null;

    fields.forEach(function (field) {
      if (!validateField(field)) {
        isValid = false;
        if (!firstInvalidField) {
          firstInvalidField = field;
        }
      }
    });

    if (!isValid) {
      e.preventDefault();
      // Focus first invalid field
      if (firstInvalidField) {
        firstInvalidField.focus();
      }
    }
  });
}

/**
 * Validate a single form field
 * @param {HTMLInputElement|HTMLTextAreaElement} field - The field to validate
 * @returns {boolean} - True if valid, false otherwise
 */
function validateField(field) {
  var value = field.value.trim();
  var type = field.type;
  var required = field.hasAttribute("required");

  var isValid = true;
  var errorMessage = "";

  // Required field check
  if (required && !value) {
    isValid = false;
    errorMessage = "This field is required";
  }

  // Email format validation
  if (type === "email" && value) {
    var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      isValid = false;
      errorMessage = "Please enter a valid email address";
    }
  }

  // Update UI with validation state
  updateFieldValidation(field, isValid, errorMessage);

  return isValid;
}

/**
 * Update field validation UI with accessible error messaging
 * @param {HTMLInputElement|HTMLTextAreaElement} field - The field to update
 * @param {boolean} isValid - Whether the field is valid
 * @param {string} errorMessage - The error message to display
 */
function updateFieldValidation(field, isValid, errorMessage) {
  var fieldWrapper = field.closest(".form-field");
  if (!fieldWrapper) return;

  var errorId = "error-" + field.id;
  var errorElement = fieldWrapper.querySelector(".field-error");

  if (!isValid) {
    // Mark field as invalid
    field.classList.add("is-invalid");
    field.setAttribute("aria-invalid", "true");

    // Create or update error message
    if (!errorElement) {
      errorElement = document.createElement("span");
      errorElement.className = "field-error";
      errorElement.id = errorId;
      errorElement.setAttribute("role", "alert");
      errorElement.setAttribute("aria-live", "polite");
      fieldWrapper.appendChild(errorElement);
    }

    errorElement.textContent = errorMessage;
    field.setAttribute("aria-describedby", errorId);
  } else {
    // Mark field as valid
    field.classList.remove("is-invalid");
    field.removeAttribute("aria-invalid");
    field.removeAttribute("aria-describedby");

    // Remove error message
    if (errorElement) {
      errorElement.remove();
    }
  }
}

