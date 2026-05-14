import { decorateIcons, createOptimizedPicture } from '../../scripts/aem.js';

export default function decorate(block) {
  const cards = [...block.children].map((row) => {
    const cells = [...row.children];
    const picture = cells[0]?.querySelector('picture');
    const icon = cells[1]?.textContent?.trim();
    const heading = cells[2]?.textContent?.trim();
    const body = cells[3]?.textContent?.trim();
    const link = cells[4]?.querySelector('a');
    const linkText = link?.textContent?.trim() || cells[4]?.textContent?.trim();
    const href = link?.href || '#';
    return { picture, icon, heading, body, linkText, href };
  }).filter((c) => c.heading);

  block.innerHTML = `
    <div class="shop-paths-grid">
      ${cards.map(({ picture, icon, heading, body, linkText, href }) => `
        <a class="path-card" href="${href}">
          ${picture ? picture.outerHTML : ''}
          <div class="path-content">
            ${icon ? `<span class="icon icon-${icon}"></span>` : ''}
            <h3>${heading}</h3>
            <p>${body}</p>
            <span class="path-link">${linkText} <span class="icon icon-arrow-right"></span></span>
          </div>
        </a>`).join('')}
    </div>`;

  block.querySelectorAll('img').forEach((img) => {
    img.closest('picture')?.replaceWith(
      createOptimizedPicture(img.src, img.alt, false, [{ width: '800' }]),
    );
  });

  decorateIcons(block);
}
