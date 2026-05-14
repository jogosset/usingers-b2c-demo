import { decorateIcons, createOptimizedPicture } from '../../scripts/aem.js';

const ICONS = { all: 'sparkles', quick: 'zap', lean: 'leaf', spicy: 'flame' };

export default function decorate(block) {
  const rows = [...block.children];

  // Row 0: kicker | heading
  const kicker = rows[0]?.children[0]?.textContent?.trim();
  const heading = rows[0]?.children[1]?.textContent?.trim();
  // Row 1: body lede
  const lede = rows[1]?.children[0]?.textContent?.trim();
  // Row 2: filter labels "all:Featured, quick:Quick Cook, lean:Lean, spicy:Spicy"
  const filterConfig = rows[2]?.children[0]?.textContent?.trim() || 'all:All, quick:Quick Cook, lean:Lean, spicy:Spicy';
  const filters = filterConfig.split(',').map((f) => {
    const [key, label] = f.split(':').map((s) => s.trim());
    return { key, label };
  });

  // Rows 3+: products — image | name | description | price | unit | weight | badge | tags
  const products = rows.slice(3).map((row) => {
    const cells = [...row.children];
    return {
      picture: cells[0]?.querySelector('picture'),
      name: cells[1]?.textContent?.trim(),
      desc: cells[2]?.textContent?.trim(),
      price: cells[3]?.textContent?.trim(),
      unit: cells[4]?.textContent?.trim(),
      weight: parseFloat(cells[5]?.textContent?.trim() || 0.75),
      badge: cells[6]?.textContent?.trim(),
      tags: cells[7]?.textContent?.trim()?.split(',').map((t) => t.trim()) || ['all'],
    };
  }).filter((p) => p.name);

  let activeFilter = 'all';

  function renderShelf(container) {
    const visible = products.filter((p) => activeFilter === 'all' || p.tags.includes(activeFilter));
    container.innerHTML = visible.map((p) => `
      <article class="product-card" data-weight="${p.weight}" data-price="${p.price?.replace(/[^0-9.]/g, '') || 0}">
        <div class="product-photo">
          ${p.picture ? p.picture.outerHTML : `<div class="product-photo-placeholder"></div>`}
          <span class="badge">${p.badge || ''}</span>
        </div>
        <div class="product-body">
          <h3>${p.name}</h3>
          <p>${p.desc}</p>
          <div class="meta-row">
            <span class="price">${p.price}</span>
            <span class="unit">${p.unit}</span>
          </div>
        </div>
        <div class="product-actions">
          <div class="stepper">
            <button type="button" data-action="decrease" aria-label="Decrease">
              <span class="icon icon-minus"></span>
            </button>
            <output>0</output>
            <button type="button" data-action="increase" aria-label="Increase">
              <span class="icon icon-plus"></span>
            </button>
          </div>
          <button class="add-button" type="button" data-action="add">Add to box</button>
        </div>
      </article>`).join('');

    container.querySelectorAll('img').forEach((img) => {
      img.closest('picture')?.replaceWith(
        createOptimizedPicture(img.src, img.alt, false, [{ width: '600' }]),
      );
    });
    decorateIcons(container);
  }

  block.innerHTML = `
    <div class="feature-header">
      <div>
        <span class="section-kicker">${kicker || ''}</span>
        <h2 class="section-title">${heading || ''}</h2>
        <p class="section-lede">${lede || ''}</p>
      </div>
      <div class="chips" role="group" aria-label="Product filters">
        ${filters.map((f, i) => `
          <button class="chip${i === 0 ? ' active' : ''}" type="button" data-filter="${f.key}">
            <span class="icon icon-${ICONS[f.key] || 'sparkles'}"></span> ${f.label}
          </button>`).join('')}
      </div>
    </div>
    <div class="product-shelf" aria-live="polite"></div>`;

  const shelf = block.querySelector('.product-shelf');
  renderShelf(shelf);
  decorateIcons(block);

  block.querySelectorAll('.chip[data-filter]').forEach((btn) => {
    btn.addEventListener('click', () => {
      activeFilter = btn.dataset.filter;
      block.querySelectorAll('.chip').forEach((c) => c.classList.toggle('active', c === btn));
      renderShelf(shelf);
    });
  });

  shelf.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-action]');
    const card = e.target.closest('.product-card');
    if (!btn || !card) return;
    const output = card.querySelector('output');
    let qty = parseInt(output.textContent, 10) || 0;
    if (btn.dataset.action === 'decrease') qty = Math.max(0, qty - 1);
    if (btn.dataset.action === 'increase' || btn.dataset.action === 'add') qty += 1;
    output.textContent = qty;
    const name = card.querySelector('h3')?.textContent;
    const weight = parseFloat(card.dataset.weight || 0.75);
    const price = parseFloat(card.dataset.price || 0);
    document.dispatchEvent(new CustomEvent('usinger:shelf-update', {
      detail: { name, weight, price, qty },
    }));
  });
}
