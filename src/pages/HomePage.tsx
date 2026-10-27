import type { PageState, Currency } from '../data'
import SearchBar from '../components/SearchBar'
import ExperienceCard from '../components/ExperienceCard'
import { useCatalog } from '../lib/catalogContext'
import { useI18n } from '../lib/i18n'

interface HomePageProps {
  navigate: (p: PageState) => void
  currency: Currency
  favorites: Set<string>
  toggleFavorite: (id: string) => void
}

const pinIcon = (
  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
    <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-2.003 3.5-4.697 3.5-8.327a8 8 0 10-16 0c0 3.63 1.556 6.326 3.5 8.327a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
  </svg>
)

export default function HomePage({ navigate, currency, favorites, toggleFavorite }: HomePageProps) {
  const { destinations, allExperiences, loading } = useCatalog()
  const { t } = useI18n()

  const featured = [...allExperiences]
    .sort((a, b) => b.rating * Math.log10(b.reviewCount + 10) - a.rating * Math.log10(a.reviewCount + 10))
    .slice(0, 6)

  return (
    <main className="flex flex-col">
      {/* Hero */}
      <div className="flex flex-col items-center px-4" style={{ paddingTop: '16vh', paddingBottom: '6vh' }}>
        <div className="text-center mb-10">
          <h1
            className="font-display font-semibold leading-none mb-4"
            style={{ fontSize: 'clamp(48px, 8vw, 96px)', color: '#1E293B', letterSpacing: '-0.03em' }}
          >
            {t('home.title')}
          </h1>
          <p style={{ fontSize: '18px', color: '#64748B' }}>{t('home.subtitle')}</p>
        </div>

        <SearchBar navigate={navigate} large />

        <div className="flex flex-wrap items-center justify-center gap-2 mt-8">
          {destinations.map((dest) => (
            <button
              key={dest.id}
              onClick={() => navigate({ type: 'destination', id: dest.id })}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all bg-white border border-[#E5E7EB] text-[#64748B] shadow-[0_1px_4px_rgba(0,0,0,0.04)] hover:border-[#0EA5E9] hover:text-[#0EA5E9]"
            >
              {pinIcon}
              {dest.name}
            </button>
          ))}
        </div>
      </div>

      {/* Destinations */}
      <section id="destinations" className="scroll-mt-20" style={{ paddingTop: '64px', paddingBottom: '48px' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h2 className="font-display font-semibold mb-8" style={{ fontSize: '28px', color: '#1E293B', letterSpacing: '-0.02em' }}>
            {t('home.popular')}
          </h2>
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="rounded-2xl animate-pulse bg-[#E5E7EB]" style={{ height: 240 }} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {destinations.map((dest) => (
                <button
                  key={dest.id}
                  onClick={() => navigate({ type: 'destination', id: dest.id })}
                  className="group relative overflow-hidden rounded-2xl text-start"
                  style={{ height: '240px', backgroundColor: '#E5E7EB' }}
                >
                  <img
                    src={dest.coverPhoto.replace('w=1600&h=900', 'w=480&h=320')}
                    alt={dest.name}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div
                    className="absolute inset-0"
                    style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0) 55%)' }}
                  />
                  <div className="absolute bottom-0 inset-x-0 p-4">
                    <div className="font-display font-semibold text-white" style={{ fontSize: '18px' }}>
                      {dest.name}
                    </div>
                    <div className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.75)' }}>
                      {t('common.experiencesCount', { n: dest.experiences.length })}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Featured */}
      {featured.length > 0 && (
        <section id="featured" className="scroll-mt-20" style={{ paddingTop: '32px', paddingBottom: '64px' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <h2 className="font-display font-semibold mb-8" style={{ fontSize: '28px', color: '#1E293B', letterSpacing: '-0.02em' }}>
              {t('home.featured')}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featured.map((exp) => (
                <ExperienceCard
                  key={exp.id}
                  experience={exp}
                  currency={currency}
                  navigate={navigate}
                  isFavorited={favorites.has(exp.id)}
                  onToggleFavorite={toggleFavorite}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Why us */}
      <section style={{ backgroundColor: '#fff', borderTop: '1px solid #E5E7EB' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
          <h2 className="font-display font-semibold mb-8 text-center" style={{ fontSize: '26px', color: '#1E293B' }}>
            {t('home.why.title')}
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            {(
              [
                ['home.why.local', 'home.why.localText', '🧭'],
                ['home.why.noPay', 'home.why.noPayText', '🤝'],
                ['home.why.support', 'home.why.supportText', '💬'],
              ] as const
            ).map(([title, text, icon]) => (
              <div key={title} className="rounded-2xl p-6 border border-[#E5E7EB] bg-[#F8FCFD]">
                <div className="text-2xl mb-3">{icon}</div>
                <div className="font-semibold text-[#1E293B] mb-1">{t(title)}</div>
                <p className="text-sm text-[#64748B] leading-relaxed">{t(text)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
