const NAV_HTML = `
<header class="nav" id="nav">
    <div class="nav-inner">
      <a href="$BASEindex.html" class="nav-logo">hp.</a>
      <button class="nav-toggle" id="navToggle" aria-label="Toggle navigation">
        <span></span><span></span><span></span>
      </button>
      <nav>
        <ul class="nav-links" id="navLinks">
          <li><a href="$BASEindex.html"    class="nav-link" data-page="home">Home</a></li>
          <li><a href="$BASEabout.html"    class="nav-link" data-page="about">About</a></li>
          <li class="nav-dropdown">
            <a href="#" class="nav-link" data-page="roles">Roles <span class="dropdown-arrow">\u25BE</span></a>
            <ul class="dropdown-menu">
              <li><a href="$BASEroles/cyber.html" class="nav-link" data-page="cyber">Cyber</a></li>
              <li><a href="$BASEroles/ml.html"    class="nav-link" data-page="ml">ML</a></li>
            </ul>
          </li>
          <li><a href="$BASEprojects.html" class="nav-link" data-page="projects">Projects</a></li>
          <li class="nav-dropdown">
            <a href="$BASEprofiles.html" class="nav-link" data-page="profiles">Profiles <span class="dropdown-arrow">\u25BE</span></a>
            <ul class="dropdown-menu">
              <li><a href="$BASEprofiles.html" class="nav-link" data-page="profiles">All Profiles</a></li>
              <li><a href="$BASEcloud.html"    class="nav-link" data-page="cloud">Google Cloud</a></li>
              <li><a href="https://vercel.com/hardiks-projects-9b7e5c43" target="_blank" rel="noopener" class="nav-link">Vercel</a></li>
              <li><a href="https://hardik-7892.itch.io"    target="_blank" rel="noopener" class="nav-link">Itch.io</a></li>
            </ul>
          </li>
          <li><a href="$BASEcontact.html"  class="nav-link" data-page="contact">Contact</a></li>
          <li><button class="theme-btn" id="themeToggle" aria-label="Toggle theme">\u263E</button></li>
        </ul>
      </nav>
    </div>
  </header>`;

const FOOTER_HTML = `
  <footer>
    <div class="container">
      <div class="footer-inner">
        <p class="footer-text">Hardik Pandey</p>
        <div class="footer-links">
          <a href="https://github.com/Hardik-7892" target="_blank" rel="noopener" class="footer-link">GitHub</a>
          <a href="https://linkedin.com/in/hp0"     target="_blank" rel="noopener" class="footer-link">LinkedIn</a>
        </div>
      </div>
    </div>
  </footer>`;
