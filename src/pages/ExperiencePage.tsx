import { useState } from 'react'
import type { PageState, Currency } from '../data'
import { getExperience, getDestination, formatPrice, DESTINATIONS } from '../data'
import ExperienceCard from '../components/ExperienceCard'

interface ExperiencePageProps {
  destinationId: string
  experienceId: string
  navigate: (p: PageState) => void
  currency: Currency
  favorites: Set<string>
  toggleFavorite: (id: string) => void
}

function Stars({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'lg' }) {
  const sz = size === 'lg' ? 'w-5 h-5' : 'w-3.5 h-3.5'
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} className={sz} style={{ color: i <= Math.round(rating) ? '#F59E0B' : '#E5E7EB' }} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="py-8" style={{ borderTop: '1px solid #E5E7EB' }}>
      <h2 className="font-display font-semibold mb-5" style={{ fontSize: '20px', color: '#1E293B', letterSpacing: '-0.02em' }}>
        {title}
      </h2>
      {children}
    </div>
  )
}

function Accordion({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ borderBottom: '1px solid #E5E7EB' }}>
      <button
        className="w-full flex items-center justify-between py-4 text-left"
        onClick={() => setOpen(!open)}
      >
        <span className="font-medium text-sm pr-4" style={{ color: '#1E293B' }}>{question}</span>
        <svg
          className="shrink-0 w-4 h-4 transition-transform"
          style={{ color: '#94A3B8', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="pb-4 text-sm leading-relaxed" style={{ color: '#64748B' }}>
          {answer}
        </div>
      )}
    </div>
  )
}

