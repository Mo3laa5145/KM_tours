import { useCallback, useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'
import { countryName, flagEmoji } from '../lib/countries'
import { LANG_LABELS } from '../lib/translations'
import type { Lang } from '../lib/catalog'
import { Badge, Button, Empty, Field, Modal, Spinner, cx, errorText, inputCls, useUi } from './ui'

export interface Booking {
  id: string
  reference: string
  experience_id: string | null
  experience_title: string | null
  destination_id: string | null
  trip_date: string
  adults: number
  children: number
  infants: number
  full_name: string
  email: string | null
  phone: string
  whatsapp: boolean
  nationality: string | null
  pickup_area: string | null
  hotel: string | null
  room: string | null
  tour_language: string | null
  notes: string | null
  unit_price: number | null
  child_price: number | null
  total_price: number | null
  currency: string
  site_language: string | null
  status: Status
  admin_notes: string | null
  created_at: string
  updated_at: string
}

type Status = 'pending' | 'confirmed' | 'completed' | 'cancelled'

const STATUS: Record<Status, { label: string; color: 'amber' | 'emerald' | 'sky' | 'red' }> = {
  pending: { label: 'في الانتظار', color: 'amber' },
  confirmed: { label: 'مؤكد', color: 'emerald' },
  completed: { label: 'تم', color: 'sky' },
  cancelled: { label: 'ملغي', color: 'red' },
}

const PAGE = 200

const CONFIRM_MSG: Record<string, (b: Booking) => string> = {
  en: (b) => `Hello ${b.full_name}, your KM Tours booking ${b.reference} for "${b.experience_title}" on ${b.trip_date} (${b.adults + b.children} guests) is confirmed. See you soon!`,
  ar: (b) => `أهلاً ${b.full_name}، تم تأكيد حجزك رقم ${b.reference} لرحلة "${b.experience_title}" يوم ${b.trip_date} (${b.adults + b.children} أفراد). في انتظارك! — KM Tours`,
  fr: (b) => `Bonjour ${b.full_name}, votre réservation KM Tours ${b.reference} pour « ${b.experience_title} » le ${b.trip_date} (${b.adults + b.children} personnes) est confirmée. À bientôt !`,
  de: (b) => `Hallo ${b.full_name}, Ihre KM Tours Buchung ${b.reference} für „${b.experience_title}“ am ${b.trip_date} (${b.adults + b.children} Personen) ist bestätigt. Bis bald!`,
}

const REVIEW_MSG: Record<string, (b: Booking, link: string) => string> = {
  en: (b, link) => `Hello ${b.full_name}, thank you for travelling with KM Tours! We'd love to hear how "${b.experience_title}" was. Please leave a short review here: ${link}`,
  ar: (b, link) => `أهلاً ${b.full_name}، شكرًا لاختيارك KM Tours! يسعدنا نعرف رأيك في رحلة "${b.experience_title}". اكتب تقييمك من هنا: ${link}`,
  fr: (b, link) => `Bonjour ${b.full_name}, merci d'avoir voyagé avec KM Tours ! Votre avis sur « ${b.experience_title} » nous ferait très plaisir : ${link}`,
  de: (b, link) => `Hallo ${b.full_name}, danke, dass Sie mit KM Tours unterwegs waren! Wir freuen uns über Ihre Bewertung zu „${b.experience_title}“: ${link}`,
}

const money = (n: number | null) => (n == null ? '—' : `EGP ${Number(n).toLocaleString('en')}`)
const dt = (s: string) => new Date(s).toLocaleString('ar-EG', { dateStyle: 'medium', timeStyle: 'short' })
const day = (s: string) => new Date(s + 'T12:00:00').toLocaleDateString('ar-EG', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })

