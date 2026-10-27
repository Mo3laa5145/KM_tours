import { lazy, Suspense, useCallback, useEffect, useState } from 'react'
import type { PageState, Currency } from './data'
import Nav from './components/Nav'
import Footer from './components/Footer'
import WhatsAppButton from './components/WhatsAppButton'
import HomePage from './pages/HomePage'
import DestinationPage from './pages/DestinationPage'
import ExperiencePage from './pages/ExperiencePage'
import ReviewPage from './pages/ReviewPage'
import { go, pageToHash, pathToPage, usePath } from './lib/router'
import { useI18n } from './lib/i18n'
import { useCatalog } from './lib/catalogContext'
import { trackPageView } from './lib/analytics'
import { loadLiveRates } from './lib/currency'

const AdminApp = lazy(() => import('./admin/AdminApp'))

function loadSet(key: string): Set<string> {
  try {
    return new Set(JSON.parse(localStorage.getItem(key) ?? '[]') as string[])
  } catch {
    return new Set()
  }
}

function loadCurrency(): Currency {
  try {
    const c = localStorage.getItem('km-tours-currency')
    if (c === 'EGP' || c === 'USD' || c === 'EUR') return c
  } catch {
    /* ignore */
  }
  return 'EGP'
}

export default function App() {
  const path = usePath()
  if (path.startsWith('/admin')) {
    return (
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-[#94A3B8]">…</div>}>
        <AdminApp path={path} />
      </Suspense>
    )
  }
  return <PublicSite path={path} />
}

function PublicSite({ path }: { path: string }) {
  const page = pathToPage(path)
  const { lang } = useI18n()
  const { destinations, getDestination, getExperience } = useCatalog()
  const [currency, setCurrencyState] = useState<Currency>(loadCurrency)
  const [favorites, setFavorites] = useState<Set<string>>(() => loadSet('km-tours-favorites'))
  const [, setRatesVersion] = useState(0)

  useEffect(() => {
    loadLiveRates().then((changed) => changed && setRatesVersion((v) => v + 1))
  }, [])

  const navigate = useCallback((p: PageState) => {
    go(pageToHash(p))
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [])

  const setCurrency = (c: Currency) => {
    setCurrencyState(c)
    try {
      localStorage.setItem('km-tours-currency', c)
    } catch {
      /* ignore */
    }
  }

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      try {
        localStorage.setItem('km-tours-favorites', JSON.stringify([...next]))
      } catch {
        /* ignore */
      }
      return next
    })
  }

  // Page title + visitor analytics
  const pageKey = JSON.stringify(page)
  useEffect(() => {
    let title = 'KM Tours'
    if (page.type === 'destination') {
      const d = getDestination(page.id)
      if (d) title = `${d.name} · KM Tours`
    } else if (page.type === 'experience') {
      const e = getExperience(page.destinationId, page.experienceId)
      if (e) title = `${e.title} · KM Tours`
    }
    document.title = title
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageKey, lang, destinations])

  useEffect(() => {
    void trackPageView(page, path, lang)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path, lang])

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#F8FCFD' }}>
      <Nav navigate={navigate} currency={currency} setCurrency={setCurrency} favorites={favorites} />

      <div className="flex-1">
        {page.type === 'home' && (
          <HomePage navigate={navigate} currency={currency} favorites={favorites} toggleFavorite={toggleFavorite} />
        )}
        {page.type === 'destination' && (
          <DestinationPage
            destinationId={page.id}
            navigate={navigate}
            currency={currency}
            favorites={favorites}
            toggleFavorite={toggleFavorite}
          />
        )}
        {page.type === 'experience' && (
          <ExperiencePage
            destinationId={page.destinationId}
            experienceId={page.experienceId}
            navigate={navigate}
            currency={currency}
            favorites={favorites}
            toggleFavorite={toggleFavorite}
          />
        )}
        {page.type === 'review' && <ReviewPage reference={page.reference} navigate={navigate} />}
      </div>

      <Footer />
      <div className={page.type === 'experience' ? 'hidden lg:block' : ''}>
        <WhatsAppButton />
      </div>
    </div>
  )
}
