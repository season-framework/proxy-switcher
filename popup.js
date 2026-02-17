// popup.js — Season Proxy Switcher

document.addEventListener('DOMContentLoaded', init);

let proxies = [];
let activeProxyId = null;
let editingId = null;
let currentPolicyMode = 'blacklist';
let currentTheme = 'system';
let currentView = 'list'; // 'list' | 'form' | 'settings'

// ── View Switching ────────────────────────────────────
function switchView(view) {
  currentView = view;
  const listEl = document.getElementById('proxyList');
  const formEl = document.getElementById('proxyForm');
  const settingsEl = document.getElementById('settingsPanel');
  const footerEl = document.getElementById('listFooter');
  const settingsBtn = document.getElementById('settingsBtn');

  // Hide all views
  listEl.classList.add('hidden');
  formEl.classList.add('hidden');
  settingsEl.classList.add('hidden');
  footerEl.classList.add('hidden');
  settingsBtn.classList.remove('active');

  // Show target view
  if (view === 'list') {
    listEl.classList.remove('hidden');
    footerEl.classList.remove('hidden');
  } else if (view === 'form') {
    formEl.classList.remove('hidden');
  } else if (view === 'settings') {
    settingsEl.classList.remove('hidden');
    settingsBtn.classList.add('active');
  }
}

// ── Init ──────────────────────────────────────────────
async function init() {
  const data = await chrome.storage.local.get(['proxies', 'activeProxyId', 'lang', 'theme']);
  proxies = data.proxies || [];
  activeProxyId = data.activeProxyId || null;

  // Restore language
  const savedLang = data.lang || navigator.language.slice(0, 2);
  const supportedLangs = ['en', 'ko', 'ja', 'zh'];
  setLang(supportedLangs.includes(savedLang) ? savedLang : 'en');
  document.getElementById('langSelect').value = currentLang;

  // Restore theme
  currentTheme = data.theme || 'system';
  applyTheme(currentTheme);

  applyLocaleToUI();
  renderProxyList();
  updateStatus();
  bindEvents();
}

// ── Apply Locale to Static UI ─────────────────────────
function applyLocaleToUI() {
  // Settings panel
  document.getElementById('settingsTitle').textContent = t('settingsTitle');
  document.getElementById('labelLanguage').textContent = t('labelLanguage');
  document.getElementById('labelTheme').textContent = t('labelTheme');
  document.querySelector('#themeLight span').textContent = t('themeLight');
  document.querySelector('#themeDark span').textContent = t('themeDark');
  document.querySelector('#themeSystem span').textContent = t('themeSystem');

  // Empty state
  document.getElementById('emptyTitle').textContent = t('emptyTitle');
  document.getElementById('emptySub').textContent = t('emptySub');

  // Form labels
  document.getElementById('labelName').textContent = t('labelName');
  document.getElementById('labelProtocol').textContent = t('labelProtocol');
  document.getElementById('labelHost').textContent = t('labelHost');
  document.getElementById('labelPort').textContent = t('labelPort');
  document.getElementById('labelAuth').textContent = t('labelAuth');
  document.getElementById('labelPolicyMode').textContent = t('labelPolicyMode');
  document.getElementById('optionAll').textContent = t('optionAll');

  // Form placeholders
  document.getElementById('proxyName').placeholder = t('placeholderName');
  document.getElementById('proxyHost').placeholder = t('placeholderHost');
  document.getElementById('proxyPort').placeholder = t('placeholderPort');
  document.getElementById('proxyUser').placeholder = t('placeholderUser');
  document.getElementById('proxyPass').placeholder = t('placeholderPass');

  // Policy buttons
  document.querySelector('#policyBlacklist .policy-label').textContent = t('policyBlacklistLabel');
  document.querySelector('#policyBlacklist .policy-desc').textContent = t('policyBlacklistDesc');
  document.querySelector('#policyWhitelist .policy-label').textContent = t('policyWhitelistLabel');
  document.querySelector('#policyWhitelist .policy-desc').textContent = t('policyWhitelistDesc');

  // Form buttons
  document.getElementById('cancelBtn').textContent = t('btnCancel');
  document.getElementById('saveBtn').textContent = t('btnSave');

  // Add button
  document.getElementById('addProxyBtn').textContent = t('addProxy');

  // Settings back button
  document.getElementById('settingsBackBtn').textContent = t('btnBack');

  // Domain label (depends on current policy mode)
  setPolicyMode(currentPolicyMode);

  // Update theme button active state
  document.querySelectorAll('.theme-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.theme === currentTheme);
  });
}

// ── Theme ─────────────────────────────────────────────
function applyTheme(theme) {
  currentTheme = theme;
  if (theme === 'system') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
  } else {
    document.documentElement.setAttribute('data-theme', theme);
  }
  document.querySelectorAll('.theme-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.theme === theme);
  });
}

