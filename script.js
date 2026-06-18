/* =====================================================
   Forest & Hills — Landing Page Interactions
   ===================================================== */

// --- Preloader hide on full load ---
window.addEventListener('load', () => {
  const pre = document.getElementById('preloader');
  if (pre) {
    setTimeout(() => pre.classList.add('hide'), 600);
  }
});

document.addEventListener('DOMContentLoaded', () => {

  // --- AOS init ---
  if (window.AOS) {
    AOS.init({
      duration: 850,
      easing: 'ease-out-cubic',
      once: true,
      offset: 80,
    });
  }

  // --- Current year in footer ---
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // --- Navbar scroll state + Scroll Progress + Back to top ---
  const nav = document.querySelector('.main-nav');
  const progress = document.getElementById('scrollProgress');
  const backTop = document.getElementById('backTop');

  const onScroll = () => {
    const y = window.scrollY;

    if (y > 60) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');

    if (backTop) {
      if (y > 500) backTop.classList.add('show');
      else backTop.classList.remove('show');
    }

    if (progress) {
      const docH = document.documentElement.scrollHeight - window.innerHeight;
      const pct = docH > 0 ? (y / docH) * 100 : 0;
      progress.style.width = pct + '%';
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (backTop) {
    backTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // --- Smooth scroll & auto-close mobile nav on link click ---
  const navLinks = document.querySelectorAll('.main-nav .nav-link');
  const navCollapse = document.getElementById('navMenu');
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (navCollapse.classList.contains('show')) {
        new bootstrap.Collapse(navCollapse).hide();
      }
    });
  });

  // --- Init Bootstrap tooltips (for masterplan hotspots) ---
  const tooltipTriggers = document.querySelectorAll('[data-bs-toggle="tooltip"]');
  tooltipTriggers.forEach(el => new bootstrap.Tooltip(el));

  // --- Animated counter via IntersectionObserver ---
  const counters = document.querySelectorAll('.counter');
  const counterObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseInt(el.dataset.target, 10) || 0;
      const suffix = el.dataset.suffix || '';
      const duration = 1800;
      const start = performance.now();

      const animate = (now) => {
        const t = Math.min((now - start) / duration, 1);
        // Ease-out cubic for smooth deceleration
        const eased = 1 - Math.pow(1 - t, 3);
        el.textContent = Math.floor(eased * target) + suffix;
        if (t < 1) requestAnimationFrame(animate);
        else el.textContent = target + suffix;
      };
      requestAnimationFrame(animate);
      obs.unobserve(el);
    });
  }, { threshold: 0.4 });
  counters.forEach(c => counterObserver.observe(c));

  // --- Form submission handler (shared by hero + modal forms) ---
  const forms = document.querySelectorAll('.enquiry-form');
  const toastEl = document.getElementById('successToast');
  const toast = toastEl ? new bootstrap.Toast(toastEl, { delay: 4000 }) : null;
  const enquiryModalEl = document.getElementById('enquiryModal');

  forms.forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      const data = Object.fromEntries(new FormData(form).entries());
      const source = form.dataset.form || 'unknown';

      console.log('Enquiry submitted from:', source, data);

      const btn = form.querySelector('button[type="submit"]');
      const originalHtml = btn.innerHTML;
      btn.disabled = true;
      btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span> Submitting...';

      setTimeout(() => {
        btn.innerHTML = '<i class="bi bi-check-circle-fill"></i> Sent Successfully';
        form.reset();

        if (source === 'modal' && enquiryModalEl) {
          const modalInstance = bootstrap.Modal.getInstance(enquiryModalEl);
          if (modalInstance) modalInstance.hide();
        }

        if (toast) toast.show();

        setTimeout(() => {
          btn.disabled = false;
          btn.innerHTML = originalHtml;
        }, 1800);
      }, 1100);
    });
  });

  // --- Phone field: numeric only, max 10 digits ---
  document.querySelectorAll('input[name="phone"]').forEach(input => {
    input.addEventListener('input', (e) => {
      e.target.value = e.target.value.replace(/\D/g, '').slice(0, 10);
    });
  });

  // --- Newsletter footer form ---
  const newsletter = document.querySelector('.newsletter');
  if (newsletter) {
    newsletter.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = newsletter.querySelector('input');
      const btn = newsletter.querySelector('button');
      if (input.value) {
        btn.innerHTML = '<i class="bi bi-check2"></i>';
        input.value = '';
        if (toast) toast.show();
        setTimeout(() => btn.innerHTML = '<i class="bi bi-arrow-right"></i>', 2000);
      }
    });
  }

  // --- Gallery lightbox (lightweight, no library) ---
  const galItems = document.querySelectorAll('.gal-item');
  galItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const src = item.getAttribute('href');
      openLightbox(src);
    });
  });

  function openLightbox(src) {
    const overlay = document.createElement('div');
    overlay.className = 'lightbox-overlay';

    const closeBtn = document.createElement('button');
    closeBtn.className = 'lightbox-close';
    closeBtn.setAttribute('aria-label', 'Close');
    closeBtn.textContent = '×';

    const img = document.createElement('img');
    img.setAttribute('src', src);
    img.setAttribute('alt', 'Gallery image');

    overlay.appendChild(closeBtn);
    overlay.appendChild(img);

    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden';

    requestAnimationFrame(() => overlay.classList.add('visible'));

    const close = () => {
      overlay.classList.remove('visible');
      setTimeout(() => {
        overlay.remove();
        document.body.style.overflow = '';
      }, 250);
    };

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay || e.target.classList.contains('lightbox-close')) close();
    });
    document.addEventListener('keydown', function esc(ev) {
      if (ev.key === 'Escape') { close(); document.removeEventListener('keydown', esc); }
    });
  }

  // --- Open modal automatically after 15s (one-time per session) ---
  if (!sessionStorage.getItem('autoModalShown')) {
    setTimeout(() => {
      if (enquiryModalEl) {
        const m = new bootstrap.Modal(enquiryModalEl);
        m.show();
        sessionStorage.setItem('autoModalShown', '1');
      }
    }, 15000);
  }

  // --- Subtle parallax on hero leaves (mouse follow) ---
  const hero = document.querySelector('.hero');
  const leaves = document.querySelectorAll('.hero-leaves .leaf');
  if (hero && leaves.length && window.matchMedia('(hover: hover)').matches) {
    hero.addEventListener('mousemove', (e) => {
      const rect = hero.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      leaves.forEach((leaf, i) => {
        const factor = (i + 1) * 12;
        leaf.style.transform = `translate(${x * factor}px, ${y * factor}px) rotate(${x * 8}deg)`;
      });
    });
  }
});

