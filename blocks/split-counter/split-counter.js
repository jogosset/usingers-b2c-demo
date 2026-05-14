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

  // ── Left panel ──────────────────────────────────────
  // Row 0: background image (optional)
  const bgPicture       = rows[0]?.querySelector('picture');
  // Row 1: eyebrow text | eyebrow icon
  const eyebrow         = rows[1]?.children[0]?.textContent?.trim();
  const eyebrowIconCell = rows[1]?.children[1];
  // Row 2: H1 heading
  const heading         = rows[2]?.children[0]?.textContent?.trim();
  // Row 3: body paragraph
  const body            = rows[3]?.children[0]?.textContent?.trim();
  // Row 4: primary CTA | ghost CTA
  const primaryLink     = rows[4]?.children[0]?.querySelector('a');
  const ghostLink       = rows[4]?.children[1]?.querySelector('a');
  // Rows 5–7: proof stats (value | label)
  const proofStats      = rows.slice(5, 8).map((row) => ({
    value: row.children[0]?.textContent?.trim(),
    label: row.children[1]?.textContent?.trim(),
  })).filter((s) => s.value);

  // ── Right panel ─────────────────────────────────────
  // Row 8:  panel background image
  const panelPicture    = rows[8]?.querySelector('picture');
  // Row 9:  stamp text (supports line breaks via " / " separator)
  const stampRaw        = rows[9]?.children[0]?.textContent?.trim() || 'Famous\nSausage';
  const stampHtml       = stampRaw.replace(/\s*\/\s*/g, '<br>').replace(/\n/g, '<br>');
  // Row 10: panel kicker
  const panelKicker     = rows[10]?.children[0]?.textContent?.trim();
  // Row 11: panel heading
  const panelHeading    = rows[11]?.children[0]?.textContent?.trim();
  // Rows 12+: list items (icon cell | text)
  const listItems       = rows.slice(12).map((row) => ({
    iconCell: row.children[0],
    text:     row.children[1]?.textContent?.trim() || row.children[0]?.textContent?.trim(),
  })).filter((item) => item.text);

  block.innerHTML = `
    <div class="counter-left">
      ${bgPicture ? `<div class="counter-bg" aria-hidden="true">${bgPicture.outerHTML}</div>` : ''}
      <div class="counter-left-head">
        <span class="counter-eyebrow">
          ${renderIcon(eyebrowIconCell)}
          ${eyebrow || ''}
        </span>
        <h1>${heading || ''}</h1>
        <p>${body || ''}</p>
      </div>
      <div class="counter-actions">
        ${primaryLink ? `<a class="counter-primary-btn" href="${primaryLink.href}">${primaryLink.textContent}</a>` : ''}
        ${ghostLink   ? `<a class="counter-ghost-btn"   href="${ghostLink.href}">${ghostLink.textContent}</a>`   : ''}
      </div>
      <div class="counter-proof">
        ${proofStats.map((s) => `
          <div class="proof-item">
            <strong>${s.value}</strong>
            <span>${s.label}</span>
          </div>`).join('')}
      </div>
    </div>

    <aside class="counter-right">
      <div class="counter-panel-media">
        ${panelPicture ? panelPicture.outerHTML : ''}
        <div class="panel-stamp" aria-hidden="true">${stampHtml}</div>
      </div>
      <div class="counter-panel-body">
        ${panelKicker ? `<span class="section-kicker">${panelKicker}</span>` : ''}
        ${panelHeading ? `<h2>${panelHeading}</h2>` : ''}
        ${listItems.length ? `
          <ul class="panel-list">
            ${listItems.map((item) => `
              <li>
                ${renderIcon(item.iconCell)}
                <span>${item.text}</span>
              </li>`).join('')}
          </ul>` : ''}
      </div>
    </aside>`;

  // Optimise images
  block.querySelectorAll('.counter-bg img, .counter-panel-media img').forEach((img) => {
    img.closest('picture')?.replaceWith(
      createOptimizedPicture(img.src, img.alt, false, [{ width: '900' }]),
    );
  });
  block.querySelectorAll('.block-icon img').forEach((img) => {
    img.closest('picture')?.replaceWith(
      createOptimizedPicture(img.src, img.alt, false, [{ width: '32' }]),
    );
  });

  decorateIcons(block);
}