// ── Event Bindings ────────────────────────────────────
function bindEvents() {
  document.getElementById('addProxyBtn').addEventListener('click', showAddForm);
  document.getElementById('cancelBtn').addEventListener('click', hideForm);
  document.getElementById('saveBtn').addEventListener('click', saveProxy);

  // Policy mode toggle
  document.getElementById('policyBlacklist').addEventListener('click', () => setPolicyMode('blacklist'));
  document.getElementById('policyWhitelist').addEventListener('click', () => setPolicyMode('whitelist'));

  // Settings toggle
  document.getElementById('settingsBtn').addEventListener('click', () => {
    if (currentView === 'settings') {
      switchView('list');
    } else {
      switchView('settings');
    }
  });

  // Settings back button
  document.getElementById('settingsBackBtn').addEventListener('click', () => {
    switchView('list');
  });

  // Language change
  document.getElementById('langSelect').addEventListener('change', async (e) => {
    setLang(e.target.value);
    await chrome.storage.local.set({ lang: e.target.value });
    applyLocaleToUI();
    renderProxyList();
    updateStatus();
  });

  // Theme buttons
  document.querySelectorAll('.theme-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      applyTheme(btn.dataset.theme);
      await chrome.storage.local.set({ theme: btn.dataset.theme });
    });
  });

  // Listen for system theme changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (currentTheme === 'system') applyTheme('system');
  });
}

function setPolicyMode(mode) {
  currentPolicyMode = mode;
  document.getElementById('policyBlacklist').classList.toggle('active', mode === 'blacklist');
  document.getElementById('policyWhitelist').classList.toggle('active', mode === 'whitelist');

  const label = document.getElementById('domainListLabel');
  if (mode === 'blacklist') {
    label.textContent = t('domainLabelBlacklist');
    document.getElementById('domainList').placeholder = t('domainPlaceholderBlacklist');
  } else {
    label.textContent = t('domainLabelWhitelist');
    document.getElementById('domainList').placeholder = t('domainPlaceholderWhitelist');
  }
}

// ── Render ────────────────────────────────────────────
function renderProxyList() {
  const listEl = document.getElementById('proxyList');
  const emptyEl = document.getElementById('emptyState');

  // Clear existing items (keep empty state)
  listEl.querySelectorAll('.proxy-item').forEach(el => el.remove());

  emptyEl.classList.add('hidden');

  // "No Proxy" item always at top
  const directItem = document.createElement('div');
  const isDirectActive = !activeProxyId;
  directItem.className = `proxy-item proxy-item-direct${isDirectActive ? ' active' : ''}`;
  directItem.innerHTML = `
    <label class="proxy-radio-label">
      <input type="radio" name="proxySelect" value="" ${isDirectActive ? 'checked' : ''}>
      <div class="proxy-info">
        <div class="proxy-name">${escapeHtml(t('noProxy'))}</div>
        <div class="proxy-detail">${escapeHtml(t('directConnection'))}</div>
      </div>
    </label>
  `;
  directItem.querySelector('input[type="radio"]').addEventListener('change', () => disconnectProxy());
  directItem.querySelector('.proxy-radio-label').addEventListener('click', (e) => {
    if (e.target.tagName !== 'INPUT') {
      directItem.querySelector('input[type="radio"]').checked = true;
      disconnectProxy();
    }
  });
  listEl.appendChild(directItem);

  proxies.forEach(proxy => {
    const isActive = proxy.id === activeProxyId;
    const policyLabel = proxy.policyMode === 'whitelist' ? 'WL' : 'BL';
    const policyClass = proxy.policyMode === 'whitelist' ? 'whitelist' : 'blacklist';

    const domainCountText = proxy.domainList && proxy.domainList.length > 0
      ? `· ${t('domainCount').replace('{n}', proxy.domainList.length)}`
      : '';

    const item = document.createElement('div');
    item.className = `proxy-item${isActive ? ' active' : ''}`;
    item.innerHTML = `
      <label class="proxy-radio-label">
        <input type="radio" name="proxySelect" value="${proxy.id}" ${isActive ? 'checked' : ''}>
        <div class="proxy-info">
          <div class="proxy-name-row">
            <span class="proxy-name">${escapeHtml(proxy.name)}</span>
            <span class="proxy-badge policy ${policyClass}">${policyLabel}</span>
            <span class="proxy-badge ${proxy.type}">${proxy.type}</span>
          </div>
          <div class="proxy-detail">
            ${proxy.host}:${proxy.port}${proxy.username ? ' · 🔑' : ''}
            ${domainCountText}
          </div>
        </div>
      </label>
      <div class="proxy-actions">
        <button class="edit-btn" data-id="${proxy.id}" title="${t('btnEdit')}">✏️</button>
        <button class="delete-btn" data-id="${proxy.id}" title="${t('btnDelete')}">🗑️</button>
      </div>
    `;

    // Radio change to activate
    item.querySelector('input[type="radio"]').addEventListener('change', () => activateProxy(proxy.id));
    // Click anywhere on label area to select
    item.querySelector('.proxy-radio-label').addEventListener('click', (e) => {
      if (e.target.tagName !== 'INPUT') {
        item.querySelector('input[type="radio"]').checked = true;
        activateProxy(proxy.id);
      }
    });
    item.querySelector('.edit-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      showEditForm(proxy.id);
    });
    item.querySelector('.delete-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      deleteProxy(proxy.id);
    });

    listEl.appendChild(item);
  });
}

