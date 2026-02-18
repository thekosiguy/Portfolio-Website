document.addEventListener("DOMContentLoaded", function () {
  var yearSpan = document.getElementById("current-year");
  if (yearSpan) {
    yearSpan.textContent = String(new Date().getFullYear());
  }

  var navToggle = document.querySelector(".nav-toggle");
  var navList = document.querySelector(".nav-list");

  if (navToggle && navList) {
    navToggle.addEventListener("click", function () {
      var isExpanded = navToggle.getAttribute("aria-expanded") === "true";
      navToggle.setAttribute("aria-expanded", String(!isExpanded));
      navList.classList.toggle("is-open");
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

  if ("IntersectionObserver" in window && scrollTargets.length) {
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
});

