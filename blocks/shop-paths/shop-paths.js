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
  const cards = [...block.children].map((row) => {
    const cells    = [...row.children];
    const picture  = cells[0]?.querySelector('picture');
    const link     = cells[4]?.querySelector('a');
    return {
      picture,
      iconCell:  cells[1],
      heading:   cells[2]?.textContent?.trim(),
      body:      cells[3]?.textContent?.trim(),
      linkText:  link?.textContent?.trim() || cells[4]?.textContent?.trim(),
      href:      link?.href || '#',
    };
  }).filter((c) => c.heading);

  block.innerHTML = `
    <div class="shop-paths-grid">
      ${cards.map(({ picture, iconCell, heading, body, linkText, href }) => `
        <a class="path-card" href="${href}">
          ${picture ? picture.outerHTML : ''}
          <div class="path-content">
            ${renderIcon(iconCell)}
            <h3>${heading}</h3>
            <p>${body}</p>
            <span class="path-link">${linkText} <span class="icon icon-arrow-right"></span></span>
          </div>
        </a>`).join('')}
    </div>`;

  block.querySelectorAll('.path-card > picture img').forEach((img) => {
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
