import { useEffect, useState } from 'react'
import type { Review } from '../data'
import { supabase } from '../lib/supabase'
import { useI18n } from '../lib/i18n'
import { countryName, flagEmoji } from '../lib/countries'
import { go } from '../lib/router'

interface DbReview {
  id: string
  name: string
  country: string | null
  rating: number
  comment: string
  date_label: string | null
  booking_reference: string | null
  created_at: string
}

interface ShownReview extends Review {
  verified?: boolean
}

function SmallStars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating}/5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} className="w-3.5 h-3.5" style={{ color: i <= Math.round(rating) ? '#F59E0B' : '#E5E7EB' }} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  )
}

export default function ReviewsList({ experienceId, fallback }: { experienceId: string; fallback: Review[] }) {
  const { t, lang, formatDate } = useI18n()
  const [reviews, setReviews] = useState<ShownReview[] | null>(supabase ? null : fallback)
  const [showForm, setShowForm] = useState(false)
  const [ref, setRef] = useState('')

  useEffect(() => {
    if (!supabase) return
    let alive = true
    supabase
      .from('reviews')
      .select('id, name, country, rating, comment, date_label, booking_reference, created_at')
      .eq('experience_id', experienceId)
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .limit(30)
      .then(({ data, error }) => {
        if (!alive) return
        if (error || !data) return setReviews(fallback)
        setReviews(
          (data as DbReview[]).map((r) => ({
            id: r.id,
            name: r.name,
            country: r.country ?? '',
            rating: r.rating,
            comment: r.comment,
            date: r.date_label || formatDate(r.created_at, { month: 'long', year: 'numeric' }),
            verified: !!r.booking_reference,
          })),
        )
      })
    return () => {
      alive = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [experienceId])

  const countryLabel = (c: string) => (/^[A-Z]{2}$/.test(c) ? `${flagEmoji(c)} ${countryName(c, lang)}` : c)

  return (
    <div>
      {reviews === null ? (
        <div className="space-y-4">
          {[0, 1].map((i) => (
            <div key={i} className="h-20 rounded-xl bg-[#F1F5F9] animate-pulse" />
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <p className="text-sm text-[#94A3B8]">{t('rev.none')}</p>
      ) : (
        <div className="space-y-6">
          {reviews.map((review) => (
            <div key={review.id} className="pb-6 border-b border-[#F1F5F9]">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold text-white bg-[#0369A1] shrink-0">
                  {review.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-[#1E293B] flex items-center gap-2 flex-wrap">
                    {review.name}
                    {review.verified && (
                      <span className="text-[10px] font-semibold rounded-full px-2 py-0.5 bg-[#F0FDF4] text-[#059669]">✓ {t('rev.verified')}</span>
                    )}
                  </div>
                  <div className="text-xs text-[#94A3B8]">
                    {[countryLabel(review.country), review.date].filter(Boolean).join(' · ')}
                  </div>
                </div>
                <div className="ms-auto">
                  <SmallStars rating={review.rating} />
                </div>
              </div>
              <p className="text-sm leading-relaxed text-[#64748B]" dir="auto">
                {review.comment}
              </p>
            </div>
          ))}
        </div>
      )}

      {supabase && (
        <div className="mt-6">
          {!showForm ? (
            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold border border-[#0EA5E9] text-[#0369A1] hover:bg-[#F0F9FF]"
            >
              ✎ {t('rev.write')}
            </button>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault()
                if (ref.trim()) go(`/review/${encodeURIComponent(ref.trim().toUpperCase())}`)
              }}
              className="rounded-xl border border-[#E5E7EB] bg-[#F8FCFD] p-4"
            >
              <p className="text-sm text-[#64748B] mb-3">{t('rev.haveBooking')}</p>
              <div className="flex gap-2">
                <input
                  value={ref}
                  onChange={(e) => setRef(e.target.value)}
                  placeholder={t('rev.refPh')}
                  dir="ltr"
                  className="flex-1 rounded-[10px] border border-[#E5E7EB] bg-white px-3.5 py-2.5 text-sm outline-none focus:border-[#0EA5E9]"
                />
                <button type="submit" className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#0EA5E9] hover:bg-[#0369A1]">
                  {t('rev.continue')}
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  )
}