export default function Bookings({ onChange }: { onChange: () => void }) {
  const { toast } = useUi()
  const [rows, setRows] = useState<Booking[] | null>(null)
  const [hasMore, setHasMore] = useState(false)
  const [status, setStatus] = useState<Status | 'all' | 'upcoming'>('pending')
  const [q, setQ] = useState('')
  const [open, setOpen] = useState<Booking | null>(null)

  const load = useCallback(
    async (append = false) => {
      let query = supabase!.from('bookings').select('*')
      if (status === 'upcoming') {
        query = query
          .gte('trip_date', new Date().toLocaleDateString('en-CA', { timeZone: 'Africa/Cairo' }))
          .in('status', ['pending', 'confirmed'])
          .order('trip_date', { ascending: true })
      } else {
        if (status !== 'all') query = query.eq('status', status)
        query = query.order('created_at', { ascending: false })
      }
      const from = append ? (rows?.length ?? 0) : 0
      const { data, error } = await query.range(from, from + PAGE - 1)
      if (error) {
        toast(errorText(error), 'err')
        setRows([])
        return
      }
      const list = data as Booking[]
      setRows((prev) => (append ? [...(prev ?? []), ...list] : list))
      setHasMore(list.length === PAGE)
    },
    [status, rows?.length, toast],
  )

  useEffect(() => {
    setRows(null)
    void load(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status])

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase()
    if (!rows || !s) return rows ?? []
    return rows.filter((b) =>
      [b.reference, b.full_name, b.phone, b.email, b.experience_title, b.hotel].some((v) => v?.toLowerCase().includes(s)),
    )
  }, [rows, q])

  const updateRow = (b: Booking) => {
    setRows((all) => all?.map((x) => (x.id === b.id ? b : x)) ?? null)
    setOpen(b)
    onChange()
  }

  const exportCsv = () => {
    const cols: (keyof Booking)[] = [
      'reference', 'status', 'created_at', 'trip_date', 'experience_title', 'full_name', 'phone', 'whatsapp', 'email',
      'nationality', 'adults', 'children', 'total_price', 'pickup_area', 'hotel', 'room', 'tour_language', 'site_language', 'notes', 'admin_notes',
    ]
    const esc = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`
    const csv = [cols.join(','), ...filtered.map((b) => cols.map((c) => esc(c === 'nationality' ? countryName(b.nationality, 'en') : b[c])).join(','))].join('\r\n')
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `km-tours-bookings-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  const tabs: { key: typeof status; label: string }[] = [
    { key: 'pending', label: 'في الانتظار' },
    { key: 'upcoming', label: 'الرحلات القادمة' },
    { key: 'confirmed', label: 'مؤكدة' },
    { key: 'completed', label: 'تمت' },
    { key: 'cancelled', label: 'ملغية' },
    { key: 'all', label: 'الكل' },
  ]

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">الحجوزات</h1>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => load(false)}>
            تحديث
          </Button>
          <Button variant="secondary" onClick={exportCsv} disabled={!filtered.length}>
            تصدير Excel (CSV)
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-1 rounded-xl bg-white border border-slate-200 p-1 w-fit">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setStatus(t.key)}
            className={cx('px-3 py-1.5 rounded-lg text-sm font-medium', status === t.key ? 'bg-sky-500 text-white' : 'text-slate-600 hover:bg-slate-50')}
          >
            {t.label}
          </button>
        ))}
      </div>

      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="بحث بالاسم / الموبايل / رقم الحجز..." className={cx(inputCls, 'max-w-md')} />

      {!rows ? (
        <div className="py-20 flex justify-center">
          <Spinner />
        </div>
      ) : filtered.length === 0 ? (
        <Empty>لا توجد حجوزات هنا</Empty>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block rounded-2xl bg-white border border-slate-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs">
                <tr>
                  <th className="text-start font-semibold px-4 py-3">العميل</th>
                  <th className="text-start font-semibold px-4 py-3">الرحلة</th>
                  <th className="text-start font-semibold px-4 py-3">التاريخ</th>
                  <th className="text-start font-semibold px-4 py-3">الأفراد</th>
                  <th className="text-start font-semibold px-4 py-3">الإجمالي</th>
                  <th className="text-start font-semibold px-4 py-3">الحالة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((b) => (
                  <tr key={b.id} onClick={() => setOpen(b)} className="cursor-pointer hover:bg-sky-50/50">
                    <td className="px-4 py-3">
                      <div className="font-semibold">
                        {flagEmoji(b.nationality)} {b.full_name}
                      </div>
                      <div className="text-xs text-slate-400" dir="ltr" style={{ textAlign: 'right' }}>
                        {b.phone} · {b.reference}
                      </div>
                    </td>
                    <td className="px-4 py-3 max-w-[240px]">
                      <div className="truncate">{b.experience_title ?? '—'}</div>
                      <div className="text-xs text-slate-400">طُلب {dt(b.created_at)}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">{day(b.trip_date)}</td>
                    <td className="px-4 py-3">
                      {b.adults}
                      {b.children > 0 && <span className="text-slate-400"> + {b.children} طفل</span>}
                      {b.infants > 0 && <span className="text-slate-400"> + {b.infants} رضيع</span>}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap" dir="ltr" style={{ textAlign: 'right' }}>
                      {money(b.total_price)}
                    </td>
                    <td className="px-4 py-3">
                      <Badge color={STATUS[b.status].color}>{STATUS[b.status].label}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {filtered.map((b) => (
              <button key={b.id} onClick={() => setOpen(b)} className="w-full text-start rounded-2xl bg-white border border-slate-200 p-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="font-semibold">
                    {flagEmoji(b.nationality)} {b.full_name}
                  </div>
                  <Badge color={STATUS[b.status].color}>{STATUS[b.status].label}</Badge>
                </div>
                <div className="text-sm text-slate-600 mt-1 truncate">{b.experience_title}</div>
                <div className="text-xs text-slate-400 mt-1">
                  {day(b.trip_date)} · {b.adults + b.children + (b.infants ?? 0)} أفراد · {money(b.total_price)}
                </div>
              </button>
            ))}
          </div>

          {hasMore && (
            <div className="flex justify-center">
              <Button variant="secondary" onClick={() => load(true)}>
                تحميل المزيد
              </Button>
            </div>
          )}
        </>
      )}

      {open && <Detail booking={open} onClose={() => setOpen(null)} onUpdated={updateRow} onDeleted={(id) => {
        setRows((all) => all?.filter((x) => x.id !== id) ?? null)
        setOpen(null)
        onChange()
      }} />}
    </div>
  )
}

