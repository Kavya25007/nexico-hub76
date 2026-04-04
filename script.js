  // Kavya Kushwaha— script.js
   //All interactivity, animations, canvas, etc.
//════════════════════════════════════════════ */
'use strict';

// ═══════════════════════════════════════════
// 1. LOADER
// ═══════════════════════════════════════════
(function initLoader() {
  const loader = document.getElementById('loader');
  const prog = document.getElementById('loaderProg');
  if (!loader || !prog) return;
  let pct = 0;
  const interval = setInterval(() => {
    pct += Math.random() * 18;
    if (pct >= 100) { pct = 100; clearInterval(interval); }
    prog.style.width = pct + '%';
    if (pct === 100) {
      setTimeout(() => {
        loader.classList.add('gone');
        document.body.removeAttribute('data-loading');
        // Trigger HV fill bars after load
        document.querySelectorAll('.hv-fill').forEach(el => {
          el.style.width = el.style.getPropertyValue('--w') || el.parentElement.querySelector('.hv-fill')?.dataset.w + '%';
        });
      }, 400);
    }
  }, 80);
})();

// ═══════════════════════════════════════════
// 2. CURSOR
// ═══════════════════════════════════════════
(function initCursor() {
  const cursor = document.getElementById('cursor');
  const dot = document.getElementById('cursorDot');
  if (!cursor || !dot) return;
  let mx = -100, my = -100, cx = -100, cy = -100;
  document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
  function lerp(a, b, t) { return a + (b - a) * t; }
  function animate() {
    cx = lerp(cx, mx, 0.14);
    cy = lerp(cy, my, 0.14);
    cursor.style.left = cx + 'px';
    cursor.style.top = cy + 'px';
    dot.style.left = mx + 'px';
    dot.style.top = my + 'px';
    requestAnimationFrame(animate);
  }
  animate();
  // Grow on interactive elements
  document.querySelectorAll('a, button, [role="button"]').forEach(el => {
    el.addEventListener('mouseenter', () => cursor.style.transform = 'translate(-50%,-50%) scale(1.8)');
    el.addEventListener('mouseleave', () => cursor.style.transform = 'translate(-50%,-50%) scale(1)');
  });
  document.addEventListener('mouseleave', () => { cursor.style.opacity = '0'; dot.style.opacity = '0'; });
  document.addEventListener('mouseenter', () => { cursor.style.opacity = '1'; dot.style.opacity = '1'; });
})();

// ═══════════════════════════════════════════
// 3. CANVAS BACKGROUND — AI Neural Network
// ═══════════════════════════════════════════
(function initCanvas() {
  const canvas = document.getElementById('bgCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, nodes = [], mouse = { x: -999, y: -999 };
  const NODE_COUNT = 65;
  const MAX_DIST = 180;

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function getAccColor() {
    return getComputedStyle(document.body).getPropertyValue('--node').trim() || 'rgba(240,165,0,.6)';
  }

  function initNodes() {
    nodes = Array.from({ length: NODE_COUNT }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - .5) * .5,
      vy: (Math.random() - .5) * .5,
      r: Math.random() * 2 + 1
    }));
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    const acc = getAccColor();
    // Update + draw nodes
    nodes.forEach(n => {
      n.x += n.vx; n.y += n.vy;
      if (n.x < 0 || n.x > W) n.vx *= -1;
      if (n.y < 0 || n.y > H) n.vy *= -1;
      // Draw node
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fillStyle = acc;
      ctx.fill();
    });
    // Draw connections
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MAX_DIST) {
          const opacity = (1 - dist / MAX_DIST) * 0.35;
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.strokeStyle = acc.replace(/[\d.]+\)$/, `${opacity})`).replace(/rgba\([^)]+\)/, acc.replace(/[\d.]+(?=\))/, opacity));
          ctx.globalAlpha = opacity;
          ctx.lineWidth = .6;
          ctx.stroke();
          ctx.globalAlpha = 1;
        }
      }
      // Mouse connections
      const mx = nodes[i].x - mouse.x, my = nodes[i].y - mouse.y;
      const md = Math.sqrt(mx * mx + my * my);
      if (md < MAX_DIST * 1.5) {
        const op = (1 - md / (MAX_DIST * 1.5)) * 0.6;
        ctx.beginPath();
        ctx.moveTo(nodes[i].x, nodes[i].y);
        ctx.lineTo(mouse.x, mouse.y);
        ctx.globalAlpha = op;
        ctx.strokeStyle = acc;
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
    }
    requestAnimationFrame(draw);
  }

  window.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });
  window.addEventListener('resize', () => { resize(); initNodes(); });
  resize(); initNodes(); draw();
})();

