import { useCallback, useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'
import { fetchCatalog } from '../lib/catalogContext'
import type { TripRecord } from '../lib/catalog'
import { countryName, flagEmoji, sortedCountries } from '../lib/countries'
import { LANG_LABELS } from '../lib/translations'
import type { Lang } from '../lib/catalog'
import { Badge, Button, Empty, Field, Modal, Spinner, cx, errorText, inputCls, useUi } from './ui'

interface Row {
  id: string
  experience_id: string
  booking_reference: string | null
  name: string
  country: string | null
  rating: number
  comment: string
  language: string | null
  date_label: string | null
  status: 'pending' | 'approved' | 'rejected'
  source: 'customer' | 'admin' | 'imported'
  created_at: string
}

const STATUS = {
  pending: { label: 'في الانتظار', color: 'amber' as const },
  approved: { label: 'منشور', color: 'emerald' as const },
  rejected: { label: 'مرفوض', color: 'red' as const },
}

const SOURCE: Record<Row['source'], string> = { customer: 'من عميل', admin: 'أضافه الأدمن', imported: 'قديم' }

export default function Reviews({ onChange }: { onChange: () => void }) {
  const { toast, confirm } = useUi()
  const [rows, setRows] = useState<Row[] | null>(null)
  const [trips, setTrips] = useState<TripRecord[]>([])
  const [tab, setTab] = useState<Row['status']>('pending')
  const [trip, setTrip] = useState('')
  const [adding, setAdding] = useState(false)

  const load = useCallback(async () => {
    let q = supabase!.from('reviews').select('*').eq('status', tab).order('created_at', { ascending: false }).limit(300)
    if (trip) q = q.eq('experience_id', trip)
    const { data, error } = await q
    if (error) {
      toast(errorText(error), 'err')
      setRows([])
    } else setRows(data as Row[])
  }, [tab, trip, toast])

  useEffect(() => {
    setRows(null)
    void load()
  }, [load])

  useEffect(() => {
    fetchCatalog(true)
      .then((c) => setTrips(c.trips))
      .catch(() => {})
  }, [])

  const titleOf = useMemo(() => {
    const m = new Map(trips.map((t) => [t.id, t.content.ar?.title || t.content.en?.title || t.id]))
    return (id: string) => m.get(id) ?? id
  }, [trips])

  const setStatus = async (r: Row, status: Row['status']) => {
    const { error } = await supabase!.from('reviews').update({ status }).eq('id', r.id)
    if (error) return toast(errorText(error), 'err')
    toast(status === 'approved' ? 'تم نشر التقييم ✓' : 'تم رفض التقييم')
    setRows((all) => all?.filter((x) => x.id !== r.id) ?? null)
    onChange()
  }

  const remove = async (r: Row) => {
    if (!(await confirm(`حذف تقييم "${r.name}" نهائيًا؟`))) return
    const { error } = await supabase!.from('reviews').delete().eq('id', r.id)
    if (error) return toast(errorText(error), 'err')
    toast('تم الحذف')
    setRows((all) => all?.filter((x) => x.id !== r.id) ?? null)
    onChange()
  }

  const countryLabel = (c: string | null) => (c && /^[A-Z]{2}$/.test(c) ? `${flagEmoji(c)} ${countryName(c, 'ar')}` : c ?? '')

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">التقييمات</h1>
        <Button onClick={() => setAdding(true)}>+ إضافة تقييم</Button>
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        <div className="flex gap-1 rounded-xl bg-white border border-slate-200 p-1">
          {(Object.keys(STATUS) as Row['status'][]).map((s) => (
            <button
              key={s}
              onClick={() => setTab(s)}
              className={cx('px-3 py-1.5 rounded-lg text-sm font-medium', tab === s ? 'bg-sky-500 text-white' : 'text-slate-600 hover:bg-slate-50')}
            >
              {STATUS[s].label}
            </button>
          ))}
        </div>
        <select value={trip} onChange={(e) => setTrip(e.target.value)} className={cx(inputCls, 'max-w-xs')}>
          <option value="">كل الرحلات</option>
          {trips.map((t) => (
            <option key={t.id} value={t.id}>
              {titleOf(t.id)}
            </option>
          ))}
        </select>
      </div>

      {!rows ? (
        <div className="py-20 flex justify-center">
          <Spinner />
        </div>
      ) : rows.length === 0 ? (
        <Empty>لا توجد تقييمات هنا</Empty>
      ) : (
        <div className="space-y-3">
          {rows.map((r) => (
            <div key={r.id} className="rounded-2xl bg-white border border-slate-200 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-semibold flex flex-wrap items-center gap-2">
                    {r.name}
                    <span className="text-amber-500 tracking-tight" dir="ltr">
                      {'★'.repeat(r.rating)}
                      <span className="text-slate-200">{'★'.repeat(5 - r.rating)}</span>
                    </span>
                    <Badge color={STATUS[r.status].color}>{STATUS[r.status].label}</Badge>
                    <Badge>{SOURCE[r.source]}</Badge>
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    {titleOf(r.experience_id)}
                    {r.country ? ` · ${countryLabel(r.country)}` : ''}
                    {r.language ? ` · ${LANG_LABELS[r.language as Lang] ?? r.language}` : ''}
                    {' · '}
                    {r.date_label || new Date(r.created_at).toLocaleDateString('ar-EG')}
                    {r.booking_reference && (
                      <span dir="ltr" className="ms-1">
                        · {r.booking_reference}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-1">
                  {r.status !== 'approved' && (
                    <Button size="sm" variant="success" onClick={() => setStatus(r, 'approved')}>
                      نشر
                    </Button>
                  )}
                  {r.status !== 'rejected' && (
                    <Button size="sm" variant="secondary" onClick={() => setStatus(r, 'rejected')}>
                      {r.status === 'approved' ? 'إخفاء' : 'رفض'}
                    </Button>
                  )}
                  <Button size="sm" variant="danger" onClick={() => remove(r)}>
                    حذف
                  </Button>
                </div>
              </div>
              <p className="text-sm text-slate-700 mt-3 whitespace-pre-line" dir="auto">
                {r.comment}
              </p>
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-slate-400">
        التقييم المنشور بيتحسب تلقائيًا في متوسط تقييم الرحلة وعدد التقييمات. العميل بيكتب التقييم من لينك بنبعته له من صفحة الحجز.
      </p>

      {adding && (
        <AddReview
          trips={trips}
          titleOf={titleOf}
          onClose={() => setAdding(false)}
          onSaved={() => {
            setAdding(false)
            setTab('approved')
            void load()
            onChange()
          }}
        />
      )}
    </div>
  )
}

function AddReview({
  trips,
  titleOf,
  onClose,
  onSaved,
}: {
  trips: TripRecord[]
  titleOf: (id: string) => string
  onClose: () => void
  onSaved: () => void
}) {
  const { toast } = useUi()
  const countries = useMemo(() => sortedCountries('ar'), [])
  const [f, setF] = useState({ experience_id: trips[0]?.id ?? '', name: '', country: '', rating: 5, comment: '', date_label: '' })
  const [busy, setBusy] = useState(false)

  const save = async () => {
    if (!f.experience_id || !f.name.trim() || f.comment.trim().length < 3) return toast('اكمل الرحلة والاسم ونص التقييم', 'err')
    setBusy(true)
    const { error } = await supabase!.from('reviews').insert({
      experience_id: f.experience_id,
      name: f.name.trim(),
      country: f.country || null,
      rating: f.rating,
      comment: f.comment.trim(),
      date_label: f.date_label.trim() || null,
      status: 'approved',
      source: 'admin',
    })
    setBusy(false)
    if (error) return toast(errorText(error), 'err')
    toast('تمت إضافة التقييم ✓')
    onSaved()
  }

  return (
    <Modal open onClose={onClose} title="إضافة تقييم" wide>
      <div className="space-y-4">
        <Field label="الرحلة">
          <select value={f.experience_id} onChange={(e) => setF({ ...f, experience_id: e.target.value })} className={inputCls}>
            {trips.map((t) => (
              <option key={t.id} value={t.id}>
                {titleOf(t.id)}
              </option>
            ))}
          </select>
        </Field>
        <div className="grid sm:grid-cols-3 gap-4">
          <Field label="اسم صاحب التقييم">
            <input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} className={inputCls} placeholder="Anna M." />
          </Field>
          <Field label="الدولة">
            <select value={f.country} onChange={(e) => setF({ ...f, country: e.target.value })} className={inputCls}>
              <option value="">—</option>
              {countries.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="التاريخ (نص)" hint="مثلًا: October 2026 — فاضي = النهارده">
            <input value={f.date_label} onChange={(e) => setF({ ...f, date_label: e.target.value })} className={inputCls} />
          </Field>
        </div>
        <Field label="التقييم">
          <div className="flex gap-1" dir="ltr">
            {[1, 2, 3, 4, 5].map((i) => (
              <button
                type="button"
                key={i}
                onClick={() => setF({ ...f, rating: i })}
                className="text-3xl leading-none"
                style={{ color: i <= f.rating ? '#F59E0B' : '#E5E7EB' }}
              >
                ★
              </button>
            ))}
          </div>
        </Field>
        <Field label="نص التقييم" hint="بأي لغة، زي ما كتبه العميل">
          <textarea rows={4} value={f.comment} onChange={(e) => setF({ ...f, comment: e.target.value })} dir="auto" className={inputCls} />
        </Field>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>
            إلغاء
          </Button>
          <Button onClick={save} disabled={busy}>
            {busy ? '...' : 'إضافة ونشر'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
