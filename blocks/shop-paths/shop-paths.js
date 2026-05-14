import { createOptimizedPicture } from '../../scripts/aem.js';

export default function decorate(block) {
  const cards = [...block.children].map((row) => {
    const cells   = [...row.children];
    const picture = cells[0]?.querySelector('picture');
    const link    = cells[3]?.querySelector('a');
    return {
      picture,
      heading:  cells[1]?.textContent?.trim(),
      body:     cells[2]?.textContent?.trim(),
      linkText: link?.textContent?.trim() || cells[3]?.textContent?.trim(),
      href:     link?.href || '#',
    };
  }).filter((c) => c.heading);

  block.innerHTML = `
    <div class="shop-paths-grid">
      ${cards.map(({ picture, heading, body, linkText, href }) => `
        <a class="path-card" href="${href}">
          ${picture ? picture.outerHTML : ''}
          <div class="path-content">
            <h3>${heading}</h3>
            <p>${body}</p>
            <span class="path-link">${linkText}</span>
          </div>
        </a>`).join('')}
    </div>`;

  block.querySelectorAll('.path-card > picture img').forEach((img) => {
    img.closest('picture')?.replaceWith(
      createOptimizedPicture(img.src, img.alt, false, [{ width: '800' }]),
    );
  });
}