// ═══════════════════════════════════════════
// 4. NAV SCROLL BEHAVIOR
// ═══════════════════════════════════════════
(function initNav() {
  const nav = document.getElementById('nav');
  const burger = document.getElementById('burger');
  const drawer = document.getElementById('navDrawer');
  if (!nav) return;

  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 60);
  });

  burger?.addEventListener('click', () => {
    burger.classList.toggle('open');
    drawer?.classList.toggle('open');
  });

  // Close drawer on link click
  document.querySelectorAll('.nd-a').forEach(a => {
    a.addEventListener('click', () => {
      burger?.classList.remove('open');
      drawer?.classList.remove('open');
    });
  });

  // Active link on scroll
  const sections = document.querySelectorAll('section[id]');
  const navAs = document.querySelectorAll('.nav-a');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        navAs.forEach(a => a.classList.remove('active'));
        const match = document.querySelector(`.nav-a[href="#${e.target.id}"]`);
        if (match) match.classList.add('active');
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px' });
  sections.forEach(s => observer.observe(s));
})();

// ═══════════════════════════════════════════
// 5. THEME SWITCHER
// ═══════════════════════════════════════════
(function initTheme() {
  const saved = localStorage.getItem('portfolio-theme') || 'default';
  applyTheme(saved);

  document.querySelectorAll('.tdot').forEach(btn => {
    btn.addEventListener('click', () => applyTheme(btn.dataset.theme));
  });

  function applyTheme(t) {
    document.body.className = `theme-${t}`;
    document.querySelectorAll('.tdot').forEach(b => b.classList.toggle('active', b.dataset.theme === t));
    localStorage.setItem('portfolio-theme', t);
  }
})();

// ═══════════════════════════════════════════
// 6. TYPED TITLE EFFECT
// ═══════════════════════════════════════════
(function initTyped() {
  const el = document.getElementById('typed');
  if (!el) return;
  const phrases = [
    'UI/UX Designer',
    'AI App Developer',
    'Frontend Engineer',
    'Product Thinker'
  ];
  let pi = 0, ci = 0, deleting = false, waiting = false;
  function type() {
    const phrase = phrases[pi];
    if (!deleting) {
      el.textContent = phrase.slice(0, ci + 1);
      ci++;
      if (ci === phrase.length) { deleting = true; setTimeout(type, 1800); return; }
      setTimeout(type, 70);
    } else {
      el.textContent = phrase.slice(0, ci - 1);
      ci--;
      if (ci === 0) {
        deleting = false;
        pi = (pi + 1) % phrases.length;
        setTimeout(type, 400);
        return;
      }
      setTimeout(type, 40);
    }
  }
  setTimeout(type, 1500);
})();

// ═══════════════════════════════════════════
// 7. SCROLL REVEAL
// ═══════════════════════════════════════════
(function initReveal() {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const delay = parseInt(e.target.dataset.delay || '0');
        setTimeout(() => e.target.classList.add('visible'), delay);
        observer.unobserve(e.target);
        // Trigger skill bars
        e.target.querySelectorAll('.sb-fill[data-w]').forEach(bar => {
          bar.style.width = bar.dataset.w + '%';
        });
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
})();

// ═══════════════════════════════════════════
// 8. COUNTER ANIMATION
// ═══════════════════════════════════════════
(function initCounters() {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.querySelectorAll('.hn-val[data-count]').forEach(el => {
          const target = parseInt(el.dataset.count);
          let current = 0;
          const step = Math.ceil(target / 30);
          const timer = setInterval(() => {
            current = Math.min(current + step, target);
            el.textContent = current;
            if (current >= target) clearInterval(timer);
          }, 50);
        });
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.5 });

  const heroNums = document.querySelector('.hero-nums');
  if (heroNums) observer.observe(heroNums);
})();

