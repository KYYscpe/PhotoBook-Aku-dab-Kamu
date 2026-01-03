// app.js
(() => {
  const body = document.body;
  requestAnimationFrame(() => body.classList.add("page-enter"));

  // Mobile nav
  const topbar = document.querySelector(".topbar");
  const toggle = document.querySelector(".nav-toggle");
  if (toggle && topbar) {
    toggle.addEventListener("click", () => topbar.classList.toggle("open"));
    document.addEventListener("click", (e) => {
      const t = e.target;
      if (!topbar.classList.contains("open")) return;
      if (t.closest(".topbar")) return;
      topbar.classList.remove("open");
    });
  }

  // Page transition for navigation links
  const isSameOrigin = (url) => {
    try { return new URL(url, location.href).origin === location.origin; }
    catch { return false; }
  };

  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[data-nav]");
    if (!a) return;

    const href = a.getAttribute("href");
    if (!href) return;

    if (!isSameOrigin(href) || href.startsWith("#")) return;

    e.preventDefault();
    if (topbar) topbar.classList.remove("open");

    body.classList.add("page-leave");
    window.setTimeout(() => {
      window.location.href = href;
    }, 320);
  });

  // Lightbox: images and videos
  const lightbox = document.getElementById("lightbox");
  const lightboxContent = document.getElementById("lightboxContent");

  const openLightbox = (node) => {
    if (!lightbox || !lightboxContent) return;
    lightboxContent.innerHTML = "";
    lightboxContent.appendChild(node);
    lightbox.classList.add("show");
    lightbox.setAttribute("aria-hidden", "false");
    document.documentElement.style.overflow = "hidden";
  };

  const closeLightbox = () => {
    if (!lightbox || !lightboxContent) return;
    const v = lightboxContent.querySelector("video");
    if (v) v.pause();
    lightbox.classList.remove("show");
    lightbox.setAttribute("aria-hidden", "true");
    lightboxContent.innerHTML = "";
    document.documentElement.style.overflow = "";
  };

  document.addEventListener("click", (e) => {
    const close = e.target.closest("[data-close]");
    if (close) closeLightbox();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeLightbox();
  });

  const attachPreviewHandlers = () => {
    const previewables = document.querySelectorAll("[data-preview][data-src]");
    previewables.forEach((el) => {
      const open = () => {
        const type = el.getAttribute("data-preview");
        const src = el.getAttribute("data-src");
        if (!src) return;

        if (type === "img") {
          const img = new Image();
          img.src = src;
          img.alt = el.getAttribute("data-alt") || "Pratinjau";
          img.loading = "eager";
          openLightbox(img);
          return;
        }

        if (type === "video") {
          const video = document.createElement("video");
          video.src = src;
          video.controls = true;
          video.playsInline = true;
          video.autoplay = true;
          openLightbox(video);
        }
      };

      el.addEventListener("click", open);
      el.addEventListener("keydown", (ev) => {
        if (ev.key === "Enter" || ev.key === " ") {
          ev.preventDefault();
          open();
        }
      });
    });
  };

  attachPreviewHandlers();

  // Minimal floating heart particles in background
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!prefersReduced) {
    const HEARTS_MAX = 18;
    const hearts = [];

    const spawnHeart = () => {
      if (hearts.length >= HEARTS_MAX) return;
      const h = document.createElement("div");
      h.className = "float-heart";
      const x = Math.random() * window.innerWidth;
      const y = window.innerHeight + 20 + Math.random() * 120;
      const size = 8 + Math.random() * 12;
      const drift = (Math.random() * 2 - 1) * 0.25;
      const speed = 0.35 + Math.random() * 0.7;
      const rot = (Math.random() * 2 - 1) * 25;

      h.style.width = `${size}px`;
      h.style.height = `${size}px`;
      h.style.left = `${x}px`;
      h.style.top = `${y}px`;
      h.style.opacity = `${0.28 + Math.random() * 0.28}`;
      h.style.transform = `translate(-50%,-50%) rotate(${45 + rot}deg)`;

      document.body.appendChild(h);

      hearts.push({ el: h, x, y, size, drift, speed });
    };

    const tick = () => {
      for (let i = hearts.length - 1; i >= 0; i--) {
        const p = hearts[i];
        p.y -= p.speed;
        p.x += p.drift * 2;
        p.el.style.left = `${p.x}px`;
        p.el.style.top = `${p.y}px`;

        if (p.y < -80) {
          p.el.remove();
          hearts.splice(i, 1);
        }
      }
      requestAnimationFrame(tick);
    };

    for (let i = 0; i < 10; i++) spawnHeart();
    setInterval(spawnHeart, 420);
    requestAnimationFrame(tick);
  }
})();
