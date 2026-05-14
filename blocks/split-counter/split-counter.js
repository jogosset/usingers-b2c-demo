import { decorateIcons, createOptimizedPicture } from '../../scripts/aem.js';

export default function decorate(block) {
  const rows = [...block.children];

  // Row 0: background image (optional)
  const bgPicture = rows[0]?.querySelector('picture');

  // Row 1: eyebrow | icon-name
  const eyebrow = rows[1]?.children[0]?.textContent?.trim();
  const eyebrowIcon = rows[1]?.children[1]?.textContent?.trim();

  // Row 2: h1 heading
  const heading = rows[2]?.children[0]?.textContent?.trim();

  // Row 3: body paragraph
  const body = rows[3]?.children[0]?.textContent?.trim();

  // Row 4: primary CTA link | ghost CTA link
  const primaryLink = rows[4]?.children[0]?.querySelector('a');
  const ghostLink = rows[4]?.children[1]?.querySelector('a');

  // Rows 5-7: proof stats (value | label)
  const proofStats = rows.slice(5, 8).map((row) => ({
    value: row.children[0]?.textContent?.trim(),
    label: row.children[1]?.textContent?.trim(),
  })).filter((s) => s.value);

  // Rows 8+: product cards (image | name | price | weight-lb | badge | tag)
  const products = rows.slice(8).map((row) => ({
    picture: row.children[0]?.querySelector('picture'),
    name: row.children[1]?.textContent?.trim(),
    price: row.children[2]?.textContent?.trim(),
    weight: row.children[3]?.textContent?.trim(),
    badge: row.children[4]?.textContent?.trim(),
    tag: row.children[5]?.textContent?.trim(),
  })).filter((p) => p.name);

  block.innerHTML = `
    <div class="counter-left">
      ${bgPicture ? `<div class="counter-bg" aria-hidden="true">${bgPicture.outerHTML}</div>` : ''}
      <div class="counter-left-head">
        <span class="counter-eyebrow">
          ${eyebrowIcon ? `<span class="icon icon-${eyebrowIcon}"></span>` : ''}
          ${eyebrow || ''}
        </span>
        <h1>${heading || ''}</h1>
        <p>${body || ''}</p>
      </div>
      <div class="counter-actions">
        ${primaryLink ? `<a class="counter-primary-btn" href="${primaryLink.href}">${primaryLink.textContent}</a>` : ''}
        ${ghostLink ? `<a class="counter-ghost-btn" href="${ghostLink.href}">${ghostLink.textContent}</a>` : ''}
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
      <div class="counter-panel-header">
        <div class="panel-steam" aria-hidden="true"><span></span><span></span><span></span></div>
        <div>
          <h2>Today's counter</h2>
          <p>Add to your cold box</p>
        </div>
        <div class="panel-stamp" aria-hidden="true">Famous<br>Sausage</div>
      </div>
      <div class="counter-card-stack">
        ${products.map((p) => `
          <div class="counter-card" data-weight="${p.weight || 0.75}" data-price="${p.price?.replace(/[^0-9.]/g, '') || 0}">
            <div class="counter-card-photo">${p.picture ? p.picture.outerHTML : ''}</div>
            <div class="counter-card-body">
              <h3>${p.name}</h3>
              <span class="counter-card-price">${p.price}</span>
              <span class="counter-card-badge">${p.badge}</span>
            </div>
            <div class="counter-card-action">
              <button class="cc-add-btn" type="button" aria-label="Add ${p.name} to cold box">
                <span class="icon icon-plus"></span> Add
              </button>
            </div>
          </div>`).join('')}
      </div>
      <div class="counter-panel-tally">
        <div class="tally-row">
          <span>Cold box weight</span>
          <strong class="js-tally-weight">0.0 lb</strong>
        </div>
        <div class="tally-bar"><div class="tally-bar-fill"></div></div>
        <div class="tally-row">
          <span class="js-tally-note">Add 6 lb to unlock cold checkout.</span>
          <span><strong class="js-tally-left">6.0</strong> lb left</span>
        </div>
      </div>
    </aside>`;

  // Optimize images
  block.querySelectorAll('.counter-bg img, .counter-card-photo img').forEach((img) => {
    img.closest('picture')?.replaceWith(
      createOptimizedPicture(img.src, img.alt, false, [{ width: '800' }]),
    );
  });

  decorateIcons(block);

  // Wire up add buttons — dispatches a custom event the cold-bar listens to
  block.querySelectorAll('.cc-add-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.counter-card');
      const weight = parseFloat(card.dataset.weight || 0.75);
      const price = parseFloat(card.dataset.price || 0);
      const name = card.querySelector('h3')?.textContent;
      document.dispatchEvent(new CustomEvent('usinger:add-item', {
        detail: { name, weight, price },
      }));
      btn.classList.add('in-cart');
      btn.innerHTML = '<span class="icon icon-check"></span> Added';
      decorateIcons(btn);
    });
  });

  // Listen for weight updates from cold-bar
  document.addEventListener('usinger:weight-updated', ({ detail }) => {
    const { weight, left, pct } = detail;
    const weightEl = block.querySelector('.js-tally-weight');
    const leftEl = block.querySelector('.js-tally-left');
    const noteEl = block.querySelector('.js-tally-note');
    const fill = block.querySelector('.tally-bar-fill');
    if (weightEl) weightEl.textContent = `${weight.toFixed(1)} lb`;
    if (leftEl) leftEl.textContent = left.toFixed(1);
    if (fill) fill.style.width = `${pct}%`;
    if (noteEl) noteEl.textContent = left <= 0
      ? 'Deli minimum met — ready to ship!'
      : `${left.toFixed(1)} lb left before cold checkout.`;
  });
}
