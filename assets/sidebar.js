(function () {
  const sidebarHTML = `
    <aside class="sidebar" aria-label="Main navigation">
      <h2 class="sidebar-title">BOO HTML Vault</h2>

      <details class="nav-group" open>
        <summary>Notes</summary>
        <nav class="nav-list" aria-label="Notes">
          <a href="../html-notes/html-overview.html" data-page="overview">Main Overview</a>
          <a href="../html-notes/html-basic-elements.html" data-page="basic-elements">Basic Elements</a>
          <a href="../html-notes/html-attributes.html" data-page="attributes">Attributes</a>
          <a href="../html-notes/html-headers.html" data-page="headers">Headers</a>
          <a href="../html-notes/html-html5-elements.html" data-page="html5-elements">HTML5 Elements</a>
          <a href="../html-notes/html-boilerplate.html" data-page="boilerplate">Boilerplate</a>
        </nav>
      </details>

      <details class="nav-group">
        <summary>Workshops</summary>
        <nav class="nav-list" aria-label="Workshops">
          <a href="../workshops/cat-photo-app.html" data-page="cat-photo-app">Cat Photo App</a>
          <a href="../workshops/pet-adoption-debug.html" data-page="pet-adoption-debug">Pet Adoption Debug</a>
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
    if (!page) return;

    document.querySelectorAll('.nav-list a[data-page]').forEach((a) => {
      a.classList.toggle('active-page', a.dataset.page === page);
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
