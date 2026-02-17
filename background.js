// background.js — Season Proxy Switcher Service Worker

let currentAuthCredentials = null;

// ── Utilities ─────────────────────────────────────────
function cidrToMask(prefix) {
    const mask = new Array(4).fill(0);
    for (let i = 0; i < prefix; i++) {
        mask[Math.floor(i / 8)] |= (128 >> (i % 8));
    }
    return mask.join('.');
}

// ── Message Listener ──────────────────────────────────
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'setProxy') {
        setProxy(message.proxy).then(() => sendResponse({ success: true }));
        return true; // async response
    }

    if (message.action === 'clearProxy') {
        clearProxy().then(() => sendResponse({ success: true }));
        return true;
    }
});

// ── Proxy Control ─────────────────────────────────────
async function setProxy(proxyConfig) {
    const { type, host, port, policyMode, domainList, username, password } = proxyConfig;

    // Store auth credentials if provided
    if (username) {
        currentAuthCredentials = { username, password: password || '' };
    } else {
        currentAuthCredentials = null;
    }

    let scheme;
    switch (type) {
        case 'all': scheme = 'http'; break;
        case 'http': scheme = 'http'; break;
        case 'https': scheme = 'https'; break;
        case 'socks4': scheme = 'socks4'; break;
        case 'socks5': scheme = 'socks5'; break;
        default: scheme = 'http';
    }

    const portNum = parseInt(port);
    let config;

    if (policyMode === 'whitelist') {
        // Whitelist: 기본 직접 연결, 목록에 있는 도메인만 프록시 적용
        let proxyStr;
        if (type === 'socks4' || type === 'socks5') {
            proxyStr = `SOCKS ${host}:${portNum}`;
        } else {
            proxyStr = `PROXY ${host}:${portNum}`;
        }

        const conditions = domainList.map(pattern => {
            // CIDR notation: e.g. 192.168.0.0/24, 172.16.0.0/12
            const cidrMatch = pattern.match(/^(\d+\.\d+\.\d+\.\d+)\/(\d+)$/);
            if (cidrMatch) {
                const ip = cidrMatch[1];
                const prefix = parseInt(cidrMatch[2]);
                const mask = cidrToMask(prefix);
                return `isInNet(dnsResolve(host), "${ip}", "${mask}")`;
            }
            // Plain IP address
            if (/^\d+\.\d+\.\d+\.\d+$/.test(pattern)) {
                return `host === "${pattern}"`;
            }
            // Wildcard domain: *.example.com
            if (pattern.startsWith('*.')) {
                const domain = pattern.slice(2);
                return `dnsDomainIs(host, ".${domain}") || dnsDomainIs(host, "${domain}")`;
            }
            return `dnsDomainIs(host, "${pattern}")`;
        });

        const pacScript = `
      function FindProxyForURL(url, host) {
        if (${conditions.length > 0 ? conditions.map(c => `(${c})`).join(' || ') : 'false'}) {
          return "${proxyStr}";
        }
        return "DIRECT";
      }
    `;

        config = {
            mode: 'pac_script',
            pacScript: {
                data: pacScript,
            },
        };
    } else if (type === 'all') {
        // Blacklist + 일괄 적용: 모든 프로토콜에 동일한 프록시 적용
        config = {
            mode: 'fixed_servers',
            rules: {
                singleProxy: {
                    scheme: 'http',
                    host: host,
                    port: portNum,
                },
                bypassList: domainList.length > 0 ? domainList : ['localhost', '127.0.0.1'],
            },
        };
    } else {
        // Blacklist + 개별 프로토콜: 특정 프로토콜에만 프록시 적용
        const proxyEntry = { scheme, host, port: portNum };
        const rules = { bypassList: domainList.length > 0 ? domainList : ['localhost', '127.0.0.1'] };

        if (type === 'http') {
            rules.proxyForHttp = proxyEntry;
        } else if (type === 'https') {
            rules.proxyForHttps = proxyEntry;
        } else if (type === 'socks4' || type === 'socks5') {
            rules.fallbackProxy = proxyEntry;
        }

        config = {
            mode: 'fixed_servers',
            rules,
        };
    }

    return new Promise((resolve, reject) => {
        chrome.proxy.settings.set(
            { value: config, scope: 'regular' },
            () => {
                if (chrome.runtime.lastError) {
                    console.log('Proxy set error:', chrome.runtime.lastError);
                    reject(chrome.runtime.lastError);
                } else {
                    console.log(`Proxy set: ${scheme}://${host}:${port} [${policyMode}]`);
                    updateBadge(true, policyMode);
                    resolve();
                }
            }
        );
    });
}

async function clearProxy() {
    return new Promise((resolve, reject) => {
        chrome.proxy.settings.clear(
            { scope: 'regular' },
            () => {
                if (chrome.runtime.lastError) {
                    console.log('Proxy clear error:', chrome.runtime.lastError);
                    reject(chrome.runtime.lastError);
                } else {
                    console.log('Proxy cleared — direct connection');
                    currentAuthCredentials = null;
                    updateBadge(false);
                    resolve();
                }
            }
        );
    });
}

// ── Badge Indicator ───────────────────────────────────
function updateBadge(isActive, policyMode) {
    if (isActive) {
        const text = policyMode === 'whitelist' ? 'WL' : 'BL';
        chrome.action.setBadgeText({ text });
        chrome.action.setBadgeBackgroundColor({
            color: policyMode === 'whitelist' ? '#805ad5' : '#48bb78',
        });
    } else {
        chrome.action.setBadgeText({ text: '' });
    }
}

// ── Startup: Restore Proxy State ──────────────────────
chrome.runtime.onStartup.addListener(restoreProxy);
chrome.runtime.onInstalled.addListener(restoreProxy);

async function restoreProxy() {
    const data = await chrome.storage.local.get(['proxies', 'activeProxyId']);
    const proxies = data.proxies || [];
    const activeProxyId = data.activeProxyId || null;

    if (activeProxyId) {
        const proxy = proxies.find(p => p.id === activeProxyId);
        if (proxy) {
            await setProxy({
                type: proxy.type,
                host: proxy.host,
                port: proxy.port,
                username: proxy.username || '',
                password: proxy.password || '',
                policyMode: proxy.policyMode || 'blacklist',
                domainList: proxy.domainList || [],
            });
        }
    } else {
        updateBadge(false);
    }
}

// ── Error Listener ────────────────────────────────────
chrome.proxy.onProxyError.addListener((details) => {
    console.log('Proxy error:', details);
});

// ── Auth Listener ─────────────────────────────────────
chrome.webRequest.onAuthRequired.addListener(
    (details, asyncCallback) => {
        if (currentAuthCredentials && details.isProxy) {
            asyncCallback({
                authCredentials: {
                    username: currentAuthCredentials.username,
                    password: currentAuthCredentials.password,
                },
            });
        } else {
            asyncCallback();
        }
    },
    { urls: ['<all_urls>'] },
    ['asyncBlocking']
);
