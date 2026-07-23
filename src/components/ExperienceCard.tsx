import type { Experience, Currency, PageState } from '../data'
import { formatPrice } from '../data'

interface ExperienceCardProps {
  experience: Experience
  currency: Currency
  navigate: (p: PageState) => void
  isFavorited?: boolean
  onToggleFavorite?: (id: string) => void
}

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => {
        const filled = i <= Math.floor(rating)
        const partial = !filled && i <= Math.ceil(rating) && rating % 1 >= 0.5
        return (
          <svg
            key={i}
            className="w-3.5 h-3.5"
            style={{ color: filled || partial ? '#F59E0B' : '#E5E7EB' }}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        )
      })}
    </div>
  )
}

export default function ExperienceCard({
  experience,
  currency,
  navigate,
  isFavorited,
  onToggleFavorite,
}: ExperienceCardProps) {
  const handleClick = () => {
    navigate({ type: 'experience', destinationId: experience.destinationId, experienceId: experience.id })
  }

  return (
    <div
      className="group flex flex-col cursor-pointer rounded-2xl overflow-hidden"
      style={{ backgroundColor: '#fff', border: '1px solid #E5E7EB', transition: 'box-shadow 0.2s, transform 0.2s' }}
      onClick={handleClick}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLElement
        el.style.boxShadow = '0 8px 32px rgba(0,0,0,0.1)'
        el.style.transform = 'translateY(-2px)'
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLElement
        el.style.boxShadow = 'none'
        el.style.transform = 'translateY(0)'
      }}
    >
      {/* Photo */}
      <div className="relative overflow-hidden" style={{ height: '220px', backgroundColor: '#E5E7EB' }}>
        <img
          src={experience.photo}
          alt={experience.title}
          className="w-full h-full object-cover"
          style={{ transition: 'transform 0.4s ease' }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.transform = 'scale(1.04)')}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.transform = 'scale(1)')}
        />
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {experience.freeCancellation && (
            <span
              className="text-xs font-medium px-2.5 py-1 rounded-full"
              style={{ backgroundColor: 'rgba(255,255,255,0.95)', color: '#059669', fontSize: '11px' }}
            >
              Free cancellation
            </span>
          )}
        </div>
        {/* Favorite button */}
        {onToggleFavorite && (
          <button
            className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-colors"
            style={{ backgroundColor: 'rgba(255,255,255,0.9)' }}
            onClick={(e) => { e.stopPropagation(); onToggleFavorite(experience.id) }}
          >
            <svg
              className="w-4 h-4"
              style={{ color: isFavorited ? '#FF7A59' : '#94A3B8' }}
              fill={isFavorited ? 'currentColor' : 'none'}
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={1.8}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
            </svg>
          </button>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4">
        {/* Category */}
        <div className="text-xs font-medium mb-2" style={{ color: '#0EA5E9' }}>
          {experience.category}
        </div>

        {/* Title */}
        <h3
          className="font-semibold leading-snug mb-3 line-clamp-2"
          style={{ fontSize: '15px', color: '#1E293B' }}
        >
          {experience.title}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-2 mb-3">
          <Stars rating={experience.rating} />
          <span className="text-sm font-semibold" style={{ color: '#1E293B' }}>
            {experience.rating.toFixed(1)}
          </span>
          <span className="text-sm" style={{ color: '#94A3B8' }}>
            ({experience.reviewCount.toLocaleString()})
          </span>
        </div>

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-3 mb-4" style={{ color: '#64748B' }}>
          <div className="flex items-center gap-1.5 text-xs">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {experience.duration}
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 21l5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 016-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C11.176 10.658 7.69 15.08 3 17.502m9.334-12.138c.896.061 1.785.147 2.666.257m-4.589 8.495a18.023 18.023 0 01-3.827-5.802" />
            </svg>
            {experience.languages.slice(0, 2).join(', ')}
            {experience.languages.length > 2 && ` +${experience.languages.length - 2}`}
          </div>
          {experience.pickupAvailable && (
            <div className="flex items-center gap-1.5 text-xs">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
              </svg>
              Pickup included
            </div>
          )}
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Price + Book */}
        <div className="flex items-center justify-between pt-3" style={{ borderTop: '1px solid #F1F5F9' }}>
          <div>
            <div className="text-xs mb-0.5" style={{ color: '#94A3B8' }}>From</div>
            <div className="font-bold text-base" style={{ color: '#1E293B' }}>
              {formatPrice(experience.price, currency)}
            </div>
            <div className="text-xs" style={{ color: '#94A3B8' }}>per person</div>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); handleClick() }}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-white transition-colors"
            style={{ backgroundColor: '#0EA5E9' }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = '#0369A1')}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = '#0EA5E9')}
          >
            View
          </button>
        </div>
      </div>
    </div>
  )
}
