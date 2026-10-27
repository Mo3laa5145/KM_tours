import { useState, useMemo } from 'react'
import type { PageState, Currency } from '../data'
import { formatPrice } from '../lib/currency'
import SearchBar from '../components/SearchBar'
import ExperienceCard from '../components/ExperienceCard'
import { useCatalog } from '../lib/catalogContext'
import { useI18n } from '../lib/i18n'
import { CATEGORIES } from '../lib/catalog'

interface DestinationPageProps {
  destinationId: string
  navigate: (p: PageState) => void
  currency: Currency
  favorites: Set<string>
  toggleFavorite: (id: string) => void
}

const PRICE_RANGES: Record<string, [number, number]> = {
  p1: [0, 700],
  p2: [700, 1500],
  p3: [1500, 3000],
  p4: [3000, Infinity],
}

type SortOption = 'recommended' | 'rating' | 'price_low' | 'price_high' | 'reviews'

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
  const active = value !== ''
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none ps-4 pe-8 py-2.5 rounded-xl text-sm font-medium cursor-pointer outline-none"
        style={{
          backgroundColor: active ? '#F0F9FF' : '#fff',
          border: `1px solid ${active ? '#0EA5E9' : '#E5E7EB'}`,
          color: active ? '#0369A1' : '#64748B',
          minWidth: '130px',
        }}
      >
        <option value="">{label}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <Chevron />
    </div>
  )
}

function Chevron() {
  return (
    <svg
      className="pointer-events-none absolute end-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5"
      style={{ color: '#94A3B8' }}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  )
}

