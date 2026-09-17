(() => {
  const counter = document.getElementById("view-counter");
  const value = document.getElementById("view-count");
  const configuredSite = counter?.dataset.goatcounterSite?.trim();
  if (!counter || !value || !configuredSite) return;

  let site;
  try {
    site = new URL(configuredSite);
    if (site.protocol !== "https:" || site.username || site.password) return;
  } catch {
    return;
  }

  counter.hidden = false;
  // Count the homepage once per visit; changing notebook tabs is not a new view.
  // Local previews never send analytics, but can display the real public count.
  const productionHosts = ["nihardwivedi.com", "www.nihardwivedi.com", "nihardwivedi.github.io"];
  if (productionHosts.includes(location.hostname)) {
    const tracker = document.createElement("script");
    tracker.async = true;
    tracker.src = "https://gc.zgo.at/count.js";
    tracker.setAttribute("data-goatcounter", `${site.origin}/count`);
    tracker.setAttribute("data-goatcounter-settings", JSON.stringify({ path: "/" }));
    document.head.append(tracker);
  }

  async function loadCount() {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    try {
      const endpoint = new URL(`/counter/${encodeURIComponent("/")}.json`, site.origin);
      // Keep the public total scoped to the day analytics was enabled.
      const start = counter.dataset.countStart;
      if (start && /^\d{4}-\d{2}-\d{2}$/.test(start)) endpoint.searchParams.set("start", start);
      const response = await fetch(endpoint.href, {
        credentials: "omit",
        referrerPolicy: "no-referrer",
        signal: controller.signal,
      });
      // GoatCounter returns a JSON zero with 404 for a page without visits yet.
      if (!response.ok && response.status !== 404) throw new Error("Counter unavailable");
      const data = await response.json();
      const raw = String(data.count ?? "").replaceAll(",", "");
      if (!/^\d+$/.test(raw)) throw new Error("Invalid count");
      const count = Number(raw);
      if (!Number.isSafeInteger(count) || (response.status === 404 && count !== 0)) {
        throw new Error("Invalid count");
      }
      value.textContent = new Intl.NumberFormat("en").format(count);
    } catch {
      // Never replace an unavailable shared count with a fabricated zero.
      value.textContent = "Unavailable";
    } finally {
      clearTimeout(timeout);
    }
  }

  void loadCount();
})();
