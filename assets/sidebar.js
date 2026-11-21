(function () {
  function resolveProjectRoot() {
    const currentScript = document.currentScript;

    if (currentScript?.src) {
      try {
        return new URL('../', currentScript.src);
      } catch {
        // Fallback to document.baseURI below.
      }
    }

    return new URL('../', document.baseURI);
  }

  const projectRoot = resolveProjectRoot();
  const href = (path) => new URL(path, projectRoot).toString();

  const sidebarHTML = `
    <aside class="sidebar" aria-label="Main navigation">
      <h2 class="sidebar-title">BOO HTML Vault</h2>

      <details class="nav-group" open>
        <summary>Home</summary>
        <nav class="nav-list" aria-label="Home">
          <a href="${href('html-notes/html-overview.html')}" data-page="overview">Home</a>
          <a href="${href('tracker/tracking.html')}" data-page="tracking">Learning Tracker</a>
        </nav>
      </details>
      <details class="nav-group" open>
        <summary>Notes</summary>
        <nav class="nav-list" aria-label="Notes">
          <a href="${href('html-notes/index.html')}" data-page="notes-index">All HTML Notes</a>
          <a href="${href('html-notes/html-basic-elements.html')}" data-page="basic-elements">Basic Elements</a>
          <a href="${href('html-notes/html-attributes.html')}" data-page="attributes">Attributes</a>
          <a href="${href('html-notes/html-headers.html')}" data-page="headers">Headers</a>
          <a href="${href('html-notes/html-html5-elements.html')}" data-page="html5-elements">HTML5 Elements</a>
          <a href="${href('html-notes/html-boilerplate.html')}" data-page="boilerplate">Boilerplate</a>
          <a href="${href('html-notes/html-meta-element.html')}" data-page="meta-element">Meta Element</a> 
          <a href="${href('html-notes/html-section.html')}" data-page="section">Section Element</a>
          <a href="${href('html-notes/html-images.html')}" data-page="images">Images</a>
          <a href="${href('html-notes/html-anchor.html')}" data-page="anchor">Anchor</a>
          <a href="${href('html-notes/html-lists.html')}" data-page="lists">Lists</a>
          <a href="${href('html-notes/html-emphasis-and-idiomatic-elements.html')}" data-page="emphasis-and-idiomatic-elements">Emphasis and Idiomatic Elements</a>
        </nav>
      </details>
      <details class="nav-group">
        <summary>Lab</summary>
        <nav class="nav-list" aria-label="Labs">
          <a href="${href('html-work/freecodecamp/Lab-Camperbot/index.html')}" data-page="camperbot-lab">Camperbot</a>
        </nav>
      </details>
      <details class="nav-group">
        <summary>Exercises</summary>
        <nav class="nav-list" aria-label="Exercises">
          <a href="${href('html-work/freecodecamp/index.html')}" data-page="fcc-index">All freeCodeCamp Exercises</a>
          <a href="${href('html-work/freecodecamp/CatPhotoApp.html')}" data-page="cat-photo-app">Cat Photo App</a>
          <a href="${href('html-work/w3-schools/index.html')}" data-page="w3-index">W3Schools Exercises</a>
        </nav>
      </details>
    </aside>
  `;

  function mountSidebar() {
    const mount = document.getElementById('sidebar-mount');
    if (!mount) return;
    mount.innerHTML = sidebarHTML;
  }

  function highlightCurrentPage() {
    const page = document.body.dataset.page;
    const currentPath = new URL(window.location.href).pathname;

    document.querySelectorAll('.nav-list a').forEach((a) => {
      const pageMatch = page && a.dataset.page === page;
      const pathMatch = new URL(a.href, window.location.href).pathname === currentPath;
      a.classList.toggle('active-page', Boolean(pageMatch || pathMatch));
    });
  }

  function persistNavGroups() {
    const groups = Array.from(document.querySelectorAll('.nav-group'));
    const keyBase = 'html-vault:nav:';

    // restore
    groups.forEach((details) => {
      const summaryText = (details.querySelector('summary')?.textContent || 'group').trim().toLowerCase();
      const key = keyBase + summaryText;
      const saved = localStorage.getItem(key);
      if (saved !== null) details.open = saved === 'open';
    });

    // save
    groups.forEach((details) => {
      details.addEventListener('toggle', () => {
        const summaryText = (details.querySelector('summary')?.textContent || 'group').trim().toLowerCase();
        const key = keyBase + summaryText;
        localStorage.setItem(key, details.open ? 'open' : 'closed');
      });
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    mountSidebar();
    highlightCurrentPage();
    persistNavGroups();
  });
})();
