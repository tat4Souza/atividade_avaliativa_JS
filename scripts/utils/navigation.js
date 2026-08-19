document.addEventListener("DOMContentLoaded", () => {
  const mainContent = document.getElementById("content");
  const dynamicMenu = document.getElementById("dynamicMenu");

  const isLocalhost =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1";
  const repoName = window.location.pathname.split("/")[1];
  const BASE_PATH = isLocalhost ? "" : `/${repoName}`;

  const routes = {
    "/": { file: null },
    "/exercicio-1": { file: "exercicioUm" },
    "/exercicio-2": { file: "exercicioDois" },
    "/exercicio-3": { file: "exercicioTres" },
    "/exercicio-4": { file: "exercicioQuatro" },
    "/exercicio-5": { file: "exercicioCinco" },
    "/exercicio-6": { file: "exercicioSeis" },
  };

  for (let path in routes) {
    if (routes[path].file === null) continue;
    const menuLink = document.createElement("li");
    const formattedText = path
      .replace("/", "")
      .replace("-", "")
      .replace("io", "io ");

    menuLink.innerHTML = `<a href="${BASE_PATH}${path}" data-link>${formattedText}`;
    dynamicMenu.appendChild(menuLink);
  }

  const homeLink = document.querySelector(".header__title a");
  if (homeLink) {
    homeLink.href = `${BASE_PATH}/`;
  }

  async function loadHtml(fileName) {
    try {
      const res = await fetch(`./pages/${fileName}.html`);
      if (!res.ok) throw new Error("Página não encontrada");
      return await res.text();
    } catch (err) {
      return `<h2>Exercício não encontrado...</h2>`;
    }
  }

  async function router() {
    let currentPath = window.location.pathname;
    if (BASE_PATH && currentPath.startsWith(BASE_PATH)) {
      currentPath = currentPath.slice(BASE_PATH.length) || "/";
    }

    const route = routes[currentPath] || routes["/"];

    if (!route.file) {
      mainContent.innerHTML = "<h2>Selecione um exercício</h2>";
      return;
    }

    mainContent.innerHTML = await loadHtml(route.file);

    try {
      const script = await import(`../pages/${route.file}.js`);
      if (script.init) {
        script.init();
      }
    } catch (err) {
      console.log(`Sem script JS para ${route.file}`, err);
    }
  }

  function navigateTo(url) {
    window.history.pushState(null, null, url);
    router();
  }

  document.addEventListener("click", (e) => {
    if (e.target.matches("[data-link]")) {
      e.preventDefault();
      navigateTo(e.target.href);
    }
  });

  window.addEventListener("popstate", router);

  router();
});
