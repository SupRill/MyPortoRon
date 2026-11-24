import { data } from './data.js';
import { startParticles } from './particles.js';
import { startCursor } from './cursor.js';

const $ = (selector) => document.querySelector(selector);
const root = document.documentElement;
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const fine = matchMedia('(hover: hover) and (pointer: fine)');
const escapeHTML = (value) => String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));

// URL dari konfigurasi tetap divalidasi. Tidak menjalankan skema javascript/data.
function safeURL(value, type = 'link') {
  if (!value || String(value).includes('[[')) return '';
  try {
    const url = new URL(value, document.baseURI);
    const protocols = type === 'link' ? ['https:', 'http:', 'mailto:'] : ['https:', 'http:'];
    return protocols.includes(url.protocol) && !url.username && !url.password ? url.href : '';
  } catch { return ''; }
}
function text(selector, value) { $(selector).textContent = value; }
function linkHTML(label, value) {
  const url = safeURL(value);
  return url ? `<a href="${escapeHTML(url)}" target="_blank" rel="noopener noreferrer">${escapeHTML(label)}</a>` : '';
}
function setImage(image, source, fallback) {
  image.addEventListener('error', () => { image.src = fallback; }, { once: true });
  image.src = safeURL(source, 'asset') || fallback;
}
function stored(key) { try { return localStorage.getItem(key); } catch { return null; } }
function store(key, value) { try { localStorage.setItem(key, value); } catch { /* Mode privat tetap berjalan. */ } }
function toggleState(button, active) {
  button.setAttribute('aria-pressed', String(active));
  button.querySelector('.option-state').textContent = active ? 'On' : 'Off';
}

