import { useCallback, useEffect, useState, type ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { go } from '../lib/router'
import { Button, Field, Spinner, UiProvider, cx, errorText, inputCls } from './ui'
import Dashboard from './Dashboard'
import Trips from './Trips'
import TripEditor from './TripEditor'
import Destinations from './Destinations'
import Bookings from './Bookings'
import Reviews from './Reviews'
import BlockedDates from './BlockedDates'

export default function AdminApp({ path }: { path: string }) {
  useEffect(() => {
    const prev = document.title
    document.title = 'لوحة التحكم · KM Tours'
    return () => {
      document.title = prev
    }
  }, [])

  return (
    <div dir="rtl" lang="ar" className="admin-root min-h-screen bg-slate-50 text-slate-800">
      <UiProvider>{isSupabaseConfigured ? <AuthGate path={path} /> : <NotConfigured />}</UiProvider>
    </div>
  )
}

function NotConfigured() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-lg rounded-2xl bg-white border border-slate-200 p-8 shadow-sm">
        <h1 className="text-xl font-bold mb-3">لوحة التحكم غير متصلة بقاعدة البيانات</h1>
        <p className="text-sm text-slate-600 leading-relaxed mb-4">
          لازم تربط الموقع بمشروع Supabase الأول. اعمل ملف <code className="bg-slate-100 px-1 rounded">.env</code> في المشروع وحط فيه:
        </p>
        <pre dir="ltr" className="text-xs bg-slate-900 text-slate-100 rounded-xl p-4 overflow-x-auto mb-4">
          {`VITE_SUPABASE_URL=https://xxxx.supabase.co\nVITE_SUPABASE_ANON_KEY=eyJhbGciOi...`}
        </pre>
        <p className="text-sm text-slate-600">الخطوات كاملة موجودة في ملف SETUP-AR.md.</p>
        <a href="#/" className="inline-block mt-6 text-sm text-sky-600 underline">
          الرجوع للموقع
        </a>
      </div>
    </div>
  )
}

function AuthGate({ path }: { path: string }) {
  const [session, setSession] = useState<Session | null | undefined>(undefined)
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)

  useEffect(() => {
    supabase!.auth.getSession().then(({ data }) => setSession(data.session))
    const { data } = supabase!.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => data.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!session) {
      setIsAdmin(null)
      return
    }
    supabase!
      .rpc('is_admin')
      .then(({ data, error }) => setIsAdmin(!error && data === true))
  }, [session])

  if (session === undefined || (session && isAdmin === null)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner />
      </div>
    )
  }
  if (!session) return <Login />
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-md rounded-2xl bg-white border border-slate-200 p-8 text-center">
          <h1 className="text-lg font-bold mb-2">الحساب ده مش أدمن</h1>
          <p className="text-sm text-slate-600 mb-1" dir="ltr">
            {session.user.email}
          </p>
          <p className="text-sm text-slate-500 mb-6">لازم تضيف الحساب في جدول admins (الخطوات في SETUP-AR.md).</p>
          <Button variant="secondary" onClick={() => supabase!.auth.signOut()}>
            تسجيل الخروج
          </Button>
        </div>
      </div>
    )
  }
  return <Layout path={path} email={session.user.email ?? ''} />
}

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setErr('')
    const { error } = await supabase!.auth.signInWithPassword({ email: email.trim(), password })
    if (error) setErr(errorText(error))
    setBusy(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-sky-50 to-slate-100">
      <form onSubmit={submit} className="w-full max-w-sm rounded-2xl bg-white border border-slate-200 shadow-sm p-8">
        <div className="text-center mb-6">
          <div className="text-2xl font-bold" dir="ltr">
            KM Tours
          </div>
          <div className="text-sm text-slate-500 mt-1">تسجيل دخول لوحة التحكم</div>
        </div>
        <div className="space-y-4">
          <Field label="البريد الإلكتروني">
            <input type="email" dir="ltr" value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} autoComplete="username" required />
          </Field>
          <Field label="كلمة المرور">
            <input type="password" dir="ltr" value={password} onChange={(e) => setPassword(e.target.value)} className={inputCls} autoComplete="current-password" required />
          </Field>
          {err && <p className="text-sm text-red-600">{err}</p>}
          <Button type="submit" disabled={busy} className="w-full py-2.5">
            {busy ? 'جارٍ الدخول...' : 'دخول'}
          </Button>
        </div>
      </form>
    </div>
  )
}

