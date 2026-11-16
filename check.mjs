// Dependency-free checks. Optional: sync the SEO tags from the single data source.
import assert from 'node:assert/strict';
import { readFile, writeFile, access, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.dirname(fileURLToPath(import.meta.url));
const source = await readFile(path.join(root, 'assets/js/data.js'), 'utf8');
const { data } = await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);
const htmlPath = path.join(root, 'index.html');
let html = await readFile(htmlPath, 'utf8');
const main = await readFile(path.join(root, 'assets/js/main.js'), 'utf8');
const escape = (value) => String(value).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

assert(data.name && data.role && data.themeName, 'Identity fields are required');
assert(data.education?.school && Array.isArray(data.education.interests), 'education needs school and interests');
for (const key of ['skills', 'projects', 'experience', 'about', 'certificates']) assert(Array.isArray(data[key]), `${key} must be an array`);
for (const skill of data.skills) assert(typeof skill.level === 'string' ? skill.level.trim().length > 0 : Number.isFinite(skill.level) && skill.level >= 0 && skill.level <= 100, `Invalid level: ${skill.name}`);
for (const project of data.projects) assert(project.title && Array.isArray(project.tech), 'Each project needs a title and a tech array');
assert(!data.cv || data.cv.endsWith('.pdf'), 'data.cv must point to a .pdf file');
const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
assert.equal(new Set(ids).size, ids.length, 'Duplicate HTML id');
for (const [, id] of html.matchAll(/href="#([^"]+)"/g)) assert(ids.includes(id), `Anchor not found: ${id}`);

// Every local file the page, the data or the manifest points at must exist.
const manifest = JSON.parse(await readFile(path.join(root, 'site.webmanifest'), 'utf8'));
assert(html.includes('rel="manifest" href="site.webmanifest"') && manifest.short_name && manifest.icons?.length, 'Manifest is missing or incomplete');
const assets = [data.profile.image, ...data.projects.map((project) => project.image), data.cv, data.ambientAudio, data.seo.image, ...manifest.icons.map((icon) => icon.src), 'assets/models/umn-campus.glb'];
for (const [, value] of html.matchAll(/(?:src|href)="(assets\/[^"]+)"/g)) assets.push(value);
for (const [, value] of html.matchAll(/srcset="([^"]+)"/g)) assets.push(...value.split(',').map((entry) => entry.trim().split(/\s+/)[0]));
for (const asset of new Set(assets.filter(Boolean))) {
  if (/^https?:\/\//.test(asset)) continue;
  assert(!asset.startsWith('/') && !asset.includes('..'), `Path must be relative and inside the project: ${asset}`);
  await access(path.join(root, asset));
}
for (const still of ['assets/img/umn-campus.webp', 'assets/img/umn-campus-600.webp']) assert(assets.includes(still), `Campus still is not referenced: ${still}`);

// The campus model stays Draco-compressed and small, and never spins on its own.
const glbPath = path.join(root, 'assets/models/umn-campus.glb');
assert((await stat(glbPath)).size <= 300 * 1024, 'umn-campus.glb is over 300 KB');
assert((await readFile(glbPath)).includes('KHR_draco_mesh_compression'), 'umn-campus.glb is not Draco-compressed');
assert(!html.includes('auto-rotate') && !main.includes('auto-rotate'), 'The 3D model must not auto-rotate');
assert(main.includes('@google/model-viewer@4.0.0/dist/model-viewer.min.js'), 'model-viewer is not pinned in main.js');
assert(!html.includes('model-viewer'), 'index.html must not load model-viewer; main.js loads it on demand');

assert(html.includes('lang="en"') && html.includes('type="module"'), 'HTML language or module script is missing');
assert(html.includes('gsap@3.12.5') && html.includes('ScrollTrigger.min.js'), 'Animation CDN is not pinned');
assert(html.includes('fieldset id="form-fields" disabled'), 'The form must stay safe without JavaScript');
for (const [, target] of html.matchAll(/aria-(?:controls|labelledby|describedby)="([^"]+)"/g)) {
  for (const id of target.split(/\s+/)) assert(ids.includes(id), `Accessibility reference not found: ${id}`);
}
for (const id of ['accessibility-panel', 'quick-find']) assert(html.includes(`<dialog id="${id}"`), `${id} must be a native dialog`);
// Headings stay on one logical line: no <br> stacking in any h2.
for (const [, heading] of html.matchAll(/<h2[^>]*>(.*?)<\/h2>/gs)) assert(!/<br/i.test(heading), `No <br> in h2: ${heading}`);

if (process.argv.includes('--sync-meta')) {
  html = html.replace(/<title>[^<]*<\/title>/, `<title>${escape(data.seo.title)}</title>`);
  const values = { description: data.seo.description, 'og:title': data.seo.title, 'og:description': data.seo.description, 'og:image': data.seo.url ? new URL(data.seo.image, data.seo.url).href : data.seo.image };
  for (const [name, value] of Object.entries(values)) {
    const attribute = name.startsWith('og:') ? 'property' : 'name';
    const pattern = new RegExp(`<meta ${attribute}="${name}" content="[^"]*">`);
    html = html.replace(pattern, `<meta ${attribute}="${name}" content="${escape(value)}">`);
  }
  html = html.replace(/\n?\s*<link rel="canonical"[^>]*>/g, '').replace(/\n?\s*<meta property="og:url"[^>]*>/g, '');
  if (data.seo.url) {
    const url = new URL(data.seo.url);
    assert(['https:', 'http:'].includes(url.protocol), 'The SEO URL must be HTTP(S)');
    html = html.replace('</head>', `  <link rel="canonical" href="${escape(url.href)}">\n  <meta property="og:url" content="${escape(url.href)}">\n</head>`);
  }
  await writeFile(htmlPath, html);
  console.log('HTML metadata synced from data.js.');
}
console.log(`Passed: data, anchors, ${new Set(assets.filter(Boolean)).size} asset paths, campus model, manifest, modules, CDN pins, and the form fallback.`);