function render() {
  document.title = data.seo.title;
  $('meta[name="description"]').content = data.seo.description;
  $('meta[property="og:title"]').content = data.seo.title;
  $('meta[property="og:description"]').content = data.seo.description;
  $('meta[property="og:image"]').content = safeURL(data.seo.image, 'asset');
  const siteURL = safeURL(data.seo.url, 'asset');
  if (siteURL) {
    document.querySelector('link[rel="canonical"]')?.remove();
    document.querySelector('meta[property="og:url"]')?.remove();
    const canonical = document.createElement('link');
    canonical.rel = 'canonical'; canonical.href = siteURL; document.head.append(canonical);
    const ogURL = document.createElement('meta');
    ogURL.setAttribute('property', 'og:url'); ogURL.content = siteURL; document.head.append(ogURL);
  }
  text('#brand', data.shortName || data.name);
  text('.telegram-heading span', data.themeName);
  text('#hero-name', data.name);
  text('#hero-role', data.role);
  text('#hero-tagline', data.tagline);
  text('#hero-location', data.location);
  text('#profile-caption', data.profile.caption);
  setImage($('#profile'), data.profile.image, 'assets/img/profile.svg');
  $('#profile').alt = data.profile.alt;
  $('#about-copy').innerHTML = data.about.map((paragraph) => `<p>${escapeHTML(paragraph)}</p>`).join('');
  const edu = data.education;
  $('#credentials').innerHTML = `<h3>${escapeHTML(edu.school)}</h3><div class="degree-row"><p class="degree">${escapeHTML(edu.degree)}<br><span class="period">${escapeHTML(edu.period)}</span></p>${edu.semester ? `<span class="semester-stamp" role="img" aria-label="${escapeHTML(edu.semester)}"><i aria-hidden="true">✦</i><small aria-hidden="true">Semester</small><b aria-hidden="true">${escapeHTML(edu.semester.replace(/\D+/g, ''))}</b></span>` : ''}</div><dl><div><dt>GPA</dt><dd class="gpa">${escapeHTML(edu.gpa)}</dd></div><div><dt>Areas of interest</dt><dd><ul>${edu.interests.map((item) => `<li>${escapeHTML(item)}</li>`).join('')}</ul></dd></div></dl>${data.certificates.map((item) => `<p>${escapeHTML(item)}</p>`).join('')}`;
  const cvURL = safeURL(data.cv, 'asset');
  if (cvURL) { $('#cv-link').href = cvURL; $('#cv-link').hidden = false; }
  // Satu papan per kategori: chip alat ber-logo, lalu tag konsep tanpa logo.
  $('#skill-list').innerHTML = data.skills.map((skill) => {
    const size = ['wide', 'half'].includes(skill.size) ? ` is-${skill.size}` : '';
    const tools = (skill.tools || []).map((tool) => `<li class="tool-chip"><span class="tool-icon"><img src="assets/icons/skills/${encodeURIComponent(tool.icon)}.svg" alt="" width="24" height="24" loading="lazy" decoding="async"></span>${escapeHTML(tool.name)}</li>`).join('');
    const tags = (skill.tags || []).map((tag) => tag.flag ? `<li class="has-flag"><img class="flag" src="assets/icons/flags/${encodeURIComponent(tag.flag)}.svg" alt="" width="22" height="14">${escapeHTML(tag.name)}</li>` : `<li>${escapeHTML(tag)}</li>`).join('');
    return `<article class="skill-card plate reveal${size}"><h3>${escapeHTML(skill.name)}</h3><p>${escapeHTML(skill.detail)}</p>${tools ? `<ul class="tool-chips">${tools}</ul>` : ''}${tags ? `<ul class="skill-tags">${tags}</ul>` : ''}</article>`;
  }).join('') || '<p>The inventory is being prepared.</p>';
  $('#project-list').innerHTML = data.projects.map((project, index) => `<article class="poster reveal" style="--rotation:${[-2, 1.5, -1, 2][index % 4]}deg">
    <div class="poster-inner">
      <div class="poster-face poster-front" id="front-${index}"><div class="wanted" aria-hidden="true">WANTED</div><img data-project-image="${index}" src="assets/img/project.svg" alt="${escapeHTML(project.alt)}" width="1200" height="750" loading="lazy" decoding="async"><h3>${escapeHTML(project.title)}</h3><p class="poster-category">${escapeHTML(project.category)}</p><button type="button" data-flip="${index}" aria-controls="back-${index}" aria-expanded="false" aria-label="Flip poster: ${escapeHTML(project.title)}">Flip poster</button></div>
      <div class="poster-face poster-back" id="back-${index}" inert aria-hidden="true"><h3>${escapeHTML(project.title)}</h3><p>${escapeHTML(project.description)}</p><div class="tech">${project.tech.map(escapeHTML).join(' / ')}</div><div class="project-links">${linkHTML('Demo', project.demo)}${linkHTML('GitHub', project.github)}</div>${project.completed ? '<span class="stamp">COMPLETED</span>' : '<p class="note">Project notes</p>'}<button type="button" data-flip="${index}" aria-controls="front-${index}" aria-label="Back to poster: ${escapeHTML(project.title)}">Back to poster</button></div>
    </div></article>`).join('') || '<p>No posters on this board yet.</p>';
  document.querySelectorAll('[data-project-image]').forEach((image) => setImage(image, data.projects[image.dataset.projectImage].image, 'assets/img/project.svg'));
  $('#experience-list').innerHTML = data.experience.map((item) => `<li class="journey-stop reveal"><span class="marker" aria-hidden="true">×</span><time>${escapeHTML(item.period)}</time><h3>${escapeHTML(item.position)}</h3><p class="company">${escapeHTML(item.company)}</p><p>${escapeHTML(item.description)}</p></li>`).join('') || '<li>The journey is about to begin.</li>';
  $('.route').hidden = !data.experience.length;
  text('#contact-intro', data.contact.intro);
  const email = data.contact.email.trim();
  const ICONS = {
    GitHub: '<svg viewBox="0 0 16 16" aria-hidden="true"><path fill="currentColor" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>',
    LinkedIn: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M4.98 3.5a2.5 2.5 0 11-.01 5 2.5 2.5 0 01.01-5zM3 9.75h4V21H3zM9.75 9.75h3.8v1.54h.05c.53-1 1.82-2.04 3.75-2.04 4 0 4.75 2.63 4.75 6.06V21h-4v-5.07c0-1.21-.02-2.77-1.69-2.77-1.69 0-1.95 1.32-1.95 2.68V21h-4z"/></svg>',
    Instagram: '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>',
    WhatsApp: '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M4 20l1.3-4.2A8 8 0 1112 20a8 8 0 01-3.8-1z"/></svg>',
    Email: '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-3.92 7.94"/></svg>',
    'Download CV': '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2h8l5 5v15H6z"/><path d="M14 2v5h5M12 11v6M9.5 14.5L12 17l2.5-2.5"/></svg>'
  };
  const iconLink = (key, attrs, name = key) => `<a ${attrs} aria-label="${escapeHTML(name)}" title="${escapeHTML(name)}">${ICONS[key]}</a>`;
  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const socials = [['GitHub', data.contact.github], ['LinkedIn', data.contact.linkedin], ['Instagram', data.contact.instagram]];
  if (/^\d{8,15}$/.test(data.contact.whatsapp)) socials.push(['WhatsApp', `https://wa.me/${data.contact.whatsapp}`]);
  $('#social-links').innerHTML = (validEmail ? iconLink('Email', `id="email-link" href="mailto:${encodeURIComponent(email)}"`, `Email ${email}`) : '') + socials.filter(([, url]) => safeURL(url)).map(([label, url]) => iconLink(label, `href="${escapeHTML(safeURL(url))}" target="_blank" rel="noopener noreferrer"`)).join('') + (cvURL ? iconLink('Download CV', `href="${escapeHTML(cvURL)}" download`) : '');
  text('#year', new Date().getFullYear()); text('#footer-name', data.footerName || data.name);
}

