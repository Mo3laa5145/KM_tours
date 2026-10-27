import { useCallback, useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'
import { fetchCatalog } from '../lib/catalogContext'
import type { TripRecord } from '../lib/catalog'
import { Button, Card, Empty, Field, Spinner, cx, errorText, inputCls, useUi } from './ui'

interface Row {
  id: number
  experience_id: string | null
  day: string
  reason: string | null
}

const today = () => new Date().toLocaleDateString('en-CA', { timeZone: 'Africa/Cairo' })
const fmt = (d: string) => new Date(d + 'T12:00:00').toLocaleDateString('ar-EG', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

function datesBetween(from: string, to: string): string[] {
  const out: string[] = []
  const d = new Date(from + 'T12:00:00')
  const end = new Date((to || from) + 'T12:00:00')
  while (d <= end && out.length < 366) {
    out.push(d.toISOString().slice(0, 10))
    d.setDate(d.getDate() + 1)
  }
  return out
}

export default function BlockedDates() {
  const { toast, confirm } = useUi()
  const [rows, setRows] = useState<Row[] | null>(null)
  const [trips, setTrips] = useState<TripRecord[]>([])
  const [form, setForm] = useState({ from: '', to: '', experience_id: '', reason: '' })
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    const { data, error } = await supabase!.from('blocked_dates').select('*').gte('day', today()).order('day').limit(1000)
    if (error) {
      toast(errorText(error), 'err')
      setRows([])
    } else setRows(data as Row[])
  }, [toast])

  useEffect(() => {
    void load()
    fetchCatalog(true)
      .then((c) => setTrips(c.trips))
      .catch(() => {})
  }, [load])

  const titleOf = useMemo(() => {
    const m = new Map(trips.map((t) => [t.id, t.content.ar?.title || t.content.en?.title || t.id]))
    return (id: string | null) => (id ? (m.get(id) ?? id) : 'كل الرحلات')
  }, [trips])

  const add = async () => {
    if (!form.from) return toast('اختر التاريخ', 'err')
    if (form.to && form.to < form.from) return toast('تاريخ النهاية قبل البداية', 'err')
    const scope = form.experience_id || null
    const existing = new Set((rows ?? []).filter((r) => r.experience_id === scope).map((r) => r.day))
    const days = datesBetween(form.from, form.to).filter((d) => !existing.has(d))
    if (days.length === 0) return toast('التواريخ دي مقفولة بالفعل')
    setBusy(true)
    const { error } = await supabase!
      .from('blocked_dates')
      .insert(days.map((day) => ({ day, experience_id: scope, reason: form.reason.trim() || null })))
    setBusy(false)
    if (error) return toast(errorText(error), 'err')
    toast(days.length > 1 ? `تم قفل ${days.length} يوم ✓` : 'تم قفل اليوم ✓')
    setForm({ from: '', to: '', experience_id: form.experience_id, reason: '' })
    void load()
  }

  const remove = async (ids: number[], label: string) => {
    if (!(await confirm(`فتح ${label} للحجز تاني؟`, false))) return
    const { error } = await supabase!.from('blocked_dates').delete().in('id', ids)
    if (error) return toast(errorText(error), 'err')
    toast('تم فتح الحجز')
    setRows((all) => all?.filter((r) => !ids.includes(r.id)) ?? null)
  }

  // Group consecutive rows by day for display
  const grouped = useMemo(() => {
    const m = new Map<string, Row[]>()
    for (const r of rows ?? []) m.set(r.day, [...(m.get(r.day) ?? []), r])
    return [...m.entries()]
  }, [rows])

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">التواريخ المقفولة</h1>

      <Card title="قفل تاريخ أو فترة">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Field label="من يوم">
            <input type="date" min={today()} value={form.from} onChange={(e) => setForm({ ...form, from: e.target.value })} className={inputCls} />
          </Field>
          <Field label="إلى يوم" hint="اختياري — لقفل فترة كاملة">
            <input type="date" min={form.from || today()} value={form.to} onChange={(e) => setForm({ ...form, to: e.target.value })} className={inputCls} />
          </Field>
          <Field label="الرحلة">
            <select value={form.experience_id} onChange={(e) => setForm({ ...form, experience_id: e.target.value })} className={inputCls}>
              <option value="">كل الرحلات</option>
              {trips.map((t) => (
                <option key={t.id} value={t.id}>
                  {titleOf(t.id)}
                </option>
              ))}
            </select>
          </Field>
          <Field label="السبب (للأدمن فقط)">
            <input value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} className={inputCls} placeholder="عيد / رياح / كامل العدد" />
          </Field>
        </div>
        <div className="mt-4 flex justify-end">
          <Button onClick={add} disabled={busy || !form.from}>
            {busy ? '...' : 'قفل الحجز'}
          </Button>
        </div>
      </Card>

      <Card title="التواريخ المقفولة القادمة">
        {!rows ? (
          <div className="py-10 flex justify-center">
            <Spinner />
          </div>
        ) : grouped.length === 0 ? (
          <Empty>مفيش تواريخ مقفولة — كل الأيام متاحة للحجز</Empty>
        ) : (
          <div className="divide-y divide-slate-100">
            {grouped.map(([day, list]) => (
              <div key={day} className="py-3 flex flex-wrap items-center gap-3">
                <div className="w-56 shrink-0 font-semibold text-sm">{fmt(day)}</div>
                <div className="flex-1 flex flex-wrap gap-2">
                  {list.map((r) => (
                    <span
                      key={r.id}
                      className={cx(
                        'inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs',
                        r.experience_id ? 'bg-amber-50 text-amber-800' : 'bg-red-50 text-red-700 font-semibold',
                      )}
                    >
                      {titleOf(r.experience_id)}
                      {r.reason && <span className="opacity-70">({r.reason})</span>}
                      <button onClick={() => remove([r.id], fmt(day))} className="hover:text-red-600" title="فتح الحجز">
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
      <p className="text-xs text-slate-400">الزائر بيشوف رسالة إن التاريخ مش متاح، والسيرفر بيرفض أي حجز على يوم مقفول.</p>
    </div>
  )
}
