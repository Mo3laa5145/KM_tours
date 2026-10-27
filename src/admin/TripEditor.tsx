import { useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'
import { fetchCatalog } from '../lib/catalogContext'
import {
  CATEGORIES,
  LANGS,
  emptyContent,
  pickText,
  slugify,
  tripFromRow,
  tripToRow,
  type DestinationRecord,
  type Lang,
  type TripContent,
  type TripRecord,
  type TripRow,
} from '../lib/catalog'
import { LANG_LABELS, TOUR_LANGUAGE_CODES } from '../lib/translations'
import { go } from '../lib/router'
import { Badge, Button, Card, Field, Spinner, Toggle, cx, errorText, inputCls, useUi } from './ui'
import { deleteImages, uploadImage } from './images'

const CAT_AR: Record<string, string> = {
  'Water Sports': 'رياضات مائية',
  'Desert & Adventure': 'صحراء ومغامرات',
  'Cultural & Historical': 'ثقافة وتاريخ',
  'Cruises & Sailing': 'رحلات بحرية ونيلية',
  'Nature & Wildlife': 'طبيعة وحياة برية',
}

const TOUR_LANG_AR: Record<string, string> = {
  English: 'إنجليزي',
  Arabic: 'عربي',
  German: 'ألماني',
  French: 'فرنساوي',
  Italian: 'إيطالي',
  Russian: 'روسي',
  Spanish: 'إسباني',
  Polish: 'بولندي',
  Chinese: 'صيني',
  Japanese: 'ياباني',
  Portuguese: 'برتغالي',
  Dutch: 'هولندي',
  Turkish: 'تركي',
  Ukrainian: 'أوكراني',
  Czech: 'تشيكي',
}

function blankTrip(destinationId: string): TripRecord {
  return {
    id: '',
    destinationId,
    category: 'Cultural & Historical',
    price: 0,
    childPrice: null,
    durationHours: null,
    tourLanguages: ['English', 'Arabic'],
    pickupAvailable: true,
    freeCancellation: true,
    provider: 'KM Tours',
    photos: [],
    rating: 5,
    reviewCount: 0,
    reviews: [],
    content: { en: emptyContent(), ar: emptyContent() },
    published: false,
    featured: false,
    sortOrder: 0,
    maxGuests: null,
    childrenAllowed: true,
    childMinAge: 4,
    childMaxAge: 11,
    infantsAllowed: true,
  }
}

export default function TripEditor({ id }: { id: string }) {
  const isNew = id === 'new'
  const { toast, confirm } = useUi()
  const [trip, setTrip] = useState<TripRecord | null>(null)
  const [original, setOriginal] = useState<TripRecord | null>(null)
  const [destinations, setDestinations] = useState<DestinationRecord[]>([])
  const [allPhotosElsewhere, setAllPhotosElsewhere] = useState<Set<string>>(new Set())
  const [tab, setTab] = useState<Lang>('ar')
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(0)
  const [notFound, setNotFound] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        const cat = await fetchCatalog(true)
        if (!alive) return
        setDestinations(cat.destinations)
        setAllPhotosElsewhere(new Set(cat.trips.filter((t) => t.id !== id).flatMap((t) => t.photos)))
        if (isNew) {
          setTrip(blankTrip(cat.destinations[0]?.id ?? ''))
        } else {
          const { data, error } = await supabase!.from('experiences').select('*').eq('id', id).maybeSingle()
          if (error) throw error
          if (!data) return setNotFound(true)
          const t = tripFromRow(data as TripRow)
          setTrip(t)
          setOriginal(t)
        }
      } catch (e) {
        toast(errorText(e), 'err')
      }
    })()
    return () => {
      alive = false
    }
  }, [id, isNew, toast])

  if (notFound) return <div className="py-20 text-center text-slate-500">الرحلة غير موجودة</div>
  if (!trip)
    return (
      <div className="py-20 flex justify-center">
        <Spinner />
      </div>
    )

  const set = (patch: Partial<TripRecord>) => setTrip((t) => (t ? { ...t, ...patch } : t))
  const content: TripContent = { ...emptyContent(), ...(trip.content[tab] ?? {}) }
  const setContent = (patch: Partial<TripContent>) =>
    setTrip((t) => (t ? { ...t, content: { ...t.content, [tab]: { ...emptyContent(), ...(t.content[tab] ?? {}), ...patch } } } : t))

  const onFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    const folder = trip.id || slugify(trip.content.en?.title ?? '') || 'new-trip'
    const list = Array.from(files)
    setUploading((n) => n + list.length)
    for (const f of list) {
      try {
        const url = await uploadImage(folder, f)
        setTrip((t) => (t ? { ...t, photos: [...t.photos, url] } : t))
      } catch (e) {
        toast(`فشل رفع ${f.name}: ${errorText(e)}`, 'err')
      } finally {
        setUploading((n) => n - 1)
      }
    }
    if (fileRef.current) fileRef.current.value = ''
  }

  const movePhoto = (i: number, dir: -1 | 1) => {
    const p = [...trip.photos]
    const j = i + dir
    if (j < 0 || j >= p.length) return
    ;[p[i], p[j]] = [p[j], p[i]]
    set({ photos: p })
  }

  const addPhotoUrl = () => {
    const url = window.prompt('الصق رابط الصورة (https://...)')?.trim()
    if (url && /^https?:\/\//.test(url)) set({ photos: [...trip.photos, url] })
  }

  const copyFromEnglish = async () => {
    const en = trip.content.en
    if (!en) return
    const has = Object.values(trip.content[tab] ?? {}).some((v) => (Array.isArray(v) ? v.length : String(v ?? '').trim()))
    if (has && !(await confirm(`هيتم استبدال محتوى ${LANG_LABELS[tab]} بنسخة من الإنجليزي (عشان تترجمها). متأكد؟`, false))) return
    setContent({ ...emptyContent(), ...en })
  }

  const save = async () => {
    let t = { ...trip }
    const anyTitle = LANGS.some((l) => t.content[l]?.title?.trim())
    if (!anyTitle) return toast('اكتب عنوان الرحلة في لغة واحدة على الأقل', 'err')
    if (!t.destinationId) return toast('اختر الوجهة', 'err')
    if (!(t.price > 0)) return toast('اكتب سعر الرحلة', 'err')
    if (t.childrenAllowed && t.childMinAge >= t.childMaxAge) return toast('سن الطفل "من" لازم يكون أصغر من "إلى"', 'err')
    if (isNew) {
      const base = slugify(t.content.en?.title ?? '') || slugify(t.content.fr?.title ?? '') || Date.now().toString(36)
      t.id = t.id.trim() ? slugify(t.id) : `${t.destinationId}-${base}`.slice(0, 70)
    }
    if (!/^[a-z0-9-]+$/.test(t.id)) return toast('المعرّف (ID) لازم يكون حروف إنجليزي صغيرة وأرقام وشرطة فقط', 'err')
    // Clean empty rows
    const cleaned: TripRecord['content'] = {}
    for (const l of LANGS) {
      const c = t.content[l]
      if (!c) continue
      cleaned[l] = {
        ...c,
        highlights: (c.highlights ?? []).map((x) => x.trim()).filter(Boolean),
        included: (c.included ?? []).map((x) => x.trim()).filter(Boolean),
        excluded: (c.excluded ?? []).map((x) => x.trim()).filter(Boolean),
        whatToBring: (c.whatToBring ?? []).map((x) => x.trim()).filter(Boolean),
        itinerary: (c.itinerary ?? []).filter((x) => x.activity?.trim()),
        faq: (c.faq ?? []).filter((x) => x.question?.trim() && x.answer?.trim()),
      }
    }
    t = { ...t, content: cleaned }

    setSaving(true)
    const row = tripToRow(t)
    const { error } = isNew
      ? await supabase!.from('experiences').insert(row)
      : await supabase!.from('experiences').update(row).eq('id', t.id)
    setSaving(false)
    if (error) return toast(errorText(error), 'err')

    // Remove photos that were deleted from this trip and aren't used anywhere else
    if (original) {
      const removed = original.photos.filter((u) => !t.photos.includes(u) && !allPhotosElsewhere.has(u))
      if (removed.length) void deleteImages(removed)
    }
    setOriginal(t)
    setTrip(t)
    toast('تم الحفظ ✓')
    if (isNew) go(`/admin/trips/${encodeURIComponent(t.id)}`)
  }

  const listValue = (arr: string[]) => arr.join('\n')
  const fromLines = (v: string) => v.split('\n')

  const filled = (l: Lang) => {
    const c = trip.content[l]
    if (!c?.title?.trim()) return 'none'
    return c.description?.trim() ? 'full' : 'partial'
  }

  return (
    <div className="space-y-6 pb-24">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <button onClick={() => go('/admin/trips')} className="text-sm text-slate-500 hover:text-sky-600">
            → الرحلات
          </button>
          <h1 className="text-2xl font-bold mt-1">
            {isNew ? 'رحلة جديدة' : trip.content.ar?.title || trip.content.en?.title || trip.id}
          </h1>
        </div>
        <div className="flex gap-2">
          {!isNew && (
            <a href={`#/e/${trip.destinationId}/${trip.id}`} target="_blank" rel="noopener">
              <Button variant="secondary">معاينة ↗</Button>
            </a>
          )}
          <Button onClick={save} disabled={saving || uploading > 0}>
            {saving ? 'جارٍ الحفظ...' : 'حفظ'}
          </Button>
        </div>
      </div>

      {/* Basics */}
      <Card title="البيانات الأساسية">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Field label="الوجهة">
            <select value={trip.destinationId} onChange={(e) => set({ destinationId: e.target.value })} className={inputCls}>
              {destinations.map((d) => (
                <option key={d.id} value={d.id}>
                  {pickText(d.name, 'ar')}
                </option>
              ))}
            </select>
          </Field>
          <Field label="الفئة">
            <select value={trip.category} onChange={(e) => set({ category: e.target.value as TripRecord['category'] })} className={inputCls}>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {CAT_AR[c]}
                </option>
              ))}
            </select>
          </Field>
          <Field label="المعرّف في الرابط (ID)" hint={isNew ? 'اتركه فاضي وهيتعمل تلقائي' : 'لا يمكن تغييره بعد الإنشاء'}>
            <input value={trip.id} onChange={(e) => set({ id: e.target.value.toLowerCase() })} disabled={!isNew} dir="ltr" className={inputCls} placeholder="hurghada-sunset-cruise" />
          </Field>
          <Field label="سعر البالغ (جنيه مصري)">
            <input type="number" min={0} value={trip.price || ''} onChange={(e) => set({ price: Number(e.target.value) })} dir="ltr" className={inputCls} />
          </Field>
          <Field label="المدة بالساعات" hint="تُستخدم في الفلترة والترجمة التلقائية">
            <input
              type="number"
              min={0}
              step={0.5}
              value={trip.durationHours ?? ''}
              onChange={(e) => set({ durationHours: e.target.value === '' ? null : Number(e.target.value) })}
              dir="ltr"
              className={inputCls}
            />
          </Field>
          <Field label="أقصى عدد أفراد للحجز" hint="فاضي = بدون حد">
            <input
              type="number"
              min={1}
              value={trip.maxGuests ?? ''}
              onChange={(e) => set({ maxGuests: e.target.value === '' ? null : Number(e.target.value) })}
              dir="ltr"
              className={inputCls}
            />
          </Field>
          <Field label="مقدّم الرحلة">
            <input value={trip.provider} onChange={(e) => set({ provider: e.target.value })} className={inputCls} />
          </Field>
          <Field label="ترتيب الظهور" hint="الأصغر يظهر الأول">
            <input type="number" value={trip.sortOrder} onChange={(e) => set({ sortOrder: Number(e.target.value) })} dir="ltr" className={inputCls} />
          </Field>
          <Field label="التقييم (من 5)">
            <input
              type="number"
              min={0}
              max={5}
              step={0.1}
              value={trip.rating}
              onChange={(e) => set({ rating: Math.min(5, Math.max(0, Number(e.target.value))) })}
              dir="ltr"
              className={inputCls}
            />
          </Field>
          <Field label="عدد التقييمات">
            <input type="number" min={0} value={trip.reviewCount} onChange={(e) => set({ reviewCount: Number(e.target.value) })} dir="ltr" className={inputCls} />
          </Field>
        </div>

        <div className="mt-5">
          <div className="text-xs font-semibold text-slate-500 mb-2">لغات المرشد المتاحة</div>
          <div className="flex flex-wrap gap-2">
            {Object.keys(TOUR_LANGUAGE_CODES).map((l) => {
              const on = trip.tourLanguages.includes(l)
              return (
                <button
                  key={l}
                  type="button"
                  onClick={() => set({ tourLanguages: on ? trip.tourLanguages.filter((x) => x !== l) : [...trip.tourLanguages, l] })}
                  className={cx(
                    'px-3 py-1.5 rounded-full text-sm border',
                    on ? 'bg-sky-50 border-sky-400 text-sky-700' : 'bg-white border-slate-200 text-slate-500',
                  )}
                >
                  {TOUR_LANG_AR[l] ?? l}
                </button>
              )
            })}
          </div>
        </div>

        <div className="flex flex-wrap gap-6 mt-5">
          <Toggle checked={trip.published} onChange={(v) => set({ published: v })} label="ظاهرة في الموقع" />
          <Toggle checked={trip.featured} onChange={(v) => set({ featured: v })} label="رحلة مميزة" />
          <Toggle checked={trip.pickupAvailable} onChange={(v) => set({ pickupAvailable: v })} label="فيها توصيل من الفندق" />
          <Toggle checked={trip.freeCancellation} onChange={(v) => set({ freeCancellation: v })} label="إلغاء مجاني" />
        </div>
      </Card>

      {/* Children & infants */}
      <Card title="الأطفال والرُضّع">
        <div className="flex flex-wrap gap-6 mb-4">
          <Toggle checked={trip.childrenAllowed} onChange={(v) => set({ childrenAllowed: v })} label="مسموح بالأطفال" />
          <Toggle checked={trip.infantsAllowed} onChange={(v) => set({ infantsAllowed: v })} label="مسموح بالرُضّع (مجانًا)" />
        </div>
        {trip.childrenAllowed && (
          <div className="grid sm:grid-cols-3 gap-4">
            <Field label="سعر الطفل (جنيه)" hint="فاضي = نص سعر البالغ">
              <input
                type="number"
                min={0}
                value={trip.childPrice ?? ''}
                onChange={(e) => set({ childPrice: e.target.value === '' ? null : Number(e.target.value) })}
                dir="ltr"
                className={inputCls}
              />
            </Field>
            <Field label="سن الطفل من">
              <input
                type="number"
                min={0}
                max={17}
                value={trip.childMinAge}
                onChange={(e) => set({ childMinAge: Math.max(0, Number(e.target.value)) })}
                dir="ltr"
                className={inputCls}
              />
            </Field>
            <Field label="سن الطفل إلى">
              <input
                type="number"
                min={1}
                max={17}
                value={trip.childMaxAge}
                onChange={(e) => set({ childMaxAge: Math.max(1, Number(e.target.value)) })}
                dir="ltr"
                className={inputCls}
              />
            </Field>
          </div>
        )}
        <p className="text-xs text-slate-400 mt-3">
          {trip.infantsAllowed
            ? `الرضيع = أقل من ${trip.childrenAllowed ? trip.childMinAge : 'سن الطفل'} سنين، ومجاني. `
            : 'الرُضّع غير مسموح بهم في الرحلة دي. '}
          {trip.childrenAllowed
            ? `الطفل من ${trip.childMinAge} لـ ${trip.childMaxAge} سنة، وأكبر من كده يتحسب بالغ.`
            : 'الأطفال غير مسموح بهم في الرحلة دي.'}
        </p>
      </Card>

      {/* Photos */}
      <Card
        title={
          <span>
            الصور <span className="text-slate-400 font-normal text-sm">({trip.photos.length}) — أول صورة هي صورة الغلاف</span>
          </span>
        }
        actions={
          <>
            <Button size="sm" variant="ghost" onClick={addPhotoUrl}>
              إضافة برابط
            </Button>
            <Button size="sm" onClick={() => fileRef.current?.click()} disabled={uploading > 0}>
              {uploading > 0 ? `جارٍ الرفع (${uploading})...` : 'رفع صور'}
            </Button>
          </>
        }
      >
        <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={(e) => onFiles(e.target.files)} />
        {trip.photos.length === 0 ? (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault()
              void onFiles(e.dataTransfer.files)
            }}
            className="w-full rounded-xl border-2 border-dashed border-slate-200 py-12 text-sm text-slate-400 hover:border-sky-300 hover:text-sky-500"
          >
            اسحب الصور هنا أو اضغط للرفع
          </button>
        ) : (
          <div
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault()
              void onFiles(e.dataTransfer.files)
            }}
          >
            {trip.photos.map((url, i) => (
              <div key={url + i} className={cx('relative group rounded-xl overflow-hidden bg-slate-100 aspect-[4/3]', i === 0 && 'ring-2 ring-sky-500')}>
                <img src={url} alt="" className="w-full h-full object-cover" loading="lazy" />
                {i === 0 && (
                  <span className="absolute top-2 start-2">
                    <Badge color="sky">الغلاف</Badge>
                  </span>
                )}
                <div className="absolute inset-x-0 bottom-0 p-1.5 flex justify-between gap-1 bg-gradient-to-t from-black/60 to-transparent opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex gap-1">
                    <IconBtn title="قبل" onClick={() => movePhoto(i, -1)}>
                      →
                    </IconBtn>
                    <IconBtn title="بعد" onClick={() => movePhoto(i, 1)}>
                      ←
                    </IconBtn>
                    {i !== 0 && (
                      <IconBtn title="اجعلها الغلاف" onClick={() => set({ photos: [url, ...trip.photos.filter((_, j) => j !== i)] })}>
                        ★
                      </IconBtn>
                    )}
                  </div>
                  <IconBtn title="حذف" danger onClick={() => set({ photos: trip.photos.filter((_, j) => j !== i) })}>
                    ✕
                  </IconBtn>
                </div>
              </div>
            ))}
          </div>
        )}
        <p className="text-xs text-slate-400 mt-3">الصور بتتصغّر تلقائيًا قبل الرفع. الحذف بيتنفّذ نهائيًا بعد ما تضغط حفظ.</p>
      </Card>

      {/* Content per language */}
      <Card
        title="المحتوى والترجمات"
        actions={
          tab !== 'en' && trip.content.en?.title ? (
            <Button size="sm" variant="ghost" onClick={copyFromEnglish}>
              انسخ من الإنجليزي للترجمة
            </Button>
          ) : undefined
        }
      >
        <div className="flex flex-wrap gap-1 mb-5 border-b border-slate-100 pb-3">
          {LANGS.map((l) => {
            const f = filled(l)
            return (
              <button
                key={l}
                onClick={() => setTab(l)}
                className={cx('px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2', tab === l ? 'bg-sky-500 text-white' : 'text-slate-600 hover:bg-slate-100')}
              >
                {LANG_LABELS[l]}
                <span className={cx('w-2 h-2 rounded-full', f === 'full' ? 'bg-emerald-400' : f === 'partial' ? 'bg-amber-400' : 'bg-slate-300')} />
              </button>
            )
          })}
        </div>

        <div dir={tab === 'ar' ? 'rtl' : 'ltr'} className="space-y-4">
          <div className="grid sm:grid-cols-3 gap-4">
            <Field label="عنوان الرحلة" className="sm:col-span-2">
              <input value={content.title} onChange={(e) => setContent({ title: e.target.value })} className={inputCls} />
            </Field>
            <Field label="المدة (نص)" hint="مثال: 5 hours / Full day — فاضي = تلقائي">
              <input value={content.duration} onChange={(e) => setContent({ duration: e.target.value })} className={inputCls} />
            </Field>
          </div>
          <Field label="الوصف">
            <textarea rows={5} value={content.description} onChange={(e) => setContent({ description: e.target.value })} className={inputCls} />
          </Field>
          <div className="grid lg:grid-cols-2 gap-4">
            <Field label="أبرز النقاط" hint="كل نقطة في سطر">
              <textarea rows={5} value={listValue(content.highlights)} onChange={(e) => setContent({ highlights: fromLines(e.target.value) })} className={inputCls} />
            </Field>
            <Field label="ماذا تحضر معك" hint="كل عنصر في سطر">
              <textarea rows={5} value={listValue(content.whatToBring)} onChange={(e) => setContent({ whatToBring: fromLines(e.target.value) })} className={inputCls} />
            </Field>
            <Field label="يشمل السعر" hint="كل عنصر في سطر">
              <textarea rows={5} value={listValue(content.included)} onChange={(e) => setContent({ included: fromLines(e.target.value) })} className={inputCls} />
            </Field>
            <Field label="لا يشمل السعر" hint="كل عنصر في سطر">
              <textarea rows={5} value={listValue(content.excluded)} onChange={(e) => setContent({ excluded: fromLines(e.target.value) })} className={inputCls} />
            </Field>
          </div>

          <div>
            <div className="text-xs font-semibold text-slate-500 mb-2">برنامج الرحلة</div>
            <div className="space-y-2">
              {content.itinerary.map((step, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    value={step.time}
                    onChange={(e) => setContent({ itinerary: content.itinerary.map((s, j) => (j === i ? { ...s, time: e.target.value } : s)) })}
                    placeholder="09:00"
                    dir="ltr"
                    className={cx(inputCls, 'w-24 shrink-0')}
                  />
                  <input
                    value={step.activity}
                    onChange={(e) => setContent({ itinerary: content.itinerary.map((s, j) => (j === i ? { ...s, activity: e.target.value } : s)) })}
                    className={inputCls}
                  />
                  <Button size="sm" variant="ghost" onClick={() => setContent({ itinerary: content.itinerary.filter((_, j) => j !== i) })}>
                    ✕
                  </Button>
                </div>
              ))}
              <Button size="sm" variant="secondary" onClick={() => setContent({ itinerary: [...content.itinerary, { time: '', activity: '' }] })}>
                + خطوة
              </Button>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-4">
            <Field label="نقطة التجمع">
              <textarea rows={3} value={content.meetingPoint} onChange={(e) => setContent({ meetingPoint: e.target.value })} className={inputCls} />
            </Field>
            <Field label="سياسة الإلغاء">
              <textarea rows={3} value={content.cancellationPolicy} onChange={(e) => setContent({ cancellationPolicy: e.target.value })} className={inputCls} />
            </Field>
          </div>

          <div>
            <div className="text-xs font-semibold text-slate-500 mb-2">الأسئلة الشائعة</div>
            <div className="space-y-3">
              {content.faq.map((f, i) => (
                <div key={i} className="rounded-xl border border-slate-200 p-3 space-y-2">
                  <div className="flex gap-2">
                    <input
                      value={f.question}
                      onChange={(e) => setContent({ faq: content.faq.map((x, j) => (j === i ? { ...x, question: e.target.value } : x)) })}
                      placeholder="السؤال"
                      className={inputCls}
                    />
                    <Button size="sm" variant="ghost" onClick={() => setContent({ faq: content.faq.filter((_, j) => j !== i) })}>
                      ✕
                    </Button>
                  </div>
                  <textarea
                    rows={2}
                    value={f.answer}
                    onChange={(e) => setContent({ faq: content.faq.map((x, j) => (j === i ? { ...x, answer: e.target.value } : x)) })}
                    placeholder="الإجابة"
                    className={inputCls}
                  />
                </div>
              ))}
              <Button size="sm" variant="secondary" onClick={() => setContent({ faq: [...content.faq, { question: '', answer: '' }] })}>
                + سؤال
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Reviews */}
      {trip.reviews.length > 0 && (
        <Card title={`آراء الضيوف المعروضة (${trip.reviews.length})`}>
          <div className="space-y-3">
            {trip.reviews.map((r, i) => (
              <div key={r.id + i} className="flex items-start gap-3 rounded-xl border border-slate-100 p-3">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold">
                    {r.name} <span className="text-slate-400 font-normal">· {r.country} · {'★'.repeat(Math.round(r.rating))}</span>
                  </div>
                  <p className="text-sm text-slate-600 mt-1 line-clamp-2" dir="auto">
                    {r.comment}
                  </p>
                </div>
                <Button size="sm" variant="danger" onClick={() => set({ reviews: trip.reviews.filter((_, j) => j !== i) })}>
                  حذف
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Sticky save bar */}
      <div className="fixed bottom-0 inset-x-0 lg:start-64 z-30 bg-white/95 backdrop-blur border-t border-slate-200 px-4 py-3 flex items-center justify-end gap-2">
        <span className="text-xs text-slate-400 me-auto">{uploading > 0 ? 'استنى لحد ما الصور تخلص رفع...' : ''}</span>
        <Button variant="secondary" onClick={() => go('/admin/trips')}>
          رجوع
        </Button>
        <Button onClick={save} disabled={saving || uploading > 0}>
          {saving ? 'جارٍ الحفظ...' : 'حفظ التغييرات'}
        </Button>
      </div>
    </div>
  )
}

function IconBtn({ children, onClick, title, danger }: { children: React.ReactNode; onClick: () => void; title: string; danger?: boolean }) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={cx('w-7 h-7 rounded-lg text-xs font-bold bg-white/90 hover:bg-white', danger ? 'text-red-600' : 'text-slate-700')}
    >
      {children}
    </button>
  )
}
