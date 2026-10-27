import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Lang } from './catalog'
import { LANGS } from './catalog'
import { DICTIONARIES, TOUR_LANGUAGE_CODES, type TKey } from './translations'

const STORAGE_KEY = 'km-tours-lang'

function detectLang(): Lang {
  try {
    const fromUrl = new URLSearchParams(window.location.search).get('lang')
    if (fromUrl && (LANGS as string[]).includes(fromUrl)) return fromUrl as Lang
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved && (LANGS as string[]).includes(saved)) return saved as Lang
  } catch {
    /* storage unavailable */
  }
  const browser = (navigator.languages?.[0] ?? navigator.language ?? 'en').slice(0, 2).toLowerCase()
  return (LANGS as string[]).includes(browser) ? (browser as Lang) : 'en'
}

interface I18nValue {
  lang: Lang
  setLang: (l: Lang) => void
  dir: 'rtl' | 'ltr'
  t: (key: TKey, vars?: Record<string, string | number>) => string
  categoryLabel: (c: string) => string
  tourLanguageLabel: (name: string) => string
  durationLabel: (hours: number) => string
  formatNumber: (n: number) => string
  formatDate: (d: string | Date, opts?: Intl.DateTimeFormatOptions) => string
}

const I18nContext = createContext<I18nValue | null>(null)

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(detectLang)
  const dir = lang === 'ar' ? 'rtl' : 'ltr'

  useEffect(() => {
    document.documentElement.lang = lang
    document.documentElement.dir = dir
  }, [lang, dir])

  const setLang = useCallback((l: Lang) => {
    setLangState(l)
    try {
      localStorage.setItem(STORAGE_KEY, l)
    } catch {
      /* ignore */
    }
  }, [])

  const value = useMemo<I18nValue>(() => {
    const dict = DICTIONARIES[lang]
    const locale = lang === 'ar' ? 'ar-EG' : lang
    const t = (key: TKey, vars?: Record<string, string | number>) => {
      let s = dict[key] ?? DICTIONARIES.en[key] ?? key
      if (vars) for (const [k, v] of Object.entries(vars)) s = s.split(`{${k}}`).join(String(v))
      return s
    }
    let langNames: Intl.DisplayNames | null = null
    try {
      langNames = new Intl.DisplayNames([lang], { type: 'language' })
    } catch {
      langNames = null
    }
    return {
      lang,
      setLang,
      dir,
      t,
      categoryLabel: (c) => (dict as Record<string, string>)[`cat.${c}`] ?? c,
      tourLanguageLabel: (name) => {
        const code = TOUR_LANGUAGE_CODES[name]
        if (!code || !langNames) return name
        const label = langNames.of(code) ?? name
        return label.charAt(0).toLocaleUpperCase(locale) + label.slice(1)
      },
      durationLabel: (h) => {
        const n = Math.round(h * 10) / 10
        return n === 1 ? t('duration.hour') : t('duration.hours', { n: n.toLocaleString(locale) })
      },
      formatNumber: (n) => n.toLocaleString(locale),
      formatDate: (d, opts) => {
        const date = typeof d === 'string' ? new Date(d.length === 10 ? d + 'T12:00:00' : d) : d
        return date.toLocaleDateString(locale, opts ?? { day: 'numeric', month: 'long', year: 'numeric' })
      },
    }
  }, [lang, dir, setLang])

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n(): I18nValue {
  const v = useContext(I18nContext)
  if (!v) throw new Error('useI18n must be used inside I18nProvider')
  return v
}
