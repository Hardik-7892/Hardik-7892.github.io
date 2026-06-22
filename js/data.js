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