// ═══════════════════════════════════════════
// 9. HV FILL BARS (hero card)
// ═══════════════════════════════════════════
(function initHvFills() {
  // Triggered after loader finishes, but also on scroll just in case
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.querySelectorAll('.hv-fill').forEach(fill => {
          const w = fill.style.getPropertyValue('--w');
          fill.style.width = w;
        });
      }
    });
  }, { threshold: 0.3 });
  const card = document.querySelector('.hv-card');
  if (card) observer.observe(card);
})();

// ═══════════════════════════════════════════
// 10. SMOOTH SCROLL
// ═══════════════════════════════════════════
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const id = a.getAttribute('href');
    if (id === '#') return;
    const target = document.querySelector(id);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// ═══════════════════════════════════════════
// 11. CONTACT FORM
// ═══════════════════════════════════════════
(function initForm() {
  const form = document.getElementById('cform');
  const ok = document.getElementById('cfOk');
  if (!form || !ok) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    const btn = form.querySelector('.cf-submit');
    btn.textContent = 'Sending...';
    btn.disabled = true;
    setTimeout(() => {
      form.reset();
      ok.classList.add('show');
      btn.innerHTML = 'Send Message <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z"/></svg>';
      btn.disabled = false;
      setTimeout(() => ok.classList.remove('show'), 4000);
    }, 1200);
  });
})();

// ═══════════════════════════════════════════
// 12. PARALLAX HERO ORBS
// ═══════════════════════════════════════════
(function initParallax() {
  const orbs = document.querySelectorAll('.orb');
  window.addEventListener('mousemove', e => {
    const rx = (e.clientX / window.innerWidth - .5) * 2;
    const ry = (e.clientY / window.innerHeight - .5) * 2;
    orbs.forEach((orb, i) => {
      const depth = (i + 1) * 12;
      orb.style.transform = `translate(${rx * depth}px, ${ry * depth}px)`;
    });
  });
})();

// ═══════════════════════════════════════════
// 13. BUILD HERO INNER LAYOUT
// ═══════════════════════════════════════════
// The hero section uses a specific grid layout — rebuild in JS for clean control
(function buildHero() {
  const hero = document.getElementById('hero');
  if (!hero) return;
  // Wrap hero children (except fixed elements) in hero-inner
  const inner = document.createElement('div');
  inner.className = 'hero-inner';
  const heroContent = hero.querySelector('.hero-content');
  const heroVisual = hero.querySelector('.hero-visual');
  const scrollHint = hero.querySelector('.scroll-hint');
  if (heroContent) inner.appendChild(heroContent);
  if (heroVisual) inner.appendChild(heroVisual);
  hero.appendChild(inner);
  if (scrollHint) hero.appendChild(scrollHint);
})();

// ═══════════════════════════════════════════
// 14. PROJECT CARD TILT EFFECT
// ═══════════════════════════════════════════
(function initTilt() {
  document.querySelectorAll('.proj-card, .svc-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - .5;
      const y = (e.clientY - r.top) / r.height - .5;
      card.style.transform = `translateY(-4px) rotateX(${-y * 6}deg) rotateY(${x * 6}deg)`;
      card.style.transition = 'transform .1s';
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.transition = 'transform .4s cubic-bezier(.4,0,.2,1)';
    });
  });
})();

// ═══════════════════════════════════════════
// 15. GLITCH EFFECT ON HERO NAME HOVER
// ═══════════════════════════════════════════
(function initGlitch() {
  const name = document.querySelector('.hero-name');
  if (!name) return;
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%';
  function glitchText(el, original) {
    let iterations = 0;
    const interval = setInterval(() => {
      el.textContent = original.split('').map((ch, i) => {
        if (ch === ' ') return ' ';
        if (i < iterations) return original[i];
        return chars[Math.floor(Math.random() * chars.length)];
      }).join('');
      if (iterations >= original.length) clearInterval(interval);
      iterations += 1.5;
    }, 35);
  }
  name.querySelectorAll('.hn-row').forEach(row => {
    const original = row.textContent;
    row.addEventListener('mouseenter', () => glitchText(row, original));
  });
})();

// ═══════════════════════════════════════════
// 16. FOOTER YEAR
// ═══════════════════════════════════════════
document.querySelectorAll('.footer-cr').forEach(el => {
  el.innerHTML = el.innerHTML.replace('2024', new Date().getFullYear());
});
