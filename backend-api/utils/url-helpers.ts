export function isLikelyAssetUrl(inputUrl: string): boolean {
  try {
    const u = new URL(inputUrl);
    // common asset extensions
    if (u.pathname.match(/\.(jpg|jpeg|png|gif|mp4|webm|svg|ico)(\?|$)/i)) return true;
    // author image paths or obvious asset routes
    if (/\/authors\//.test(u.pathname)) return true;
    // direct media hosts
    if (/cdn|static|tikcdn|tiktokcdn/.test(u.hostname)) return true;
    return false;
  } catch (e) {
    return false;
  }
}
