# Porto_Beta

Personal portfolio of **Alfonsus Ronaldy Hidayat** (Information Systems, Universitas Multimedia Nusantara, Jakarta). The theme is a late-1800s frontier bounty board called **DUSTY TRAIL PORTFOLIO**. It is a static site: HTML5, CSS3 and JavaScript ES modules, with no build step and no `npm install`.

**Status: beta.** The content follows the owner's latest resume, and the CV is downloadable from `assets/cv.pdf`. The profile photo, Instagram and the form endpoint are not filled in yet. The contact form is **not connected** until `contact.formEndpoint` is set in `data.js`; while it is empty, the form is shown but tells visitors to use email.

## Preview

![First view of the portfolio: hero with a desert landscape at sunset](assets/img/preview.png)

The image is a hero snapshot at 1440 × 900 from an earlier Indonesian build; the live text is now English. Run the site locally to see the current version.

## What is on the site

- **Hero**: an original layered SVG desert with mesas, sun, cactus, birds and a tumbleweed. A short saloon-door intro plays once and never blocks clicks or the keyboard. Wooden trail signs at the foot of the hero show a greeting, a link into the trail and the owner's location.
- **Education**: the UMN logo and degree details on a wooden plate, next to a 3D model of the UMN campus (Draco-compressed, about 229 KB). It never rotates on its own; it only turns when the visitor drags it. Every device first gets a small still image (80 KB). Desktops with WebGL then load the viewer and the model when the section comes near. Phones, touch devices, data-saver connections and browsers without WebGL keep the still and get a **Load the 3D campus** button, so nothing heavy downloads unless they ask.
- **Traveler's Journal, Gear & Skills, The Trail So Far**: about text, skill ledger and experience route, on wooden plates and paper.
- **Wanted Board**: project posters that flip by mouse, keyboard or touch.
- **Contact**: icon badges for email, GitHub, LinkedIn and the CV download (Instagram and WhatsApp appear once set), plus a Formspree form with validation and a 15-second timeout. The form only sends once `contact.formEndpoint` is set.
- **CV download**: `assets/cv.pdf`, linked from the about section and the contact badges. Leave `cv` empty in `data.js` to hide every CV link.
- **Sheriff's Quick-Find**: the magnifier in the header, or `Ctrl`/`Cmd`+`K`, or `/`. Type to filter sections, project posters and contact links; arrow keys move, `Enter` goes, `Esc` closes. Choosing a project scrolls to its poster and flips it.
- **Dusk/dawn toggle**: the sun/lantern button in the header switches between dawn (light) and dusk (dark). With nothing saved, the site follows the device's light/dark setting.
- **Accessibility panel**: dusk mode, reduce motion, high contrast, text size 100–125% and reset. Choices are saved in the browser. The device's reduced-motion setting always wins.
- Works without JavaScript for the landscape, navigation and the campus still. Personal content and the form need JavaScript.

## Structure

```text
.
├── index.html
├── site.webmanifest
├── check.mjs                 developer check, not needed by the browser
├── assets/
│   ├── css/                  style.css, animations.css
│   ├── js/                   data.js (content), main.js, particles.js, cursor.js
│   ├── img/                  photos, previews, umn-campus.webp (+ 600px version)
│   ├── icons/                favicon.svg, apple-touch-icon.png, icon-192.png, icon-512.png
│   ├── models/               umn-campus.glb (Draco-compressed)
│   └── cv.pdf                downloadable CV
└── .github/workflows/deploy.yml
```

## Edit the content in one file

1. Open `assets/js/data.js`.
2. Look for the **EDIT HERE** comments and the `[[...]]` tokens.
3. Change the values, not the property names:

   ```js
   name: 'Your Full Name',
   role: 'Front-end Developer',
   tagline: 'Digital work that feels human.',
   ```

4. Add or remove objects in `skills`, `projects` or `experience`. The page renders however many there are. `skills[].level` takes text or a number from 0 to 100; a progress bar appears only for a number.
5. Leave `cv`, social URLs, `demo`, `github` or `ambientAudio` empty when you do not have them. Empty links and buttons are hidden, and Quick-Find leaves them out.
6. Set `contact.formEndpoint` to a real Formspree endpoint such as `https://formspree.io/f/abcdefgh`. Only that host and route are accepted.
7. Write WhatsApp as an international number with no `+`, spaces or dashes, for example `6281234567890`.

Text is never inserted as raw HTML. Everything in `data.js` is public, so do not put secrets in it.

### Images

- Profile photo: 600 × 800, for example `assets/img/profile.webp`; set `profile.image` and `profile.alt`.
- Project preview: 1200 × 750; set `projects[].image` and `projects[].alt`.
- Social preview: a 1200 × 630 JPG or PNG in `seo.image`.
- Paths are relative to `index.html`, with no leading slash.

## Run it locally

ES modules need HTTP, so do not open `index.html` from `file://`.

```bash
python -m http.server 8080
```

Open `http://localhost:8080/` and press `Ctrl+C` to stop.

## Check before publishing

Needs Node.js 18 or newer and nothing else:

```bash
node check.mjs
```

