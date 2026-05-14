export default function decorate(block) {
  const rows = [...block.children];
  const minWeight = parseFloat(rows[0]?.children[0]?.textContent?.trim() || 6);
  const ctaText = rows[1]?.children[0]?.textContent?.trim() || 'Schedule cold shipment';
  const ctaHref = rows[1]?.querySelector('a')?.href || '/shop/cart';

  // Create the sticky bar element
  const bar = document.createElement('div');
  bar.className = 'cold-bar';
  bar.setAttribute('role', 'complementary');
  bar.setAttribute('aria-label', 'Cold box — deli weight and checkout status');
  bar.innerHTML = `
    <div class="cold-bar-inner">
      <div class="cold-bar-left">
        <div class="cold-weight-stat">
          <strong class="js-cold-weight">0.0</strong>
          <span>lb added</span>
        </div>
        <div class="cold-bar-track">
          <span class="cold-bar-track-label js-cold-note">${minWeight} lb to unlock</span>
          <div class="cold-progress"><span class="js-cold-bar-fill"></span></div>
        </div>
      </div>
      <div class="cold-bar-lines js-cold-lines" aria-hidden="true"></div>
      <div class="cold-bar-right">
        <div class="cold-subtotal">
          <strong class="js-cold-subtotal">$0.00</strong>
          <span>subtotal</span>
        </div>
        <a class="cold-cta-btn js-cold-cta" href="${ctaHref}">
          ${ctaText}
        </a>
      </div>
    </div>`;

  document.body.appendChild(bar);
  block.closest('.section')?.remove(); // remove from page flow; bar is now fixed

  const fmt = (v) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(v);

  document.addEventListener('usinger:weight-updated', ({ detail }) => {
    const { weight, left, pct, subtotal } = detail;
    bar.classList.toggle('is-active', weight > 0);
    bar.querySelector('.js-cold-weight').textContent = weight.toFixed(1);
    bar.querySelector('.js-cold-bar-fill').style.width = `${pct}%`;
    bar.querySelector('.js-cold-subtotal').textContent = fmt(subtotal || 0);
    bar.querySelector('.js-cold-note').textContent = left <= 0
      ? 'Minimum met'
      : `${left.toFixed(1)} lb to unlock`;

    const cta = bar.querySelector('.js-cold-cta');
    if (left <= 0) {
      cta.style.background = 'var(--usinger-sage-deep, #2f432d)';
      cta.classList.add('is-unlocked');
    } else {
      cta.style.background = '';
      cta.classList.remove('is-unlocked');
    }
  });
}
