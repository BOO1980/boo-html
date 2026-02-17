async function loadSidebar() {
  const mount = document.getElementById('sidebar-mount');
  if (!mount) return;

  const res = await fetch('../partials/sidebar.html');
  mount.innerHTML = await res.text();
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