function updateStatus() {
  const dotEl = document.querySelector('.status-dot');
  const textEl = document.querySelector('.status-text');

  if (activeProxyId) {
    const proxy = proxies.find(p => p.id === activeProxyId);
    if (proxy) {
      dotEl.className = 'status-dot on';
      const modeText = proxy.policyMode === 'whitelist' ? '[WL]' : '[BL]';
      textEl.textContent = `${proxy.name} ${modeText}`;
    }
  } else {
    dotEl.className = 'status-dot off';
    textEl.textContent = t('statusDirect');
  }
}

// ── Form Management ───────────────────────────────────
function showAddForm() {
  editingId = null;
  document.getElementById('formTitle').textContent = t('formTitleAdd');
  clearForm();
  switchView('form');
}

function showEditForm(id) {
  const proxy = proxies.find(p => p.id === id);
  if (!proxy) return;

  editingId = id;
  document.getElementById('formTitle').textContent = t('formTitleEdit');
  document.getElementById('proxyName').value = proxy.name;
  document.getElementById('proxyType').value = proxy.type;
  document.getElementById('proxyHost').value = proxy.host;
  document.getElementById('proxyPort').value = proxy.port;
  document.getElementById('proxyUser').value = proxy.username || '';
  document.getElementById('proxyPass').value = proxy.password || '';
  document.getElementById('domainList').value = (proxy.domainList || []).join(', ');

  // Restore policy mode
  setPolicyMode(proxy.policyMode || 'blacklist');

  switchView('form');
}

function hideForm() {
  switchView('list');
  clearForm();
  editingId = null;
}

function clearForm() {
  document.getElementById('proxyName').value = '';
  document.getElementById('proxyType').value = 'all';
  document.getElementById('proxyHost').value = '';
  document.getElementById('proxyPort').value = '';
  document.getElementById('proxyUser').value = '';
  document.getElementById('proxyPass').value = '';
  document.getElementById('domainList').value = '';
  setPolicyMode('blacklist');
}

// ── CRUD Operations ───────────────────────────────────
async function saveProxy() {
  const name = document.getElementById('proxyName').value.trim();
  const type = document.getElementById('proxyType').value;
  const host = document.getElementById('proxyHost').value.trim();
  const port = document.getElementById('proxyPort').value.trim();
  const username = document.getElementById('proxyUser').value.trim();
  const password = document.getElementById('proxyPass').value;
  const policyMode = currentPolicyMode;
  const domainRaw = document.getElementById('domainList').value.trim();
  const domainList = domainRaw ? domainRaw.split(',').map(s => s.trim()).filter(Boolean) : [];

  if (!name || !host || !port) {
    alert(t('alertRequired'));
    return;
  }

  if (editingId) {
    // Update existing
    const idx = proxies.findIndex(p => p.id === editingId);
    if (idx !== -1) {
      proxies[idx] = { ...proxies[idx], name, type, host, port: parseInt(port), username, password, policyMode, domainList };
    }
  } else {
    // Add new
    const newProxy = {
      id: Date.now().toString(),
      name,
      type,
      host,
      port: parseInt(port),
      username,
      password,
      policyMode,
      domainList,
    };
    proxies.push(newProxy);
  }

  await chrome.storage.local.set({ proxies });

  // If editing the active proxy, re-apply settings
  if (editingId && editingId === activeProxyId) {
    await applyProxy(editingId);
  }

  hideForm();
  renderProxyList();
}

async function deleteProxy(id) {
  if (!confirm(t('confirmDelete'))) return;

  proxies = proxies.filter(p => p.id !== id);
  await chrome.storage.local.set({ proxies });

  if (activeProxyId === id) {
    await disconnectProxy();
  }

  renderProxyList();
}

// ── Proxy Activation ──────────────────────────────────
async function activateProxy(id) {
  await applyProxy(id);
  activeProxyId = id;
  await chrome.storage.local.set({ activeProxyId });
  renderProxyList();
  updateStatus();
}

async function applyProxy(id) {
  const proxy = proxies.find(p => p.id === id);
  if (!proxy) return;

  // Send message to background script
  await chrome.runtime.sendMessage({
    action: 'setProxy',
    proxy: {
      type: proxy.type,
      host: proxy.host,
      port: proxy.port,
      username: proxy.username || '',
      password: proxy.password || '',
      policyMode: proxy.policyMode || 'blacklist',
      domainList: proxy.domainList || [],
    },
  });
}

async function disconnectProxy() {
  activeProxyId = null;
  await chrome.storage.local.set({ activeProxyId });

  await chrome.runtime.sendMessage({ action: 'clearProxy' });

  renderProxyList();
  updateStatus();
}

// ── Utilities ─────────────────────────────────────────
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
