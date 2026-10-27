import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'
import { fetchCatalog } from '../lib/catalogContext'
import { countryName, flagEmoji } from '../lib/countries'
import { LANG_LABELS } from '../lib/translations'
import type { Lang, TripRecord } from '../lib/catalog'
import { Badge, Card, Empty, Spinner, cx, errorText } from './ui'

interface Stats {
  page_views: number
  visitors: number
  visitors_today: number
  page_views_today: number
  countries_count: number
  daily: { day: string; views: number; visitors: number }[]
  countries: { country: string; visitors: number }[]
  languages: { language: string; visitors: number }[]
  devices: { device: string; visitors: number }[]
  referrers: { referrer: string; visitors: number }[]
  top_trips: { experience_id: string; views: number }[]
  bookings: {
    total: number
    pending: number
    confirmed: number
    completed: number
    cancelled: number
    revenue: number
    guests: number
    upcoming: number
    pending_reviews?: number
  }
  bookings_daily: { day: string; count: number }[]
  booking_nationalities: { country: string; bookings: number }[]
  top_booked: { experience_id: string; title: string; bookings: number; guests: number }[]
}

const fmt = (n: number) => Number(n ?? 0).toLocaleString('en')

const DEVICE_LABEL: Record<string, string> = { mobile: '📱 موبايل', desktop: '💻 كمبيوتر', tablet: '📟 تابلت', unknown: 'غير معروف' }

export default function Dashboard() {
  const [days, setDays] = useState(30)
  const [stats, setStats] = useState<Stats | null>(null)
  const [error, setError] = useState('')
  const [trips, setTrips] = useState<TripRecord[]>([])

  useEffect(() => {
    let alive = true
    setStats(null)
    setError('')
    supabase!.rpc('admin_stats', { days }).then(({ data, error }) => {
      if (!alive) return
      if (error) setError(errorText(error))
      else setStats(data as Stats)
    })
    return () => {
      alive = false
    }
  }, [days])

  useEffect(() => {
    fetchCatalog(true)
      .then((c) => setTrips(c.trips))
      .catch(() => {})
  }, [])

  const tripTitle = useMemo(() => {
    const m = new Map(trips.map((t) => [t.id, t.content.ar?.title || t.content.en?.title || t.id]))
    return (id: string) => m.get(id) ?? id
  }, [trips])

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">لوحة التحكم</h1>
        <div className="flex rounded-xl bg-white border border-slate-200 p-1">
          {[7, 30, 90, 365].map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={cx('px-3 py-1.5 rounded-lg text-sm font-medium', days === d ? 'bg-sky-500 text-white' : 'text-slate-600 hover:bg-slate-50')}
            >
              {d === 365 ? 'سنة' : `${d} يوم`}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 text-red-700 p-4 text-sm">
          {error}
          <div className="text-xs mt-1 text-red-500">تأكد إنك شغّلت ملف supabase/schema.sql كامل.</div>
        </div>
      )}
      {!stats && !error && (
        <div className="py-20 flex justify-center">
          <Spinner />
        </div>
      )}

      {stats && (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Kpi label="الزوار" value={fmt(stats.visitors)} sub={`اليوم: ${fmt(stats.visitors_today)}`} color="sky" />
            <Kpi label="مشاهدات الصفحات" value={fmt(stats.page_views)} sub={`اليوم: ${fmt(stats.page_views_today)}`} color="violet" />
            <Kpi label="طلبات الحجز" value={fmt(stats.bookings.total)} sub={`في الانتظار: ${fmt(stats.bookings.pending)}`} color="amber" />
            <Kpi
              label="معدل التحويل"
              value={stats.visitors ? `${((stats.bookings.total / stats.visitors) * 100).toFixed(1)}%` : '—'}
              sub={`${fmt(stats.countries_count)} دولة`}
              color="emerald"
            />
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Kpi label="مؤكدة" value={fmt(stats.bookings.confirmed)} small />
            <Kpi label="رحلات قادمة" value={fmt(stats.bookings.upcoming)} small />
            <Kpi label="تقييمات في انتظار الموافقة" value={fmt(stats.bookings.pending_reviews ?? 0)} small />
            <Kpi label="إيراد متوقع (مؤكد/منتهي)" value={`EGP ${fmt(stats.bookings.revenue)}`} small />
          </div>

          <Card title="الزوار يوميًا">
            <LineChart data={stats.daily} bookings={stats.bookings_daily} />
          </Card>

          <div className="grid lg:grid-cols-2 gap-6">
            <Card title="جنسيات الزوار (حسب الدولة)" actions={<Badge color="sky">{stats.countries.length}</Badge>}>
              <Bars
                rows={stats.countries.map((c) => ({
                  key: c.country,
                  label: `${flagEmoji(c.country)}  ${countryName(c.country, 'ar')}`,
                  value: c.visitors,
                }))}
              />
            </Card>
            <Card title="جنسيات الحاجزين">
              <Bars
                color="bg-amber-400"
                rows={stats.booking_nationalities.map((c) => ({
                  key: c.country,
                  label: `${flagEmoji(c.country)}  ${countryName(c.country, 'ar')}`,
                  value: c.bookings,
                }))}
              />
            </Card>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            <Card title="لغة الموقع المستخدمة">
              <Bars
                color="bg-violet-400"
                rows={stats.languages.map((l) => ({ key: l.language, label: LANG_LABELS[l.language as Lang] ?? l.language, value: l.visitors }))}
              />
            </Card>
            <Card title="الأجهزة">
              <Bars
                color="bg-emerald-400"
                rows={stats.devices.map((d) => ({ key: d.device, label: DEVICE_LABEL[d.device] ?? d.device, value: d.visitors }))}
              />
            </Card>
            <Card title="مصادر الزيارات">
              <Bars
                color="bg-slate-400"
                rows={stats.referrers.map((r) => ({ key: r.referrer, label: r.referrer === 'direct' ? 'دخول مباشر' : r.referrer, value: r.visitors }))}
              />
            </Card>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <Card title="أكثر الرحلات مشاهدة">
              <Bars rows={stats.top_trips.map((t) => ({ key: t.experience_id, label: tripTitle(t.experience_id), value: t.views }))} />
            </Card>
            <Card title="أكثر الرحلات حجزًا">
              <Bars
                color="bg-amber-400"
                rows={stats.top_booked.map((t) => ({
                  key: t.experience_id ?? t.title,
                  label: t.experience_id ? tripTitle(t.experience_id) : t.title,
                  value: t.bookings,
                  extra: `${fmt(t.guests)} فرد`,
                }))}
              />
            </Card>
          </div>

          <p className="text-xs text-slate-400">
            الدولة بتتحدد من عنوان الـ IP وقت الزيارة (من غير ما نحفظ الـ IP نفسه). الزائر = متصفح واحد.
          </p>
        </>
      )}
    </div>
  )
}