let paused = stored('dusty-motion') === 'paused';
let animationContext;
let cleanupParticles = () => {};
let cleanupCursor = () => {};
const motionAllowed = () => !reduced.matches && !paused;

function setupMotion() {
  cleanupParticles(); cleanupCursor(); animationContext?.revert();
  const enabled = motionAllowed();
  root.classList.toggle('motion-on', enabled);
  root.classList.toggle('motion-paused', !enabled);
  document.querySelectorAll('.poster').forEach((poster) => { poster.style.transform = ''; });
  toggleState($('#motion-toggle'), !enabled);
  $('#motion-toggle').disabled = reduced.matches;
  $('#motion-help').hidden = !reduced.matches;
  if (!enabled) { $('#loader').hidden = true; return; }
  cleanupParticles = startParticles($('#dust'), data.motion.particles);
  cleanupCursor = startCursor($('#cursor'));
  const gsap = window.gsap, ScrollTrigger = window.ScrollTrigger;
  if (!gsap || !ScrollTrigger) return; // CDN gagal: konten tetap terlihat.
  gsap.registerPlugin(ScrollTrigger);
  animationContext = gsap.context(() => {
    const duration = Math.max(.1, Number(data.motion.duration) || .8);
    document.querySelectorAll('.reveal').forEach((element, index) => {
      gsap.from(element, { y: 24, opacity: 0, duration, delay: (index % 3) * .06, ease: 'power2.out', scrollTrigger: { trigger: element, start: 'top 94%', once: true } });
    });
    // Parallax hero: makin jauh lapisannya, makin lambat ikut scroll (turun relatif ke halaman). Tanah dekat & papan petunjuk ikut halaman (0).
    const hero = $('#home'), heroScroll = { trigger: hero, start: 'top top', end: 'bottom top', scrub: 1, invalidateOnRefresh: true };
    for (const [layer, depth] of [['.sun-layer', .5], ['.far', .32], ['.middle', .18], ['.near', .06]]) {
      gsap.to(layer, { y: () => hero.offsetHeight * depth, ease: 'none', scrollTrigger: { ...heroScroll } });
    }
    // Nama bergerak lebih cepat dari halaman dan memudar, jadi hero terasa ditinggalkan.
    gsap.to('.hero-content', { y: () => hero.offsetHeight * -.12, opacity: .15, ease: 'none', scrollTrigger: { ...heroScroll } });
    const path = $('#route-line'), length = path.getTotalLength();
    gsap.fromTo(path, { strokeDasharray: length, strokeDashoffset: length }, { strokeDashoffset: 0, ease: 'none', scrollTrigger: { trigger: '.route-layout', start: 'top 70%', end: 'bottom 65%', scrub: .6 } });
    document.querySelectorAll('.marker').forEach((marker) => gsap.from(marker, { scale: 0, duration, ease: 'back.out(1.4)', scrollTrigger: { trigger: marker, start: 'top 85%', once: true } }));
  });
}

