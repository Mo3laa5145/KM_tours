import type { PageState, Currency } from '../data'
import { DESTINATIONS } from '../data'
import SearchBar from '../components/SearchBar'

interface HomePageProps {
  navigate: (p: PageState) => void
  currency: Currency
}

export default function HomePage({ navigate }: HomePageProps) {
  return (
    <main className="min-h-screen flex flex-col">
      {/* Hero */}
      <div className="flex-1 flex flex-col items-center" style={{ paddingTop: '18vh' }}>
        <div className="text-center px-6 mb-10">
          <h1
            className="font-display font-semibold leading-none mb-4"
            style={{ fontSize: 'clamp(52px, 8vw, 96px)', color: '#1E293B', letterSpacing: '-0.03em' }}
          >
            Where to?
          </h1>
          <p
            className="font-normal"
            style={{ fontSize: '18px', color: '#64748B', letterSpacing: '-0.01em' }}
          >
            Discover unforgettable experiences across Egypt.
          </p>
        </div>

        <SearchBar navigate={navigate} large />

        {/* Quick destination pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-8 px-6">
          {DESTINATIONS.map((dest) => (
            <button
              key={dest.id}
              onClick={() => navigate({ type: 'destination', id: dest.id })}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all"
              style={{
                backgroundColor: '#fff',
                border: '1px solid #E5E7EB',
                color: '#64748B',
                boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLElement
                el.style.borderColor = '#0EA5E9'
                el.style.color = '#0EA5E9'
                el.style.boxShadow = '0 2px 8px rgba(14,165,233,0.12)'
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLElement
                el.style.borderColor = '#E5E7EB'
                el.style.color = '#64748B'
                el.style.boxShadow = '0 1px 4px rgba(0,0,0,0.04)'
              }}
            >
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-2.003 3.5-4.697 3.5-8.327a8 8 0 10-16 0c0 3.63 1.556 6.326 3.5 8.327a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
              </svg>
              {dest.name}
            </button>
          ))}
        </div>
      </div>

      {/* Destination cards strip */}
      <div style={{ paddingTop: '80px', paddingBottom: '80px' }}>
        <div className="max-w-7xl mx-auto px-6">
          <h2
            className="font-display font-semibold mb-8"
            style={{ fontSize: '28px', color: '#1E293B', letterSpacing: '-0.02em' }}
          >
            Popular destinations
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {DESTINATIONS.map((dest) => (
              <button
                key={dest.id}
                onClick={() => navigate({ type: 'destination', id: dest.id })}
                className="group relative overflow-hidden rounded-2xl text-left"
                style={{ height: '240px', backgroundColor: '#E5E7EB' }}
              >
                <img
                  src={dest.coverPhoto.replace('w=1600&h=900', 'w=480&h=320')}
                  alt={dest.name}
                  className="w-full h-full object-cover transition-transform duration-500"
                  style={{ transform: 'scale(1)' }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.transform = 'scale(1.06)')}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.transform = 'scale(1)')}
                />
                <div
                  className="absolute inset-0"
                  style={{
                    background: 'linear-gradient(to top, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0) 55%)',
                  }}
                />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <div className="font-display font-semibold text-white" style={{ fontSize: '18px', letterSpacing: '-0.02em' }}>
                    {dest.name}
                  </div>
                  <div className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.75)' }}>
                    {dest.experiences.length} experiences
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid #E5E7EB', backgroundColor: '#fff' }}>
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="font-display text-base font-semibold" style={{ color: '#1E293B', letterSpacing: '-0.02em' }}>
            KM Tours
          </div>
          <div className="flex items-center gap-6">
            {['Privacy', 'Terms', 'Support', 'About'].map((link) => (
              <button key={link} className="text-sm" style={{ color: '#94A3B8' }}>
                {link}
              </button>
            ))}
          </div>
          <div className="text-sm" style={{ color: '#CBD5E1' }}>
            © 2025 KM Tours. All rights reserved.
          </div>
        </div>
      </footer>
    </main>
  )
}
