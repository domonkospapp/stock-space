// Frankfurter API based currency conversion with simple in-memory caching
// Docs/example: https://api.frankfurter.app/latest?amount=1&from=CAD&to=USD

type FrankfurterResponse = {
  amount: number;
  base: string;
  date: string;
  rates: Record<string, number>;
};

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
const rateCache = new Map<string, { rate: number; timestampMs: number }>();

function normalizeCurrencyCode(input: string): string {
  const upper = (input || "").toUpperCase();
  if (upper === "GBX" || upper === "GBP" || upper === "GBP ") return "GBP";
  if (upper === "GBP." || upper === "GBX.") return "GBP";
  if (upper === "GBPp" || upper === "GBP P" || upper === "GBP PENNY")
    return "GBP";
  if (upper === "GBPENCE" || upper === "GBP PENCE") return "GBP";
  if (upper === "GBPENCE" || upper === "GBp") return "GBP"; // common variations
  return upper;
}

function makeCacheKey(from: string, to: string): string {
  return `${from}->${to}`;
}

async function fetchFrankfurterRate(
  from: string,
  to: string
): Promise<number | null> {
  try {
    const url = new URL("https://api.frankfurter.app/latest");
    url.searchParams.set("amount", "1");
    url.searchParams.set("from", from);
    url.searchParams.set("to", to);

    const res = await fetch(url.toString(), { cache: "no-store" });
    if (!res.ok) return null;
    const data = (await res.json()) as FrankfurterResponse;
    const rate = data?.rates?.[to];
    if (typeof rate === "number" && rate > 0) return rate;
    return null;
  } catch {
    return null;
  }
}

export default async function getExchangeRate(
  fromCurrency: string,
  toCurrency: string
): Promise<number> {
  const from = normalizeCurrencyCode(fromCurrency);
  const to = normalizeCurrencyCode(toCurrency);

  if (!from || !to) return 1;
  if (from === to) return 1;

  const cacheKey = makeCacheKey(from, to);
  const now = Date.now();
  const cached = rateCache.get(cacheKey);
  if (cached && now - cached.timestampMs < CACHE_TTL_MS) {
    return cached.rate;
  }

  // 1) Try direct pair via Frankfurter
  const direct = await fetchFrankfurterRate(from, to);
  if (direct) {
    rateCache.set(cacheKey, { rate: direct, timestampMs: now });
    return direct;
  }

  // 2) Try reverse pair and invert
  const reverse = await fetchFrankfurterRate(to, from);
  if (reverse) {
    const inverted = 1 / reverse;
    rateCache.set(cacheKey, { rate: inverted, timestampMs: now });
    return inverted;
  }

  // 3) Cross via USD
  const fromToUSD =
    from === "USD" ? 1 : await fetchFrankfurterRate(from, "USD");
  const toToUSD = to === "USD" ? 1 : await fetchFrankfurterRate(to, "USD");
  if (fromToUSD && toToUSD) {
    const cross = fromToUSD / toToUSD;
    rateCache.set(cacheKey, { rate: cross, timestampMs: now });
    return cross;
  }

  // 4) Static fallbacks for common pairs (approximate, last resort)
  const fallbackRates: Record<string, number> = {
    EURUSD: 1.08,
    USDEUR: 0.93,
    CADUSD: 0.73,
    USDCAD: 1.37,
    GBPEUR: 1.17,
    EURGBP: 0.85,
  };
  const pair = `${from}${to}`;
  if (fallbackRates[pair]) return fallbackRates[pair];

  // Final conservative fallback
  return 1;
}
