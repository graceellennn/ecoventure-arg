// =====================================================
//  EcoVenture — Interactive Map (map.js)
//  Zoom, Pan, Level Node States
// =====================================================

(function() {
  const wrapper = document.getElementById('map-wrapper');
  const scene   = document.getElementById('map-scene');
  if (!scene) return;

  let scale = 1, ox = 0, oy = 0;
  let dragging = false, startX = 0, startY = 0;

  const MIN_SCALE = 0.7, MAX_SCALE = 2.8;

  function clamp(v, mn, mx) { return Math.min(mx, Math.max(mn, v)); }

  function applyTransform(smooth) {
    scene.style.transition = smooth ? 'transform .25s ease' : 'none';
    scene.style.transform = `translate(${ox}px,${oy}px) scale(${scale})`;
  }

  // ── Zoom (wheel) ──
  wrapper.addEventListener('wheel', e => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.08 : 0.08;
    scale = clamp(scale + delta, MIN_SCALE, MAX_SCALE);
    applyTransform(false);
  }, { passive: false });

  // ── Pan (mouse) ──
  wrapper.addEventListener('mousedown', e => {
    if (e.target.closest('.level-node')) return;
    dragging = true;
    startX = e.clientX - ox;
    startY = e.clientY - oy;
    wrapper.style.cursor = 'grabbing';
  });
  document.addEventListener('mousemove', e => {
    if (!dragging) return;
    ox = e.clientX - startX;
    oy = e.clientY - startY;
    applyTransform(false);
  });
  document.addEventListener('mouseup', () => {
    dragging = false;
    wrapper.style.cursor = 'grab';
  });

  // ── Touch (mobile) ──
  let lastTouchDist = null;
  wrapper.addEventListener('touchstart', e => {
    if (e.touches.length === 1) {
      dragging = true;
      startX = e.touches[0].clientX - ox;
      startY = e.touches[0].clientY - oy;
    }
    if (e.touches.length === 2) {
      lastTouchDist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
    }
  }, { passive: true });

  wrapper.addEventListener('touchmove', e => {
    if (e.touches.length === 1 && dragging) {
      ox = e.touches[0].clientX - startX;
      oy = e.touches[0].clientY - startY;
      applyTransform(false);
    }
    if (e.touches.length === 2 && lastTouchDist) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const ds = (dist - lastTouchDist) * 0.005;
      scale = clamp(scale + ds, MIN_SCALE, MAX_SCALE);
      lastTouchDist = dist;
      applyTransform(false);
    }
  }, { passive: true });

  wrapper.addEventListener('touchend', () => {
    dragging = false;
    lastTouchDist = null;
  });

  // ── Update node states from localStorage ──
  function refreshNodes() {
    document.querySelectorAll('.level-node').forEach(node => {
      const id = parseInt(node.dataset.level);
      const state = EcoState.getLevelState(id);
      node.className = `level-node ${state}`;
      const btn = node.querySelector('.node-btn');
      if (state === 'locked') {
        btn.disabled = true;
        btn.innerHTML = `<span style="font-size:1.2rem">🔒</span>`;
      } else if (state === 'done') {
        btn.disabled = false;
        btn.innerHTML = `✓`;
      } else {
        btn.disabled = false;
        btn.innerHTML = id;
      }
    });
  }

  // ── Node click → navigate ──
  const levelURLs = { 1:'level1.html', 2:'level2.html', 3:'level3.html', 4:'level4.html', hero:'eco-hero.html' };
  document.querySelectorAll('.level-node .node-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const raw = this.closest('.level-node').dataset.level;
      const id  = raw === 'hero' ? 'hero' : parseInt(raw);
      if (id === 'hero') {
        // Only accessible when all 4 levels done
        const allDone = [1,2,3,4].every(i => EcoState.getLevelState(i) === 'done');
        if (!allDone) { showNotif('🔒 Selesaikan semua 4 level dulu!'); return; }
        window.location.href = 'eco-hero.html';
        return;
      }
      const state = EcoState.getLevelState(id);
      if (state === 'locked') { showNotif('🔒 Selesaikan level sebelumnya!'); return; }
      window.location.href = levelURLs[id] || `level${id}.html`;
    });
  });

  // ── Reset zoom button ──
  const resetBtn = document.getElementById('map-reset-zoom');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      scale = 1; ox = 0; oy = 0;
      applyTransform(true);
    });
  }

  refreshNodes();
  updateNavXP();
})();
