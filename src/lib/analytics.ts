import { supabase } from './supabase'
import type { PageState } from '../data'

const VISITOR_KEY = 'km-tours-visitor'
const COUNTRY_KEY = 'km-tours-country'

function visitorId(): string {
  try {
    let id = localStorage.getItem(VISITOR_KEY)
    if (!id) {
      id = crypto.randomUUID()
      localStorage.setItem(VISITOR_KEY, id)
    }
    return id
  } catch {
    return 'anon-' + Math.random().toString(36).slice(2)
  }
}

let countryPromise: Promise<string | null> | null = null

/** Looks up the visitor's country once per browser session (the IP address itself is never stored). */
export function detectCountry(): Promise<string | null> {
  if (countryPromise) return countryPromise
  countryPromise = (async () => {
    try {
      const cached = sessionStorage.getItem(COUNTRY_KEY)
      if (cached) return cached === '-' ? null : cached
    } catch {
      /* ignore */
    }
    const save = (c: string | null) => {
      try {
        sessionStorage.setItem(COUNTRY_KEY, c ?? '-')
      } catch {
        /* ignore */
      }
      return c
    }
    const timeout = (ms: number) => {
      const ctl = new AbortController()
      setTimeout(() => ctl.abort(), ms)
      return ctl.signal
    }
    try {
      const r = await fetch('https://api.country.is/', { signal: timeout(4000) })
      const j = (await r.json()) as { country?: string }
      if (j.country && /^[A-Z]{2}$/.test(j.country)) return save(j.country)
    } catch {
      /* try the next provider */
    }
    try {
      const r = await fetch('https://ipapi.co/country/', { signal: timeout(4000) })
      const c = (await r.text()).trim()
      if (/^[A-Z]{2}$/.test(c)) return save(c)
    } catch {
      /* give up */
    }
    return save(null)
  })()
  return countryPromise
}

function deviceType(): string {
  const w = window.innerWidth
  const ua = navigator.userAgent
  if (/iPad|Tablet/i.test(ua) || (w >= 600 && w < 1024 && /Mobi|Android/i.test(ua))) return 'tablet'
  if (/Mobi|Android|iPhone/i.test(ua) || w < 600) return 'mobile'
  return 'desktop'
}

function referrerHost(): string | null {
  try {
    if (!document.referrer) return null
    const host = new URL(document.referrer).hostname
    return host === window.location.hostname ? null : host.replace(/^www\./, '').slice(0, 200)
  } catch {
    return null
  }
}

const initialReferrer = typeof document !== 'undefined' ? referrerHost() : null
let lastKey = ''

export async function trackPageView(page: PageState, path: string, lang: string) {
  if (!supabase) return
  if (navigator.webdriver) return
  const key = path + '|' + lang
  if (key === lastKey) return
  lastKey = key
  try {
    const country = await detectCountry()
    await supabase.from('visits').insert({
      session_id: visitorId(),
      path: path.slice(0, 300),
      destination_id: page.type === 'destination' ? page.id : page.type === 'experience' ? page.destinationId : null,
      experience_id: page.type === 'experience' ? page.experienceId : null,
      country,
      language: lang,
      referrer: initialReferrer,
      device: deviceType(),
    })
  } catch {
    /* analytics must never break the site */
  }
}
