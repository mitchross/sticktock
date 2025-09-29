export function isLikelyAssetUrl(inputUrl: string): boolean {
  try {
    const u = new URL(inputUrl);
    if (/\.(jpg|jpeg|png|gif|mp4|webm|svg|ico)(\?|$)/i.test(u.pathname)) return true;
    if (/\/authors\//.test(u.pathname)) return true;
    if (/cdn|static|tikcdn|tiktokcdn/.test(u.hostname)) return true;
    return false;
  } catch (e) {
    return false;
  }
}
