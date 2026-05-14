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
  const items = [...block.children].map((row) => ({
    iconCell: row.children[0],
    text: row.children[1]?.textContent?.trim() || row.children[0]?.textContent?.trim() || '',
    hasImage: !!(row.children[0]?.querySelector('picture, img')),
  })).filter((item) => item.text || item.hasImage);

  const track = items.map(({ iconCell, text }) => `
    <span class="ticker-item">
      ${renderIcon(iconCell)}
      ${text}
    </span>`).join('');

  block.innerHTML = `
    <div class="ticker" aria-hidden="true">
      <div class="ticker-track">${track}</div>
      <div class="ticker-track" aria-hidden="true">${track}</div>
    </div>`;

  block.querySelectorAll('.block-icon img').forEach((img) => {
    img.closest('picture')?.replaceWith(
      createOptimizedPicture(img.src, img.alt, false, [{ width: '32' }]),
    );
  });

  decorateIcons(block);
}