function Detail({
  booking: b,
  onClose,
  onUpdated,
  onDeleted,
}: {
  booking: Booking
  onClose: () => void
  onUpdated: (b: Booking) => void
  onDeleted: (id: string) => void
}) {
  const { toast, confirm } = useUi()
  const [notes, setNotes] = useState(b.admin_notes ?? '')
  const [busy, setBusy] = useState(false)

  const patch = async (p: Partial<Booking>) => {
    setBusy(true)
    const { data, error } = await supabase!.from('bookings').update(p).eq('id', b.id).select().single()
    setBusy(false)
    if (error) return toast(errorText(error), 'err')
    onUpdated(data as Booking)
    toast('تم التحديث ✓')
  }

  const remove = async () => {
    if (!(await confirm(`حذف الحجز ${b.reference} نهائيًا؟`))) return
    const { error } = await supabase!.from('bookings').delete().eq('id', b.id)
    if (error) return toast(errorText(error), 'err')
    toast('تم حذف الحجز')
    onDeleted(b.id)
  }

  let digits = b.phone.replace(/[^\d]/g, '').replace(/^00/, '')
  // Local Egyptian numbers (01xxxxxxxxx) → international format for WhatsApp
  if (/^01\d{9}$/.test(digits)) digits = '20' + digits.slice(1)
  const lang = (b.site_language ?? 'en') as Lang
  const waConfirm = `https://wa.me/${digits}?text=${encodeURIComponent((CONFIRM_MSG[lang] ?? CONFIRM_MSG.en)(b))}`
  const reviewLink = `${window.location.origin}${window.location.pathname}?lang=${lang}#/review/${encodeURIComponent(b.reference)}`
  const waReview = `https://wa.me/${digits}?text=${encodeURIComponent((REVIEW_MSG[lang] ?? REVIEW_MSG.en)(b, reviewLink))}`
  const tripDone = b.trip_date <= new Date().toLocaleDateString('en-CA', { timeZone: 'Africa/Cairo' })

  const Info = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div>
      <div className="text-xs text-slate-400">{label}</div>
      <div className="text-sm font-medium text-slate-800 break-words">{children || '—'}</div>
    </div>
  )

  return (
    <Modal open onClose={onClose} title={<span dir="ltr">{b.reference}</span>} wide>
      <div className="space-y-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-slate-500">الحالة:</span>
          {(Object.keys(STATUS) as Status[]).map((s) => (
            <button
              key={s}
              disabled={busy || s === b.status}
              onClick={() => patch({ status: s })}
              className={cx(
                'px-3 py-1.5 rounded-lg text-sm font-semibold border',
                s === b.status ? 'bg-slate-900 text-white border-slate-900' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50',
              )}
            >
              {STATUS[s].label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 rounded-xl bg-slate-50 p-4">
          <Info label="الرحلة">{b.experience_title}</Info>
          <Info label="تاريخ الرحلة">{day(b.trip_date)}</Info>
          <Info label="تاريخ الطلب">{dt(b.created_at)}</Info>
          <Info label="عدد الأفراد">
            {b.adults} بالغ{b.children > 0 ? ` + ${b.children} طفل` : ''}{b.infants > 0 ? ` + ${b.infants} رضيع` : ''}
          </Info>
          <Info label="الإجمالي">
            <span dir="ltr">{money(b.total_price)}</span>
          </Info>
          <Info label="لغة المرشد">{b.tour_language}</Info>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <Info label="الاسم">{b.full_name}</Info>
          <Info label="الموبايل">
            <a href={`tel:${b.phone}`} dir="ltr" className="text-sky-600">
              {b.phone}
            </a>
            {b.whatsapp && <span className="ms-1 text-emerald-600 text-xs">(واتساب)</span>}
          </Info>
          <Info label="البريد">{b.email && <a href={`mailto:${b.email}`} className="text-sky-600">{b.email}</a>}</Info>
          <Info label="الجنسية">
            {flagEmoji(b.nationality)} {countryName(b.nationality, 'ar')}
          </Info>
          <Info label="لغة الموقع">{LANG_LABELS[lang] ?? b.site_language}</Info>
          <Info label="الاستلام">{[b.pickup_area, b.hotel, b.room && `غرفة ${b.room}`].filter(Boolean).join(' · ')}</Info>
        </div>

        {b.notes && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
            <div className="text-xs font-semibold text-amber-700 mb-1">طلبات العميل</div>
            <p className="text-sm text-slate-700 whitespace-pre-line" dir="auto">
              {b.notes}
            </p>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {digits.length >= 7 && (
            <a href={waConfirm} target="_blank" rel="noopener noreferrer">
              <Button variant="success">واتساب: رسالة تأكيد بلغة العميل</Button>
            </a>
          )}
          {digits.length >= 7 && (
            <a href={`https://wa.me/${digits}`} target="_blank" rel="noopener noreferrer">
              <Button variant="secondary">فتح محادثة واتساب</Button>
            </a>
          )}
          {digits.length >= 7 && tripDone && (b.status === 'completed' || b.status === 'confirmed') && (
            <a href={waReview} target="_blank" rel="noopener noreferrer">
              <Button variant="secondary">⭐ واتساب: طلب تقييم</Button>
            </a>
          )}
          {tripDone && (b.status === 'completed' || b.status === 'confirmed') && (
            <Button
              variant="ghost"
              onClick={() => navigator.clipboard?.writeText(reviewLink).then(() => toast('تم نسخ لينك التقييم'))}
            >
              نسخ لينك التقييم
            </Button>
          )}
        </div>

        <Field label="ملاحظات داخلية (لا يراها العميل)">
          <textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} className={inputCls} />
        </Field>
        <div className="flex flex-wrap justify-between gap-2">
          <Button variant="danger" onClick={remove}>
            حذف الحجز
          </Button>
          <Button onClick={() => patch({ admin_notes: notes.trim() || null })} disabled={busy || notes === (b.admin_notes ?? '')}>
            حفظ الملاحظات
          </Button>
        </div>
      </div>
    </Modal>
  )
}
