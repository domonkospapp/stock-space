/**
 * Check if the browser is online
 */
export function isBrowserOnline(): boolean {
  if (typeof window === "undefined") return true; // Server-side, assume online
  return navigator.onLine;
}

/**
 * Check if major stock markets are likely open
 * This is a simplified check that considers:
 * - Weekends (markets closed)
 * - Weekdays during market hours (9:30 AM - 4:00 PM ET for US markets)
 * - Extended hours are not considered
 *
 * Note: This is a simplified check. Real market hours vary by exchange
 * and include holidays, early closes, etc. For production, consider using
 * a market data API that provides real-time market status.
 */
export function areMarketsLikelyOpen(): boolean {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 = Sunday, 6 = Saturday

  // Markets are closed on weekends
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    return false;
  }

  // Convert current time to ET (Eastern Time)
  // This is a simplified approach - in production, use a proper timezone library
  const etOffset = -5; // EST offset (doesn't account for DST, but close enough)
  const utcHours = now.getUTCHours();
  const etHours = (utcHours + etOffset + 24) % 24;

  // US market hours: 9:30 AM - 4:00 PM ET (13:30 - 20:00 UTC during EST)
  // Extended hours: 4:00 AM - 9:30 AM ET and 4:00 PM - 8:00 PM ET
  // For simplicity, we check core hours: 9:30 AM - 4:00 PM ET
  const marketOpenHour = 9;
  const marketOpenMinute = 30;
  const marketCloseHour = 16;
  const marketCloseMinute = 0;

  const currentMinutes = etHours * 60 + now.getUTCMinutes();
  const openMinutes = marketOpenHour * 60 + marketOpenMinute;
  const closeMinutes = marketCloseHour * 60 + marketCloseMinute;

  // Check if current time is within market hours
  return currentMinutes >= openMinutes && currentMinutes < closeMinutes;
}

/**
 * Check if it's safe to fetch market data
 * Returns true if browser is online AND markets are likely open
 */
export function shouldFetchMarketData(): boolean {
  return isBrowserOnline() && areMarketsLikelyOpen();
}
