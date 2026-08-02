(function () {
function esc(s) { var d = document.createElement('div'); d.textContent = s; return d.innerHTML; }

const projects = [
  {
    id: 'ai-companion',
    name: 'AI-Companion',
    desc: 'A modular RAG-powered conversational engine. The RAG pipeline runs both a local GGUF LLM (llama-cpp-python) and Anthropic Claude via OpenRouter with SentenceTransformers embeddings. Dual-layer memory: FAISS for semantic long-term retrieval, JSON archive for full history. Ships dual UIs (Gradio + Streamlit) sharing one logic core.',
    url: 'https://github.com/Hardik-7892/AI-Companion',
    liveUrl: 'https://ai-companion-123.streamlit.app/',
    liveText: 'Live demo',
    color: 'var(--c-python)',
    tags: ['Python', 'RAG', 'FAISS', 'SentenceTransformers', 'llama.cpp', 'Gradio', 'AI-assisted'],
    filterTags: ['python', 'ml', 'ai-assisted'],
    featured: true,
    roles: ['ml'],
  },
  {
    id: 'siem-elk',
    name: 'SIEM-ELK',
    desc: 'A three-machine SOC homelab: a dedicated ELK SIEM server ingesting logs from an Ubuntu agent and a Windows host via Logstash. Kibana dashboards for log visualisation and threat detection with custom alert rules \u2014 a realistic SOC environment.',
    url: 'https://github.com/Hardik-7892/SIEM-ELK',
    color: 'var(--c-elk)',
    tags: ['Elasticsearch', 'Logstash', 'Kibana', 'SIEM', 'Ubuntu', 'Windows'],
    filterTags: ['security'],
    featured: true,
    roles: ['cyber'],
  },
  {
    id: 'auto-ml',
    name: 'auto-ml',
    desc: 'A no-code ML web app. Upload a dataset, pick a target column, and AutoGluon handles feature engineering, model selection, and ensembling automatically \u2014 then review the evaluation results in the browser.',
    url: 'https://github.com/Hardik-7892/auto-ml',
    liveUrl: 'https://auto-ml-hardik.streamlit.app/',
    color: 'var(--c-python)',
    tags: ['Python', 'AutoGluon', 'Streamlit'],
    filterTags: ['python', 'ml'],
    featured: false,
    roles: ['ml'],
  },
  {
    id: 'emojinterp',
    name: 'emojinterp',
    desc: 'A fully functional esoteric language interpreter in Rust \u2014 emoji tokens map to Brainfuck-style instructions, with lexing, parsing, and execution handled in a single CLI tool.',
    url: 'https://github.com/Hardik-7892/emojinterp',
    color: 'var(--c-rust)',
    tags: ['Rust', 'CLI', 'interpreter', 'lang design'],
    filterTags: ['rust'],
    featured: true,
    roles: [],
  },
  {
    id: 'emoji-passwords',
    name: 'Emoji Passwords',
    desc: 'Human-centred security research. Designed and ran a user study comparing text-only, emoji-only, and hybrid passwords. Built a Gradio data-collection interface wired to the Google Sheets API for real-time capture, then analysed the behavioural data for recommendations.',
    url: 'https://github.com/Hardik-7892/Improving-Passwords-using-Emojis',
    liveUrl: 'https://hcs-group-e.streamlit.app/',
    color: 'var(--c-python)',
    tags: ['Python', 'Gradio', 'Research', 'Google Sheets API'],
    filterTags: ['python', 'security', 'research'],
    featured: false,
    roles: ['cyber'],
  },
  {
    id: 'space-shooter-2d',
    name: 'Space Shooter 2D',
    desc: 'A complete 2D space shooter built in Unity \u2014 enemy AI, scoring systems, scene management. 3 levels, chasers and shooters, plus sound effects. Deployed as WebGL for browser play \u2014 also on itch.io.',
    url: 'https://github.com/Hardik-7892/2D-Shooter',
    liveUrl: 'https://hardik-pandey.com/2D-Shooter/',
    color: 'var(--c-csharp)',
    tags: ['C#', 'Unity', 'Game Dev'],
    filterTags: ['csharp', 'gamedev'],
    featured: false,
    roles: [],
  },
  {
    id: 'install-k8s-tui',
    name: 'k8s-installer',
    desc: 'A Rust TUI that generates ready-to-run Kubernetes install scripts across 5 distributions (kubeadm, k3s, minikube, kind, MicroK8s). Interactive ratatui mode, simple prompts, or fully CLI-driven \u2014 outputs Bash and PowerShell as a zero-dependency binary.',
    url: 'https://github.com/Hardik-7892/install-k8s-tui',
    color: 'var(--c-rust)',
    tags: ['Rust', 'CLI', 'Kubernetes', 'TUI', 'AI-assisted'],
    filterTags: ['rust', 'ai-assisted'],
    featured: true,
    roles: [],
  },
  {
    id: 'kart-game',
    name: 'Kart Game',
    desc: 'A complete kart racing game in Unity \u2014 physics-based driving, enemy AI, scoring systems, and scene management. WebGL build deployed for browser play, with Windows and macOS builds also available.',
    url: 'https://github.com/Hardik-7892/Kart-Game',
    liveUrl: 'https://hardik-pandey.com/Kart-Game/',
    color: 'var(--c-csharp)',
    tags: ['C#', 'Unity', 'Game Dev'],
    filterTags: ['csharp', 'gamedev'],
    featured: false,
    roles: [],
  },
  {
    id: 'portfolio',
    name: 'Portfolio Website',
    desc: 'This site \u2014 a zero-framework ~5,500-line vanilla HTML/CSS/JS portfolio across 11 pages with six Three.js 3D scenes, PWA offline support, and dark mode. Security-first: CSP, SRI, security.txt (RFC 9116), dual-compliance privacy (UK GDPR + India DPDP). Cloudflare CDN/DNS, JSON-LD SEO, self-hosted analytics.',
    url: 'https://github.com/Hardik-7892/Hardik-7892.github.io',
    liveUrl: 'https://hardik-pandey.com/',
    color: 'var(--c-web)',
    tags: ['HTML', 'CSS', 'JavaScript', 'Three.js', 'PWA', 'CSP', 'AI-assisted'],
    filterTags: ['web', 'ai-assisted'],
    featured: false,
    roles: [],
  },
  {
    id: 'shutterfolio',
    name: 'Shutterfolio',
    desc: 'A JAMstack photographer portfolio with a secure admin panel. Drag-and-drop upload, reordering, and editing \u2014 persisted by committing to the repo via the GitHub API. Serverless API routes and server-side validation on Vercel.',
    url: 'https://github.com/Hardik-7892/shutterfolio',
    liveUrl: 'https://shutterfolio.vercel.app/',
    color: 'var(--c-web)',
    tags: ['JavaScript', 'Alpine.js', 'Serverless', 'GitHub API', 'Vercel', 'AI-assisted'],
    filterTags: ['web', 'ai-assisted'],
    featured: false,
    roles: [],
  },
  {
    id: 'income-calculation',
    name: 'Income Calculator',
    desc: 'An interactive Streamlit tool that computes daily earnings from configurable hourly rates and weekend multipliers \u2014 deployed as a live web app.',
    url: 'https://github.com/Hardik-7892/income-calculation',
    liveUrl: 'https://income-calculation.streamlit.app/',
    color: 'var(--c-python)',
    tags: ['Python', 'Streamlit'],
    filterTags: ['python'],
    featured: false,
    roles: [],
  },
  {
    id: 'ed-tech',
    name: 'AI-Powered Ed-Tech Platform',
    desc: 'Led a 4-member team building an AI-powered web platform for educational delivery \u2014 from roadmap and feature prioritisation to delivery. Published the findings as a first-author IEEE paper on integrating scalable digital platforms in education.',
    url: 'https://doi.org/10.1109/TQCEBT59414.2024.10545211',
    urlText: 'Paper',
    color: 'var(--c-web)',
    tags: ['IEEE', 'Research', 'EdTech', 'Team Lead'],
    filterTags: ['research', 'web'],
    featured: false,
    roles: [],
  },
];

const profiles = [
  {
    id: 'gcp-skills',
    name: 'Google Cloud Skills',
    url: 'cloud.html',
    color: 'var(--c-gcp)',
    desc: 'Diamond League — 34,595 points. 51 skill badges across ML, GenAI, infrastructure, security, data, and more.',
    tags: ['Diamond League', '34,595 pts', '51 badges'],
    badgeIcon: 'https://cdn.qwiklabs.com/assets/leagues/diamond_sm_new-06034c04ad18f430d9bd6cb990cc389114c4307d.png',
    linkText: 'Browse badges \u2192'
  },
  {
    id: 'gcp-cyber',
    name: 'Google Cloud Cybersecurity',
    url: 'cloud.html?filter=cyber',
    color: 'var(--c-gcp)',
    desc: '51 skill badges including networking, load balancing, Kubernetes, and cloud infrastructure — earned through hands-on Google Cloud labs.',
    tags: ['Diamond League', '51 badges'],
    badgeIcon: 'https://cdn.qwiklabs.com/assets/leagues/diamond_sm_new-06034c04ad18f430d9bd6cb990cc389114c4307d.png',
    linkText: 'Browse badges \u2192'
  },
  {
    id: 'gcp-ml',
    name: 'Google Cloud ML Skills',
    url: 'cloud.html?filter=ml',
    color: 'var(--c-gcp)',
    desc: '51 skill badges including ML APIs, BigQuery analytics, and GenAI pathways — from introductory to advanced hands-on labs.',
    tags: ['Diamond League', '51 badges'],
    badgeIcon: 'https://cdn.qwiklabs.com/assets/leagues/diamond_sm_new-06034c04ad18f430d9bd6cb990cc389114c4307d.png',
    linkText: 'Browse badges \u2192'
  },
  {
    id: 'vercel',
    name: 'Vercel',
    url: 'https://vercel.com/hardiks-projects-9b7e5c43',
    color: 'var(--c-vercel)',
    desc: 'Live deployments and previews for side projects and experiments — shipped and hosted straight from GitHub.',
    tags: ['Hosting', 'Deployments'],
    linkText: 'View profile \u2192'
  },
  {
    id: 'itchio',
    name: 'itch.io',
    url: 'https://hardik-7892.itch.io/',
    color: 'var(--c-itch)',
    desc: 'Games and interactive builds, including Space Shooter 2D and other experiments made in Unity.',
    tags: ['Game Dev', 'Unity'],
    linkText: 'View profile \u2192'
  },
  {
    id: 'tryhackme',
    name: 'TryHackMe',
    url: 'https://tryhackme.com/p/hardik0',
    color: 'var(--c-thm)',
    desc: 'Hands-on cybersecurity training \u2014 working through CTF rooms and offensive/defensive security challenges.',
    tags: ['Cyber Security', 'CTF'],
    linkText: 'View profile \u2192'
  }
];

function renderProfiles(containerId, opts) {
  if (!opts) opts = {};
  var container = document.getElementById(containerId);
  if (!container) return;

  var filtered = profiles.slice();

  if (opts.ids) {
    filtered = filtered.filter(function (p) {
      return opts.ids.indexOf(p.id) !== -1;
    });
  }

  container.innerHTML = filtered.map(function (p) {
    var badgeHtml = p.badgeIcon
      ? '<div class="profile-card-top">'
        + '<p class="card-name">' + esc(p.name) + '</p>'
        + '<img src="' + p.badgeIcon + '" alt="' + esc(p.name) + ' badge" class="profile-badge-icon" loading="lazy" />'
        + '</div>'
      : '<p class="card-name">' + esc(p.name) + '</p>';

    return '<a href="' + p.url + '"'
      + '   target="_blank" rel="noopener"'
      + '   class="card profile-card fade-in"'
      + '   data-color="' + p.color.replace(/^var\(--c-/, '').replace(/\)$/, '') + '">'
      + badgeHtml
      + '  <p class="card-desc">' + esc(p.desc) + '</p>'
      + '  <div class="card-footer">'
      + '    <div class="card-tags">'
      + p.tags.map(function (t) { return '<span class="tag">' + esc(t) + '</span>'; }).join('')
      + '    </div>'
      + '    <span class="card-link">' + esc(p.linkText || 'View profile \u2192') + '</span>'
      + '  </div>'
      + '</a>';
  }).join('');
}

window.projects = projects;
window.profiles = profiles;
window.renderProfiles = renderProfiles;

function renderProjects(containerId, opts = {}) {
  const container = document.getElementById(containerId);
  if (!container) return;

  let filtered = [...projects];

  if (opts.featured) {
    filtered = filtered.filter(function (p) { return p.featured; });
  }

  if (opts.role) {
    filtered = filtered.filter(function (p) {
      return p.roles && p.roles.indexOf(opts.role) !== -1;
    });
  }

  if (opts.limit) {
    filtered = filtered.slice(0, opts.limit);
  }

  container.innerHTML = filtered.map(function (p) {
    var links =
      '<div class="card-links">'
      + '<a class="card-link" href="' + p.url + '" target="_blank" rel="noopener">'
      + esc(p.urlText || 'GitHub') + ' &rarr;</a>'
      + (p.liveUrl
        ? '<a class="card-link" href="' + p.liveUrl + '" target="_blank" rel="noopener">'
          + esc(p.liveText || 'Live site') + ' &rarr;</a>'
        : '')
      + '</div>';

    return '<div class="card fade-in"'
      + ' data-tags="' + p.filterTags.join(',') + '"'
      + ' data-color="' + p.color.replace(/^var\(--c-/, '').replace(/\)$/, '') + '">'
      + '  <p class="card-name">' + esc(p.name) + '</p>'
      + '  <p class="card-desc">' + esc(p.desc) + '</p>'
      + '  <div class="card-footer">'
      + '    <div class="card-tags">'
      + p.tags.map(function (t) { return '<span class="tag">' + esc(t) + '</span>'; }).join('')
      + '    </div>'
      + links
      + '  </div>'
      + '</div>';
  }).join('');
}

window.renderProjects = renderProjects;
})();
