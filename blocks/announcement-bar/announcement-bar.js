import { decorateIcons } from '../../scripts/aem.js';

export default function decorate(block) {
  const items = [...block.children].map((row) => {
    const cells = [...row.children];
    return {
      icon: cells[0]?.textContent?.trim() || '',
      text: cells[1]?.textContent?.trim() || cells[0]?.textContent?.trim() || '',
    };
  }).filter((item) => item.text);

  const track = items.map(({ icon, text }) => `
    <span class="ticker-item">
      ${icon ? `<span class="icon icon-${icon}"></span>` : ''}
      ${text}
    </span>`).join('');

  block.innerHTML = `
    <div class="ticker" aria-hidden="true">
      <div class="ticker-track">${track}</div>
      <div class="ticker-track" aria-hidden="true">${track}</div>
    </div>`;

  decorateIcons(block);
}
