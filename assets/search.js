(() => {
  const projectRoot = new URL('../', document.currentScript.src);
  const catalogs = [
    { path: 'html-notes/index.html', heading: 'topics-heading', category: 'HTML notes' },
    { path: 'html-work/freecodecamp/index.html', heading: 'projects-heading', category: 'freeCodeCamp exercises' },
    { path: 'html-work/w3-schools/index.html', heading: 'exercises-heading', category: 'W3Schools exercises' },
  ];

  const host = document.createElement('div');
  const component = host.attachShadow({ mode: 'open' });
  component.innerHTML = `
    <style>
      :host {
        all: initial;
        position: fixed;
        z-index: 1000;
        inset: 0.75rem 0.75rem auto auto;
        color: #222;
        font: 1rem/1.5 system-ui, sans-serif;
      }
      summary {
        width: max-content;
        margin-inline-start: auto;
        padding: 0.4rem 0.75rem;
        border-radius: 0.5rem;
        background: #222;
        color: white;
        cursor: pointer;
      }
      .panel {
        box-sizing: border-box;
        width: min(22rem, calc(100vw - 1.5rem));
        max-height: 65vh;
        overflow: auto;
        margin-top: 0.4rem;
        padding: 0.75rem;
        border: 1px solid #777;
        border-radius: 0.5rem;
        background: white;
        box-shadow: 0 4px 16px #0003;
      }
      label { display: block; }
      input {
        box-sizing: border-box;
        width: 100%;
        padding: 0.45rem;
        font: inherit;
      }
      p, ul { margin-block: 0.5rem 0; }
      p:empty { margin: 0; }
      ul { padding-inline-start: 1.2rem; }
      li + li { margin-top: 0.5rem; }
      .excerpt { display: block; color: #444; font-size: 0.875rem; }
      [hidden] { display: none; }
    </style>
    <details>
      <summary>Search</summary>
      <div class="panel">
        <form role="search">
          <label for="query">Search page titles and text</label>
          <input id="query" type="search" />
        </form>
        <p role="status"></p>
        <ul aria-label="Search results" hidden></ul>
      </div>
    </details>
  `;
  document.body.append(host);

  const details = component.querySelector('details');
  const summary = component.querySelector('summary');
  const form = component.querySelector('form');
  const input = component.querySelector('input');
  const status = component.querySelector('[role="status"]');
  const results = component.querySelector('ul');
  let searchIndex;
  let searchVersion = 0;

  async function loadCatalog(catalog) {
    const catalogUrl = new URL(catalog.path, projectRoot);
    const response = await fetch(catalogUrl);
    if (!response.ok) throw new Error('Could not load the catalog');

    const page = new DOMParser().parseFromString(await response.text(), 'text/html');
    const section = page.getElementById(catalog.heading)?.closest('section');
    if (!section) throw new Error('Catalog section is missing');

    return [...section.querySelectorAll('li > a[href]')].map((link) => ({
      title: link.textContent.trim(),
      url: new URL(link.getAttribute('href'), response.url || catalogUrl).href,
      category: catalog.category,
    }));
  }

  async function loadPage(entry) {
    const response = await fetch(entry.url);
    if (!response.ok) throw new Error('Could not load page text');

    const page = new DOMParser().parseFromString(await response.text(), 'text/html');
    const content = page.body;
    content.querySelectorAll('script, style, template, noscript, nav, [hidden]').forEach((element) => element.remove());
    const walker = page.createTreeWalker(content, NodeFilter.SHOW_TEXT);
    const parts = [];
    while (walker.nextNode()) parts.push(walker.currentNode.textContent);
    const text = [page.title, ...parts].join(' ').replace(/\s+/g, ' ').trim();
    return { text, searchableText: text.toLowerCase() };
  }

  async function loadIndex() {
    const loaded = await Promise.allSettled(catalogs.map(loadCatalog));
    const available = loaded.filter((catalog) => catalog.status === 'fulfilled');
    if (!available.length) return null;

    const entries = available.flatMap((catalog) => catalog.value);
    entries.push({ title: 'Learning Tracker', url: new URL('tracker/tracking.html', projectRoot).href, category: 'Tracker' });
    let incomplete = available.length !== loaded.length;

    for (let start = 0; start < entries.length; start += 8) {
      const batch = entries.slice(start, start + 8);
      const pages = await Promise.allSettled(batch.map(loadPage));
      pages.forEach((page, index) => {
        if (page.status === 'fulfilled') Object.assign(batch[index], page.value);
        else incomplete = true;
      });
    }

    return { entries, incomplete };
  }

  function makeExcerpt({ text, searchableText }, terms) {
    const phrase = searchableText.indexOf(terms.join(' '));
    const longestMatch = [...terms].sort((a, b) => b.length - a.length)
      .find((term) => searchableText.includes(term));
    const hit = phrase >= 0 ? phrase : searchableText.indexOf(longestMatch);
    const start = Math.max(0, hit - 45);
    const end = start + 150;
    return `${start ? '…' : ''}${text.slice(start, end).trim()}${end < text.length ? '…' : ''}`;
  }

  async function search() {
    const version = ++searchVersion;
    const query = input.value.trim().toLowerCase();
    results.replaceChildren();
    results.hidden = true;
    status.textContent = '';
    if (!query) return;

    status.textContent = 'Loading search results…';
    searchIndex ??= loadIndex();
    const index = await searchIndex;
    if (version !== searchVersion) return;

    if (!index) {
      searchIndex = undefined;
      status.textContent = 'Search is unavailable. Open this page through Live Server and try again.';
      return;
    }

    const terms = query.split(/\s+/);
    const titleMatches = [];
    const textMatches = [];
    for (const entry of index.entries) {
      const title = entry.title.toLowerCase();
      if (terms.every((term) => title.includes(term))) titleMatches.push(entry);
      else if (entry.searchableText && terms.every((term) =>
        title.includes(term) || entry.searchableText.includes(term),
      )) textMatches.push(entry);
    }
    const matches = [...titleMatches, ...textMatches];

    for (const match of matches) {
      const item = document.createElement('li');
      const link = document.createElement('a');
      link.href = match.url;
      link.textContent = match.title;
      item.append(link, ` (${match.category})`);
      if (textMatches.includes(match)) {
        const excerpt = document.createElement('span');
        excerpt.className = 'excerpt';
        excerpt.textContent = makeExcerpt(match, terms);
        item.append(excerpt);
      }
      results.append(item);
    }

    results.hidden = matches.length === 0;
    const count = matches.length === 1 ? '1 result' : `${matches.length} results`;
    status.textContent = index.incomplete ? `${count}. Some page text could not be loaded.` : count;
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    search();
  });
  input.addEventListener('input', search);
  details.addEventListener('toggle', () => {
    if (details.open) input.focus();
  });
  details.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape' || !details.open) return;
    event.preventDefault();
    details.open = false;
    summary.focus();
  });
})();
