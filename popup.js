// popup.js — Season Proxy Switcher

document.addEventListener('DOMContentLoaded', init);

let proxies = [];
let activeProxyId = null;
let editingId = null;
let currentPolicyMode = 'blacklist';

// ── Init ──────────────────────────────────────────────
async function init() {
  const data = await chrome.storage.local.get(['proxies', 'activeProxyId']);
  proxies = data.proxies || [];
  activeProxyId = data.activeProxyId || null;

  renderProxyList();
  updateStatus();
  bindEvents();
}

// ── Event Bindings ────────────────────────────────────
function bindEvents() {
  document.getElementById('addProxyBtn').addEventListener('click', showAddForm);
  document.getElementById('cancelBtn').addEventListener('click', hideForm);
  document.getElementById('saveBtn').addEventListener('click', saveProxy);

  // Policy mode toggle
  document.getElementById('policyBlacklist').addEventListener('click', () => setPolicyMode('blacklist'));
  document.getElementById('policyWhitelist').addEventListener('click', () => setPolicyMode('whitelist'));
}

function setPolicyMode(mode) {
  currentPolicyMode = mode;
  document.getElementById('policyBlacklist').classList.toggle('active', mode === 'blacklist');
  document.getElementById('policyWhitelist').classList.toggle('active', mode === 'whitelist');

  const label = document.getElementById('domainListLabel');
  if (mode === 'blacklist') {
    label.textContent = '프록시 제외 목록 (콤마로 구분)';
    document.getElementById('domainList').placeholder = '예: localhost, 127.0.0.1, *.example.com';
  } else {
    label.textContent = '프록시 적용 목록 (콤마로 구분)';
    document.getElementById('domainList').placeholder = '예: *.company.com, internal.site.kr';
  }
}

// ── Render ────────────────────────────────────────────
function renderProxyList() {
  const listEl = document.getElementById('proxyList');
  const emptyEl = document.getElementById('emptyState');

  // Clear existing items (keep empty state)
  listEl.querySelectorAll('.proxy-item').forEach(el => el.remove());

  emptyEl.classList.add('hidden');

  // "프록시 미사용" 항목을 항상 맨 위에 추가
  const directItem = document.createElement('div');
  const isDirectActive = !activeProxyId;
  directItem.className = `proxy-item proxy-item-direct${isDirectActive ? ' active' : ''}`;
  directItem.innerHTML = `
    <label class="proxy-radio-label">
      <input type="radio" name="proxySelect" value="" ${isDirectActive ? 'checked' : ''}>
      <div class="proxy-info">
        <div class="proxy-name">프록시 미사용</div>
        <div class="proxy-detail">직접 연결</div>
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
            ${proxy.host}:${proxy.port}
            ${proxy.domainList && proxy.domainList.length > 0 ? `· ${proxy.domainList.length}개 도메인` : ''}
          </div>
        </div>
      </label>
      <div class="proxy-actions">
        <button class="edit-btn" data-id="${proxy.id}" title="수정">✏️</button>
        <button class="delete-btn" data-id="${proxy.id}" title="삭제">🗑️</button>
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
    textEl.textContent = '직접 연결';
  }
}

// ── Form Management ───────────────────────────────────
function showAddForm() {
  editingId = null;
  document.getElementById('formTitle').textContent = '프록시 추가';
  clearForm();
  document.getElementById('proxyForm').classList.remove('hidden');
  document.getElementById('addProxyBtn').classList.add('hidden');
}

function showEditForm(id) {
  const proxy = proxies.find(p => p.id === id);
  if (!proxy) return;

  editingId = id;
  document.getElementById('formTitle').textContent = '프록시 수정';
  document.getElementById('proxyName').value = proxy.name;
  document.getElementById('proxyType').value = proxy.type;
  document.getElementById('proxyHost').value = proxy.host;
  document.getElementById('proxyPort').value = proxy.port;
  document.getElementById('domainList').value = (proxy.domainList || []).join(', ');

  // Restore policy mode
  setPolicyMode(proxy.policyMode || 'blacklist');

  document.getElementById('proxyForm').classList.remove('hidden');
  document.getElementById('addProxyBtn').classList.add('hidden');
}

function hideForm() {
  document.getElementById('proxyForm').classList.add('hidden');
  document.getElementById('addProxyBtn').classList.remove('hidden');
  clearForm();
  editingId = null;
}

function clearForm() {
  document.getElementById('proxyName').value = '';
  document.getElementById('proxyType').value = 'all';
  document.getElementById('proxyHost').value = '';
  document.getElementById('proxyPort').value = '';
  document.getElementById('domainList').value = '';
  setPolicyMode('blacklist');
}

// ── CRUD Operations ───────────────────────────────────
async function saveProxy() {
  const name = document.getElementById('proxyName').value.trim();
  const type = document.getElementById('proxyType').value;
  const host = document.getElementById('proxyHost').value.trim();
  const port = document.getElementById('proxyPort').value.trim();
  const policyMode = currentPolicyMode;
  const domainRaw = document.getElementById('domainList').value.trim();
  const domainList = domainRaw ? domainRaw.split(',').map(s => s.trim()).filter(Boolean) : [];

  if (!name || !host || !port) {
    alert('이름, 호스트, 포트는 필수 항목입니다.');
    return;
  }

  if (editingId) {
    // Update existing
    const idx = proxies.findIndex(p => p.id === editingId);
    if (idx !== -1) {
      proxies[idx] = { ...proxies[idx], name, type, host, port: parseInt(port), policyMode, domainList };
    }
  } else {
    // Add new
    const newProxy = {
      id: Date.now().toString(),
      name,
      type,
      host,
      port: parseInt(port),
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
  if (!confirm('이 프록시를 삭제하시겠습니까?')) return;

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