function intro() {
  if (!motionAllowed()) return;
  const loader = $('#loader'); loader.hidden = false;
  const message = 'Riding down the dusty trail…'; let index = 0;
  text('#loading-text', '');
  const typing = setInterval(() => { text('#loading-text', message.slice(0, ++index)); if (index >= message.length) clearInterval(typing); }, 45);
  const introDuration = Math.min(2200, Math.max(600, (Number(data.motion.intro) || 1.6) * 1000));
  setTimeout(() => { clearInterval(typing); loader.classList.add('is-opening'); }, introDuration);
  setTimeout(() => { loader.hidden = true; }, introDuration + 850);
  // Intro dekoratif tidak memblokir klik atau fokus keyboard.
  document.addEventListener('keydown', () => { loader.hidden = true; clearInterval(typing); }, { once: true });
}

function navigation() {
  const menu = $('#menu-toggle'), nav = $('#nav-links');
  menu.hidden = false;
  // Offset mengikuti tinggi navbar, termasuk saat font atau viewport berubah.
  new ResizeObserver(([entry]) => {
    if (!nav.classList.contains('is-open')) root.style.setProperty('--nav-offset', `${entry.target.getBoundingClientRect().height + 16}px`);
  }).observe($('.site-header'));
  function close() { menu.setAttribute('aria-expanded', 'false'); nav.classList.remove('is-open'); }
  menu.addEventListener('click', () => {
    const open = menu.getAttribute('aria-expanded') !== 'true';
    menu.setAttribute('aria-expanded', String(open)); nav.classList.toggle('is-open', open);
  });
  nav.addEventListener('click', (event) => { if (event.target.closest('a')) close(); });
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && nav.classList.contains('is-open')) { close(); menu.focus(); } });
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) if (entry.isIntersecting) {
      nav.querySelectorAll('a').forEach((link) => {
        if (link.hash === `#${entry.target.id}`) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    }
  }, { rootMargin: '-15% 0px -55% 0px' });
  document.querySelectorAll('main section[id]').forEach((section) => observer.observe(section));
  new IntersectionObserver(([entry]) => {
    root.classList.toggle('hero-offscreen', !entry.isIntersecting);
  }).observe($('#home'));
  // Papan bergoyang saat tiba dan tiap kali scroll dimulai lagi setelah diam; CSS hanya menganimasikannya bila .motion-on.
  const plank = $('.nav-shell'); let idle;
  const swing = () => { if (!plank.classList.contains('is-swinging')) plank.classList.add('is-swinging'); };
  plank.addEventListener('animationend', () => plank.classList.remove('is-swinging'));
  addEventListener('scroll', () => { if (!idle) swing(); clearTimeout(idle); idle = setTimeout(() => { idle = 0; }, 400); }, { passive: true });
  swing();
}

function posters() {
  $('#project-list').addEventListener('click', (event) => {
    const button = event.target.closest('[data-flip]'); if (!button) return;
    const poster = button.closest('.poster'), flipped = !poster.classList.contains('is-flipped');
    const front = poster.querySelector('.poster-front'), back = poster.querySelector('.poster-back');
    const visible = flipped ? back : front, hidden = flipped ? front : back;
    visible.inert = false; visible.removeAttribute('aria-hidden');
    poster.classList.toggle('is-flipped', flipped);
    front.querySelector('button').setAttribute('aria-expanded', String(flipped));
    visible.querySelector('button').focus({ preventScroll: true });
    hidden.inert = true; hidden.setAttribute('aria-hidden', 'true');
    poster.style.transform = '';
    const stamp = back.querySelector('.stamp');
    stamp?.classList.toggle('hit', flipped);
    poster.classList.toggle('shake', flipped);
  });
  document.querySelectorAll('.poster').forEach((poster) => {
    let frame = 0;
    poster.addEventListener('pointermove', (event) => {
      if (!motionAllowed() || !fine.matches || poster.classList.contains('is-flipped') || frame) return;
      const { clientX, clientY } = event;
      frame = requestAnimationFrame(() => {
        const box = poster.getBoundingClientRect();
        const x = (clientX - box.left) / box.width - .5, y = (clientY - box.top) / box.height - .5;
        poster.style.transform = `perspective(900px) translateY(-6px) rotateX(${-y * 7}deg) rotateY(${x * 9}deg)`;
        frame = 0;
      });
    });
    poster.addEventListener('pointerleave', () => { cancelAnimationFrame(frame); frame = 0; poster.style.transform = ''; });
  });
  let frame = 0;
  $('#home').addEventListener('pointermove', (event) => {
    if (!motionAllowed() || !fine.matches || frame) return;
    const { clientX, clientY } = event;
    frame = requestAnimationFrame(() => {
      const x = (clientX / innerWidth - .5) * 14, y = (clientY / innerHeight - .5) * 8;
      // translate, bukan transform: transform milik parallax scroll GSAP, menimpanya membuat matahari loncat ke atas.
      $('.sun-layer').style.translate = `${x}px ${y}px`;
      $('.landscape').style.setProperty('--mouse-x', `${-x}px`);
      $('.landscape').style.setProperty('--mouse-y', `${-y}px`); frame = 0;
    });
  });
  $('#home').addEventListener('pointerleave', () => { cancelAnimationFrame(frame); frame = 0; $('.sun-layer').style.translate = ''; $('.landscape').style.removeProperty('--mouse-x'); $('.landscape').style.removeProperty('--mouse-y'); });
}

