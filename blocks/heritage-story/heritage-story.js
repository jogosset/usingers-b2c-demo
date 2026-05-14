import { decorateIcons, createOptimizedPicture } from '../../scripts/aem.js';

export default function decorate(block) {
  const rows = [...block.children];
  const picture = rows[0]?.querySelector('picture');
  const labelYear = rows[1]?.children[0]?.textContent?.trim();
  const labelText = rows[1]?.children[1]?.textContent?.trim();
  const kicker = rows[2]?.children[0]?.textContent?.trim();
  const heading = rows[2]?.children[1]?.textContent?.trim();
  const lede = rows[3]?.children[0]?.textContent?.trim();
  const timelineItems = rows.slice(4).map((row) => ({
    year: row.children[0]?.textContent?.trim(),
    title: row.children[1]?.textContent?.trim(),
    body: row.children[2]?.textContent?.trim(),
  })).filter((t) => t.title);

  block.innerHTML = `
    <div class="heritage-media">
      ${picture ? picture.outerHTML : ''}
      <div class="heritage-label">
        <strong>${labelYear || ''}</strong>
        <span>${labelText || ''}</span>
      </div>
    </div>
    <div class="heritage-content">
      <div>
        <span class="section-kicker">${kicker || ''}</span>
        <h2 class="section-title">${heading || ''}</h2>
        <p class="section-lede">${lede || ''}</p>
      </div>
      <div class="timeline">
        ${timelineItems.map((t) => `
          <article class="timeline-item">
            <strong>${t.year}</strong>
            <div>
              <h3>${t.title}</h3>
              <p>${t.body}</p>
            </div>
          </article>`).join('')}
      </div>
    </div>`;

  block.querySelectorAll('img').forEach((img) => {
    img.closest('picture')?.replaceWith(
      createOptimizedPicture(img.src, img.alt, false, [{ width: '800' }]),
    );
  });
  decorateIcons(block);
}
