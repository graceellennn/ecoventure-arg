// =====================================================
//  EcoVenture — State Management (state.js)
//  Semua data progress disimpan di localStorage
// =====================================================

const EcoState = {
  LEVELS: [
    { id:1, name:'Waste Basics',    icon:'🌱', xp:50,  url:'level1.html' },
    { id:2, name:'Jenis Sampah',    icon:'🔬', xp:75,  url:'level2.html' },
    { id:3, name:'Waste Sorting',   icon:'♻️', xp:75,  url:'level3.html' },
    { id:4, name:'3R & Real Action',icon:'🌍', xp:100, url:'level4.html' },
  ],

  BADGES: {
    1:'🌱', 2:'🔬', 3:'♻️', 4:'🌍', 'hero':'🏆'
  },

  _get(key, def) {
    try {
      const v = localStorage.getItem('eco_' + key);
      return v !== null ? JSON.parse(v) : def;
    } catch { return def; }
  },
  _set(key, val) {
    localStorage.setItem('eco_' + key, JSON.stringify(val));
  },

  getXP()          { return this._get('xp', 0); },
  addXP(n)         { const x = Math.max(0, this.getXP()+n); this._set('xp',x); return x; },

  getLevelStates() { return this._get('levels', {}); },
  getLevelState(id){ return this.getLevelStates()[id] || (id===1?'active':'locked'); },
  setLevelState(id, state) {
    const ls = this.getLevelStates();
    ls[id] = state;
    this._set('levels', ls);
  },

  getBadges()      { return this._get('badges', []); },
  addBadge(id)     {
    const b = this.getBadges();
    if (!b.includes(id)) { b.push(id); this._set('badges', b); return true; }
    return false;
  },

  getStreak()      { return this._get('streak', 0); },
  getLastCheckin() { return this._get('last_checkin', null); },
  getDailyChecks() { return this._get('daily_checks', {}); },

  doCheckin(itemKey) {
    const today = new Date().toDateString();
    const last  = this.getLastCheckin();
    const checks= this.getDailyChecks();

    if (!checks[today]) checks[today] = [];
    if (!checks[today].includes(itemKey)) {
      checks[today].push(itemKey);
      this._set('daily_checks', checks);
      this.addXP(15);
    }

    // Streak logic
    if (last !== today) {
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      const streak = last === yesterday ? this.getStreak()+1 : 1;
      this._set('streak', streak);
      this._set('last_checkin', today);
      if (streak > 0 && streak % 7 === 0) this.addXP(100);
      return streak;
    }
    return this.getStreak();
  },

  getCheckedToday() {
    const today = new Date().toDateString();
    const checks = this.getDailyChecks();
    return checks[today] || [];
  },

  // Called when a level is fully completed
  completeLevel(id) {
    if (this.getLevelState(id) === 'done') return;
    this.setLevelState(id, 'done');
    this.addXP(this.LEVELS.find(l=>l.id===id)?.xp || 50);
    this.addBadge(id);
    // Unlock next (max 4 levels)
    if (id < 4) {
      if (this.getLevelState(id+1) === 'locked') {
        this.setLevelState(id+1, 'active');
      }
    }
    // All 4 done → unlock Eco Hero
    const allDone = [1,2,3,4].every(i => this.getLevelState(i) === 'done');
    if (allDone) this.addBadge('hero');
  },

  // Reset (dev/demo)
  reset() {
    ['xp','levels','badges','streak','last_checkin','daily_checks'].forEach(k=>{
      localStorage.removeItem('eco_'+k);
    });
    location.reload();
  },

  init() {
    // Ensure level 1 is always at least active
    if (this.getLevelState(1) === 'locked') {
      this.setLevelState(1, 'active');
    }
  },

  getLevelProgress(id) {
    return this._get('lp_'+id, 0);
  },
  setLevelProgress(id, pct) {
    this._set('lp_'+id, Math.min(100, pct));
  },
};

// Auto-init
EcoState.init();

// ── XP Toast helper ──
function showXPToast(amount, label='') {
  let toast = document.getElementById('xp-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'xp-toast';
    toast.className = 'xp-toast';
    document.body.appendChild(toast);
  }
  const sign = amount >= 0 ? '+' : '';
  toast.innerHTML = `⚡ <span class="xp-val">${sign}${amount} XP</span> ${label}`;
  toast.classList.add('show');
  clearTimeout(toast._t);
  toast._t = setTimeout(()=>toast.classList.remove('show'), 2600);
}

// ── Notification helper ──
function showNotif(msg) {
  let n = document.getElementById('eco-notif');
  if (!n) {
    n = document.createElement('div');
    n.id = 'eco-notif';
    n.className = 'notif';
    document.body.appendChild(n);
  }
  n.textContent = msg;
  n.classList.add('show');
  clearTimeout(n._t);
  n._t = setTimeout(()=>n.classList.remove('show'), 2800);
}

// ── Update navbar XP display ──
function updateNavXP() {
  const el = document.getElementById('nav-xp-val');
  if (el) el.textContent = EcoState.getXP() + ' XP';
}
