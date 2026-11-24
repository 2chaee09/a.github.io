document.addEventListener("DOMContentLoaded", () => {
  const navLinks = Array.from(document.querySelectorAll('.nav-link[href^="#"]'));
  const sections = navLinks
    .map((link) => {
      const id = link.getAttribute("href");
      return id ? document.querySelector(id) : null;
    })
    .filter((section) => section instanceof HTMLElement);

  const glow = document.querySelector(".pointer-glow");
  if (glow && window.matchMedia("(pointer: fine)").matches) {
    const updateGlow = (event) => {
      glow.style.setProperty("--x", `${event.clientX}px`);
      glow.style.setProperty("--y", `${event.clientY}px`);
    };
    window.addEventListener("mousemove", updateGlow, { passive: true });
  }

  const setActive = (id) => {
    navLinks.forEach((link) => {
      const isActive = link.getAttribute("href") === `#${id}`;
      link.classList.toggle("active", isActive);
      if (isActive) {
        link.setAttribute("aria-current", "location");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  };

  if (sections.length === 0) {
    return;
  }

  if (!("IntersectionObserver" in window)) {
    setActive(sections[0].id);
    return;
  }

  const visibleSections = new Map();

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          visibleSections.set(entry.target.id, entry.intersectionRatio);
        } else {
          visibleSections.delete(entry.target.id);
        }
      });

      if (visibleSections.size === 0) {
        return;
      }

      let currentId = sections[0].id;
      let maxRatio = -1;
      visibleSections.forEach((ratio, id) => {
        if (ratio > maxRatio) {
          maxRatio = ratio;
          currentId = id;
        }
      });
      setActive(currentId);
    },
    {
      rootMargin: "-20% 0px -55% 0px",
      threshold: [0.1, 0.25, 0.5, 0.75, 1]
    }
  );

  sections.forEach((section) => observer.observe(section));

  const hashId = window.location.hash.replace("#", "");
  if (hashId && sections.some((section) => section.id === hashId)) {
    setActive(hashId);
  } else {
    setActive(sections[0].id);
  }
});