function theme() {
  const button = $('#theme-toggle'), quick = $('#dusk-toggle');
  const system = matchMedia('(prefers-color-scheme: dark)');
  // Any stored value other than day/night (e.g. after Reset) means "follow the device".
  const preferred = () => ['day', 'night'].includes(stored('dusty-theme')) ? stored('dusty-theme') : system.matches ? 'night' : 'day';
  function apply(value = preferred()) {
    root.dataset.theme = value;
    toggleState(button, value === 'night');
    quick.setAttribute('aria-pressed', String(value === 'night'));
    window.dispatchEvent(new Event('dusty-theme'));
  }
  function toggle() { const value = root.dataset.theme === 'day' ? 'night' : 'day'; apply(value); store('dusty-theme', value); }
  apply(); quick.hidden = false;
  system.addEventListener('change', () => apply());
  button.addEventListener('click', toggle); quick.addEventListener('click', toggle);
  return apply;
}

const MODEL_VIEWER = 'https://cdn.jsdelivr.net/npm/@google/model-viewer@4.0.0/dist/model-viewer.min.js';
function hasWebGL() {
  try { const canvas = document.createElement('canvas'); return Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl')); } catch { return false; }
}
// The still image is the default. The viewer script and the GLB are fetched only on capable desktops, or on request.
function campus() {
  const stage = $('.campus-stage'), button = $('#campus-load'), caption = $('#campus-status');
  let started = false;
  async function load(event) {
    if (started) return; started = true;
    const asked = Boolean(event);
    if (asked) { caption.setAttribute('role', 'status'); button.disabled = true; }
    const viewer = document.createElement('model-viewer');
    try {
      if (!hasWebGL()) throw new Error('WebGL unavailable');
      caption.textContent = 'Loading the 3D campus…';
      await import(MODEL_VIEWER);
      const attributes = { id: 'campus-model', src: 'assets/models/umn-campus.glb', alt: '3D model of the Universitas Multimedia Nusantara campus: two egg-shaped towers, an oval glass building, and a curved building', 'camera-controls': '', 'touch-action': 'pan-y', 'interaction-prompt': 'none', 'shadow-intensity': '0.6', 'camera-orbit': '-25deg 65deg 68%', 'min-camera-orbit': 'auto 20deg 25%', 'max-camera-orbit': 'auto 85deg 105%' };
      for (const [name, value] of Object.entries(attributes)) viewer.setAttribute(name, value);
      await new Promise((resolve, reject) => {
        viewer.addEventListener('load', resolve, { once: true });
        viewer.addEventListener('error', reject, { once: true });
        stage.append(viewer);
      });
      // Two frames so the model is painted before the still underneath goes away.
      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      $('.campus-still').hidden = true;
      caption.textContent = 'Drag to rotate the model';
    } catch {
      viewer.remove();
      caption.textContent = '3D view unavailable. This is a still of the model.';
    }
    button.hidden = true;
    if (asked) caption.focus({ preventScroll: true });
  }
  // Never probe WebGL on phones: the media query short-circuits first.
  const allow3d = !matchMedia('(max-width: 767px), (pointer: coarse)').matches && !navigator.connection?.saveData && hasWebGL();
  if (!allow3d) { button.hidden = false; button.addEventListener('click', load); return; }
  const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { observer.disconnect(); load(); } }, { rootMargin: '600px' });
  observer.observe(stage);
}

