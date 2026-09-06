(() => {
  const tabs = [...document.querySelectorAll("[data-route]")];
  const pages = tabs.map((tab) => document.getElementById(tab.dataset.route));
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
  const finish = document.getElementById("finish-typing");
  const previous = document.getElementById("previous-page");
  const next = document.getElementById("next-page");
  const characterCache = new Map();
  let active = -1,
    transitionTimer,
    frame,
    generation = 0,
    characters = [],
    cursor = 0;
  document.querySelector(".chapter-tabs").setAttribute("role", "tablist");
  tabs.forEach((tab, index) => {
    tab.setAttribute("role", "tab");
    tab.setAttribute("aria-controls", pages[index].id);
    pages[index].setAttribute("role", "tabpanel");
    pages[index].setAttribute("aria-labelledby", tab.id);
    pages[index].tabIndex = 0;
    tab.addEventListener("keydown", (event) => {
      let target;
      if (event.key === "ArrowRight") target = (index + 1) % tabs.length;
      if (event.key === "ArrowLeft")
        target = (index + tabs.length - 1) % tabs.length;
      if (event.key === "Home") target = 0;
      if (event.key === "End") target = tabs.length - 1;
      if (target !== undefined) {
        event.preventDefault();
        tabs[target].focus();
        navigate(target);
      }
    });
  });
  function revealAll() {
    cancelAnimationFrame(frame);
    characters.forEach((character) => {
      character.classList.add("revealed");
      character.classList.remove("caret");
    });
    cursor = characters.length;
    finish.hidden = true;
  }
  function prepare(page) {
    if (characterCache.has(page)) return characterCache.get(page);
    const walker = document.createTreeWalker(page, NodeFilter.SHOW_TEXT, {
      acceptNode: (node) =>
        node.textContent.trim() &&
        !node.parentElement.closest('[aria-hidden="true"], .sr-only')
          ? NodeFilter.FILTER_ACCEPT
          : NodeFilter.FILTER_REJECT,
    });
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    const output = [];
    nodes.forEach((node) => {
      const wrapper = document.createElement("span");
      const accessible = document.createElement("span");
      accessible.className = "sr-only";
      accessible.textContent = node.textContent;
      const visual = document.createElement("span");
      visual.setAttribute("aria-hidden", "true");
      // Keep normal word wrapping while each letter is revealed independently.
      Array.from(node.textContent).forEach((letter) => {
        const character = document.createElement("span");
        character.className = "type-character";
        character.textContent = letter;
        visual.append(character);
        output.push(character);
      });
      wrapper.append(accessible, visual);
      node.replaceWith(wrapper);
    });
    characterCache.set(page, output);
    return output;
  }
  function typePage(page) {
    characters = prepare(page);
    cursor = 0;
    characters.forEach((character) =>
      character.classList.remove("revealed", "caret"),
    );
    if (reducedMotion.matches) {
      revealAll();
      return;
    }
    finish.hidden = false;
    const start = performance.now();
    const duration = Math.min(6500, characters.length * 12);
    function tick(now) {
      const end = Math.min(
        characters.length,
        Math.floor(((now - start) / duration) * characters.length),
      );
      if (cursor) characters[cursor - 1].classList.remove("caret");
      while (cursor < end) characters[cursor++].classList.add("revealed");
      if (cursor && cursor < characters.length)
        characters[cursor - 1].classList.add("caret");
      if (cursor < characters.length) frame = requestAnimationFrame(tick);
      else finish.hidden = true;
    }
    frame = requestAnimationFrame(tick);
  }
  function show(index, animate = true) {
    if (index === active) return;
    const token = ++generation;
    clearTimeout(transitionTimer);
    revealAll();
    const outgoing = pages[active];
    const backwards = index < active;
    active = index;
    tabs.forEach((tab, i) => {
      tab.setAttribute("aria-selected", String(i === index));
      tab.tabIndex = i === index ? 0 : -1;
    });
    previous.disabled = index === 0;
    next.disabled = index === pages.length - 1;
    document.getElementById("page-number").textContent =
      `${String(index + 1).padStart(2, "0")} — 05`;
    pages.forEach((page) =>
      page.classList.remove("is-leaving", "is-entering", "reverse"),
    );
    function enter() {
      if (generation !== token) return;
      pages.forEach((page, i) => {
        page.hidden = i !== index;
        page.inert = i !== index;
      });
      if (animate && !reducedMotion.matches)
        pages[index].classList.add("is-entering");
      if (backwards) pages[index].classList.add("reverse");
      typePage(pages[index]);
    }
    if (outgoing && !outgoing.hidden && animate && !reducedMotion.matches) {
      outgoing.inert = true;
      outgoing.classList.add("is-leaving");
      if (backwards) outgoing.classList.add("reverse");
      transitionTimer = setTimeout(enter, 230);
    } else enter();
  }
  function navigate(index) {
    const hash = `#${pages[index].id}`;
    if (location.hash !== hash) history.pushState(null, "", hash);
    // Move focus out of a page before it becomes hidden.
    if (pages.some((page) => page.contains(document.activeElement)))
      tabs[index].focus({ preventScroll: true });
    show(index);
  }
  document.addEventListener("click", (event) => {
    const link = event.target.closest('a[href^="#"]');
    if (
      !link ||
      event.ctrlKey ||
      event.metaKey ||
      event.shiftKey ||
      event.altKey
    )
      return;
    const index = pages.findIndex(
      (page) => `#${page.id}` === link.getAttribute("href"),
    );
    if (index < 0) return;
    event.preventDefault();
    navigate(index);
    if (link.classList.contains("skip-link")) {
      clearTimeout(transitionTimer);
      pages.forEach((page, i) => {
        page.hidden = i !== index;
        page.inert = i !== index;
      });
      pages[index].classList.remove("is-leaving");
      pages[index].focus();
      revealAll();
    }
  });
  function fromHash() {
    const index = pages.findIndex((page) => `#${page.id}` === location.hash);
    show(index < 0 ? 0 : index);
  }
  window.addEventListener("popstate", fromHash);
  window.addEventListener("hashchange", fromHash);
  previous.addEventListener("click", () => {
    if (active > 0) navigate(active - 1);
  });
  next.addEventListener("click", () => {
    if (active < pages.length - 1) navigate(active + 1);
  });
  finish.addEventListener("click", revealAll);
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") revealAll();
  });
  reducedMotion.addEventListener("change", () => {
    if (reducedMotion.matches) revealAll();
  });
  const initial = pages.findIndex((page) => `#${page.id}` === location.hash);
  show(initial < 0 ? 0 : initial, false);
})();