function Kpi({ label, value, sub, color = 'slate', small }: { label: string; value: string; sub?: string; color?: string; small?: boolean }) {
  const ring: Record<string, string> = {
    sky: 'border-t-sky-500',
    violet: 'border-t-violet-500',
    amber: 'border-t-amber-500',
    emerald: 'border-t-emerald-500',
    slate: 'border-t-slate-200',
  }
  return (
    <div className={cx('rounded-2xl bg-white border border-slate-200 border-t-4 p-4', ring[color])}>
      <div className="text-xs font-medium text-slate-500">{label}</div>
      <div className={cx('font-bold text-slate-900 mt-1', small ? 'text-lg' : 'text-2xl')} dir="ltr" style={{ textAlign: 'right' }}>
        {value}
      </div>
      {sub && <div className="text-xs text-slate-400 mt-1">{sub}</div>}
    </div>
  )
}

function Bars({ rows, color = 'bg-sky-400' }: { rows: { key: string; label: string; value: number; extra?: string }[]; color?: string }) {
  if (rows.length === 0) return <Empty>لا توجد بيانات بعد</Empty>
  const max = Math.max(...rows.map((r) => r.value), 1)
  return (
    <div className="space-y-2.5">
      {rows.map((r) => (
        <div key={r.key}>
          <div className="flex items-center justify-between text-sm mb-1 gap-3">
            <span className="truncate text-slate-700">{r.label}</span>
            <span className="font-semibold text-slate-900 shrink-0">
              {fmt(r.value)}
              {r.extra && <span className="text-xs font-normal text-slate-400 ms-1">· {r.extra}</span>}
            </span>
          </div>
          <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
            <div className={cx('h-full rounded-full', color)} style={{ width: `${(r.value / max) * 100}%` }} />
          </div>
        </div>
      ))}
    </div>
  )
}