// Fallback for browsers without <dialog closedby="any"> (Safari). Press and release must both be
// outside, so a text-selection drag that ends on the backdrop does not close the dialog.
function closeOnBackdrop(dialog) {
  if ('closedBy' in HTMLDialogElement.prototype) return;
  const outside = (event) => {
    const box = dialog.getBoundingClientRect();
    return event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom;
  };
  let pressedOutside = false;
  dialog.addEventListener('pointerdown', (event) => { pressedOutside = event.target === dialog && outside(event); });
  dialog.addEventListener('pointerup', (event) => { if (pressedOutside && event.target === dialog && outside(event)) dialog.close(); });
}

// Sheriff's Quick-Find: substring search over sections, posters and contact links. Run after render().
function quickFind() {
  const trigger = $('#quick-find-toggle'), dialog = $('#quick-find'), input = $('#quick-find-input'), list = $('#quick-find-list');
  const go = (selector) => () => $(selector).scrollIntoView();
  const open = (url) => () => { if (url.startsWith('mailto:')) location.href = url; else window.open(url, '_blank', 'noopener,noreferrer'); };
  // [title, kind, extra keywords, action]
  const items = [
    ['Home', 'Trailhead', 'top start hero frontier welcome', go('#home')],
    ['Education', 'Trail stop', 'university umn campus 3d model degree gpa school', go('#education')],
    ["Traveler's Journal", 'Trail stop', 'about me bio profile summary', go('#about')],
    ['Gear & Skills', 'Trail stop', 'tools inventory ledger languages', go('#skills')],
    ['Wanted Board', 'Trail stop', 'projects work portfolio posters', go('#projects')],
    ['The Trail So Far', 'Trail stop', 'experience history organizations committee', go('#experience')],
    ['Contact Me', 'Trail stop', 'message form telegram reach hire', go('#contact')],
    ...data.projects.map((project, index) => [project.title, 'Wanted poster', `project ${project.category} ${project.tech.join(' ')}`, () => {
      const poster = document.querySelectorAll('.poster')[index];
      poster.scrollIntoView({ block: 'center' });
      if (!poster.classList.contains('is-flipped')) poster.querySelector('.poster-front [data-flip]').click();
    }])
  ];
  // Links are read back from the page, so only URLs that passed safeURL() are offered.
  document.querySelectorAll('#social-links a:not([download])').forEach((link) => items.push([link.getAttribute('aria-label'), 'Contact', 'mail email social profile link', open(link.href)]));
  if (!$('#cv-link').hidden) items.push(['Download CV', 'Bounty papers', 'resume curriculum vitae pdf', () => $('#cv-link').click()]);

  let matches = [], active = 0, pending = null;
  function mark(index) {
    active = matches.length ? (index + matches.length) % matches.length : 0;
    [...list.children].forEach((option, position) => option.setAttribute('aria-selected', String(position === active)));
    const option = list.children[active];
    if (option) { input.setAttribute('aria-activedescendant', option.id); option.scrollIntoView({ block: 'nearest' }); }
    else input.removeAttribute('aria-activedescendant');
  }
  function draw() {
    const terms = input.value.toLowerCase().split(/\s+/).filter(Boolean);
    matches = items.filter((item) => terms.every((term) => item.slice(0, 3).join(' ').toLowerCase().includes(term)));
    list.innerHTML = matches.map(([title, kind], index) => `<li id="quick-find-option-${index}" role="option"><span>${escapeHTML(title)}</span><small>${escapeHTML(kind)}</small></li>`).join('');
    input.setAttribute('aria-expanded', String(matches.length > 0));
    text('#quick-find-status', matches.length ? `${matches.length} ${matches.length === 1 ? 'lead' : 'leads'}` : 'No leads. Try another word.');
    mark(0);
  }
  function choose(index) { if (!matches[index]) return; pending = matches[index][3]; dialog.close(); }
  function show() {
    if (document.querySelector('dialog[open]')) return;
    $('#loader').hidden = true;
    input.value = ''; draw();
    dialog.showModal();
    root.classList.add('dialog-open');
    trigger.setAttribute('aria-expanded', 'true');
  }
  trigger.hidden = false;
  trigger.addEventListener('click', show);
  input.addEventListener('input', draw);
  input.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') { event.preventDefault(); mark(active + (event.key === 'ArrowDown' ? 1 : -1)); }
    else if (event.key === 'Enter') { event.preventDefault(); choose(active); }
  });
  list.addEventListener('click', (event) => { const option = event.target.closest('li'); if (option) choose([...list.children].indexOf(option)); });
  closeOnBackdrop(dialog);
  // Focus goes back to the trigger first; a chosen poster then takes focus itself.
  dialog.addEventListener('close', () => {
    root.classList.remove('dialog-open');
    trigger.setAttribute('aria-expanded', 'false');
    trigger.focus({ preventScroll: true });
    const action = pending; pending = null; action?.();
  });
  document.addEventListener('keydown', (event) => {
    const palette = (event.ctrlKey || event.metaKey) && !event.altKey && event.key.toLowerCase() === 'k';
    const slash = event.key === '/' && !event.ctrlKey && !event.metaKey && !event.altKey && !event.target.closest?.('input, textarea, select, [contenteditable]');
    if (palette || slash) { event.preventDefault(); show(); }
  });
}

