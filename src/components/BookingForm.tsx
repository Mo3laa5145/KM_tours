import { useEffect, useMemo, useState } from 'react'
import type { Currency } from '../data'
import { formatPrice } from '../lib/currency'
import type { LocalizedExperience } from '../lib/catalog'
import { useI18n } from '../lib/i18n'
import { supabase } from '../lib/supabase'
import { sortedCountries } from '../lib/countries'
import { whatsappLink } from '../lib/siteConfig'
import { detectCountry } from '../lib/analytics'

interface Props {
  experience: LocalizedExperience
  currency: Currency
  isFavorited: boolean
  onToggleFavorite: () => void
}

function makeReference(): string {
  const d = new Date()
  const ymd = `${String(d.getFullYear()).slice(2)}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`
  const rand = Array.from(crypto.getRandomValues(new Uint8Array(4)))
    .map((b) => 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[b % 32])
    .join('')
  return `KM-${ymd}-${rand}`
}

function todayCairo(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Africa/Cairo' })
}

function detectedCountry(): string {
  try {
    const c = sessionStorage.getItem('km-tours-country')
    return c && c !== '-' ? c : ''
  } catch {
    return ''
  }
}

const inputCls =
  'w-full rounded-[10px] border border-[#E5E7EB] bg-white px-3.5 py-2.5 text-sm text-[#1E293B] outline-none focus:border-[#0EA5E9] focus:ring-4 focus:ring-sky-100'
const labelCls = 'block text-xs font-semibold text-[#64748B] mb-1.5 uppercase tracking-wide'

function Counter({ value, min, onChange }: { value: number; min: number; onChange: (n: number) => void }) {
  return (
    <div className="flex items-center gap-2 rounded-[10px] border border-[#E5E7EB] bg-white px-3 py-2">
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        className="w-6 h-6 rounded-full flex items-center justify-center font-bold text-lg"
        style={{ color: value <= min ? '#CBD5E1' : '#1E293B' }}
        aria-label="−"
      >
        −
      </button>
      <span className="flex-1 text-center text-sm font-semibold text-[#1E293B]">{value}</span>
      <button
        type="button"
        onClick={() => onChange(Math.min(50, value + 1))}
        className="w-6 h-6 rounded-full flex items-center justify-center font-bold text-lg text-[#0EA5E9]"
        aria-label="+"
      >
        +
      </button>
    </div>
  )
}

