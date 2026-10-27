import { useCallback, useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'
import { fetchCatalog } from '../lib/catalogContext'
import { pickText, tripToRow, type DestinationRecord, type TripRecord, LANGS } from '../lib/catalog'
import { LANG_SHORT } from '../lib/translations'
import { go } from '../lib/router'
import { Badge, Button, Empty, Spinner, cx, errorText, inputCls, useUi } from './ui'
import { deleteImages } from './images'

const CAT_AR: Record<string, string> = {
  'Water Sports': 'رياضات مائية',
  'Desert & Adventure': 'صحراء ومغامرات',
  'Cultural & Historical': 'ثقافة وتاريخ',
  'Cruises & Sailing': 'رحلات بحرية',
  'Nature & Wildlife': 'طبيعة',
}

export function tripTitle(t: TripRecord) {
  return t.content.ar?.title || t.content.en?.title || t.id
}

export default function Trips() {
  const { toast, confirm } = useUi()
  const [trips, setTrips] = useState<TripRecord[] | null>(null)
  const [destinations, setDestinations] = useState<DestinationRecord[]>([])
  const [q, setQ] = useState('')
  const [dest, setDest] = useState('')
  const [status, setStatus] = useState('')

  const load = useCallback(async () => {
    try {
      const c = await fetchCatalog(true)
      setTrips(c.trips)
      setDestinations(c.destinations)
    } catch (e) {
      toast(errorText(e), 'err')
      setTrips([])
    }
  }, [toast])

  useEffect(() => {
    void load()
  }, [load])

  const destName = (id: string) => pickText(destinations.find((d) => d.id === id)?.name, 'ar') || id

  const list = useMemo(() => {
    if (!trips) return []
    const query = q.trim().toLowerCase()
    return trips
      .filter((t) => !dest || t.destinationId === dest)
      .filter((t) => !status || (status === 'published' ? t.published : !t.published))
      .filter(
        (t) =>
          !query ||
          t.id.includes(query) ||
          LANGS.some((l) => t.content[l]?.title?.toLowerCase().includes(query)) ||
          t.provider.toLowerCase().includes(query),
      )
      .sort((a, b) => a.destinationId.localeCompare(b.destinationId) || a.sortOrder - b.sortOrder)
  }, [trips, q, dest, status])

  const update = async (t: TripRecord, patch: Partial<TripRecord>) => {
    const next = { ...t, ...patch }
    setTrips((all) => all?.map((x) => (x.id === t.id ? next : x)) ?? null)
    const row = tripToRow(next)
    const { error } = await supabase!
      .from('experiences')
      .update({ published: row.published, featured: row.featured })
      .eq('id', t.id)
    if (error) {
      toast(errorText(error), 'err')
      void load()
    }
  }

  const remove = async (t: TripRecord) => {
    if (!(await confirm(`حذف رحلة "${tripTitle(t)}" نهائيًا؟\nالصور المرفوعة لها هتتمسح كمان. الحجوزات القديمة هتفضل موجودة.`))) return
    const { error } = await supabase!.from('experiences').delete().eq('id', t.id)
    if (error) return toast(errorText(error), 'err')
    const usedElsewhere = new Set((trips ?? []).filter((x) => x.id !== t.id).flatMap((x) => x.photos))
    await deleteImages(t.photos.filter((u) => !usedElsewhere.has(u)))
    toast('تم حذف الرحلة')
    setTrips((all) => all?.filter((x) => x.id !== t.id) ?? null)
  }

  const duplicate = async (t: TripRecord) => {
    let id = `${t.id}-copy`
    let n = 2
    while (trips?.some((x) => x.id === id)) id = `${t.id}-copy-${n++}`
    const copy: TripRecord = {
      ...t,
      id,
      published: false,
      featured: false,
      content: Object.fromEntries(
        Object.entries(t.content).map(([l, c]) => [l, { ...c, title: c?.title ? `${c.title} (نسخة)` : c?.title }]),
      ),
    }
    const { error } = await supabase!.from('experiences').insert(tripToRow(copy))
    if (error) return toast(errorText(error), 'err')
    toast('تم عمل نسخة (مخفية)')
    go(`/admin/trips/${encodeURIComponent(id)}`)
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">الرحلات</h1>
        <Button onClick={() => go('/admin/trips/new')}>+ رحلة جديدة</Button>
      </div>

      <div className="flex flex-wrap gap-2">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="بحث بالاسم..." className={cx(inputCls, 'max-w-xs')} />
        <select value={dest} onChange={(e) => setDest(e.target.value)} className={cx(inputCls, 'max-w-[180px]')}>
          <option value="">كل الوجهات</option>
          {destinations.map((d) => (
            <option key={d.id} value={d.id}>
              {pickText(d.name, 'ar')}
            </option>
          ))}
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className={cx(inputCls, 'max-w-[150px]')}>
          <option value="">الكل</option>
          <option value="published">ظاهرة</option>
          <option value="hidden">مخفية</option>
        </select>
      </div>

      {!trips ? (
        <div className="py-20 flex justify-center">
          <Spinner />
        </div>
      ) : list.length === 0 ? (
        <Empty>لا توجد رحلات</Empty>
      ) : (
        <div className="rounded-2xl bg-white border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs">
                <tr>
                  <th className="text-start font-semibold px-4 py-3">الرحلة</th>
                  <th className="text-start font-semibold px-4 py-3">الوجهة</th>
                  <th className="text-start font-semibold px-4 py-3">السعر</th>
                  <th className="text-start font-semibold px-4 py-3">الترجمات</th>
                  <th className="text-start font-semibold px-4 py-3">ظاهرة</th>
                  <th className="text-start font-semibold px-4 py-3">مميزة</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {list.map((t) => (
                  <tr key={t.id} className={cx('hover:bg-slate-50/60', !t.published && 'opacity-60')}>
                    <td className="px-4 py-3">
                      <button onClick={() => go(`/admin/trips/${encodeURIComponent(t.id)}`)} className="flex items-center gap-3 text-start">
                        {t.photos[0] ? (
                          <img src={t.photos[0]} alt="" className="w-14 h-10 rounded-lg object-cover shrink-0" />
                        ) : (
                          <div className="w-14 h-10 rounded-lg bg-slate-100 shrink-0" />
                        )}
                        <div>
                          <div className="font-semibold text-slate-800 hover:text-sky-600">{tripTitle(t)}</div>
                          <div className="text-xs text-slate-400">
                            {CAT_AR[t.category] ?? t.category} · {t.photos.length} صورة
                          </div>
                        </div>
                      </button>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">{destName(t.destinationId)}</td>
                    <td className="px-4 py-3 whitespace-nowrap" dir="ltr" style={{ textAlign: 'right' }}>
                      EGP {t.price.toLocaleString('en')}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        {LANGS.map((l) => {
                          const full = !!t.content[l]?.description?.trim() && !!t.content[l]?.title?.trim()
                          const partial = !!t.content[l]?.title?.trim()
                          return (
                            <Badge key={l} color={full ? 'emerald' : partial ? 'amber' : 'slate'}>
                              {LANG_SHORT[l]}
                            </Badge>
                          )
                        })}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Switch checked={t.published} onChange={(v) => update(t, { published: v })} />
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => update(t, { featured: !t.featured })} className="text-lg" title="مميزة (تظهر أولًا)">
                        {t.featured ? '⭐' : '☆'}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1 justify-end">
                        <Button size="sm" variant="secondary" onClick={() => go(`/admin/trips/${encodeURIComponent(t.id)}`)}>
                          تعديل
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => duplicate(t)}>
                          نسخ
                        </Button>
                        <Button size="sm" variant="danger" onClick={() => remove(t)}>
                          حذف
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      <p className="text-xs text-slate-400">
        الترجمات: أخضر = مترجمة بالكامل، برتقالي = العنوان بس، رمادي = مش مترجمة (هيظهر الإنجليزي للزائر).
      </p>
    </div>
  )
}

function Switch({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={cx('relative w-10 h-6 rounded-full transition-colors', checked ? 'bg-emerald-500' : 'bg-slate-300')}
      aria-pressed={checked}
    >
      <span className={cx('absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all', checked ? 'start-[18px]' : 'start-0.5')} />
    </button>
  )
}