function BookingCard({
  price,
  currency,
  languages,
  isFavorited,
  onToggleFavorite,
}: {
  price: number
  currency: Currency
  languages: string[]
  isFavorited: boolean
  onToggleFavorite: () => void
}) {
  const [date, setDate] = useState('')
  const [adults, setAdults] = useState(2)
  const [children, setChildren] = useState(0)
  const [transfer, setTransfer] = useState('none')
  const [pickupArea, setPickupArea] = useState('')
  const [hotel, setHotel] = useState('')
  const [room, setRoom] = useState('')
  const [requests, setRequests] = useState('')
  const [language, setLanguage] = useState(languages[0] ?? 'English')
  const [payment, setPayment] = useState('cash')
  const [booked, setBooked] = useState(false)

  const totalGuests = adults + children
  const total = price * adults + price * children * 0.5

  const inputStyle = {
    width: '100%',
    border: '1px solid #E5E7EB',
    borderRadius: '10px',
    padding: '10px 14px',
    fontSize: '14px',
    color: '#1E293B',
    backgroundColor: '#fff',
    outline: 'none',
    fontFamily: 'inherit',
  }

  const labelStyle = { fontSize: '12px', fontWeight: '600', color: '#64748B', marginBottom: '6px', display: 'block', textTransform: 'uppercase' as const, letterSpacing: '0.04em' }

  if (booked) {
    return (
      <div
        className="rounded-2xl p-6 text-center"
        style={{ backgroundColor: '#fff', border: '1px solid #E5E7EB', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}
      >
        <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#F0FDF4' }}>
          <svg className="w-7 h-7" style={{ color: '#059669' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>
        <h3 className="font-display font-semibold text-lg mb-2" style={{ color: '#1E293B', letterSpacing: '-0.02em' }}>
          Booking confirmed!
        </h3>
        <p className="text-sm mb-4" style={{ color: '#64748B' }}>
          We will send your confirmation and voucher to your email within minutes.
        </p>
        <div className="rounded-xl p-4 text-sm text-left mb-4" style={{ backgroundColor: '#F8FCFD', border: '1px solid #E5E7EB' }}>
          <div className="flex justify-between mb-2">
            <span style={{ color: '#64748B' }}>Date</span>
            <span className="font-medium" style={{ color: '#1E293B' }}>{date || 'To be confirmed'}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span style={{ color: '#64748B' }}>Guests</span>
            <span className="font-medium" style={{ color: '#1E293B' }}>{totalGuests} guests</span>
          </div>
          <div className="flex justify-between">
            <span style={{ color: '#64748B' }}>Total paid</span>
            <span className="font-semibold" style={{ color: '#0EA5E9' }}>{formatPrice(total, currency)}</span>
          </div>
        </div>
        <button
          onClick={() => setBooked(false)}
          className="text-sm underline"
          style={{ color: '#94A3B8' }}
        >
          Make another booking
        </button>
      </div>
    )
  }

  return (
    <div
      className="rounded-2xl"
      style={{ backgroundColor: '#fff', border: '1px solid #E5E7EB', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}
    >
      {/* Price header */}
      <div className="p-5 pb-4" style={{ borderBottom: '1px solid #F1F5F9' }}>
        <div className="flex items-start justify-between">
          <div>
            <div className="text-xs mb-1" style={{ color: '#94A3B8' }}>From</div>
            <div className="font-display font-bold" style={{ fontSize: '28px', color: '#1E293B', letterSpacing: '-0.03em' }}>
              {formatPrice(price, currency)}
            </div>
            <div className="text-xs" style={{ color: '#94A3B8' }}>per person</div>
          </div>
          <button
            onClick={onToggleFavorite}
            className="p-2 rounded-xl transition-colors"
            style={{ backgroundColor: isFavorited ? '#FFF7F4' : '#F8FCFD' }}
          >
            <svg
              className="w-5 h-5"
              style={{ color: isFavorited ? '#FF7A59' : '#94A3B8' }}
              fill={isFavorited ? 'currentColor' : 'none'}
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={1.8}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
            </svg>
          </button>
        </div>
      </div>

      <div className="p-5 flex flex-col gap-4">
        {/* Date */}
        <div>
          <label style={labelStyle}>Select date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            style={inputStyle}
            min={new Date().toISOString().split('T')[0]}
          />
        </div>

        {/* Guests */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label style={labelStyle}>Adults</label>
            <div className="flex items-center gap-2" style={{ border: '1px solid #E5E7EB', borderRadius: '10px', padding: '8px 12px', backgroundColor: '#fff' }}>
              <button
                onClick={() => setAdults(Math.max(1, adults - 1))}
                className="w-6 h-6 rounded-full flex items-center justify-center font-bold text-lg"
                style={{ color: adults <= 1 ? '#CBD5E1' : '#1E293B' }}
              >
                −
              </button>
              <span className="flex-1 text-center text-sm font-semibold" style={{ color: '#1E293B' }}>{adults}</span>
              <button
                onClick={() => setAdults(adults + 1)}
                className="w-6 h-6 rounded-full flex items-center justify-center font-bold text-lg"
                style={{ color: '#0EA5E9' }}
              >
                +
              </button>
            </div>
          </div>
          <div>
            <label style={labelStyle}>Children</label>
            <div className="flex items-center gap-2" style={{ border: '1px solid #E5E7EB', borderRadius: '10px', padding: '8px 12px', backgroundColor: '#fff' }}>
              <button
                onClick={() => setChildren(Math.max(0, children - 1))}
                className="w-6 h-6 rounded-full flex items-center justify-center font-bold text-lg"
                style={{ color: children <= 0 ? '#CBD5E1' : '#1E293B' }}
              >
                −
              </button>
              <span className="flex-1 text-center text-sm font-semibold" style={{ color: '#1E293B' }}>{children}</span>
              <button
                onClick={() => setChildren(children + 1)}
                className="w-6 h-6 rounded-full flex items-center justify-center font-bold text-lg"
                style={{ color: '#0EA5E9' }}
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* Transfer */}
        <div>
          <label style={labelStyle}>Transfer option</label>
          <select
            value={transfer}
            onChange={(e) => setTransfer(e.target.value)}
            style={{ ...inputStyle, cursor: 'pointer' }}
          >
            <option value="none">No transfer needed</option>
            <option value="hotel">Hotel pickup (included)</option>
          </select>
        </div>

        {/* Hotel pickup fields */}
        {transfer === 'hotel' && (
          <>
            <div>
              <label style={labelStyle}>Pickup area / city</label>
              <input
                type="text"
                value={pickupArea}
                onChange={(e) => setPickupArea(e.target.value)}
                placeholder="e.g. Hurghada, Sahl Hasheesh"
                style={inputStyle}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label style={labelStyle}>Hotel name</label>
                <input
                  type="text"
                  value={hotel}
                  onChange={(e) => setHotel(e.target.value)}
                  placeholder="Hotel name"
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Room number</label>
                <input
                  type="text"
                  value={room}
                  onChange={(e) => setRoom(e.target.value)}
                  placeholder="Room no."
                  style={inputStyle}
                />
              </div>
            </div>
          </>
        )}

        {/* Language */}
        <div>
          <label style={labelStyle}>Tour language</label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            style={{ ...inputStyle, cursor: 'pointer' }}
          >
            {languages.map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
        </div>

        {/* Special requests */}
        <div>
          <label style={labelStyle}>Special requests (optional)</label>
          <textarea
            value={requests}
            onChange={(e) => setRequests(e.target.value)}
            placeholder="Dietary requirements, accessibility needs, special occasions..."
            rows={2}
            style={{ ...inputStyle, resize: 'none' }}
          />
        </div>

        {/* Payment method */}
        <div>
          <label style={labelStyle}>Payment method</label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { value: 'cash', label: 'Cash on arrival' },
              { value: 'card', label: 'Credit card' },
              { value: 'apple', label: 'Apple Pay' },
              { value: 'google', label: 'Google Pay' },
            ].map((opt) => (
              <button
                key={opt.value}
                onClick={() => setPayment(opt.value)}
                className="py-2.5 px-3 rounded-xl text-xs font-medium transition-all text-center"
                style={{
                  border: `1px solid ${payment === opt.value ? '#0EA5E9' : '#E5E7EB'}`,
                  backgroundColor: payment === opt.value ? '#F0F9FF' : '#fff',
                  color: payment === opt.value ? '#0369A1' : '#64748B',
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Price breakdown */}
        {totalGuests > 0 && (
          <div className="rounded-xl p-4 text-sm" style={{ backgroundColor: '#F8FCFD', border: '1px solid #E5E7EB' }}>
            <div className="flex justify-between mb-2">
              <span style={{ color: '#64748B' }}>{adults} adult{adults !== 1 ? 's' : ''} × {formatPrice(price, currency)}</span>
              <span style={{ color: '#1E293B' }}>{formatPrice(price * adults, currency)}</span>
            </div>
            {children > 0 && (
              <div className="flex justify-between mb-2">
                <span style={{ color: '#64748B' }}>{children} child{children !== 1 ? 'ren' : ''} × {formatPrice(price * 0.5, currency)}</span>
                <span style={{ color: '#1E293B' }}>{formatPrice(price * children * 0.5, currency)}</span>
              </div>
            )}
            <div className="flex justify-between pt-2 font-semibold" style={{ borderTop: '1px solid #E5E7EB' }}>
              <span style={{ color: '#1E293B' }}>Total</span>
              <span style={{ color: '#0EA5E9' }}>{formatPrice(total, currency)}</span>
            </div>
          </div>
        )}

        {/* Book button */}
        <button
          onClick={() => setBooked(true)}
          className="w-full py-4 rounded-xl font-semibold text-white transition-colors"
          style={{ backgroundColor: '#0EA5E9', fontSize: '15px' }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = '#0369A1')}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = '#0EA5E9')}
        >
          Book Now
        </button>

        {/* Reserve note */}
        <p className="text-xs text-center" style={{ color: '#94A3B8' }}>
          Reserve now — pay later. No credit card required today.
        </p>

        {/* Secure badge */}
        <div className="flex items-center justify-center gap-2 pt-1">
          <svg className="w-4 h-4" style={{ color: '#059669' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
          </svg>
          <span className="text-xs font-medium" style={{ color: '#059669' }}>Secure checkout — 256-bit SSL</span>
        </div>
      </div>
    </div>
  )
}

export default function ExperiencePage({
  destinationId,
  experienceId,
  navigate,
  currency,
  favorites,
  toggleFavorite,
}: ExperiencePageProps) {
  const experience = getExperience(destinationId, experienceId)
  const destination = getDestination(destinationId)
  const [activePhoto, setActivePhoto] = useState(0)

  if (!experience || !destination) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p style={{ color: '#94A3B8' }}>Experience not found.</p>
      </div>
    )
  }

  const related = DESTINATIONS.flatMap((d) => d.experiences)
    .filter((e) => e.id !== experienceId && (e.destinationId === destinationId || e.category === experience.category))
    .slice(0, 3)

  const isFav = favorites.has(experienceId)

  return (
    <main style={{ backgroundColor: '#F8FCFD' }}>
      {/* Breadcrumb */}
      <div style={{ backgroundColor: '#fff', borderBottom: '1px solid #E5E7EB' }}>
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center gap-2 text-sm" style={{ color: '#94A3B8' }}>
          <button onClick={() => navigate({ type: 'home' })} className="hover:text-slate-600 transition-colors">
            Home
          </button>
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
          <button
            onClick={() => navigate({ type: 'destination', id: destinationId })}
            className="hover:text-slate-600 transition-colors"
          >
            {destination.name}
          </button>
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
          <span style={{ color: '#1E293B' }} className="line-clamp-2">
            {experience.title}
          </span>
        </div>
      </div>

      {/* Gallery */}
      <div style={{ backgroundColor: '#fff' }}>
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="grid gap-2" style={{ gridTemplateColumns: '3fr 1fr 1fr', gridTemplateRows: '1fr 1fr', height: '480px', borderRadius: '20px', overflow: 'hidden' }}>
            {/* Main photo */}
            <div
              className="row-span-2 relative overflow-hidden cursor-pointer"
              style={{ backgroundColor: '#E5E7EB' }}
              onClick={() => {}}
            >
              <img
                src={experience.photos[activePhoto] ?? experience.photo}
                alt={experience.title}
                className="w-full h-full object-cover transition-opacity duration-300"
              />
            </div>
            {/* Thumbnails */}
            {experience.photos.slice(1, 5).map((src, i) => (
              <div
                key={i}
                className="relative overflow-hidden cursor-pointer"
                style={{ backgroundColor: '#E5E7EB', opacity: activePhoto === i + 1 ? 1 : 0.9 }}
                onClick={() => setActivePhoto(i + 1)}
              >
                <img
                  src={src}
                  alt={`${experience.title} ${i + 2}`}
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                />
                {i === 3 && experience.photos.length > 5 && (
                  <div className="absolute inset-0 flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}>
                    <span className="text-white font-semibold text-sm">+{experience.photos.length - 5} more</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content + Sidebar */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid gap-10" style={{ gridTemplateColumns: '1fr 380px', alignItems: 'start' }}>
          {/* Left: main content */}
          <div>
            {/* Title area */}
            <div className="mb-8" style={{ backgroundColor: '#fff', borderRadius: '20px', padding: '28px' }}>
              <div className="text-xs font-medium mb-2" style={{ color: '#0EA5E9' }}>
                {experience.category}
              </div>
              <h1
                className="font-display font-semibold mb-4 leading-tight"
                style={{ fontSize: 'clamp(24px, 3vw, 36px)', color: '#1E293B', letterSpacing: '-0.03em' }}
              >
                {experience.title}
              </h1>

              {/* Rating + meta row */}
              <div className="flex flex-wrap items-center gap-4 mb-5">
                <div className="flex items-center gap-2">
                  <Stars rating={experience.rating} size="lg" />
                  <span className="font-bold text-lg" style={{ color: '#1E293B' }}>
                    {experience.rating.toFixed(1)}
                  </span>
                  <span className="text-sm" style={{ color: '#94A3B8' }}>
                    ({experience.reviewCount.toLocaleString()} reviews)
                  </span>
                </div>
              </div>

              {/* Quick facts */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-5" style={{ borderTop: '1px solid #E5E7EB' }}>
                {[
                  {
                    icon: (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    ),
                    label: 'Duration',
                    value: experience.duration,
                  },
                  {
                    icon: (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 21l5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 016-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C11.176 10.658 7.69 15.08 3 17.502m9.334-12.138c.896.061 1.785.147 2.666.257m-4.589 8.495a18.023 18.023 0 01-3.827-5.802" />
                      </svg>
                    ),
                    label: 'Languages',
                    value: experience.languages.join(', '),
                  },
                  {
                    icon: (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                      </svg>
                    ),
                    label: 'Pickup',
                    value: experience.pickupAvailable ? 'Included' : 'Not included',
                  },
                  {
                    icon: (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
                      </svg>
                    ),
                    label: 'Cancellation',
                    value: experience.freeCancellation ? 'Free cancellation' : 'Non-refundable',
                  },
                ].map(({ icon, label, value }) => (
                  <div key={label} className="flex flex-col gap-1">
                    <div style={{ color: '#0EA5E9' }}>{icon}</div>
                    <div className="text-xs font-medium" style={{ color: '#94A3B8' }}>{label}</div>
                    <div className="text-sm font-medium" style={{ color: '#1E293B' }}>{value}</div>
                  </div>
                ))}
              </div>

              {/* Provider */}
              <div className="flex items-center gap-3 mt-5 pt-5" style={{ borderTop: '1px solid #E5E7EB' }}>
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-sm"
                  style={{ backgroundColor: '#0369A1' }}
                >
                  {experience.provider.charAt(0)}
                </div>
                <div>
                  <div className="text-xs" style={{ color: '#94A3B8' }}>Hosted by</div>
                  <div className="text-sm font-semibold" style={{ color: '#1E293B' }}>{experience.provider}</div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="rounded-2xl p-7" style={{ backgroundColor: '#fff', marginBottom: '16px' }}>
              <Section title="About this experience">
                <p className="text-sm leading-relaxed" style={{ color: '#64748B' }}>
                  {experience.description}
                </p>
              </Section>

              {/* Highlights */}
              <Section title="Highlights">
                <ul className="space-y-2.5">
                  {experience.highlights.map((h, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div
                        className="mt-0.5 w-5 h-5 rounded-full shrink-0 flex items-center justify-center"
                        style={{ backgroundColor: '#F0F9FF' }}
                      >
                        <svg className="w-3 h-3" style={{ color: '#0EA5E9' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                      </div>
                      <span className="text-sm leading-relaxed" style={{ color: '#1E293B' }}>{h}</span>
                    </li>
                  ))}
                </ul>
              </Section>

              {/* Itinerary */}
              <Section title="Itinerary">
                <div className="space-y-0">
                  {experience.itinerary.map((step, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold"
                          style={{ backgroundColor: '#F0F9FF', color: '#0EA5E9' }}
                        >
                          {i + 1}
                        </div>
                        {i < experience.itinerary.length - 1 && (
                          <div className="w-px flex-1 my-1" style={{ backgroundColor: '#E5E7EB', minHeight: '24px' }} />
                        )}
                      </div>
                      <div className="pb-5">
                        <div className="text-xs font-semibold mb-1" style={{ color: '#94A3B8' }}>{step.time}</div>
                        <div className="text-sm" style={{ color: '#1E293B' }}>{step.activity}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </Section>
            </div>

            {/* Included / Excluded */}
            <div className="rounded-2xl p-7 mb-4" style={{ backgroundColor: '#fff' }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h2 className="font-display font-semibold mb-4" style={{ fontSize: '18px', color: '#1E293B', letterSpacing: '-0.02em' }}>
                    What's included
                  </h2>
                  <ul className="space-y-2.5">
                    {experience.included.map((item, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <svg className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#059669' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                        <span className="text-sm" style={{ color: '#1E293B' }}>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h2 className="font-display font-semibold mb-4" style={{ fontSize: '18px', color: '#1E293B', letterSpacing: '-0.02em' }}>
                    Not included
                  </h2>
                  <ul className="space-y-2.5">
                    {experience.excluded.map((item, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <svg className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#EF4444' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        <span className="text-sm" style={{ color: '#64748B' }}>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Meeting Point + What to Bring */}
            <div className="rounded-2xl p-7 mb-4" style={{ backgroundColor: '#fff' }}>
              <Section title="Meeting point">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 shrink-0 mt-0.5" style={{ color: '#0EA5E9' }} fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-2.003 3.5-4.697 3.5-8.327a8 8 0 10-16 0c0 3.63 1.556 6.326 3.5 8.327a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                  </svg>
                  <p className="text-sm leading-relaxed" style={{ color: '#64748B' }}>
                    {experience.meetingPoint}
                  </p>
                </div>
              </Section>

              <Section title="What to bring">
                <ul className="space-y-2">
                  {experience.whatToBring.map((item, i) => (
                    <li key={i} className="flex items-center gap-2.5">
                      <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: '#0EA5E9' }} />
                      <span className="text-sm" style={{ color: '#1E293B' }}>{item}</span>
                    </li>
                  ))}
                </ul>
              </Section>

              <Section title="Cancellation policy">
                <div className="rounded-xl p-4 flex items-start gap-3" style={{ backgroundColor: '#F0FDF4', border: '1px solid #D1FAE5' }}>
                  <svg className="w-5 h-5 shrink-0 mt-0.5" style={{ color: '#059669' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                  </svg>
                  <p className="text-sm leading-relaxed" style={{ color: '#065F46' }}>
                    {experience.cancellationPolicy}
                  </p>
                </div>
              </Section>
            </div>

            {/* FAQ */}
            {experience.faq.length > 0 && (
              <div className="rounded-2xl p-7 mb-4" style={{ backgroundColor: '#fff' }}>
                <h2 className="font-display font-semibold mb-4" style={{ fontSize: '20px', color: '#1E293B', letterSpacing: '-0.02em' }}>
                  Frequently asked questions
                </h2>
                <div>
                  {experience.faq.map((item, i) => (
                    <Accordion key={i} question={item.question} answer={item.answer} />
                  ))}
                </div>
              </div>
            )}

            {/* Reviews */}
            <div className="rounded-2xl p-7 mb-8" style={{ backgroundColor: '#fff' }}>
              <div className="flex items-start justify-between mb-6">
                <h2 className="font-display font-semibold" style={{ fontSize: '20px', color: '#1E293B', letterSpacing: '-0.02em' }}>
                  Guest reviews
                </h2>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="font-display font-bold" style={{ fontSize: '40px', color: '#1E293B', letterSpacing: '-0.04em', lineHeight: 1 }}>
                      {experience.rating.toFixed(1)}
                    </div>
                    <div className="text-xs mt-1" style={{ color: '#94A3B8' }}>
                      {experience.reviewCount.toLocaleString()} reviews
                    </div>
                  </div>
                  <Stars rating={experience.rating} size="lg" />
                </div>
              </div>

              <div className="space-y-6">
                {experience.reviews.map((review) => (
                  <div key={review.id} className="pb-6" style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <div className="flex items-center gap-3 mb-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold text-white"
                        style={{ backgroundColor: '#0369A1' }}
                      >
                        {review.name.charAt(0)}
                      </div>
                      <div>
                        <div className="text-sm font-semibold" style={{ color: '#1E293B' }}>{review.name}</div>
                        <div className="text-xs" style={{ color: '#94A3B8' }}>{review.country} · {review.date}</div>
                      </div>
                      <div className="ml-auto">
                        <Stars rating={review.rating} />
                      </div>
                    </div>
                    <p className="text-sm leading-relaxed" style={{ color: '#64748B' }}>
                      {review.comment}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Related */}
            {related.length > 0 && (
              <div className="mb-8">
                <h2 className="font-display font-semibold mb-5" style={{ fontSize: '24px', color: '#1E293B', letterSpacing: '-0.02em' }}>
                  You might also like
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {related.map((exp) => (
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
            )}
          </div>

          {/* Right: sticky booking card */}
          <div className="sticky" style={{ top: '88px' }}>
            <BookingCard
              price={experience.price}
              currency={currency}
              languages={experience.languages}
              isFavorited={isFav}
              onToggleFavorite={() => toggleFavorite(experienceId)}
            />
          </div>
        </div>
      </div>
    </main>
  )
}
