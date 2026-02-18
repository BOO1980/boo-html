async function loadSidebar() {
  const mount = document.getElementById('sidebar-mount');
  if (!mount) return;

  // If another script already mounted a sidebar, don't override it.
  if (mount.childElementCount > 0 || mount.textContent.trim()) return;

  try {
    const res = await fetch('../partials/sidebar.html');
    if (!res.ok) return;

    // Guard again in case the sidebar was mounted while fetch was in-flight.
    if (mount.childElementCount > 0 || mount.textContent.trim()) return;

    mount.innerHTML = await res.text();
  } catch {
    // Ignore fetch failures (e.g. opening files directly without a web server).
  }
}

function highlightCurrentPage() {
  const page = document.body.dataset.page;
  if (!page) return;

  const links = document.querySelectorAll('.sidebar a[data-page]');
  links.forEach((link) => {
    link.classList.toggle('active-page', link.dataset.page === page);
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  await loadSidebar();
  highlightCurrentPage();
});