function LineChart({ data, bookings }: { data: Stats['daily']; bookings: Stats['bookings_daily'] }) {
  const [hover, setHover] = useState<number | null>(null)
  if (data.length === 0) return <Empty>لا توجد بيانات بعد</Empty>
  const W = 800
  const H = 220
  const pad = { l: 8, r: 8, t: 12, b: 24 }
  const max = Math.max(...data.map((d) => d.views), 4)
  const bmap = new Map(bookings.map((b) => [b.day, b.count]))
  const x = (i: number) => pad.l + (data.length === 1 ? (W - pad.l - pad.r) / 2 : (i / (data.length - 1)) * (W - pad.l - pad.r))
  const y = (v: number) => pad.t + (1 - v / max) * (H - pad.t - pad.b)
  const line = (key: 'views' | 'visitors') => data.map((d, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(d[key]).toFixed(1)}`).join(' ')
  const area = `${line('visitors')} L${x(data.length - 1)},${H - pad.b} L${x(0)},${H - pad.b} Z`
  const labelEvery = Math.ceil(data.length / 8)
  const h = hover !== null ? data[hover] : null

  return (
    <div dir="ltr">
      <div className="flex flex-wrap gap-4 text-xs text-slate-500 mb-2 justify-end" dir="rtl">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-1 rounded bg-sky-500" /> زوار
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-1 rounded bg-violet-300" /> مشاهدات
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-amber-500" /> حجوزات
        </span>
      </div>
      <div className="relative">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-56" preserveAspectRatio="none" onMouseLeave={() => setHover(null)}>
          {[0.25, 0.5, 0.75, 1].map((f) => (
            <line key={f} x1={pad.l} x2={W - pad.r} y1={y(max * f)} y2={y(max * f)} stroke="#F1F5F9" />
          ))}
          <path d={area} fill="rgba(14,165,233,0.08)" />
          <path d={line('views')} fill="none" stroke="#C4B5FD" strokeWidth={2} vectorEffect="non-scaling-stroke" />
          <path d={line('visitors')} fill="none" stroke="#0EA5E9" strokeWidth={2.5} vectorEffect="non-scaling-stroke" />
          {data.map((d, i) =>
            bmap.get(d.day) ? <circle key={d.day} cx={x(i)} cy={H - pad.b - 4} r={4} fill="#F59E0B" /> : null,
          )}
          {data.map((d, i) => (
            <rect
              key={d.day}
              x={x(i) - (W / data.length) / 2}
              y={0}
              width={W / data.length}
              height={H}
              fill="transparent"
              onMouseEnter={() => setHover(i)}
            />
          ))}
          {hover !== null && <line x1={x(hover)} x2={x(hover)} y1={pad.t} y2={H - pad.b} stroke="#94A3B8" strokeDasharray="3 3" />}
        </svg>
        <div className="flex justify-between text-[10px] text-slate-400 mt-1">
          {data.map((d, i) =>
            i % labelEvery === 0 ? (
              <span key={d.day}>{new Date(d.day + 'T12:00:00').toLocaleDateString('ar-EG', { day: 'numeric', month: 'short' })}</span>
            ) : null,
          )}
        </div>
        {h && (
          <div className="absolute top-0 left-1/2 -translate-x-1/2 rounded-lg bg-slate-900 text-white text-xs px-3 py-2 pointer-events-none" dir="rtl">
            <div className="font-semibold mb-0.5">{new Date(h.day + 'T12:00:00').toLocaleDateString('ar-EG', { weekday: 'long', day: 'numeric', month: 'long' })}</div>
            {fmt(h.visitors)} زائر · {fmt(h.views)} مشاهدة · {fmt(bmap.get(h.day) ?? 0)} حجز
          </div>
        )}
      </div>
    </div>
  )
}