function audio() {
  const src = safeURL(data.ambientAudio, 'asset'); if (!src) return () => {};
  const button = $('#audio-toggle'), sound = new Audio();
  sound.preload = 'none'; sound.src = src; sound.loop = true; sound.volume = .25; button.hidden = false;
  let playRequest = 0;
  function reset() { playRequest++; sound.pause(); toggleState(button, false); }
  button.addEventListener('click', async () => {
    if (!sound.paused) return reset();
    const request = ++playRequest;
    try { await sound.play(); if (request !== playRequest) { sound.pause(); return; } toggleState(button, true); text('#audio-status', ''); }
    catch { reset(); text('#audio-status', 'The audio could not be played. Check the audio file.'); }
  });
  sound.addEventListener('error', () => { reset(); text('#audio-status', 'The audio file is not available.'); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) reset(); });
  return reset;
}

function accessibility(applyTheme, stopAudio) {
  const trigger = $('#accessibility-toggle'), panel = $('#accessibility-panel');
  const contrast = $('#contrast-toggle'), size = $('#text-size');
  function applyContrast(active) {
    root.classList.toggle('high-contrast', active);
    toggleState(contrast, active);
  }
  function applySize(value) {
    const valid = ['100', '112.5', '125'].includes(value) ? value : '100';
    size.value = valid;
    root.style.fontSize = `${valid}%`;
    root.classList.toggle('large-text', valid !== '100');
    window.ScrollTrigger?.refresh();
  }
  applyContrast(stored('dusty-contrast') === 'high');
  applySize(stored('dusty-text-size') || '100');
  trigger.hidden = false;
  trigger.addEventListener('click', () => {
    $('#loader').hidden = true;
    panel.showModal();
    root.classList.add('dialog-open');
    trigger.setAttribute('aria-expanded', 'true');
  });
  panel.addEventListener('close', () => {
    root.classList.remove('dialog-open');
    trigger.setAttribute('aria-expanded', 'false');
    trigger.focus({ preventScroll: true });
  });
  // Dialog native menangani Escape dan halaman belakang inert; Tab tetap di panel.
  panel.addEventListener('keydown', (event) => {
    if (event.key !== 'Tab') return;
    const controls = [...panel.querySelectorAll('button:not(:disabled):not([hidden]), select')];
    const first = controls[0], last = controls.at(-1);
    if (event.shiftKey && document.activeElement === first || !event.shiftKey && document.activeElement === last) {
      event.preventDefault(); (event.shiftKey ? last : first).focus();
    }
  });
  closeOnBackdrop(panel);
  contrast.addEventListener('click', () => {
    const active = !root.classList.contains('high-contrast');
    applyContrast(active); store('dusty-contrast', active ? 'high' : 'normal');
  });
  size.addEventListener('change', () => { applySize(size.value); store('dusty-text-size', size.value); });
  $('#motion-toggle').addEventListener('click', () => { paused = !paused; store('dusty-motion', paused ? 'paused' : 'active'); setupMotion(); });
  $('#accessibility-reset').addEventListener('click', () => {
    store('dusty-theme', 'system'); applyTheme(); applyContrast(false); applySize('100'); stopAudio();
    paused = false;
    store('dusty-contrast', 'normal'); store('dusty-text-size', '100'); store('dusty-motion', 'active');
    setupMotion();
    text('#audio-status', '');
    text('#accessibility-status', reduced.matches ? 'Settings reset. The reduced-motion preference of your device is still respected.' : 'Settings are back to default.');
  });
}

