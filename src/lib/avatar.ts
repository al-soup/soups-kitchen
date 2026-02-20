/** Simple FNV-1a hash → hex string. Not cryptographic, just obscures the UUID. */
function fnv1a(str: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16);
}

export function getAvatarUrl(userId: string, size = 64): string {
  const seed = fnv1a(userId);
  return `https://api.dicebear.com/9.x/identicon/svg?seed=${seed}&size=${size}`;
}
