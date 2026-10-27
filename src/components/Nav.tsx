import { useState, useRef, useEffect } from 'react'
import type { PageState, Currency } from '../data'
import { CURRENCY_SYMBOLS } from '../lib/currency'
import { LANGS, type Lang } from '../lib/catalog'
import { LANG_LABELS, LANG_SHORT } from '../lib/translations'
import { useI18n } from '../lib/i18n'
import { useCatalog } from '../lib/catalogContext'

interface NavProps {
  navigate: (p: PageState) => void
  currency: Currency
  setCurrency: (c: Currency) => void
  favorites: Set<string>
}

const CURRENCIES: Currency[] = ['EGP', 'USD', 'EUR']

function useOutside(ref: React.RefObject<HTMLElement | null>, onOutside: () => void) {
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onOutside()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [ref, onOutside])
}

const menuItemClass =
  'w-full text-start px-4 py-2.5 text-sm flex items-center justify-between gap-3 transition-colors hover:bg-[#F8FCFD]'

export default function Nav({ navigate, currency, setCurrency, favorites }: NavProps) {
  const { t, lang, setLang } = useI18n()
  const { allExperiences } = useCatalog()
  const [open, setOpen] = useState<'lang' | 'curr' | 'fav' | null>(null)
  const ref = useRef<HTMLDivElement>(null)
  useOutside(ref, () => setOpen(null))

  const saved = allExperiences.filter((e) => favorites.has(e.id))

  const scrollTo = (id: string) => {
    navigate({ type: 'home' })
    setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60)
  }

  return (
    <header
      style={{ borderBottom: '1px solid #E5E7EB', backgroundColor: 'rgba(248,252,253,0.92)' }}
      className="sticky top-0 z-50 backdrop-blur-md"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-2">
        <button
          onClick={() => navigate({ type: 'home' })}
          className="font-display text-xl font-semibold tracking-tight shrink-0"
          style={{ color: '#1E293B', letterSpacing: '-0.02em' }}
          dir="ltr"
        >
          KM Tours
        </button>

        <nav className="hidden md:flex items-center gap-8">
          {[
            { label: t('nav.experiences'), action: () => scrollTo('featured') },
            { label: t('nav.destinations'), action: () => scrollTo('destinations') },
            { label: t('nav.contact'), action: () => scrollTo('contact') },
          ].map(({ label, action }) => (
            <button
              key={label}
              onClick={action}
              className="text-sm font-medium transition-colors text-[#64748B] hover:text-[#1E293B]"
            >
              {label}
            </button>
          ))}
        </nav>

        <div ref={ref} className="flex items-center gap-1">
          {/* Language */}
          <div className="relative">
            <button
              onClick={() => setOpen(open === 'lang' ? null : 'lang')}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-lg text-sm font-medium transition-colors text-[#64748B] hover:bg-[#F1F5F9]"
              aria-label={t('nav.language')}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
              </svg>
              {LANG_SHORT[lang]}
            </button>
            {open === 'lang' && (
              <div className="absolute end-0 mt-1 w-44 rounded-xl shadow-lg py-1 z-50 bg-white border border-[#E5E7EB]">
                {LANGS.map((l: Lang) => (
                  <button
                    key={l}
                    onClick={() => {
                      setLang(l)
                      setOpen(null)
                    }}
                    className={menuItemClass}
                    style={{ color: l === lang ? '#0EA5E9' : '#1E293B' }}
                  >
                    <span>{LANG_LABELS[l]}</span>
                    {l === lang && <Check />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Currency */}
          <div className="relative">
            <button
              onClick={() => setOpen(open === 'curr' ? null : 'curr')}
              className="flex items-center gap-1 px-2.5 sm:px-3 py-2 rounded-lg text-sm font-medium transition-colors text-[#64748B] hover:bg-[#F1F5F9]"
              aria-label={t('nav.currency')}
            >
              {currency}
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {open === 'curr' && (
              <div className="absolute end-0 mt-1 w-32 rounded-xl shadow-lg py-1 z-50 bg-white border border-[#E5E7EB]">
                {CURRENCIES.map((c) => (
                  <button
                    key={c}
                    onClick={() => {
                      setCurrency(c)
                      setOpen(null)
                    }}
                    className={menuItemClass}
                    style={{ color: c === currency ? '#0EA5E9' : '#1E293B' }}
                  >
                    <span>{c}</span>
                    <span className="text-xs text-[#94A3B8]">{CURRENCY_SYMBOLS[c]}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Favorites */}
          <div className="relative">
            <button
              onClick={() => setOpen(open === 'fav' ? null : 'fav')}
              className="relative p-2 rounded-lg transition-colors text-[#64748B] hover:bg-[#F1F5F9]"
              title={t('nav.saved')}
              aria-label={t('nav.saved')}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
              </svg>
              {favorites.size > 0 && (
                <span
                  className="absolute -top-0.5 -end-0.5 w-4 h-4 rounded-full flex items-center justify-center text-white font-medium"
                  style={{ backgroundColor: '#FF7A59', fontSize: '10px' }}
                >
                  {favorites.size}
                </span>
              )}
            </button>
            {open === 'fav' && (
              <div className="absolute end-0 mt-1 w-72 rounded-xl shadow-lg py-2 z-50 bg-white border border-[#E5E7EB]">
                <div className="px-4 pb-2 text-xs font-semibold uppercase tracking-wide text-[#94A3B8]">{t('nav.saved')}</div>
                {saved.length === 0 ? (
                  <div className="px-4 py-4 text-sm text-[#94A3B8]">♡</div>
                ) : (
                  saved.map((e) => (
                    <button
                      key={e.id}
                      onClick={() => {
                        setOpen(null)
                        navigate({ type: 'experience', destinationId: e.destinationId, experienceId: e.id })
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2 text-start hover:bg-[#F8FCFD]"
                    >
                      <img src={e.photo} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" />
                      <span className="text-sm text-[#1E293B] line-clamp-2">{e.title}</span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

function Check() {
  return (
    <svg className="w-4 h-4 text-sky-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  )
}
