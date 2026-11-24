// Canvas dibatasi DPR 1.5 dan 60 partikel; berhenti saat tab tidak terlihat.
// Warna debu mengikuti bagian di belakangnya: terang di atas latar gelap, cokelat tua di atas kertas terang.
export function startParticles(canvas, count = 38) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return () => {};
  let width, height, frame = 0, previous = 0, night, light, dark, zones = [];
  const total = Math.max(0, Math.min(60, Number(count) || 0));
  const particles = Array.from({ length: innerWidth < 600 ? Math.min(20, total) : total }, () => ({ x: Math.random(), y: Math.random(), radius: .5 + Math.random() * 1.5, speed: .006 + Math.random() * .012, alpha: .1 + Math.random() * .3 }));
  const sections = [...document.querySelectorAll('main > section, .site-footer')];
  // Luminans relatif dari warna latar terhitung; hero bergradien dan warna transparan dianggap gelap.
  function isDark(element) {
    const match = getComputedStyle(element).backgroundColor.match(/[\d.]+/g);
    if (!match || element.id === 'home' || (match[3] !== undefined && Number(match[3]) < .5)) return true;
    const [r, g, b] = match.slice(0, 3).map((value) => { const c = value / 255; return c <= .04045 ? c / 12.92 : ((c + .055) / 1.055) ** 2.4; });
    return .2126 * r + .7152 * g + .0722 * b < .25;
  }
  function palette() {
    night = document.documentElement.dataset.theme === 'night';
    const style = getComputedStyle(document.documentElement);
    light = style.getPropertyValue(night ? '--sunset' : '--parchment-dark').trim();
    dark = style.getPropertyValue('--wood').trim();
    zones = sections.map((element) => ({ element, dark: isDark(element) }));
  }
  function resize() {
    width = innerWidth; height = innerHeight;
    const dpr = Math.min(devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  function draw(time) {
    const dt = previous ? Math.min((time - previous) / 1000, .05) : 0; previous = time;
    // Satu baca layout per bagian per frame, tanpa tulis di antaranya.
    const bands = zones.map(({ element, dark: isDarkZone }) => { const rect = element.getBoundingClientRect(); return { top: rect.top, bottom: rect.bottom, color: isDarkZone ? light : dark }; });
    ctx.clearRect(0, 0, width, height);
    for (const particle of particles) {
      particle.x = (particle.x + particle.speed * dt + 1) % 1;
      particle.y = (particle.y + (night ? -1 : .25) * particle.speed * dt + 1) % 1;
      const y = particle.y * height;
      ctx.fillStyle = bands.find((band) => y >= band.top && y < band.bottom)?.color ?? light;
      ctx.globalAlpha = particle.alpha;
      ctx.beginPath(); ctx.arc(particle.x * width, y, particle.radius, 0, Math.PI * 2); ctx.fill();
    }
    frame = requestAnimationFrame(draw);
  }
  function visibility() {
    cancelAnimationFrame(frame); previous = 0;
    if (!document.hidden) frame = requestAnimationFrame(draw);
  }
  // Mode kontras tinggi mengganti kelas root; latar bagian ikut berubah.
  const classWatch = new MutationObserver(palette);
  classWatch.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  resize(); palette(); visibility();
  window.addEventListener('resize', resize);
  window.addEventListener('dusty-theme', palette);
  document.addEventListener('visibilitychange', visibility);
  return () => {
    cancelAnimationFrame(frame); ctx.clearRect(0, 0, width, height); classWatch.disconnect();
    window.removeEventListener('resize', resize);
    window.removeEventListener('dusty-theme', palette);
    document.removeEventListener('visibilitychange', visibility);
  };
}
