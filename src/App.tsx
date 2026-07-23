import { useState } from 'react'
import type { PageState, Currency, Language } from './data'
import Nav from './components/Nav'
import HomePage from './pages/HomePage'
import DestinationPage from './pages/DestinationPage'
import ExperiencePage from './pages/ExperiencePage'

export default function App() {
  const [page, setPage] = useState<PageState>({ type: 'home' })
  const [language, setLanguage] = useState<Language>('EN')
  const [currency, setCurrency] = useState<Currency>('EGP')
  const [favorites, setFavorites] = useState<Set<string>>(new Set())

  const navigate = (newPage: PageState) => {
    setPage(newPage)
    window.scrollTo({ top: 0, behavior: 'instant' })
  }

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F8FCFD' }}>
      <Nav
        page={page}
        navigate={navigate}
        language={language}
        setLanguage={setLanguage}
        currency={currency}
        setCurrency={setCurrency}
        favorites={favorites}
      />

      {page.type === 'home' && (
        <HomePage navigate={navigate} currency={currency} />
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
    </div>
  )
}
