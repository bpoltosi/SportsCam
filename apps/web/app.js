(() => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.querySelectorAll('a[href^="#"]').forEach(link => link.addEventListener("click", event => {
    const id = link.getAttribute("href");
    if (id.length > 1) {
      const el = document.querySelector(id);
      if (el) { event.preventDefault(); el.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" }); }
    }
  }));

  const form = document.getElementById("lead-form");
  const note = document.getElementById("form-note");
  if (!form) return;

  form.addEventListener("submit", async event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    const endpoint = document.documentElement.dataset.leadEndpoint || window.SPORTSCAM_LEAD_ENDPOINT || "";
    const payload = Object.fromEntries(data.entries());

    if (endpoint) {
      try {
        const response = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json", "Accept": "application/json" },
          body: JSON.stringify(payload)
        });
        if (!response.ok) throw new Error("lead endpoint failed");
        form.reset();
        if (note) note.textContent = "Solicitação enviada. Em breve entraremos em contato.";
        return;
      } catch (_) {
        if (note) note.textContent = "Não foi possível enviar pelo canal online. Vamos abrir o e-mail como alternativa.";
      }
    }

    const subject = encodeURIComponent("Novo projeto SportsCam — " + (payload.company || payload.name));
    const body = encodeURIComponent(
      "Nome: " + payload.name +
      "\nE-mail: " + (payload.email || "") +
      "\nEmpresa/projeto: " + (payload.company || "") +
      "\n\nNecessidade:\n" + payload.message
    );
    window.location.href = "mailto:contato@sportscam.com.br?subject=" + subject + "&body=" + body;
  });
})();