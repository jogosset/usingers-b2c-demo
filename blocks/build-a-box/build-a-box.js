import { decorateIcons } from '../../scripts/aem.js';

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
  const rows         = [...block.children];
  const eyebrow      = rows[0]?.children[0]?.textContent?.trim();
  const eyebrowIconCell = rows[0]?.children[1];
  const heading      = rows[1]?.children[0]?.textContent?.trim();
  const lede         = rows[2]?.children[0]?.textContent?.trim();
  const steps        = rows.slice(3).map((row) => ({
    num:   row.children[0]?.textContent?.trim(),
    title: row.children[1]?.textContent?.trim(),
    body:  row.children[2]?.textContent?.trim(),
  })).filter((s) => s.title);

  block.innerHTML = `
    <div class="box-copy">
      <span class="box-eyebrow">
        ${renderIcon(eyebrowIconCell)}
        ${eyebrow || ''}
      </span>
      <h2 class="section-title">${heading || ''}</h2>
      <p class="section-lede">${lede || ''}</p>
      <div class="box-steps">
        ${steps.map((s) => `
          <article class="box-step">
            <strong aria-hidden="true">${s.num}</strong>
            <div><h3>${s.title}</h3><p>${s.body}</p></div>
          </article>`).join('')}
      </div>
    </div>

    <aside class="box-panel" aria-label="Cold box cart summary">
      <div class="box-panel-head">
        <h3>Cold Box</h3>
        <span class="icon icon-snowflake"></span>
      </div>
      <div class="progress-wrap">
        <div class="progress-stat">
          <div><strong class="js-weight-total">0.0</strong><span>lb added</span></div>
          <div><strong class="js-weight-left">6.0</strong><span>lb left</span></div>
        </div>
        <div class="progress-bar" aria-hidden="true">
          <span class="js-progress-bar"></span>
        </div>
      </div>
      <div class="cart-lines js-cart-lines">
        <p class="empty-cart">Your box is empty. Add a few deli favorites above to see the minimum and shipment state update.</p>
      </div>
      <div class="cart-total">
        <div class="total-row"><span>Subtotal</span><strong class="js-subtotal">$0.00</strong></div>
        <div class="total-row"><span>Deli weight</span><strong class="js-cart-weight">0.0 lb</strong></div>
        <div class="shipping-note js-shipping-note">Add 6 lb to unlock deli checkout.</div>
        <button class="box-cta-btn" type="button">
          <span class="icon icon-truck"></span> Schedule cold shipment
        </button>
      </div>
    </aside>`;

  decorateIcons(block);

  const cartState = new Map();

  function updateUI() {
    let weight = 0;
    let subtotal = 0;
    cartState.forEach(({ weight: w, price, qty }) => { weight += w * qty; subtotal += price * qty; });
    const left = Math.max(0, 6 - weight);
    const pct  = Math.min(100, (weight / 6) * 100);
    const fmt  = (v) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(v);

    block.querySelector('.js-weight-total').textContent = weight.toFixed(1);
    block.querySelector('.js-weight-left').textContent  = left.toFixed(1);
    block.querySelector('.js-cart-weight').textContent  = `${weight.toFixed(1)} lb`;
    block.querySelector('.js-subtotal').textContent     = fmt(subtotal);
    block.querySelector('.js-progress-bar').style.width = `${pct}%`;
    block.querySelector('.js-shipping-note').textContent = left <= 0
      ? 'Deli minimum met. Cold shipment can be scheduled.'
      : `${left.toFixed(1)} lb left before deli checkout.`;

    const lines = block.querySelector('.js-cart-lines');
    if (!cartState.size) {
      lines.innerHTML = '<p class="empty-cart">Your box is empty. Add a few deli favorites above to see the minimum and shipment state update.</p>';
    } else {
      lines.innerHTML = [...cartState.entries()].map(([name, { weight: w, price, qty }]) => `
        <div class="cart-line">
          <strong>${name}</strong>
          <strong>${fmt(price * qty)}</strong>
          <span>${qty} × item</span>
          <span>${(w * qty).toFixed(1)} lb</span>
        </div>`).join('');
    }

    document.dispatchEvent(new CustomEvent('usinger:weight-updated', {
      detail: { weight, left, pct, subtotal },
    }));
  }

  document.addEventListener('usinger:add-item', ({ detail }) => {
    const { name, weight, price } = detail;
    const existing = cartState.get(name) || { weight, price, qty: 0 };
    cartState.set(name, { ...existing, qty: existing.qty + 1 });
    updateUI();
  });

  document.addEventListener('usinger:shelf-update', ({ detail }) => {
    const { name, weight, price, qty } = detail;
    if (qty === 0) cartState.delete(name);
    else cartState.set(name, { weight, price, qty });
    updateUI();
  });
}
