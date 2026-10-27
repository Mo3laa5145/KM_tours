import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'
import { fetchCatalog } from '../lib/catalogContext'
import { LANGS, destinationToRow, pickText, slugify, type DestinationRecord, type Lang } from '../lib/catalog'
import { LANG_LABELS } from '../lib/translations'
import { Badge, Button, Empty, Field, Modal, Spinner, Toggle, errorText, inputCls, useUi } from './ui'
import { deleteImages, uploadImage } from './images'

const blank = (): DestinationRecord => ({ id: '', name: {}, description: {}, coverPhoto: '', sortOrder: 0, published: true })

export default function Destinations() {
  const { toast, confirm } = useUi()
  const [items, setItems] = useState<DestinationRecord[] | null>(null)
  const [counts, setCounts] = useState<Record<string, number>>({})
  const [edit, setEdit] = useState<{ d: DestinationRecord; isNew: boolean } | null>(null)

  const load = useCallback(async () => {
    try {
      const c = await fetchCatalog(true)
      setItems(c.destinations)
      const m: Record<string, number> = {}
      c.trips.forEach((t) => (m[t.destinationId] = (m[t.destinationId] ?? 0) + 1))
      setCounts(m)
    } catch (e) {
      toast(errorText(e), 'err')
      setItems([])
    }
  }, [toast])

  useEffect(() => {
    void load()
  }, [load])

  const remove = async (d: DestinationRecord) => {
    if (counts[d.id]) return toast('لازم تحذف أو تنقل الرحلات اللي في الوجهة دي الأول', 'err')
    if (!(await confirm(`حذف وجهة "${pickText(d.name, 'ar')}"؟`))) return
    const { error } = await supabase!.from('destinations').delete().eq('id', d.id)
    if (error) return toast(errorText(error), 'err')
    void deleteImages([d.coverPhoto])
    toast('تم الحذف')
    void load()
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">الوجهات</h1>
        <Button onClick={() => setEdit({ d: blank(), isNew: true })}>+ وجهة جديدة</Button>
      </div>

      {!items ? (
        <div className="py-20 flex justify-center">
          <Spinner />
        </div>
      ) : items.length === 0 ? (
        <Empty>لا توجد وجهات بعد</Empty>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((d) => (
            <div key={d.id} className="rounded-2xl bg-white border border-slate-200 overflow-hidden">
              <div className="relative h-36 bg-slate-100">
                {d.coverPhoto && <img src={d.coverPhoto} alt="" className="w-full h-full object-cover" />}
                {!d.published && (
                  <span className="absolute top-2 start-2">
                    <Badge color="red">مخفية</Badge>
                  </span>
                )}
              </div>
              <div className="p-4">
                <div className="font-semibold">{pickText(d.name, 'ar')}</div>
                <div className="text-xs text-slate-400 mt-0.5">
                  {pickText(d.name, 'en')} · {counts[d.id] ?? 0} رحلة · ترتيب {d.sortOrder}
                </div>
                <div className="flex gap-2 mt-3">
                  <Button size="sm" variant="secondary" onClick={() => setEdit({ d, isNew: false })}>
                    تعديل
                  </Button>
                  <Button size="sm" variant="danger" onClick={() => remove(d)}>
                    حذف
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {edit && (
        <Editor
          initial={edit.d}
          isNew={edit.isNew}
          onClose={() => setEdit(null)}
          onSaved={() => {
            setEdit(null)
            void load()
          }}
        />
      )}
    </div>
  )
}

function Editor({ initial, isNew, onClose, onSaved }: { initial: DestinationRecord; isNew: boolean; onClose: () => void; onSaved: () => void }) {
  const { toast } = useUi()
  const [d, setD] = useState(initial)
  const [busy, setBusy] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const setLangText = (field: 'name' | 'description', l: Lang, v: string) => setD((x) => ({ ...x, [field]: { ...x[field], [l]: v } }))

  const upload = async (f: File | undefined) => {
    if (!f) return
    setBusy(true)
    try {
      const url = await uploadImage(`destinations`, f)
      setD((x) => ({ ...x, coverPhoto: url }))
    } catch (e) {
      toast(errorText(e), 'err')
    }
    setBusy(false)
  }

  const save = async () => {
    const row = { ...d }
    if (!pickText(row.name, 'en') && !pickText(row.name, 'ar')) return toast('اكتب اسم الوجهة', 'err')
    if (isNew) row.id = slugify(row.id || row.name.en || '') || `dest-${Date.now().toString(36)}`
    setBusy(true)
    const { error } = isNew
      ? await supabase!.from('destinations').insert(destinationToRow(row))
      : await supabase!.from('destinations').update(destinationToRow(row)).eq('id', row.id)
    setBusy(false)
    if (error) return toast(errorText(error), 'err')
    if (!isNew && initial.coverPhoto && initial.coverPhoto !== row.coverPhoto) void deleteImages([initial.coverPhoto])
    toast('تم الحفظ ✓')
    onSaved()
  }

  return (
    <Modal open onClose={onClose} title={isNew ? 'وجهة جديدة' : `تعديل: ${pickText(initial.name, 'ar')}`} wide>
      <div className="space-y-5">
        <div className="flex gap-4 items-start">
          <div className="w-40 h-28 rounded-xl bg-slate-100 overflow-hidden shrink-0">
            {d.coverPhoto && <img src={d.coverPhoto} alt="" className="w-full h-full object-cover" />}
          </div>
          <div className="space-y-2">
            <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => upload(e.target.files?.[0])} />
            <Button size="sm" variant="secondary" onClick={() => fileRef.current?.click()} disabled={busy}>
              {busy ? '...' : 'رفع صورة الغلاف'}
            </Button>
            <div className="text-xs text-slate-400">يفضّل صورة عرضية 1600×900</div>
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          <Field label="المعرّف (ID)" hint={isNew ? 'إنجليزي، فاضي = تلقائي' : 'لا يمكن تغييره'}>
            <input value={d.id} disabled={!isNew} onChange={(e) => setD({ ...d, id: e.target.value.toLowerCase() })} dir="ltr" className={inputCls} placeholder="marsa-alam" />
          </Field>
          <Field label="ترتيب الظهور">
            <input type="number" value={d.sortOrder} onChange={(e) => setD({ ...d, sortOrder: Number(e.target.value) })} dir="ltr" className={inputCls} />
          </Field>
          <div className="flex items-end pb-2">
            <Toggle checked={d.published} onChange={(v) => setD({ ...d, published: v })} label="ظاهرة في الموقع" />
          </div>
        </div>

        <div className="space-y-4">
          {LANGS.map((l) => (
            <div key={l} className="rounded-xl border border-slate-100 p-3" dir={l === 'ar' ? 'rtl' : 'ltr'}>
              <div className="text-xs font-semibold text-sky-600 mb-2">{LANG_LABELS[l]}</div>
              <div className="grid sm:grid-cols-3 gap-3">
                <input value={d.name[l] ?? ''} onChange={(e) => setLangText('name', l, e.target.value)} placeholder="الاسم / Name" className={inputCls} />
                <textarea
                  rows={2}
                  value={d.description[l] ?? ''}
                  onChange={(e) => setLangText('description', l, e.target.value)}
                  placeholder="الوصف / Description"
                  className={`${inputCls} sm:col-span-2`}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>
            إلغاء
          </Button>
          <Button onClick={save} disabled={busy}>
            حفظ
          </Button>
        </div>
      </div>
    </Modal>
  )
}
