import { decorateIcons, createOptimizedPicture } from '../../scripts/aem.js';

export default function decorate(block) {
  const rows = [...block.children];
  const kicker = rows[0]?.children[0]?.textContent?.trim();
  const heading = rows[0]?.children[1]?.textContent?.trim();
  const lede = rows[1]?.children[0]?.textContent?.trim();

  const facts = [];
  let actionRow = null;
  let mapPicture = null;

  rows.slice(2).forEach((row) => {
    const cells = [...row.children];
    const possibleIcon = cells[0]?.textContent?.trim();
    if (cells.length >= 3 && cells[1]?.textContent?.trim()) {
      facts.push({ icon: possibleIcon, title: cells[1]?.textContent?.trim(), body: cells[2]?.textContent?.trim() });
    } else if (row.querySelector('picture')) {
      mapPicture = row.querySelector('picture');
    } else if (row.querySelector('a') || (cells.length === 4 && cells[1]?.textContent?.trim())) {
      actionRow = row;
    }
  });

  const primaryLink = actionRow?.querySelector('a') || actionRow?.children[0]?.querySelector('a');
  const primaryText = primaryLink?.textContent?.trim() || actionRow?.children[0]?.textContent?.trim();
  const primaryHref = primaryLink?.href || '#';
  const secondaryLink = actionRow?.children[1]?.querySelector('a') || actionRow?.children[2]?.querySelector('a');
  const secondaryText = secondaryLink?.textContent?.trim() || actionRow?.children[1]?.textContent?.trim();
  const secondaryHref = secondaryLink?.href || '#';

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
              ${f.icon ? `<span class="icon icon-${f.icon}"></span>` : ''}
              <strong>${f.title}</strong>
              <span>${f.body}</span>
            </article>`).join('')}
        </div>
        <div class="visit-actions">
          ${primaryText ? `<a class="visit-primary-btn" href="${primaryHref}"><span class="icon icon-map-pin"></span> ${primaryText}</a>` : ''}
          ${secondaryText ? `<a class="visit-secondary-btn" href="${secondaryHref}"><span class="icon icon-shopping-bag"></span> ${secondaryText}</a>` : ''}
        </div>
      </div>
      <div class="visit-map">
        ${mapPicture ? mapPicture.outerHTML : ''}
        <div class="map-pin">Milwaukee counter</div>
      </div>
    </div>`;

  block.querySelectorAll('img').forEach((img) => {
    img.closest('picture')?.replaceWith(
      createOptimizedPicture(img.src, img.alt, false, [{ width: '800' }]),
    );
  });
  decorateIcons(block);
}
