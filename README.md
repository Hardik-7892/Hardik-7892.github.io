# hardik-pandey.com

Personal portfolio website for [Hardik Pandey](https://hardik-pandey.com) — software engineer working across AI, security, Rust, and game development.

## Tech Stack

- **HTML / CSS / JavaScript** — vanilla, no frameworks
- [Three.js](https://threejs.org/) — 3D backgrounds on cyber/ML/cloud pages
- [GoatCounter](https://www.goatcounter.com/) — privacy-friendly analytics
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API) — PWA offline caching
- [View Transitions API](https://developer.mozilla.org/en-US/docs/Web/API/View_Transitions_API) — page transitions
- Hosted on [GitHub Pages](https://pages.github.com/) with custom domain

## Local Development

This is a pure static site. No build tools required.

```sh
# Clone the repo
git clone https://github.com/Hardik-7892/Hardik-7892.github.io.git
cd Hardik-7892.github.io

# Serve locally with any static file server
python -m http.server 8000
# or
npx serve .
```

Then open `http://localhost:8000` in your browser.

## Project Structure

```bash
├── index.html          # Homepage with hero + featured projects carousel
├── about.html          # Bio, skills, photo
├── projects.html       # Filterable project grid
├── contact.html        # Contact cards + form
├── profiles.html       # External profile cards
├── cloud.html          # Google Cloud badge gallery (3D globe)
├── 404.html            # Custom 404 page
├── roles/
│   ├── cyber.html      # Cyber security profile (3D globe)
│   └── ml.html         # Machine learning profile (3D network)
├── css/
│   ├── tokens.css      # Design tokens, fonts, theme variables
│   ├── components.css  # Component styles (nav, cards, buttons, etc.)
│   ├── layout.css      # Layout, footer, responsive, print
│   ├── animations.css  # Fade-in, view transitions, reduced motion
│   └── carousel.css    # Featured projects carousel
├── js/
│   ├── data.js         # Project, profile, and badge data
│   ├── shared.js       # Nav, footer, privacy banner injection
│   ├── main.js         # Theme toggle, filters, cursor, carousel, analytics
│   ├── cloud-badges.js # Badge gallery rendering
│   ├── cloud-bg.js     # Cloud page 3D globe
│   ├── cloud-globe.js  # Cloud page globe animation
│   ├── cyber-globe.js  # Cyber page 3D globe
│   ├── ml-pipeline.js  # ML page 3D pipeline
│   ├── ml-network.js   # ML page 3D network
│   └── visitor-info.js # Cyber page visitor info widget
├── images/             # Images (WebP + PNG fallbacks)
├── assets/fonts/       # Self-hosted fonts
├── cv/                 # Downloadable CV files
├── service-worker.js   # PWA service worker
└── manifest.json       # PWA manifest
```

## Custom Domain

The site is configured for `hardik-pandey.com` via GitHub Pages:

- `CNAME` file in root
- A records in the DNS zone point to GitHub Pages IPs
- All canonical URLs and OG tags reference the custom domain

## License

Feel free to use this as inspiration for your own portfolio.