function ToggleFilter({ label, active, onChange }: { label: string; active: boolean; onChange: (v: boolean) => void }) {
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

export default function DestinationPage({ destinationId, navigate, currency, favorites, toggleFavorite }: DestinationPageProps) {
  const { getDestination, loading } = useCatalog()
  const { t, categoryLabel } = useI18n()
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
    if (categoryFilter) list = list.filter((e) => e.category === categoryFilter)
    if (priceFilter && PRICE_RANGES[priceFilter]) {
      const [min, max] = PRICE_RANGES[priceFilter]
      list = list.filter((e) => e.price >= min && e.price < max)
    }
    if (durationFilter) {
      list = list.filter((e) => {
        const hrs = e.durationHours ?? 0
        if (durationFilter === 'short') return hrs < 3
        if (durationFilter === 'half') return hrs >= 3 && hrs <= 6
        if (durationFilter === 'full') return hrs > 6
        return true
      })
    }
    if (ratingFilter) list = list.filter((e) => e.rating >= parseFloat(ratingFilter))
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
      case 'reviews':
        list.sort((a, b) => b.reviewCount - a.reviewCount)
        break
    }
    return list
  }, [destination, categoryFilter, priceFilter, durationFilter, ratingFilter, pickupFilter, cancellationFilter, sortBy])

  if (!destination) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p style={{ color: '#94A3B8' }}>{loading ? '…' : t('dest.notFound')}</p>
      </div>
    )
  }

  const clearAll = () => {
    setCategoryFilter('')
    setPriceFilter('')
    setDurationFilter('')
    setRatingFilter('')
    setPickupFilter(false)
    setCancellationFilter(false)
  }
  const hasFilters = categoryFilter || priceFilter || durationFilter || ratingFilter || pickupFilter || cancellationFilter
  const fp = (n: number) => formatPrice(n, currency)

  return (
    <main>
      {/* Hero */}
      <div className="relative" style={{ height: '420px', backgroundColor: '#E5E7EB' }}>
        <img src={destination.coverPhoto} alt={destination.name} className="w-full h-full object-cover" />
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.15) 60%, rgba(0,0,0,0) 100%)' }}
        />
        <div className="absolute top-6 inset-x-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <button
              onClick={() => navigate({ type: 'home' })}
              className="flex items-center gap-1.5 text-sm font-medium text-white/80 hover:text-white"
            >
              <svg className="w-4 h-4 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
              {t('dest.all')}
            </button>
          </div>
        </div>
        <div className="absolute bottom-0 inset-x-0 pb-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <h1 className="font-display font-semibold text-white mb-2" style={{ fontSize: 'clamp(36px, 5vw, 64px)', letterSpacing: '-0.03em' }}>
              {destination.name}
            </h1>
            <p className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.75)' }}>
              {t('common.experiencesAvailable', { n: destination.experiences.length })}
            </p>
          </div>
        </div>
      </div>

      {/* Search + Description */}
      <div style={{ backgroundColor: '#fff', borderBottom: '1px solid #E5E7EB' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="flex-1 w-full">
            <SearchBar navigate={navigate} defaultValue={destination.name} />
          </div>
          <p className="text-sm max-w-lg leading-relaxed" style={{ color: '#64748B' }}>
            {destination.description}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="sticky z-30" style={{ top: '64px', backgroundColor: '#F8FCFD', borderBottom: '1px solid #E5E7EB' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 overflow-x-auto">
          <div className="flex flex-wrap items-center gap-2">
            <FilterSelect
              label={t('filter.category')}
              value={categoryFilter}
              onChange={setCategoryFilter}
              options={CATEGORIES.map((c) => ({ label: categoryLabel(c), value: c }))}
            />
            <FilterSelect
              label={t('filter.price')}
              value={priceFilter}
              onChange={setPriceFilter}
              options={[
                { value: 'p1', label: t('filter.under', { p: fp(700) }) },
                { value: 'p2', label: t('filter.between', { a: fp(700), b: fp(1500) }) },
                { value: 'p3', label: t('filter.between', { a: fp(1500), b: fp(3000) }) },
                { value: 'p4', label: t('filter.over', { p: fp(3000) }) },
              ]}
            />
            <FilterSelect
              label={t('filter.duration')}
              value={durationFilter}
              onChange={setDurationFilter}
              options={[
                { value: 'short', label: t('filter.short') },
                { value: 'half', label: t('filter.half') },
                { value: 'full', label: t('filter.full') },
              ]}
            />
            <FilterSelect
              label={t('filter.rating')}
              value={ratingFilter}
              onChange={setRatingFilter}
              options={[
                { label: '4.0+', value: '4.0' },
                { label: '4.5+', value: '4.5' },
                { label: '4.8+', value: '4.8' },
              ]}
            />
            <ToggleFilter label={t('filter.pickup')} active={pickupFilter} onChange={setPickupFilter} />
            <ToggleFilter label={t('filter.freeCancel')} active={cancellationFilter} onChange={setCancellationFilter} />

            <div className="flex-1" />

            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="appearance-none ps-4 pe-8 py-2.5 rounded-xl text-sm font-medium cursor-pointer outline-none bg-white border border-[#E5E7EB] text-[#1E293B]"
                style={{ minWidth: '150px' }}
              >
                <option value="recommended">{t('sort.recommended')}</option>
                <option value="rating">{t('sort.rating')}</option>
                <option value="price_low">{t('sort.priceLow')}</option>
                <option value="price_high">{t('sort.priceHigh')}</option>
                <option value="reviews">{t('sort.reviews')}</option>
              </select>
              <Chevron />
            </div>

            {hasFilters && (
              <button onClick={clearAll} className="text-sm font-medium underline" style={{ color: '#0EA5E9' }}>
                {t('filter.clearAll')}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-lg font-medium" style={{ color: '#94A3B8' }}>
              {t('filter.noMatch')}
            </p>
            {hasFilters && (
              <button onClick={clearAll} className="mt-4 text-sm underline" style={{ color: '#0EA5E9' }}>
                {t('filter.clear')}
              </button>
            )}
          </div>
        ) : (
          <>
            <p className="text-sm mb-6" style={{ color: '#94A3B8' }}>
              {t('filter.results', { n: filtered.length, place: destination.name })}
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
