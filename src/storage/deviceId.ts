// Unique Device Fingerprint & Hardware Identity for Mite.io
// Associates game profiles with the client device while also supporting
// distinct session IDs when multiple tabs/windows are opened on the same browser.

const DEVICE_ID_KEY = 'mite_device_id_v1';
const SESSION_TAB_KEY = 'mite_tab_session_v1';
const ACTIVE_TAB_LOCK_KEY = 'mite_primary_tab_lock_v1';

let cachedEffectiveId: string | null = null;

export function getBaseDeviceId(): string {
  try {
    const existing = localStorage.getItem(DEVICE_ID_KEY);
    if (existing && existing.startsWith('bio_dev_')) {
      return existing;
    }
  } catch {}

  const screenInfo = `${window.screen.width}x${window.screen.height}x${window.screen.colorDepth}`;
  const cores = navigator.hardwareConcurrency || 4;
  const platform = navigator.platform || 'unknown';
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';

  let randomSeed = '';
  if (window.crypto && window.crypto.getRandomValues) {
    const array = new Uint32Array(4);
    window.crypto.getRandomValues(array);
    randomSeed = Array.from(array, (dec) => dec.toString(16)).join('');
  } else {
    randomSeed = Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  const hash = simpleHash(`${screenInfo}_${cores}_${platform}_${tz}_${randomSeed}`);
  const deviceId = `bio_dev_${hash}`;

  try {
    localStorage.setItem(DEVICE_ID_KEY, deviceId);
  } catch {}

  return deviceId;
}

export function getOrCreateDeviceId(): string {
  if (cachedEffectiveId) return cachedEffectiveId;

  const baseId = getBaseDeviceId();

  try {
    let tabId = sessionStorage.getItem(SESSION_TAB_KEY);
    if (!tabId) {
      tabId = Math.random().toString(36).substring(2, 6).toUpperCase();
      sessionStorage.setItem(SESSION_TAB_KEY, tabId);
    }

    const now = Date.now();
    const lockRaw = localStorage.getItem(ACTIVE_TAB_LOCK_KEY);
    let isPrimaryTab = true;

    if (lockRaw) {
      try {
        const lock = JSON.parse(lockRaw);
        // If another tab updated the lock within the last 6 seconds, this is a secondary tab
        if (lock.tabId && lock.tabId !== tabId && now - lock.timestamp < 6000) {
          isPrimaryTab = false;
        }
      } catch {}
    }

    if (isPrimaryTab) {
      localStorage.setItem(ACTIVE_TAB_LOCK_KEY, JSON.stringify({ tabId, timestamp: now }));
      setInterval(() => {
        try {
          localStorage.setItem(ACTIVE_TAB_LOCK_KEY, JSON.stringify({ tabId, timestamp: Date.now() }));
        } catch {}
      }, 2000);
      cachedEffectiveId = baseId;
      return baseId;
    } else {
      cachedEffectiveId = `${baseId}_T${tabId}`;
      return cachedEffectiveId;
    }
  } catch {
    cachedEffectiveId = baseId;
    return baseId;
  }
}

function simpleHash(str: string): string {
  let h1 = 0xdeadbeef;
  let h2 = 0x41c64e6d;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
  h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
  h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(16).padStart(12, '0');
}
