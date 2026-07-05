const projects = [
  {
    id: 'ai-companion',
    name: 'AI-Companion',
    desc: 'A modular, local AI assistant with long-term semantic memory. Built a RAG pipeline using FAISS and SentenceTransformers so it actually remembers what you\'ve told it. Runs quantized GGUF models via llama-cpp-python \u2014 entirely offline, entirely yours.',
    url: 'https://github.com/Hardik-7892/AI-Companion',
    color: 'var(--c-python)',
    tags: ['Python', 'FAISS', 'SentenceTransformers', 'llama.cpp'],
    filterTags: ['python', 'ml'],
    featured: true,
    roles: ['ml'],
  },
  {
    id: 'siem-elk',
    name: 'SIEM-ELK',
    desc: 'A SOC analyst lab built from scratch on the ELK stack. Set up log ingestion with Logstash, built detection dashboards in Kibana, and wrote custom alert rules. The goal was to understand what real detection engineering looks like, not just read about it.',
    url: 'https://github.com/Hardik-7892/SIEM-ELK',
    color: 'var(--c-elk)',
    tags: ['Elasticsearch', 'Logstash', 'Kibana', 'SIEM'],
    filterTags: ['security'],
    featured: true,
    roles: ['cyber'],
  },
  {
    id: 'auto-ml',
    name: 'auto-ml',
    desc: 'A Streamlit app that wraps AutoGluon to make training and evaluating ML models genuinely painless. Upload a dataset, pick your target column, let it run. Comes with example model outputs so you can see what to expect.',
    url: 'https://github.com/Hardik-7892/auto-ml',
    color: 'var(--c-python)',
    tags: ['Python', 'AutoGluon', 'Streamlit'],
    filterTags: ['python', 'ml'],
    featured: false,
    roles: ['ml'],
  },
  {
    id: 'emojinterp',
    name: 'emojinterp',
    desc: 'A programming language where the syntax is entirely emojis. Brainfuck-inspired \u2014 each emoji maps to an instruction. Full CLI interpreter written in Rust. It does actually run programs.',
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
    desc: 'Human-centred security research. Ran a user study comparing text-only, emoji-only, and hybrid passwords \u2014 testing both security strength and memorability. Tracked results via Google Sheets API.',
    url: 'https://github.com/Hardik-7892/Improving-Passwords-using-Emojis',
    color: 'var(--c-python)',
    tags: ['Python', 'Research', 'Google Sheets API'],
    filterTags: ['python', 'security', 'research'],
    featured: false,
    roles: ['cyber'],
  },
  {
    id: 'space-shooter-2d',
    name: 'Space Shooter 2D',
    desc: 'A 3-level space shooter built in Unity with WASD controls and enemy waves. Expanded from the original with additional enemies, sound effects, and level progression. Free to play on itch.io.',
    url: 'https://github.com/Hardik-7892/Space-Shooter-2D',
    color: 'var(--c-csharp)',
    tags: ['C#', 'Unity', 'Game Dev'],
    filterTags: ['csharp', 'gamedev'],
    featured: false,
    roles: [],
  },
  {
    id: 'install-k8s-tui',
    name: 'k8s-installer',
    desc: 'Interactive TUI tool that generates Kubernetes installation scripts. Pick your distribution, container runtime, CNI plugin, and addons through a Ratatui terminal UI \u2014 then save or execute a ready-to-run install script.',
    url: 'https://github.com/Hardik-7892/install-k8s-tui',
    color: 'var(--c-rust)',
    tags: ['Rust', 'CLI', 'Kubernetes', 'TUI'],
    filterTags: ['rust'],
    featured: true,
    roles: [],
  },
  {
    id: 'kart-game',
    name: 'Kart Game',
    desc: 'A kart racing game built in Unity with builds for Windows, macOS, and WebGL. Built to explore game physics, vehicle handling, and cross-platform deployment workflows.',
    url: 'https://github.com/Hardik-7892/Kart-Game',
    color: 'var(--c-csharp)',
    tags: ['C#', 'Unity', 'Game Dev'],
    filterTags: ['csharp', 'gamedev'],
    featured: false,
    roles: [],
  },
  {
    id: 'portfolio',
    name: 'Portfolio Website',
    desc: 'A personal portfolio with 3D visualizations (Three.js), responsive design, dark mode, privacy-first analytics, and custom CSP. Built with vanilla HTML, CSS, and JavaScript \u2014 no frameworks. Iteratively developed with AI assistance.',
    url: 'https://github.com/Hardik-7892/Hardik-7892.github.io',
    color: 'var(--c-web)',
    tags: ['HTML', 'CSS', 'JavaScript', 'Three.js', 'AI-assisted'],
    filterTags: ['web'],
    featured: false,
    roles: [],
  },
  {
    id: 'shutterfolio',
    name: 'Shutterfolio',
    desc: 'A photographer portfolio website with a secure admin panel to manage photos, settings, and content from any device. Features drag-and-drop uploads, GitHub API-based storage, serverless API routes on Vercel, and Alpine.js on the frontend.',
    url: 'https://github.com/Hardik-7892/shutterfolio',
    color: 'var(--c-web)',
    tags: ['JavaScript', 'Alpine.js', 'Serverless', 'GitHub API', 'HTML', 'CSS', 'AI-assisted'],
    filterTags: ['web'],
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
        + '<p class="card-name">' + p.name + '</p>'
        + '<img src="' + p.badgeIcon + '" alt="' + p.name + ' badge" class="profile-badge-icon" loading="lazy" />'
        + '</div>'
      : '<p class="card-name">' + p.name + '</p>';

    return '<a href="' + p.url + '"'
      + '   target="_blank" rel="noopener"'
      + '   class="card profile-card fade-in"'
      + '   style="--card-color: ' + p.color + '">'
      + badgeHtml
      + '  <p class="card-desc">' + p.desc + '</p>'
      + '  <div class="card-footer">'
      + '    <div class="card-tags">'
      + p.tags.map(function (t) { return '<span class="tag">' + t + '</span>'; }).join('')
      + '    </div>'
      + '    <span class="card-link">' + (p.linkText || 'View profile \u2192') + '</span>'
      + '  </div>'
      + '</a>';
  }).join('');
}

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
    return '<a href="' + p.url + '"'
      + '   target="_blank" rel="noopener"'
      + '   class="card fade-in"'
      + '   data-tags="' + p.filterTags.join(',') + '"'
      + '   style="--card-color: ' + p.color + '">'
      + '  <p class="card-name">' + p.name + '</p>'
      + '  <p class="card-desc">' + p.desc + '</p>'
      + '  <div class="card-footer">'
      + '    <div class="card-tags">'
      + p.tags.map(function (t) { return '<span class="tag">' + t + '</span>'; }).join('')
      + '    </div>'
      + '    <span class="card-link">GitHub &rarr;</span>'
      + '  </div>'
      + '</a>';
  }).join('');
}
