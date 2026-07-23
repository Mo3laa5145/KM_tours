import { useState, useMemo } from 'react'
import type { PageState, Currency, ExperienceCategory } from '../data'
import { getDestination } from '../data'
import SearchBar from '../components/SearchBar'
import ExperienceCard from '../components/ExperienceCard'

interface DestinationPageProps {
  destinationId: string
  navigate: (p: PageState) => void
  currency: Currency
  favorites: Set<string>
  toggleFavorite: (id: string) => void
}

const CATEGORIES: ExperienceCategory[] = [
  'Water Sports',
  'Desert & Adventure',
  'Cultural & Historical',
  'Cruises & Sailing',
  'Nature & Wildlife',
]

const PRICE_RANGES = [
  { label: 'Any price', value: null },
  { label: 'Under EGP 700', value: [0, 700] as [number, number] },
  { label: 'EGP 700 – 1,500', value: [700, 1500] as [number, number] },
  { label: 'EGP 1,500 – 3,000', value: [1500, 3000] as [number, number] },
  { label: 'EGP 3,000+', value: [3000, Infinity] as [number, number] },
]

const DURATION_RANGES = [
  { label: 'Any duration', value: null },
  { label: 'Under 3 hours', value: 'short' },
  { label: '3 – 6 hours', value: 'half' },
  { label: '6+ hours', value: 'full' },
]

type SortOption = 'recommended' | 'rating' | 'price_low' | 'price_high' | 'newest'

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string
  options: { label: string; value: string }[]
  onChange: (v: string) => void
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none pl-4 pr-8 py-2.5 rounded-xl text-sm font-medium cursor-pointer outline-none"
        style={{
          backgroundColor: value !== '' ? '#F0F9FF' : '#fff',
          border: `1px solid ${value !== '' ? '#0EA5E9' : '#E5E7EB'}`,
          color: value !== '' ? '#0369A1' : '#64748B',
          minWidth: '140px',
        }}
      >
        <option value="">{label}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <svg
        className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5"
        style={{ color: '#94A3B8' }}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  )
}

function ToggleFilter({
  label,
  active,
  onChange,
}: {
  label: string
  active: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <button
      onClick={() => onChange(!active)}
      className="px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
      style={{
        backgroundColor: active ? '#F0F9FF' : '#fff',
        border: `1px solid ${active ? '#0EA5E9' : '#E5E7EB'}`,
        color: active ? '#0369A1' : '#64748B',
      }}
    >
      {label}
    </button>
  )
}

