// =====================================================
//  EcoVenture — Shared Nav (nav.js)
// =====================================================

(function() {
  const currentPage = location.pathname.split('/').pop() || 'index.html';

  const navHTML = `
  <nav class="navbar">
    <a href="index.html" class="logo">
    <img src="assets/logo.svg" alt="EcoVenture Logo" class="logo-icon">
    <span>Eco</span>Venture
    </a>
<div class="nav-links" id="nav-links">
      <a href="index.html"   class="${currentPage==='index.html'  ?'active':''}">Home</a>
      <a href="index.html#map-section" >Map</a>
      <a href="index.html#levels-section">Levels</a>
      <a href="about.html"  class="${currentPage==='about.html'  ?'active':''}">About</a>
      <a href="contact.html" class="${currentPage==='contact.html'?'active':''}">Contact</a>
    </div>
    <div class="nav-xp">⚡ <span id="nav-xp-val">0 XP</span></div>
    <div class="hamburger" id="hamburger" onclick="toggleNav()">
      <span></span><span></span><span></span>
    </div>
  </nav>`;

  document.body.insertAdjacentHTML('afterbegin', navHTML);

  updateNavXP();
})();

function toggleNav() {
  document.getElementById('nav-links').classList.toggle('open');
}
