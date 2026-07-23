import { useState, useRef, useEffect } from 'react'
import type { PageState, Currency, Language } from '../data'
import { LANGUAGE_LABELS, CURRENCY_SYMBOLS } from '../data'

interface NavProps {
  page: PageState
  navigate: (p: PageState) => void
  language: Language
  setLanguage: (l: Language) => void
  currency: Currency
  setCurrency: (c: Currency) => void
  favorites: Set<string>
}

const LANGUAGES: Language[] = ['EN', 'AR', 'DE', 'PL', 'IT', 'RU']
const CURRENCIES: Currency[] = ['EGP', 'USD', 'EUR']

export default function Nav({ navigate, language, setLanguage, currency, setCurrency, favorites }: NavProps) {
  const [langOpen, setLangOpen] = useState(false)
  const [currOpen, setCurrOpen] = useState(false)
  const langRef = useRef<HTMLDivElement>(null)
  const currRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) setLangOpen(false)
      if (currRef.current && !currRef.current.contains(e.target as Node)) setCurrOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <header
      style={{ borderBottom: '1px solid #E5E7EB', backgroundColor: 'rgba(248,252,253,0.92)' }}
      className="sticky top-0 z-50 backdrop-blur-md"
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <button
          onClick={() => navigate({ type: 'home' })}
          className="font-display text-xl font-semibold tracking-tight"
          style={{ color: '#1E293B', letterSpacing: '-0.02em' }}
        >
          KM Tours
        </button>

        {/* Center nav */}
        <nav className="hidden md:flex items-center gap-8">
          {[
            { label: 'Experiences', action: () => navigate({ type: 'home' }) },
            { label: 'Destinations', action: () => navigate({ type: 'home' }) },
            { label: 'About', action: () => {} },
          ].map(({ label, action }) => (
            <button
              key={label}
              onClick={action}
              className="text-sm font-medium transition-colors"
              style={{ color: '#64748B' }}
              onMouseEnter={(e) => ((e.target as HTMLElement).style.color = '#1E293B')}
              onMouseLeave={(e) => ((e.target as HTMLElement).style.color = '#64748B')}
            >
              {label}
            </button>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-1">
          {/* Language */}
          <div ref={langRef} className="relative">
            <button
              onClick={() => { setLangOpen(!langOpen); setCurrOpen(false) }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
              style={{ color: '#64748B' }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = '#F1F5F9')}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = 'transparent')}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 21l5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 016-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C11.176 10.658 7.69 15.08 3 17.502m9.334-12.138c.896.061 1.785.147 2.666.257m-4.589 8.495a18.023 18.023 0 01-3.827-5.802" />
              </svg>
              {language}
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {langOpen && (
              <div
                className="absolute right-0 mt-1 w-44 rounded-xl shadow-lg py-1 z-50"
                style={{ backgroundColor: '#fff', border: '1px solid #E5E7EB' }}
              >
                {LANGUAGES.map((l) => (
                  <button
                    key={l}
                    onClick={() => { setLanguage(l); setLangOpen(false) }}
                    className="w-full text-left px-4 py-2.5 text-sm flex items-center justify-between transition-colors"
                    style={{
                      color: l === language ? '#0EA5E9' : '#1E293B',
                      backgroundColor: 'transparent',
                    }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = '#F8FCFD')}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = 'transparent')}
                  >
                    <span>{LANGUAGE_LABELS[l]}</span>
                    {l === language && (
                      <svg className="w-4 h-4 text-sky-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Currency */}
          <div ref={currRef} className="relative">
            <button
              onClick={() => { setCurrOpen(!currOpen); setLangOpen(false) }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
              style={{ color: '#64748B' }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = '#F1F5F9')}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = 'transparent')}
            >
              {currency}
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {currOpen && (
              <div
                className="absolute right-0 mt-1 w-32 rounded-xl shadow-lg py-1 z-50"
                style={{ backgroundColor: '#fff', border: '1px solid #E5E7EB' }}
              >
                {CURRENCIES.map((c) => (
                  <button
                    key={c}
                    onClick={() => { setCurrency(c); setCurrOpen(false) }}
                    className="w-full text-left px-4 py-2.5 text-sm flex items-center justify-between transition-colors"
                    style={{
                      color: c === currency ? '#0EA5E9' : '#1E293B',
                    }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = '#F8FCFD')}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = 'transparent')}
                  >
                    <span>{c}</span>
                    <span className="text-xs" style={{ color: '#94A3B8' }}>{CURRENCY_SYMBOLS[c]}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Favorites */}
          <button
            className="relative p-2 rounded-lg transition-colors"
            style={{ color: '#64748B' }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = '#F1F5F9')}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = 'transparent')}
            title="Saved experiences"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
            </svg>
            {favorites.size > 0 && (
              <span
                className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-xs flex items-center justify-center text-white font-medium"
                style={{ backgroundColor: '#FF7A59', fontSize: '10px' }}
              >
                {favorites.size}
              </span>
            )}
          </button>

          {/* Profile */}
          <button
            className="w-8 h-8 rounded-full flex items-center justify-center ml-1 transition-opacity"
            style={{ backgroundColor: '#1E293B' }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.opacity = '0.8')}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.opacity = '1')}
            title="Sign in"
          >
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  )
}