function contactForm() {
  const form = $('#contact-form'), fields = $('#form-fields'), status = $('#form-status');
  const submit = form.querySelector('button');
  const endpoint = safeURL(data.contact.formEndpoint, 'asset');
  // Backend dipilih Formspree. Batasi host untuk mencegah salah kirim data.
  const ready = endpoint && new URL(endpoint).origin === 'https://formspree.io' && /^\/f\/[\w-]+$/.test(new URL(endpoint).pathname);
  fields.disabled = false; form.noValidate = true;
  status.textContent = ready ? 'Your email address is only used to reply to your message.' : '';
  if (ready) form.action = endpoint;
  form.addEventListener('input', (event) => { event.target.removeAttribute('aria-invalid'); event.target.setCustomValidity?.(''); });
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (submit.disabled) return;
    const inputs = [...form.querySelectorAll('[required]')];
    inputs.forEach((input) => {
      input.value = input.value.trim();
      input.setCustomValidity(input.minLength > 0 && input.value.length < input.minLength ? `Enter at least ${input.minLength} characters.` : '');
      input.setAttribute('aria-invalid', String(!input.checkValidity()));
    });
    const invalid = inputs.find((input) => !input.checkValidity());
    if (invalid) { status.textContent = 'Check your name, email, and message (at least 10 characters).'; invalid.focus(); invalid.reportValidity(); return; }
    if (!ready) { status.textContent = 'Not sent: this form is not active yet. Please use the email address shown here.'; return; }
    if ($('#website').value) return;
    const payload = new FormData(form);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    submit.disabled = true; fields.disabled = true; form.setAttribute('aria-busy', 'true'); status.textContent = 'Sending your message…';
    try {
      const response = await fetch(endpoint, { method: 'POST', body: payload, headers: { Accept: 'application/json' }, signal: controller.signal });
      if (!response.ok) throw new Error(response.status === 429 ? 'Too many submissions. Wait a moment and try again.' : 'The server did not accept the message. Try again or use email.');
      status.textContent = 'Message sent. Thank you for getting in touch.'; form.reset();
      inputs.forEach((input) => input.removeAttribute('aria-invalid'));
    } catch (error) {
      status.textContent = error.name === 'AbortError' ? 'The request timed out. Your message may have been received; check before sending again. Your text is still in the form.' : error.message === 'Failed to fetch' ? 'Connection failed. Your text is still in the form; try again or use email.' : error.message;
    } finally { clearTimeout(timeout); submit.disabled = false; fields.disabled = false; form.removeAttribute('aria-busy'); }
  });
}

render();
root.classList.add('js');
const applyTheme = theme();
// Lorong tambang di Contact menerus ke bawah footer: CSS butuh tinggi footer.
new ResizeObserver(([entry]) => root.style.setProperty('--footer-h', `${entry.target.offsetHeight}px`)).observe($('.site-footer'));
navigation(); posters(); contactForm(); campus(); quickFind();
accessibility(applyTheme, audio());
reduced.addEventListener('change', setupMotion);
fine.addEventListener('change', setupMotion);
document.addEventListener('visibilitychange', () => root.classList.toggle('page-hidden', document.hidden));
intro();
setupMotion();
// Coba ulang saat CDN defer selesai, tanpa menunda konten lokal.
window.addEventListener('load', setupMotion, { once: true });
