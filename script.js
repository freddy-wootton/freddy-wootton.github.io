
/* ============================================================
   FREDDY WOOTTON — SITE JAVASCRIPT
   Handles: dark mode, mobile nav, scroll animations, contact form
   No inline scripts. No eval. No innerHTML with untrusted data.
   ============================================================ */

(function () {
  "use strict";

  /* ---------- DARK MODE ---------- */

  var THEME_KEY = "fw-theme";
  var html = document.documentElement;
  var themeToggle = document.querySelector(".theme-toggle");

  function getSystemTheme() {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }

  function applyTheme(theme) {
    html.setAttribute("data-theme", theme);
    if (themeToggle) {
      themeToggle.setAttribute(
        "aria-label",
        theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
      );
    }
  }

  /* Initialise from localStorage or system preference */
  var savedTheme = localStorage.getItem(THEME_KEY);
  applyTheme(savedTheme || getSystemTheme());

  if (themeToggle) {
    themeToggle.addEventListener("click", function () {
      var current = html.getAttribute("data-theme");
      var next = current === "dark" ? "light" : "dark";
      applyTheme(next);
      localStorage.setItem(THEME_KEY, next);
    });
  }

  /* Listen for system theme changes (only if user hasn't set a preference) */
  window
    .matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", function (e) {
      if (!localStorage.getItem(THEME_KEY)) {
        applyTheme(e.matches ? "dark" : "light");
      }
    });


  /* ---------- MOBILE NAV TOGGLE ---------- */

  var navToggle = document.querySelector(".nav__toggle");
  var navMenu = document.getElementById("nav-menu");

  if (navToggle && navMenu) {
    navToggle.addEventListener("click", function () {
      var isOpen = navToggle.getAttribute("aria-expanded") === "true";
      navToggle.setAttribute("aria-expanded", String(!isOpen));
      navToggle.setAttribute(
        "aria-label",
        isOpen ? "Open menu" : "Close menu"
      );
      navMenu.classList.toggle("is-open");
    });

    /* Close menu when a nav link is clicked */
    navMenu.querySelectorAll(".nav__link").forEach(function (link) {
      link.addEventListener("click", function () {
        navToggle.setAttribute("aria-expanded", "false");
        navToggle.setAttribute("aria-label", "Open menu");
        navMenu.classList.remove("is-open");
      });
    });
  }


  /* ---------- SCROLL ANIMATIONS ---------- */

  var prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  if (!prefersReducedMotion) {
    var animatedElements = document.querySelectorAll("[data-animate]");

    if (animatedElements.length > 0 && "IntersectionObserver" in window) {
      var observer = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
      );

      animatedElements.forEach(function (el) {
        observer.observe(el);
      });
    }
  } else {
    /* If reduced motion, show everything immediately */
    document.querySelectorAll("[data-animate]").forEach(function (el) {
      el.classList.add("is-visible");
    });
  }


  /* ---------- SKILL BAR ANIMATION ---------- */

  var skillFills = document.querySelectorAll(".skill__fill");

  if (skillFills.length > 0 && "IntersectionObserver" in window) {
    var skillObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var level = entry.target.getAttribute("data-level") || "0";
            entry.target.style.width = level + "%";
            skillObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.3 }
    );

    skillFills.forEach(function (fill) {
      skillObserver.observe(fill);
    });
  }


  /* ---------- ACTIVE NAV HIGHLIGHTING ---------- */

  var sections = document.querySelectorAll("main .section");
  var navLinks = document.querySelectorAll(".nav__link");

  if (sections.length > 0 && "IntersectionObserver" in window) {
    var sectionObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var id = entry.target.getAttribute("id");
            navLinks.forEach(function (link) {
              link.classList.toggle(
                "is-active",
                link.getAttribute("href") === "#" + id
              );
            });
          }
        });
      },
      { threshold: 0.3, rootMargin: "-20% 0px -60% 0px" }
    );

    sections.forEach(function (section) {
      sectionObserver.observe(section);
    });
  }


  /* ---------- CONTACT FORM ---------- */

  var form = document.getElementById("contact-form");
  var statusEl = document.getElementById("form-status");

  if (form && statusEl) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();

      /* Clear previous status */
      statusEl.textContent = "";
      statusEl.className = "form-status";

      /* Client-side validation */
      var nameInput = document.getElementById("contact-name");
      var emailInput = document.getElementById("contact-email");
      var messageInput = document.getElementById("contact-message");
      var honeypot = form.querySelector("[name=\"_gotcha\"]");

      /* Reset errors */
      clearError(nameInput, "contact-name-error");
      clearError(emailInput, "contact-email-error");
      clearError(messageInput, "contact-message-error");

      var isValid = true;

      if (!nameInput.value.trim()) {
        showError(nameInput, "contact-name-error", "Please enter your name.");
        isValid = false;
      }

      if (!emailInput.value.trim() || !isValidEmail(emailInput.value)) {
        showError(
          emailInput,
          "contact-email-error",
          "Please enter a valid email address."
        );
        isValid = false;
      }

      if (!messageInput.value.trim()) {
        showError(
          messageInput,
          "contact-message-error",
          "Please enter a message."
        );
        isValid = false;
      }

      /* Honeypot check */
      if (honeypot && honeypot.value) {
        return; /* Silently reject bot submissions */
      }

      if (!isValid) {
        return;
      }

      /* Disable button during submission */
      var submitBtn = document.getElementById("contact-submit");
      submitBtn.disabled = true;
      submitBtn.textContent = "Sending\u2026";

      /* Send via Formspree */
      var formData = new FormData(form);

      fetch(form.action, {
        method: "POST",
        body: formData,
        headers: { Accept: "application/json" },
      })
        .then(function (response) {
          if (response.ok) {
            statusEl.textContent =
              "Thank you! Your message has been sent.";
            statusEl.className = "form-status form-status--success";
            form.reset();
          } else {
            throw new Error("Form submission failed.");
          }
        })
        .catch(function () {
          statusEl.textContent =
            "Sorry, something went wrong. Please try again or contact me via LinkedIn.";
          statusEl.className = "form-status form-status--error";
        })
        .finally(function () {
          submitBtn.disabled = false;
          submitBtn.textContent = "Send Message";
        });
    });
  }

  function showError(input, errorId, message) {
    var errorEl = document.getElementById(errorId);
    if (errorEl) {
      errorEl.textContent = message;
    }
    input.setAttribute("aria-invalid", "true");
  }

  function clearError(input, errorId) {
    var errorEl = document.getElementById(errorId);
    if (errorEl) {
      errorEl.textContent = "";
    }
    input.removeAttribute("aria-invalid");
  }

  function isValidEmail(email) {
    /* Basic check — not a full RFC 5322 validator */
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }


  /* ---------- DYNAMIC FOOTER YEAR ---------- */

  var yearSpan = document.getElementById("footer-year");
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }
})();

