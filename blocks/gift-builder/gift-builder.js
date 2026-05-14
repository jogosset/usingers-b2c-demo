import { decorateIcons, createOptimizedPicture } from '../../scripts/aem.js';

function renderIcon(cell) {
  if (!cell) return '';
  const picture = cell.querySelector('picture');
  if (picture) return `<span class="block-icon">${picture.outerHTML}</span>`;
  const img = cell.querySelector('img');
  if (img) return `<span class="block-icon"><img src="${img.src}" alt="${img.alt || ''}" loading="lazy"></span>`;
  const name = cell.textContent?.trim();
  return name ? `<span class="icon icon-${name}"></span>` : '';
}

export default function decorate(block) {
  const rows         = [...block.children];
  const eyebrow      = rows[0]?.children[0]?.textContent?.trim();
  const eyebrowIconCell = rows[0]?.children[1];
  const heading      = rows[1]?.children[0]?.textContent?.trim();
  const lede         = rows[2]?.children[0]?.textContent?.trim();
  const note         = rows[3]?.children[0]?.textContent?.trim();

  const cards = rows.slice(4).map((row) => {
    const cells = [...row.children];
    const link  = cells[5]?.querySelector('a');
    return {
      picture: cells[0]?.querySelector('picture'),
      badge:   cells[1]?.textContent?.trim(),
      title:   cells[2]?.textContent?.trim(),
      body:    cells[3]?.textContent?.trim(),
      price:   cells[4]?.textContent?.trim(),
      href:    link?.href || '#',
    };
  }).filter((c) => c.title);

  block.innerHTML = `
    <div class="gift-header">
      <div>
        <span class="gift-eyebrow">
          ${renderIcon(eyebrowIconCell)}
          ${eyebrow || ''}
        </span>
        <h2 class="section-title">${heading || ''}</h2>
        <p class="section-lede">${lede || ''}</p>
      </div>
      ${note ? `<p class="gift-note">${note}</p>` : ''}
    </div>
    <div class="gift-grid">
      ${cards.map((c) => `
        <article class="gift-card">
          <div class="gift-card-media">
            ${c.picture ? c.picture.outerHTML : ''}
          </div>
          <div class="gift-card-content">
            <span class="badge">${c.badge}</span>
            <h3>${c.title}</h3>
            <p>${c.body}</p>
            <strong class="gift-price">${c.price}</strong>
          </div>
        </article>`).join('')}
    </div>`;

  block.querySelectorAll('.gift-card-media img').forEach((img) => {
    img.closest('picture')?.replaceWith(
      createOptimizedPicture(img.src, img.alt, false, [{ width: '800' }]),
    );
  });

  block.querySelectorAll('.block-icon img').forEach((img) => {
    img.closest('picture')?.replaceWith(
      createOptimizedPicture(img.src, img.alt, false, [{ width: '32' }]),
    );
  });

  decorateIcons(block);
}
