import { useEffect, useState } from 'react'
import type { PageState } from '../data'
import { supabase } from '../lib/supabase'
import { useI18n } from '../lib/i18n'
import type { Lang } from '../lib/catalog'

interface Info {
  ok: boolean
  reason?: 'not_found' | 'already' | 'not_yet'
  experience_id?: string
  destination_id?: string
  titles?: Partial<Record<Lang, string | null>>
  photo?: string | null
  first_name?: string
  nationality?: string | null
}

export default function ReviewPage({ reference, navigate }: { reference: string; navigate: (p: PageState) => void }) {
  const { t, lang } = useI18n()
  const [info, setInfo] = useState<Info | null>(null)
  const [rating, setRating] = useState(0)
  const [hover, setHover] = useState(0)
  const [comment, setComment] = useState('')
  const [name, setName] = useState('')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (!supabase) {
      setInfo({ ok: false, reason: 'not_found' })
      return
    }
    supabase.rpc('review_booking_info', { ref: reference }).then(({ data, error }) => {
      if (error) setInfo({ ok: false, reason: 'not_found' })
      else {
        const i = data as Info
        setInfo(i)
        if (i.first_name) setName(i.first_name)
      }
    })
  }, [reference])

  const title = info?.titles ? info.titles[lang] || info.titles.en || '' : ''

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErr('')
    if (!rating) return setErr(t('rev.err.rating'))
    if (comment.trim().length < 10) return setErr(t('rev.err.comment'))
    setBusy(true)
    const { data, error } = await supabase!.rpc('submit_review', {
      ref: reference,
      p_rating: rating,
      p_comment: comment.trim(),
      p_name: name.trim(),
      p_country: info?.nationality ?? null,
      p_language: lang,
    })
    setBusy(false)
    const res = data as Info | null
    if (error || !res) return setErr(t('rev.err.generic'))
    if (!res.ok) return setErr(t(`rev.err.${res.reason ?? 'generic'}` as 'rev.err.generic'))
    setDone(true)
  }

  const card = 'max-w-xl mx-auto rounded-2xl bg-white border border-[#E5E7EB] shadow-[0_4px_24px_rgba(0,0,0,0.06)] overflow-hidden'

  return (
    <main className="px-4 py-12 min-h-[70vh]">
      {!info ? (
        <div className="flex justify-center py-20">
          <div className="w-7 h-7 border-2 border-[#E5E7EB] border-t-[#0EA5E9] rounded-full animate-spin" />
        </div>
      ) : !info.ok ? (
        <div className={`${card} p-8 text-center`}>
          <div className="text-4xl mb-3">🔎</div>
          <p className="text-[#1E293B] font-medium">{t(`rev.err.${info.reason ?? 'not_found'}` as 'rev.err.not_found')}</p>
          <p className="text-xs text-[#94A3B8] mt-2" dir="ltr">
            {reference}
          </p>
          <button onClick={() => navigate({ type: 'home' })} className="mt-6 text-sm text-[#0EA5E9] underline">
            {t('exp.home')}
          </button>
        </div>
      ) : done ? (
        <div className={`${card} p-8 text-center`}>
          <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 bg-[#F0FDF4] text-[#059669] text-2xl">✓</div>
          <p className="text-[#1E293B] font-medium">{t('rev.thanks')}</p>
          {info.experience_id && info.destination_id && (
            <button
              onClick={() => navigate({ type: 'experience', destinationId: info.destination_id!, experienceId: info.experience_id! })}
              className="mt-6 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#0EA5E9]"
            >
              {t('rev.backToTrip')}
            </button>
          )}
        </div>
      ) : (
        <form onSubmit={submit} className={card}>
          {info.photo && <img src={info.photo} alt="" className="w-full h-40 object-cover" />}
          <div className="p-6 sm:p-8 space-y-5">
            <div>
              <h1 className="font-display font-semibold text-2xl text-[#1E293B]">{t('rev.title')}</h1>
              <p className="text-sm text-[#64748B] mt-1">{t('rev.hello', { name: info.first_name ?? '', trip: title })}</p>
            </div>

            <div>
              <div className="text-xs font-semibold text-[#64748B] mb-2 uppercase tracking-wide">{t('rev.rating')}</div>
              <div className="flex gap-1" dir="ltr" onMouseLeave={() => setHover(0)}>
                {[1, 2, 3, 4, 5].map((i) => (
                  <button
                    type="button"
                    key={i}
                    onClick={() => setRating(i)}
                    onMouseEnter={() => setHover(i)}
                    className="text-4xl leading-none transition-transform hover:scale-110"
                    style={{ color: i <= (hover || rating) ? '#F59E0B' : '#E5E7EB' }}
                    aria-label={`${i}/5`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>

            <label className="block">
              <span className="block text-xs font-semibold text-[#64748B] mb-1.5 uppercase tracking-wide">{t('rev.comment')}</span>
              <textarea
                rows={5}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={t('rev.commentPh')}
                maxLength={2000}
                className="w-full rounded-[10px] border border-[#E5E7EB] px-3.5 py-2.5 text-sm outline-none focus:border-[#0EA5E9] resize-none"
              />
            </label>

            <label className="block">
              <span className="block text-xs font-semibold text-[#64748B] mb-1.5 uppercase tracking-wide">{t('rev.name')}</span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={80}
                className="w-full rounded-[10px] border border-[#E5E7EB] px-3.5 py-2.5 text-sm outline-none focus:border-[#0EA5E9]"
              />
            </label>

            {err && <p className="text-sm text-red-600 bg-red-50 rounded-lg p-3">{err}</p>}

            <button type="submit" disabled={busy} className="w-full py-3.5 rounded-xl font-semibold text-white bg-[#0EA5E9] hover:bg-[#0369A1] disabled:opacity-60">
              {busy ? t('rev.sending') : t('rev.submit')}
            </button>
          </div>
        </form>
      )}
    </main>
  )
}