export default function DestinationPage({
  destinationId,
  navigate,
  currency,
  favorites,
  toggleFavorite,
}: DestinationPageProps) {
  const destination = getDestination(destinationId)

  const [categoryFilter, setCategoryFilter] = useState('')
  const [priceFilter, setPriceFilter] = useState('')
  const [durationFilter, setDurationFilter] = useState('')
  const [ratingFilter, setRatingFilter] = useState('')
  const [pickupFilter, setPickupFilter] = useState(false)
  const [cancellationFilter, setCancellationFilter] = useState(false)
  const [sortBy, setSortBy] = useState<SortOption>('recommended')

  const filtered = useMemo(() => {
    if (!destination) return []
    let list = [...destination.experiences]

    if (categoryFilter) {
      list = list.filter((e) => e.category === categoryFilter)
    }

    if (priceFilter) {
      const range = PRICE_RANGES.find((r) => r.label === priceFilter)
      if (range?.value) {
        const [min, max] = range.value
        list = list.filter((e) => e.price >= min && e.price <= max)
      }
    }

    if (durationFilter) {
      list = list.filter((e) => {
        const hrs = parseFloat(e.duration)
        if (durationFilter === 'short') return hrs < 3
        if (durationFilter === 'half') return hrs >= 3 && hrs <= 6
        if (durationFilter === 'full') return hrs > 6
        return true
      })
    }

    if (ratingFilter) {
      const minRating = parseFloat(ratingFilter)
      list = list.filter((e) => e.rating >= minRating)
    }

    if (pickupFilter) list = list.filter((e) => e.pickupAvailable)
    if (cancellationFilter) list = list.filter((e) => e.freeCancellation)

    switch (sortBy) {
      case 'rating':
        list.sort((a, b) => b.rating - a.rating)
        break
      case 'price_low':
        list.sort((a, b) => a.price - b.price)
        break
      case 'price_high':
        list.sort((a, b) => b.price - a.price)
        break
      case 'newest':
        list.sort((a, b) => b.reviewCount - a.reviewCount)
        break
    }

    return list
  }, [destination, categoryFilter, priceFilter, durationFilter, ratingFilter, pickupFilter, cancellationFilter, sortBy])

  if (!destination) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p style={{ color: '#94A3B8' }}>Destination not found.</p>
      </div>
    )
  }

  const hasFilters = categoryFilter || priceFilter || durationFilter || ratingFilter || pickupFilter || cancellationFilter

  return (
    <main>
      {/* Hero */}
      <div className="relative" style={{ height: '420px', backgroundColor: '#E5E7EB' }}>
        <img
          src={destination.coverPhoto}
          alt={destination.name}
          className="w-full h-full object-cover"
        />
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.15) 60%, rgba(0,0,0,0) 100%)' }}
        />
        {/* Breadcrumb */}
        <div className="absolute top-6 left-0 right-0">
          <div className="max-w-7xl mx-auto px-6">
            <button
              onClick={() => navigate({ type: 'home' })}
              className="flex items-center gap-1.5 text-sm font-medium transition-opacity"
              style={{ color: 'rgba(255,255,255,0.8)' }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.opacity = '1')}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.opacity = '0.8')}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
              All destinations
            </button>
          </div>
        </div>
        {/* Title */}
        <div className="absolute bottom-0 left-0 right-0 pb-8">
          <div className="max-w-7xl mx-auto px-6">
            <h1
              className="font-display font-semibold text-white mb-2"
              style={{ fontSize: 'clamp(36px, 5vw, 64px)', letterSpacing: '-0.03em' }}
            >
              {destination.name}
            </h1>
            <p className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.75)' }}>
              {destination.experiences.length} experiences available
            </p>
          </div>
        </div>
      </div>

      {/* Search + Description */}
      <div style={{ backgroundColor: '#fff', borderBottom: '1px solid #E5E7EB' }}>
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="flex-1">
            <SearchBar navigate={navigate} defaultValue={destination.name} />
          </div>
          <p className="text-sm max-w-lg leading-relaxed hidden lg:block" style={{ color: '#64748B' }}>
            {destination.description}
          </p>
        </div>
      </div>

      {/* Filters bar */}
      <div
        className="sticky z-30"
        style={{ top: '64px', backgroundColor: '#F8FCFD', borderBottom: '1px solid #E5E7EB' }}
      >
        <div className="max-w-7xl mx-auto px-6 py-3">
          <div className="flex flex-wrap items-center gap-2">
            <FilterSelect
              label="Category"
              value={categoryFilter}
              onChange={setCategoryFilter}
              options={CATEGORIES.map((c) => ({ label: c, value: c }))}
            />
            <FilterSelect
              label="Price"
              value={priceFilter}
              onChange={setPriceFilter}
              options={PRICE_RANGES.slice(1).map((r) => ({ label: r.label, value: r.label }))}
            />
            <FilterSelect
              label="Duration"
              value={durationFilter}
              onChange={setDurationFilter}
              options={DURATION_RANGES.slice(1).map((r) => ({ label: r.label, value: r.value as string }))}
            />
            <FilterSelect
              label="Rating"
              value={ratingFilter}
              onChange={setRatingFilter}
              options={[
                { label: '4.0+', value: '4.0' },
                { label: '4.5+', value: '4.5' },
                { label: '4.8+', value: '4.8' },
              ]}
            />
            <ToggleFilter label="Pickup included" active={pickupFilter} onChange={setPickupFilter} />
            <ToggleFilter label="Free cancellation" active={cancellationFilter} onChange={setCancellationFilter} />

            {/* Spacer */}
            <div className="flex-1" />

            {/* Sort */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="appearance-none pl-4 pr-8 py-2.5 rounded-xl text-sm font-medium cursor-pointer outline-none"
                style={{
                  backgroundColor: '#fff',
                  border: '1px solid #E5E7EB',
                  color: '#1E293B',
                  minWidth: '160px',
                }}
              >
                <option value="recommended">Recommended</option>
                <option value="rating">Highest rated</option>
                <option value="price_low">Lowest price</option>
                <option value="price_high">Highest price</option>
                <option value="newest">Most reviewed</option>
              </select>
              <svg
                className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5"
                style={{ color: '#94A3B8' }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </div>

            {/* Clear filters */}
            {hasFilters && (
              <button
                onClick={() => {
                  setCategoryFilter('')
                  setPriceFilter('')
                  setDurationFilter('')
                  setRatingFilter('')
                  setPickupFilter(false)
                  setCancellationFilter(false)
                }}
                className="text-sm font-medium underline"
                style={{ color: '#0EA5E9' }}
              >
                Clear all
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-6 py-10">
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-lg font-medium" style={{ color: '#94A3B8' }}>
              No experiences match your filters.
            </p>
            <button
              onClick={() => {
                setCategoryFilter('')
                setPriceFilter('')
                setDurationFilter('')
                setRatingFilter('')
                setPickupFilter(false)
                setCancellationFilter(false)
              }}
              className="mt-4 text-sm underline"
              style={{ color: '#0EA5E9' }}
            >
              Clear filters
            </button>
          </div>
        ) : (
          <>
            <p className="text-sm mb-6" style={{ color: '#94A3B8' }}>
              {filtered.length} experience{filtered.length !== 1 ? 's' : ''} in {destination.name}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((exp) => (
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
          </>
        )}
      </div>
    </main>
  )
}
