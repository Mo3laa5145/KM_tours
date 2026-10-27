// Prices are stored in Egyptian pounds (EGP) and converted for display.
// USD/EUR rates are refreshed automatically once a day (cached in the browser).
export type Currency = 'EGP' | 'USD' | 'EUR'

/** Fallback rates (1 EGP = x) used until the live rates load. */
export const EXCHANGE_RATES: Record<Currency, number> = {
  EGP: 1,
  USD: 0.0205,
  EUR: 0.0188,
}

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  EGP: 'EGP',
  USD: '$',
  EUR: '€',
}

export function formatPrice(egp: number, currency: Currency): string {
  const rate = EXCHANGE_RATES[currency]
  const amount = Math.round(egp * rate)
  if (currency === 'EGP') return `EGP ${amount.toLocaleString('en')}`
  if (currency === 'USD') return `$${amount.toLocaleString('en')}`
  return `€${amount.toLocaleString('en')}`
}

const CACHE_KEY = 'km-tours-rates'
const MAX_AGE = 12 * 60 * 60 * 1000

function apply(r: { USD: number; EUR: number }) {
  if (r.USD > 0 && r.USD < 1 && r.EUR > 0 && r.EUR < 1) {
    EXCHANGE_RATES.USD = r.USD
    EXCHANGE_RATES.EUR = r.EUR
    return true
  }
  return false
}

/** Loads today's rates. Resolves to true when the rates changed (so the page can re-render). */
export async function loadLiveRates(): Promise<boolean> {
  try {
    const cached = JSON.parse(localStorage.getItem(CACHE_KEY) ?? 'null') as { t: number; USD: number; EUR: number } | null
    if (cached && Date.now() - cached.t < MAX_AGE) return apply(cached)
  } catch {
    /* ignore */
  }
  try {
    const res = await fetch('https://open.er-api.com/v6/latest/EGP')
    const j = (await res.json()) as { result?: string; rates?: Record<string, number> }
    if (j.result === 'success' && j.rates) {
      const r = { USD: j.rates.USD, EUR: j.rates.EUR }
      if (apply(r)) {
        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify({ t: Date.now(), ...r }))
        } catch {
          /* ignore */
        }
        return true
      }
    }
  } catch {
    /* keep fallback rates */
  }
  return false
}
