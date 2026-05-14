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
  const rows             = [...block.children];
  const eyebrowIconCell  = rows[0]?.children[0];
  const eyebrow          = rows[0]?.children[1]?.textContent?.trim();
  const heading          = rows[1]?.children[0]?.textContent?.trim();
  const newsletterBody   = rows[2]?.children[0]?.textContent?.trim();
  const footerLinks      = rows.slice(3).map((row) => {
    const link = row.querySelector('a');
    return link ? { text: link.textContent?.trim(), href: link.href } : null;
  }).filter(Boolean);

  block.innerHTML = `
    <div class="footer-grid">
      <div>
        <span class="footer-eyebrow">
          ${renderIcon(eyebrowIconCell)}
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

  block.querySelectorAll('.block-icon img').forEach((img) => {
    img.closest('picture')?.replaceWith(
      createOptimizedPicture(img.src, img.alt, false, [{ width: '32' }]),
    );
  });

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
