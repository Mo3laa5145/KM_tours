import { useState } from 'react'
import type { PageState, Currency } from '../data'
import { formatPrice } from '../lib/currency'
import ExperienceCard from '../components/ExperienceCard'
import BookingForm from '../components/BookingForm'
import PhotoGallery from '../components/PhotoGallery'
import ReviewsList from '../components/ReviewsList'
import { useCatalog } from '../lib/catalogContext'
import { useI18n } from '../lib/i18n'

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
        className="w-full flex items-center justify-between py-4 text-start"
        onClick={() => setOpen(!open)}
      >
        <span className="font-medium text-sm pe-4" style={{ color: '#1E293B' }}>{question}</span>
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

export default function ExperiencePage({
  destinationId,
  experienceId,
  navigate,
  currency,
  favorites,
  toggleFavorite,
}: ExperiencePageProps) {
  const { getExperience, getDestination, allExperiences, hasTranslation, loading } = useCatalog()
  const { t, lang, categoryLabel, tourLanguageLabel } = useI18n()
  const experience = getExperience(destinationId, experienceId)
  const destination = getDestination(destinationId)

  if (!experience || !destination) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p style={{ color: '#94A3B8' }}>{loading ? '…' : t('exp.notFound')}</p>
      </div>
    )
  }

  const related = allExperiences
    .filter((e) => e.id !== experienceId && (e.destinationId === destinationId || e.category === experience.category))
    .slice(0, 3)

  const isFav = favorites.has(experienceId)

  return (
    <main style={{ backgroundColor: '#F8FCFD' }} className="pb-20 lg:pb-0">
      {/* Breadcrumb */}
      <div style={{ backgroundColor: '#fff', borderBottom: '1px solid #E5E7EB' }}>
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center gap-2 text-sm" style={{ color: '#94A3B8' }}>
          <button onClick={() => navigate({ type: 'home' })} className="hover:text-slate-600 transition-colors">
            {t('exp.home')}
          </button>
          <svg className="w-3 h-3 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
          <button
            onClick={() => navigate({ type: 'destination', id: destinationId })}
            className="hover:text-slate-600 transition-colors"
          >
            {destination.name}
          </button>
          <svg className="w-3 h-3 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
          <span style={{ color: '#1E293B' }} className="line-clamp-2">
            {experience.title}
          </span>
        </div>
      </div>

      {/* Gallery */}
      <div style={{ backgroundColor: '#fff' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <PhotoGallery photos={experience.photos} title={experience.title} />
        </div>
      </div>

      {/* Content + Sidebar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid gap-10 grid-cols-1 lg:grid-cols-[1fr_380px] items-start">
          {/* Left: main content */}
          <div className="min-w-0">
            {/* Title area */}
            <div className="mb-8" style={{ backgroundColor: '#fff', borderRadius: '20px', padding: '28px' }}>
              <div className="text-xs font-medium mb-2" style={{ color: '#0EA5E9' }}>
                {categoryLabel(experience.category)}
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
                    ({t('exp.reviewsCount', { n: experience.reviewCount.toLocaleString('en') })})
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
                    label: t('exp.duration'),
                    value: experience.duration,
                  },
                  {
                    icon: (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 21l5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 016-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C11.176 10.658 7.69 15.08 3 17.502m9.334-12.138c.896.061 1.785.147 2.666.257m-4.589 8.495a18.023 18.023 0 01-3.827-5.802" />
                      </svg>
                    ),
                    label: t('exp.languages'),
                    value: experience.languages.map(tourLanguageLabel).join(lang === 'ar' ? '، ' : ', '),
                  },
                  {
                    icon: (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                      </svg>
                    ),
                    label: t('exp.pickup'),
                    value: experience.pickupAvailable ? t('exp.included') : t('exp.notIncludedShort'),
                  },
                  {
                    icon: (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
                      </svg>
                    ),
                    label: t('exp.cancellation'),
                    value: experience.freeCancellation ? t('exp.freeCancel') : t('exp.nonRefundable'),
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
                  <div className="text-xs" style={{ color: '#94A3B8' }}>{t('exp.hostedBy')}</div>
                  <div className="text-sm font-semibold" style={{ color: '#1E293B' }}>{experience.provider}</div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="rounded-2xl p-7" style={{ backgroundColor: '#fff', marginBottom: '16px' }}>
              {!hasTranslation(experience.id) && (
                <p className="text-xs mb-4 rounded-lg px-3 py-2 bg-[#F0F9FF] text-[#0369A1]">{t('exp.translationNote')}</p>
              )}
              <Section title={t('exp.about')}>
                <p className="text-sm leading-relaxed" style={{ color: '#64748B' }}>
                  {experience.description}
                </p>
              </Section>

              {/* Highlights */}
              <Section title={t('exp.highlights')}>
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
              <Section title={t('exp.itinerary')}>
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
                    {t('exp.whatsIncluded')}
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
                    {t('exp.notIncluded')}
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
              <Section title={t('exp.meetingPoint')}>
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 shrink-0 mt-0.5" style={{ color: '#0EA5E9' }} fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-2.003 3.5-4.697 3.5-8.327a8 8 0 10-16 0c0 3.63 1.556 6.326 3.5 8.327a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                  </svg>
                  <p className="text-sm leading-relaxed" style={{ color: '#64748B' }}>
                    {experience.meetingPoint}
                  </p>
                </div>
              </Section>

              <Section title={t('exp.whatToBring')}>
                <ul className="space-y-2">
                  {experience.whatToBring.map((item, i) => (
                    <li key={i} className="flex items-center gap-2.5">
                      <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: '#0EA5E9' }} />
                      <span className="text-sm" style={{ color: '#1E293B' }}>{item}</span>
                    </li>
                  ))}
                </ul>
              </Section>

              <Section title={t('exp.cancelPolicy')}>
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
                  {t('exp.faq')}
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
                  {t('exp.reviews')}
                </h2>
                <div className="flex items-center gap-3">
                  <div className="text-end">
                    <div className="font-display font-bold" style={{ fontSize: '40px', color: '#1E293B', letterSpacing: '-0.04em', lineHeight: 1 }}>
                      {experience.rating.toFixed(1)}
                    </div>
                    <div className="text-xs mt-1" style={{ color: '#94A3B8' }}>
                      {t('exp.reviewsCount', { n: experience.reviewCount.toLocaleString('en') })}
                    </div>
                  </div>
                  <Stars rating={experience.rating} size="lg" />
                </div>
              </div>

              <ReviewsList key={experience.id} experienceId={experience.id} fallback={experience.reviews} />
            </div>

            {/* Related */}
            {related.length > 0 && (
              <div className="mb-8">
                <h2 className="font-display font-semibold mb-5" style={{ fontSize: '24px', color: '#1E293B', letterSpacing: '-0.02em' }}>
                  {t('exp.related')}
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
          <div className="lg:sticky scroll-mt-20" style={{ top: '88px' }} id="book">
            <BookingForm
              key={experience.id}
              experience={experience}
              currency={currency}
              isFavorited={isFav}
              onToggleFavorite={() => toggleFavorite(experienceId)}
            />
          </div>
        </div>
      </div>
      {/* Mobile booking bar */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-[#E5E7EB] px-4 py-3 flex items-center justify-between gap-3">
        <div>
          <div className="text-xs text-[#94A3B8]">{t('card.from')}</div>
          <div className="font-bold text-[#1E293B]">{formatPrice(experience.price, currency)}</div>
        </div>
        <button
          onClick={() => document.getElementById('book')?.scrollIntoView({ behavior: 'smooth' })}
          className="px-6 py-3 rounded-xl font-semibold text-white bg-[#0EA5E9]"
        >
          {t('book.submit')}
        </button>
      </div>
    </main>
  )
}