export default function BookingForm({ experience, currency, isFavorited, onToggleFavorite }: Props) {
  const { t, lang, tourLanguageLabel, formatDate } = useI18n()
  const countries = useMemo(() => sortedCountries(lang), [lang])

  const [date, setDate] = useState('')
  const [adults, setAdults] = useState(2)
  const [children, setChildren] = useState(0)
  const [infants, setInfants] = useState(0)
  const [blocked, setBlocked] = useState<Set<string>>(new Set())
  const [transfer, setTransfer] = useState(experience.pickupAvailable ? 'hotel' : 'none')
  const [pickupArea, setPickupArea] = useState('')
  const [hotel, setHotel] = useState('')
  const [room, setRoom] = useState('')
  const [tourLanguage, setTourLanguage] = useState(experience.languages[0] ?? 'English')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [hasWhatsapp, setHasWhatsapp] = useState(true)
  const [nationality, setNationality] = useState(detectedCountry)
  const [notes, setNotes] = useState('')
  const [consent, setConsent] = useState(false)
  const [honeypot, setHoneypot] = useState('')

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [done, setDone] = useState<{ reference: string; saved: boolean } | null>(null)

  const total = experience.price * adults + experience.childPrice * children

  // Pre-select the visitor's country (they can still change it)
  useEffect(() => {
    if (nationality) return
    let alive = true
    detectCountry().then((c) => {
      if (alive && c) setNationality((cur) => cur || c)
    })
    return () => {
      alive = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Dates closed by the admin (for this trip or for all trips)
  useEffect(() => {
    if (!supabase) return
    let alive = true
    supabase
      .from('blocked_dates')
      .select('day, experience_id')
      .gte('day', todayCairo())
      .or(`experience_id.is.null,experience_id.eq.${experience.id}`)
      .then(({ data }) => {
        if (alive && data) setBlocked(new Set((data as { day: string }[]).map((d) => d.day)))
      })
    return () => {
      alive = false
    }
  }, [experience.id])

  const dateBlocked = !!date && blocked.has(date)
  const guestsTotal = adults + children + infants

  const validate = () => {
    const e: Record<string, string> = {}
    if (!date) e.date = t('book.err.date')
    else if (dateBlocked) e.date = t('book.err.blocked')
    if (fullName.trim().length < 2) e.name = t('book.err.name')
    if (phone.replace(/[^\d]/g, '').length < 7) e.phone = t('book.err.phone')
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) e.email = t('book.err.email')
    if (!nationality) e.nationality = t('book.err.nationality')
    if (!consent) e.consent = t('book.err.consent')
    if (experience.maxGuests && guestsTotal > experience.maxGuests)
      e.guests = t('book.err.maxGuests', { n: experience.maxGuests })
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault()
    setSubmitError('')
    if (!validate()) return
    if (honeypot) {
      // Bot filled the hidden field — pretend success without saving.
      setDone({ reference: makeReference(), saved: false })
      return
    }
    if (!supabase) {
      setDone({ reference: makeReference(), saved: false })
      return
    }
    setSubmitting(true)
    try {
      for (let attempt = 0; attempt < 2; attempt++) {
        const reference = makeReference()
        const { error } = await supabase.from('bookings').insert({
          reference,
          experience_id: experience.id,
          trip_date: date,
          adults,
          children: experience.childrenAllowed ? children : 0,
          infants: experience.infantsAllowed ? infants : 0,
          full_name: fullName.trim(),
          email: email.trim() || null,
          phone: phone.trim(),
          whatsapp: hasWhatsapp,
          nationality,
          pickup_area: transfer === 'hotel' ? pickupArea.trim() || null : null,
          hotel: transfer === 'hotel' ? hotel.trim() || null : null,
          room: transfer === 'hotel' ? room.trim() || null : null,
          tour_language: tourLanguage,
          notes: notes.trim() || null,
          site_language: lang,
        })
        if (!error) {
          setDone({ reference, saved: true })
          return
        }
        if (error.code !== '23505') throw error // retry only on duplicate reference
      }
      throw new Error('duplicate reference')
    } catch (err) {
      console.error('[KM Tours] booking failed', err)
      const msg = (err as { message?: string })?.message ?? ''
      if (/Date not available/i.test(msg)) {
        setBlocked((b) => new Set(b).add(date))
        setErrors((e) => ({ ...e, date: t('book.err.blocked') }))
      } else if (/Too many guests/i.test(msg) && experience.maxGuests) {
        setSubmitError(t('book.err.maxGuests', { n: experience.maxGuests }))
      } else {
        setSubmitError(t('book.err.generic'))
      }
    } finally {
      setSubmitting(false)
    }
  }

  const card = 'rounded-2xl bg-white border border-[#E5E7EB] shadow-[0_4px_24px_rgba(0,0,0,0.08)]'

  if (done) {
    const wa = whatsappLink(`${experience.title} — ${t('book.reference')}: ${done.reference}`)
    return (
      <div className={`${card} p-6 text-center`}>
        <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 bg-[#F0FDF4]">
          <svg className="w-7 h-7 text-[#059669]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>
        <h3 className="font-display font-semibold text-lg mb-2 text-[#1E293B]">{t('book.successTitle')}</h3>
        <p className="text-sm mb-4 text-[#64748B]">{t('book.successText', { name: fullName.trim().split(' ')[0] })}</p>
        <div className="rounded-xl p-4 text-sm text-start mb-4 bg-[#F8FCFD] border border-[#E5E7EB] space-y-2">
          <Row label={t('book.reference')} value={<span dir="ltr" className="font-mono">{done.reference}</span>} />
          <Row label={t('book.date')} value={formatDate(date)} />
          <Row label={t('book.guests')} value={String(guestsTotal)} />
          <Row label={t('book.total')} value={<span className="text-[#0EA5E9] font-semibold">{formatPrice(total, currency)}</span>} />
        </div>
        {!done.saved && <p className="text-xs mb-4 text-[#B45309] bg-[#FFFBEB] rounded-lg p-2">{t('book.demoNote')}</p>}
        {wa && (
          <a
            href={wa}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full py-3 rounded-xl font-semibold text-white mb-3"
            style={{ backgroundColor: '#25D366' }}
          >
            WhatsApp
          </a>
        )}
        <button
          onClick={() => {
            setDone(null)
            setConsent(false)
          }}
          className="text-sm underline text-[#94A3B8]"
        >
          {t('book.another')}
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={submit} className={card} noValidate>
      <div className="p-5 pb-4 border-b border-[#F1F5F9] flex items-start justify-between">
        <div>
          <div className="text-xs mb-1 text-[#94A3B8]">{t('card.from')}</div>
          <div className="font-display font-bold text-[28px] text-[#1E293B]" style={{ letterSpacing: '-0.03em' }}>
            {formatPrice(experience.price, currency)}
          </div>
          <div className="text-xs text-[#94A3B8]">{t('card.perPerson')}</div>
        </div>
        <button
          type="button"
          onClick={onToggleFavorite}
          className="p-2 rounded-xl transition-colors"
          style={{ backgroundColor: isFavorited ? '#FFF7F4' : '#F8FCFD' }}
          aria-label={t('nav.saved')}
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

      <div className="p-5 flex flex-col gap-4">
        <div className="font-semibold text-[#1E293B]">{t('book.title')}</div>

        <Field label={t('book.date')} error={errors.date || (dateBlocked ? t('book.err.blocked') : undefined)}>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className={`${inputCls} ${dateBlocked ? '!border-red-400' : ''}`}
            min={todayCairo()}
            required
          />
        </Field>

        <div className={`grid gap-3 ${experience.childrenAllowed ? 'grid-cols-2' : 'grid-cols-1'}`}>
          <Field label={t('book.adults')}>
            <Counter value={adults} min={1} onChange={setAdults} />
          </Field>
          {experience.childrenAllowed && (
            <Field label={t('book.children')} hint={t('book.childrenAges', { a: experience.childMinAge, b: experience.childMaxAge })}>
              <Counter value={children} min={0} onChange={setChildren} />
            </Field>
          )}
        </div>
        {experience.infantsAllowed && experience.childMinAge > 0 && (
          <Field label={t('book.infants')} hint={t('book.infantsHint', { n: experience.childMinAge })}>
            <Counter value={infants} min={0} onChange={setInfants} />
          </Field>
        )}
        {errors.guests && <p className="text-xs text-red-500 -mt-2">{errors.guests}</p>}

        {experience.pickupAvailable && (
          <Field label={t('book.transfer')}>
            <select value={transfer} onChange={(e) => setTransfer(e.target.value)} className={inputCls}>
              <option value="hotel">{t('book.hotelPickup')}</option>
              <option value="none">{t('book.noTransfer')}</option>
            </select>
          </Field>
        )}

        {transfer === 'hotel' && experience.pickupAvailable && (
          <>
            <Field label={t('book.pickupArea')}>
              <input value={pickupArea} onChange={(e) => setPickupArea(e.target.value)} placeholder={t('book.pickupAreaPh')} className={inputCls} />
            </Field>
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <Field label={t('book.hotel')}>
                  <input value={hotel} onChange={(e) => setHotel(e.target.value)} className={inputCls} />
                </Field>
              </div>
              <Field label={t('book.room')}>
                <input value={room} onChange={(e) => setRoom(e.target.value)} className={inputCls} />
              </Field>
            </div>
          </>
        )}

        {experience.languages.length > 0 && (
          <Field label={t('book.tourLanguage')}>
            <select value={tourLanguage} onChange={(e) => setTourLanguage(e.target.value)} className={inputCls}>
              {experience.languages.map((l) => (
                <option key={l} value={l}>
                  {tourLanguageLabel(l)}
                </option>
              ))}
            </select>
          </Field>
        )}

        <div className="pt-2 border-t border-[#F1F5F9] font-semibold text-[#1E293B]">{t('book.yourDetails')}</div>

        <Field label={t('book.fullName')} error={errors.name}>
          <input value={fullName} onChange={(e) => setFullName(e.target.value)} autoComplete="name" className={inputCls} maxLength={120} />
        </Field>

        <Field label={t('book.phone')} error={errors.phone}>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder={t('book.phonePh')}
            autoComplete="tel"
            dir="ltr"
            className={inputCls}
            maxLength={40}
          />
          <label className="flex items-center gap-2 mt-2 text-sm text-[#64748B] cursor-pointer">
            <input type="checkbox" checked={hasWhatsapp} onChange={(e) => setHasWhatsapp(e.target.checked)} className="accent-[#25D366]" />
            {t('book.whatsapp')}
          </label>
        </Field>

        <Field label={t('book.email')} error={errors.email}>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" dir="ltr" className={inputCls} maxLength={200} />
        </Field>

        <Field label={t('book.nationality')} error={errors.nationality}>
          <select value={nationality} onChange={(e) => setNationality(e.target.value)} className={inputCls}>
            <option value="">{t('book.selectCountry')}</option>
            {countries.map((c) => (
              <option key={c.code} value={c.code}>
                {c.name}
              </option>
            ))}
          </select>
        </Field>

        <Field label={t('book.requests')}>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={t('book.requestsPh')}
            rows={2}
            maxLength={2000}
            className={`${inputCls} resize-none`}
          />
        </Field>

        {/* Hidden field to catch spam bots */}
        <input
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
          className="hidden"
          aria-hidden="true"
          name="website"
        />

        <div className="rounded-xl p-4 text-sm bg-[#F8FCFD] border border-[#E5E7EB]">
          <div className="flex justify-between mb-2">
            <span className="text-[#64748B]">{t('book.adultLine', { n: adults, p: formatPrice(experience.price, currency) })}</span>
            <span className="text-[#1E293B]">{formatPrice(experience.price * adults, currency)}</span>
          </div>
          {children > 0 && (
            <div className="flex justify-between mb-2">
              <span className="text-[#64748B]">{t('book.childLine', { n: children, p: formatPrice(experience.childPrice, currency) })}</span>
              <span className="text-[#1E293B]">{formatPrice(experience.childPrice * children, currency)}</span>
            </div>
          )}
          {infants > 0 && (
            <div className="flex justify-between mb-2">
              <span className="text-[#64748B]">{t('book.infantLine', { n: infants })}</span>
              <span className="text-[#059669]">{t('book.free')}</span>
            </div>
          )}
          <div className="flex justify-between pt-2 font-semibold border-t border-[#E5E7EB]">
            <span className="text-[#1E293B]">{t('book.total')}</span>
            <span className="text-[#0EA5E9]">{formatPrice(total, currency)}</span>
          </div>
        </div>

        <div>
          <label className="flex items-start gap-2 text-xs text-[#64748B] cursor-pointer">
            <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5 accent-[#0EA5E9]" />
            <span>{t('book.consent')}</span>
          </label>
          {errors.consent && <p className="text-xs text-red-500 mt-1">{errors.consent}</p>}
        </div>

        {submitError && <p className="text-sm text-red-600 bg-red-50 rounded-lg p-3">{submitError}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-4 rounded-xl font-semibold text-white transition-colors bg-[#0EA5E9] hover:bg-[#0369A1] disabled:opacity-60"
          style={{ fontSize: '15px' }}
        >
          {submitting ? t('book.submitting') : t('book.submit')}
        </button>

        <p className="text-xs text-center text-[#64748B] leading-relaxed">{t('book.noPayment')}</p>
      </div>
    </form>
  )
}

function Field({ label, hint, error, children }: { label: string; hint?: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className={labelCls}>
        {label}
        {hint && <span className="normal-case font-normal text-[#94A3B8] ms-1">({hint})</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  )
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-[#64748B]">{label}</span>
      <span className="font-medium text-[#1E293B]">{value}</span>
    </div>
  )
}
