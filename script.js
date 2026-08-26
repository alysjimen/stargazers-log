function elt(tag, attrs = {}, ...children) {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'class') e.className = v;
    else if (k === 'html') e.innerHTML = v;
    else e.setAttribute(k, v);
  }
  for (const c of children) {
    if (c == null) continue;
    e.append(typeof c === 'string' ? document.createTextNode(c) : c);
  }
  return e;
}

function formatDate(iso) {
  try { return new Date(iso).toLocaleString(); } catch (e) { return iso; }
}

function renderList(items) {
  const list = document.getElementById('starred-list');
  const empty = document.getElementById('empty');
  list.innerHTML = '';
  if (!items || items.length === 0) {
    empty.hidden = false;
    return;
  }
  empty.hidden = true;
  items.forEach(item => {
    const img = elt('img', {class: 'avatar', src: item.owner?.avatar_url || '', alt: item.owner?.login || 'owner'});
    const title = elt('h3', {class: 'repo-title'}, elt('a', {href: item.html_url, target: '_blank', rel: 'noopener noreferrer'}, item.full_name));
    const desc = elt('p', {class: 'repo-desc'}, item.description || '');
    const meta = elt('div', {class: 'repo-meta'},
      elt('span', {class: 'pill'}, item.language || '—'),
      elt('span', {}, `★ ${item.stargazers_count || 0}`),
      elt('span', {}, `Starred ${formatDate(item.starred_at)}`)
    );
    const main = elt('div', {class: 'repo-main'}, title, desc, meta);
    const li = elt('li', {class: 'star-item'}, img, main);
    list.appendChild(li);
  });
}

function showError(msg) {
  const list = document.getElementById('starred-list');
  list.innerHTML = '';
  const err = elt('div', {class: 'empty'}, msg);
  list.appendChild(err);
}

async function init() {
  try {
    const res = await fetch('events.json', {cache: 'no-store'});
    if (!res.ok) throw new Error('Failed to load events.json');
    const data = await res.json();
    renderList(data);
  } catch (err) {
    console.error(err);
    showError('Unable to load starred repositories.');
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else init();
