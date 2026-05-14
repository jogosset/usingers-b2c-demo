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
  const rows = [...block.children];
  const kicker  = rows[0]?.children[0]?.textContent?.trim();
  const heading = rows[0]?.children[1]?.textContent?.trim();
  const lede    = rows[1]?.children[0]?.textContent?.trim();

  const facts      = [];
  let actionRow    = null;
  let mapPicture   = null;

  rows.slice(2).forEach((row) => {
    const cells = [...row.children];
    // A fact row has 3 cells: icon cell | title | body
    if (cells.length >= 3 && cells[1]?.textContent?.trim()) {
      facts.push({
        iconCell: cells[0],
        title:    cells[1]?.textContent?.trim(),
        body:     cells[2]?.textContent?.trim(),
      });
    } else if (row.querySelector('picture')) {
      mapPicture = row.querySelector('picture');
    } else if (row.querySelector('a') || (cells.length >= 2 && cells[0]?.querySelector('a'))) {
      actionRow = row;
    }
  });

  const primaryLink    = actionRow?.children[0]?.querySelector('a');
  const primaryText    = primaryLink?.textContent?.trim() || '';
  const primaryHref    = primaryLink?.href || '#';
  const secondaryLink  = actionRow?.children[1]?.querySelector('a');
  const secondaryText  = secondaryLink?.textContent?.trim() || '';
  const secondaryHref  = secondaryLink?.href || '#';

  block.innerHTML = `
    <div class="visit-shell">
      <div class="visit-copy">
        <div>
          <span class="section-kicker">${kicker || ''}</span>
          <h2 class="section-title">${heading || ''}</h2>
          <p class="section-lede">${lede || ''}</p>
        </div>
        <div class="visit-facts">
          ${facts.map((f) => `
            <article class="visit-fact">
              ${renderIcon(f.iconCell)}
              <strong>${f.title}</strong>
              <span>${f.body}</span>
            </article>`).join('')}
        </div>
        <div class="visit-actions">
          ${primaryText   ? `<a class="visit-primary-btn"   href="${primaryHref}"><span class="icon icon-map-pin"></span> ${primaryText}</a>`     : ''}
          ${secondaryText ? `<a class="visit-secondary-btn" href="${secondaryHref}"><span class="icon icon-shopping-bag"></span> ${secondaryText}</a>` : ''}
        </div>
      </div>
      <div class="visit-map">
        ${mapPicture ? mapPicture.outerHTML : ''}
        <div class="map-pin">Milwaukee counter</div>
      </div>
    </div>`;

  block.querySelectorAll('.visit-map img').forEach((img) => {
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
