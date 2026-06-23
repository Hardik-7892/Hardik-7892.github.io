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
    id: '2d-shooter',
    name: '2D Shooter',
    desc: 'A 2D shooter game built in Unity. Started it to properly understand how game loops, collision detection, and player physics actually work under the hood \u2014 not just use them from a template.',
    url: 'https://github.com/Hardik-7892/2D-Shooter',
    color: 'var(--c-csharp)',
    tags: ['C#', 'Unity', 'Game Dev'],
    filterTags: ['csharp', 'gamedev'],
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
    desc: 'Games and interactive builds, including 2D Shooter and other experiments made in Unity.',
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