It checks the data shape, anchors and ARIA references, that every referenced file exists (images, icons, manifest, CV), that the campus model is Draco-compressed and at most 300 KB, that nothing sets `auto-rotate`, that model-viewer is pinned and loaded only from `main.js`, and that no `<h2>` contains a `<br>`.

To copy the title, description and Open Graph tags from `data.js` into `index.html` (many social crawlers do not run JavaScript), set `seo.url` first and run:

```bash
node check.mjs --sync-meta
```

Manual checks worth doing: widths 360, 768 and 1280; keyboard only (Tab, Enter, Escape, Quick-Find); dusk mode, high contrast and large text; reduced motion on the device; JavaScript off; the form with an empty and a real endpoint.

## The 3D campus model

The model was built by the owner in Blender. It has 30 solid-colour materials and no textures. The original export is 2.36 MB; the file in this repo is the Draco-compressed copy (about 229 KB). To compress a new export, run this outside the repo:

```bash
npx @gltf-transform/cli@4.5.1 draco in.glb out.glb
```

`in.glb` is the original Blender export; copy `out.glb` to `assets/models/umn-campus.glb`. Do not use `gltf-transform optimize`: its defaults add a palette texture. If the logo looks jagged after compression, add `--quantize-position 16`.

Keep the uncompressed original somewhere outside the repo. If the model changes shape, render the still again at the same camera (`camera-orbit="-25deg 65deg 68%"`) and replace `assets/img/umn-campus.webp` (1200 × 900) and `assets/img/umn-campus-600.webp`, so the swap from still to model does not jump.

A Draco model needs the Draco decoder, which model-viewer fetches from `www.gstatic.com`. If that or the viewer script is blocked, the page keeps the still and says "3D view unavailable".

## Deploy

**Vercel**: the site is static with no build step. Import the repository, set Framework Preset to **Other**, leave Build Command empty (no build) and set Output Directory to `.` (the repository root). `.vercelignore` keeps `README.md`, `check.mjs` and `.github/` out of the upload. After the first deploy, put the production URL in `seo.url`, then run `node check.mjs --sync-meta`.

**GitHub Pages** (alternative, manual trigger): in **Settings → Pages**, set the source to **GitHub Actions**, then run the workflow **Deploy static portfolio to GitHub Pages** from the Actions tab. It publishes only `index.html`, `site.webmanifest`, `assets/`, `.nojekyll` and `LICENSE`.

## Colours, fonts and speed

- **Colours**: the tokens in `:root` in `assets/css/style.css`. Dusk overrides are in `:root[data-theme="night"]`.
- **Fonts**: `--font-display`, `--font-heading`, `--font-body`, `--font-label`, plus the Google Fonts URL in `index.html`.
- **Animation speed**: `motion.duration` and `motion.intro` in `data.js`, in seconds. `motion.particles` sets the dust count.
- **CSS loops**: durations in `assets/css/animations.css`.

## Credits and licences

- Code, CSS, SVG artwork, placeholders and icons made for this project: [MIT](LICENSE).
- Fonts: [Rye](https://fonts.google.com/specimen/Rye), [IM Fell English SC](https://fonts.google.com/specimen/IM+Fell+English+SC), [IM Fell English](https://fonts.google.com/specimen/IM+Fell+English) and [Special Elite](https://fonts.google.com/specimen/Special+Elite), served by Google Fonts. Rye and the IM Fell faces are under the SIL Open Font License; check each specimen page for the licence before self-hosting.
- [GSAP 3.12.5 and ScrollTrigger](https://gsap.com/), loaded from jsDelivr, under GSAP's own [standard licence](https://gsap.com/community/standard-license/). Not relicensed here.
- [`<model-viewer>` 4.0.0](https://modelviewer.dev/) by Google, Apache-2.0, loaded from jsDelivr only when the 3D view is shown.
- [Draco](https://google.github.io/draco/) mesh compression by Google, Apache-2.0. The decoder is fetched from gstatic by model-viewer. Compression was done with [glTF Transform](https://gltf-transform.dev/) (MIT).
- [Formspree](https://formspree.io/): optional third-party form service; limits follow the owner's account.
- `assets/models/umn-campus.glb` and the stills `assets/img/umn-campus*.webp`: a 3D model of the UMN campus made by the site owner in Blender.
- `assets/img/umn-logo.png`, and the logo as it appears on the model: the Universitas Multimedia Nusantara name and logo are trademarks of UMN. They are shown only to identify the owner's university, are not covered by this project's MIT licence, and do not imply endorsement by UMN.
- `assets/img/gate-preview.webp` comes from `asset/preview-home.png` in [GATE_PROJECT](https://github.com/amaliacalista26/GATE_PROJECT). `assets/img/proxmox-preview.webp` is a cropped screenshot of the owner's homelab dashboard. Marks shown in both belong to their owners.
- `assets/img/preview.png` and `assets/img/og-image.png` are screenshots of this site.
- No music, sound effects or assets from any western game or film are included.

The look is inspired by cinematic westerns in general. It adapts no specific work and is not affiliated with, sponsored by or endorsed by anyone. Use only photos, a CV and audio that you own or have permission to use.