// --- Inject lightbox styles dynamically so we don't need extra files ---
const lbStyle = document.createElement('style');
lbStyle.textContent = `
  .lightbox-overlay {
    position: fixed; inset: 0;
    background: rgba(15, 25, 18, 0.92);
    display: grid; place-items: center;
    z-index: 1090;
    opacity: 0;
    transition: opacity 0.25s ease;
    padding: 30px;
  }
  .lightbox-overlay.visible { opacity: 1; }
  .lightbox-overlay img {
    max-width: 92vw; max-height: 88vh;
    border-radius: 16px;
    box-shadow: 0 30px 80px rgba(0,0,0,0.5);
    border: 6px solid #fff;
    animation: lbZoom 0.35s ease;
  }
  @keyframes lbZoom {
    from { transform: scale(0.92); opacity: 0; }
    to { transform: scale(1); opacity: 1; }
  }
  .lightbox-close {
    position: absolute; top: 24px; right: 30px;
    background: #fff; border: 0;
    width: 44px; height: 44px;
    border-radius: 50%;
    font-size: 1.6rem; line-height: 1;
    color: #1f3a23;
    cursor: pointer;
    box-shadow: 0 10px 24px rgba(0,0,0,0.3);
    transition: 0.3s ease;
  }
  .lightbox-close:hover { background: #c9a14a; color: #fff; transform: rotate(90deg); }
`;
document.head.appendChild(lbStyle);
