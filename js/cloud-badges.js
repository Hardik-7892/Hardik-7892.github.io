var BADGES = [
  { name: 'Work Meets Play: Metrics in Motion', date: 'Mar 28, 2026', tags: ['arcade', 'data'] },
  { name: 'Arcade March 2026 Sprint 2', date: 'Mar 27, 2026', tags: ['arcade'] },
  { name: 'Arcade Trail: Automation and Analytics', date: 'Mar 27, 2026', tags: ['arcade', 'data'] },
  { name: 'The Arcade Trivia June 2024 Week 4', date: 'Jun 25, 2024', tags: ['arcade'] },
  { name: 'The Arcade Trivia June 2024 Week 3', date: 'Jun 19, 2024', tags: ['arcade'] },
  { name: 'The Arcade Trivia June 2024 Week 2', date: 'Jun 14, 2024', tags: ['arcade'] },
  { name: 'Level 3: GenAIus Travels', date: 'Jun 8, 2024', tags: ['genai', 'ml'] },
  { name: 'The Arcade Trivia June 2024 Week 1', date: 'Jun 3, 2024', tags: ['arcade'] },
  { name: 'The Arcade Health Tech', date: 'May 29, 2024', tags: ['arcade', 'data'] },
  { name: 'The Arcade Trivia May 2024 Week 4', date: 'May 29, 2024', tags: ['arcade'] },
  { name: 'The Arcade Trivia May 2024 Week 3', date: 'May 28, 2024', tags: ['arcade'] },
  { name: 'The Arcade Trivia May 2024 Week 2', date: 'May 25, 2024', tags: ['arcade'] },
  { name: 'Level 3: GenAIus Registries', date: 'May 6, 2024', tags: ['genai', 'ml'] },
  { name: 'The Arcade Trivia May 2024 Week 1', date: 'May 6, 2024', tags: ['arcade'] },
  { name: 'The Arcade Trivia April 2024 Week 3', date: 'Apr 30, 2024', tags: ['arcade'] },
  { name: 'Level 3: GenAIus Careers', date: 'Apr 8, 2024', tags: ['genai', 'ml'] },
  { name: 'The Arcade Trivia April 2024 Week 1', date: 'Apr 3, 2024', tags: ['arcade'] },
  { name: 'The Arcade Skills Splash', date: 'Mar 31, 2024', tags: ['arcade'] },
  { name: 'Level 2: Kubernetes', date: 'Mar 30, 2024', tags: ['infra', 'cyber'] },
  { name: 'The Arcade Trivia March 2024 Week 4', date: 'Mar 26, 2024', tags: ['arcade'] },
  { name: 'The Arcade Trivia March 2024 Week 3', date: 'Mar 26, 2024', tags: ['arcade'] },
  { name: 'The Arcade Trivia March 2024 Week 2', date: 'Mar 25, 2024', tags: ['arcade'] },
  { name: 'The Arcade Certification Zone March 2024', date: 'Mar 17, 2024', tags: ['arcade'] },
  { name: 'Level 1: Load Balancers', date: 'Mar 8, 2024', tags: ['infra', 'cyber'] },
  { name: 'The Arcade Trivia March 2024 Week 1', date: 'Mar 7, 2024', tags: ['arcade'] },
  { name: 'Level 3: GenAIus Heroes', date: 'Mar 5, 2024', tags: ['genai', 'ml'] },
  { name: 'Introduction to Generative AI', date: 'Mar 4, 2024', tags: ['genai', 'ml'] },
  { name: 'DEPRECATED BigQuery Basics for Data Analysts', date: 'Aug 5, 2023', tags: ['data'] },
  { name: 'Prepare Data for ML APIs on Google Cloud', date: 'Aug 2, 2023', tags: ['ml', 'data'] },
  { name: 'Qwiklabs Trivia July 2023', date: 'Jul 25, 2023', tags: ['arcade'] },
  { name: 'Deploy Kubernetes Applications on Google Cloud', date: 'Jul 21, 2023', tags: ['infra', 'cyber'] },
  { name: 'Google Cloud Fundamentals: Core Infrastructure', date: 'Jul 21, 2023', tags: ['infra', 'cyber'] },
  { name: 'Derive Insights from BigQuery Data', date: 'Jul 21, 2023', tags: ['data', 'ml'] },
  { name: 'Use Functions, Formulas, and Charts in Google Sheets', date: 'Jul 21, 2023', tags: ['general'] },
  { name: 'Level 1: AppDev and Infrastructure', date: 'Jul 17, 2023', tags: ['appdev', 'infra'] },
  { name: 'Level 2: Data Deep Dive', date: 'Jul 15, 2023', tags: ['data'] },
  { name: 'Develop Your Google Cloud Network', date: 'Jul 1, 2022', tags: ['infra', 'cyber'] },
  { name: 'Cloud Engineering', date: 'Jul 1, 2022', tags: ['infra', 'cyber'] },
  { name: '[DEPRECATED] Data Engineering', date: 'Jul 1, 2022', tags: ['data'] },
  { name: 'NCAA March Madness: Bracketology with Google Cloud', date: 'Jun 30, 2022', tags: ['data'] },
  { name: 'Develop Serverless Apps with Firebase', date: 'Jun 30, 2022', tags: ['appdev'] },
  { name: 'Build Apps & Websites with Firebase', date: 'Jun 29, 2022', tags: ['appdev'] },
  { name: '[DEPRECATED] Build Interactive Apps with Google Assistant', date: 'Jun 23, 2022', tags: ['appdev'] },
  { name: '[DEPRECATED] OK Google: Build Interactive Apps with Google Assistant', date: 'Jun 23, 2022', tags: ['appdev'] },
  { name: 'Google Developer Essentials', date: 'Jun 15, 2022', tags: ['general'] },
  { name: 'Understand Your Google Cloud Costs', date: 'Jun 14, 2022', tags: ['general'] },
  { name: 'Workspace: Add-ons', date: 'Jun 13, 2022', tags: ['general'] },
  { name: 'Set Up an App Dev Environment on Google Cloud', date: 'Jun 8, 2022', tags: ['appdev', 'infra'] },
  { name: 'Baseline: Infrastructure', date: 'Jun 8, 2022', tags: ['infra'] },
  { name: 'Implementing Cloud Load Balancing for Compute Engine', date: 'Jun 7, 2022', tags: ['infra', 'cyber'] },
  { name: 'Google Cloud Essentials', date: 'Apr 28, 2022', tags: ['general'] },
];

function renderBadges(containerId, filter) {
  var container = document.getElementById(containerId);
  if (!container) return;

  var filtered = BADGES.slice();
  if (filter && filter !== 'all') {
    filtered = filtered.filter(function (b) {
      return b.tags.indexOf(filter) !== -1;
    });
  }

  container.innerHTML = filtered.map(function (b) {
    return '<div class="badge-item fade-in">'
      + '  <p class="badge-name">' + b.name + '</p>'
      + '  <p class="badge-date">' + b.date + '</p>'
      + '</div>';
  }).join('');

  var countEl = document.getElementById('badgeCount');
  if (countEl) {
    countEl.textContent = filtered.length + ' of ' + BADGES.length + ' badges';
  }
}
