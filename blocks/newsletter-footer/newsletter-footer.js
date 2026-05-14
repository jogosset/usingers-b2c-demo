import { decorateIcons } from '../../scripts/aem.js';

export default function decorate(block) {
  const rows = [...block.children];
  const eyebrowIcon = rows[0]?.children[0]?.textContent?.trim();
  const eyebrow = rows[0]?.children[1]?.textContent?.trim();
  const heading = rows[1]?.children[0]?.textContent?.trim();
  const newsletterBody = rows[2]?.children[0]?.textContent?.trim();
  const footerLinks = rows.slice(3).map((row) => {
    const link = row.querySelector('a');
    return link ? { text: link.textContent?.trim(), href: link.href } : null;
  }).filter(Boolean);

  block.innerHTML = `
    <div class="footer-grid">
      <div>
        <span class="footer-eyebrow">
          ${eyebrowIcon ? `<span class="icon icon-${eyebrowIcon}"></span>` : ''}
          ${eyebrow || ''}
        </span>
        <h2>${heading || ''}</h2>
      </div>
      <form class="newsletter" novalidate>
        <p>${newsletterBody || ''}</p>
        <div class="newsletter-form">
          <input type="email" aria-label="Email address" placeholder="email@example.com" />
          <button type="button" class="newsletter-submit">Join list</button>
        </div>
      </form>
    </div>
    ${footerLinks.length ? `
    <div class="footer-bottom">
      ${footerLinks.map((l) => `<a href="${l.href}">${l.text}</a>`).join('')}
    </div>` : ''}`;

  decorateIcons(block);

  block.querySelector('.newsletter-submit')?.addEventListener('click', () => {
    const input = block.querySelector('input[type="email"]');
    if (input?.value && input.value.includes('@')) {
      block.querySelector('.newsletter').innerHTML = '<p class="newsletter-thanks">Thanks — we\'ll be in touch from the counter.</p>';
    } else {
      input?.focus();
    }
  });
}
