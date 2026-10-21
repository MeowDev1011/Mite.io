// Unique Device Fingerprint & Hardware Identity for Mite.io
// Avoids requiring explicit user login by securely associating game profiles with the client device.

const DEVICE_ID_KEY = 'mite_device_id_v1';

export function getOrCreateDeviceId(): string {
  // Check if cached in memory/session
  try {
    const existing = localStorage.getItem(DEVICE_ID_KEY);
    if (existing && existing.startsWith('bio_dev_')) {
      return existing;
    }
  } catch {}

  // Generate hardware & browser canvas fingerprint
  const screenInfo = `${window.screen.width}x${window.screen.height}x${window.screen.colorDepth}`;
  const cores = navigator.hardwareConcurrency || 4;
  const platform = navigator.platform || 'unknown';
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  
  // Random crypto seed
  let randomSeed = '';
  if (window.crypto && window.crypto.getRandomValues) {
    const array = new Uint32Array(4);
    window.crypto.getRandomValues(array);
    randomSeed = Array.from(array, dec => dec.toString(16)).join('');
  } else {
    randomSeed = Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  // Combined identifier
  const hash = simpleHash(`${screenInfo}_${cores}_${platform}_${tz}_${randomSeed}`);
  const deviceId = `bio_dev_${hash}`;

  try {
    localStorage.setItem(DEVICE_ID_KEY, deviceId);
  } catch {}

  return deviceId;
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