const NAV: { path: string; label: string; icon: ReactNode }[] = [
  { path: '/admin', label: 'لوحة التحكم', icon: <Icon d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" /> },
  { path: '/admin/bookings', label: 'الحجوزات', icon: <Icon d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" stroke /> },
  { path: '/admin/trips', label: 'الرحلات', icon: <Icon d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" stroke /> },
  { path: '/admin/destinations', label: 'الوجهات', icon: <Icon d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z" stroke /> },
  { path: '/admin/reviews', label: 'التقييمات', icon: <Icon d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" stroke /> },
  { path: '/admin/closed-dates', label: 'التواريخ المقفولة', icon: <Icon d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" stroke /> },
]

function Icon({ d, stroke }: { d: string; stroke?: boolean }) {
  return stroke ? (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d={d} />
    </svg>
  ) : (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d={d} />
    </svg>
  )
}

function Layout({ path, email }: { path: string; email: string }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [pending, setPending] = useState(0)
  const [pendingReviews, setPendingReviews] = useState(0)

  const refreshPending = useCallback(async () => {
    const [b, r] = await Promise.all([
      supabase!.from('bookings').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase!.from('reviews').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    ])
    setPending(b.count ?? 0)
    setPendingReviews(r.count ?? 0)
  }, [])

  useEffect(() => {
    void refreshPending()
    const id = setInterval(refreshPending, 60000)
    return () => clearInterval(id)
  }, [refreshPending])

  useEffect(() => setMenuOpen(false), [path])

  const parts = path.split('?')[0].split('/').filter(Boolean) // ['admin', ...]
  const section = parts[1] ?? ''

  let content: ReactNode
  if (section === 'trips' && parts[2]) content = <TripEditor id={decodeURIComponent(parts[2])} />
  else if (section === 'trips') content = <Trips />
  else if (section === 'destinations') content = <Destinations />
  else if (section === 'bookings') content = <Bookings onChange={refreshPending} />
  else if (section === 'reviews') content = <Reviews onChange={refreshPending} />
  else if (section === 'closed-dates') content = <BlockedDates />
  else content = <Dashboard />

  const active = (p: string) => (p === '/admin' ? section === '' : path.startsWith(p))

  return (
    <div className="min-h-screen lg:flex">
      {/* Sidebar */}
      <aside
        className={cx(
          'fixed lg:sticky top-0 z-40 h-screen w-64 shrink-0 bg-slate-900 text-slate-300 flex flex-col transition-transform',
          'start-0 lg:translate-x-0',
          menuOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0',
        )}
      >
        <div className="px-6 py-5 border-b border-slate-800">
          <div className="text-white text-lg font-bold" dir="ltr">
            KM Tours
          </div>
          <div className="text-xs text-slate-500">لوحة التحكم</div>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {NAV.map((n) => (
            <a
              key={n.path}
              href={'#' + n.path}
              className={cx(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                active(n.path) ? 'bg-sky-500 text-white' : 'hover:bg-slate-800 hover:text-white',
              )}
            >
              {n.icon}
              <span className="flex-1">{n.label}</span>
              {n.path === '/admin/bookings' && pending > 0 && (
                <span className="rounded-full bg-amber-400 text-slate-900 text-xs font-bold px-2 py-0.5">{pending}</span>
              )}
              {n.path === '/admin/reviews' && pendingReviews > 0 && (
                <span className="rounded-full bg-amber-400 text-slate-900 text-xs font-bold px-2 py-0.5">{pendingReviews}</span>
              )}
            </a>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-800 space-y-2">
          <a href="#/" target="_blank" rel="noopener" className="block text-sm text-slate-400 hover:text-white">
            ↗ عرض الموقع
          </a>
          <div className="text-xs text-slate-500 truncate" dir="ltr">
            {email}
          </div>
          <button onClick={() => supabase!.auth.signOut().then(() => go('/admin'))} className="text-sm text-red-400 hover:text-red-300">
            تسجيل الخروج
          </button>
        </div>
      </aside>
      {menuOpen && <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={() => setMenuOpen(false)} />}

      <div className="flex-1 min-w-0">
        <header className="lg:hidden sticky top-0 z-20 bg-white border-b border-slate-200 px-4 h-14 flex items-center justify-between">
          <button onClick={() => setMenuOpen(true)} className="p-2 -ms-2 rounded-lg hover:bg-slate-100" aria-label="القائمة">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="font-bold" dir="ltr">
            KM Tours
          </span>
          <span className="w-8" />
        </header>
        <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">{content}</main>
      </div>
    </div>
  )
}
