import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'

export const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(' ')

export const inputCls =
  'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-100 disabled:bg-slate-50 disabled:text-slate-400'

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'success'
  size?: 'sm' | 'md'
}) {
  const v = {
    primary: 'bg-sky-500 text-white hover:bg-sky-700',
    secondary: 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50',
    danger: 'bg-white text-red-600 border border-red-200 hover:bg-red-50',
    ghost: 'text-slate-600 hover:bg-slate-100',
    success: 'bg-emerald-600 text-white hover:bg-emerald-700',
  }[variant]
  const s = size === 'sm' ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-sm'
  return (
    <button
      type="button"
      {...rest}
      className={cx('inline-flex items-center justify-center gap-1.5 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed', v, s, className)}
    >
      {children}
    </button>
  )
}

export function Card({ title, actions, children, className }: { title?: ReactNode; actions?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <div className={cx('rounded-2xl bg-white border border-slate-200 shadow-sm', className)}>
      {(title || actions) && (
        <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-slate-100">
          <div className="font-semibold text-slate-800">{title}</div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  )
}

export function Field({ label, hint, children, className }: { label: ReactNode; hint?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <label className={cx('block', className)}>
      <span className="block text-xs font-semibold text-slate-500 mb-1.5">{label}</span>
      {children}
      {hint && <span className="block text-xs text-slate-400 mt-1">{hint}</span>}
    </label>
  )
}

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: ReactNode }) {
  return (
    <button type="button" onClick={() => onChange(!checked)} className="flex items-center gap-2.5 text-sm text-slate-700">
      <span className={cx('relative w-10 h-6 rounded-full transition-colors', checked ? 'bg-emerald-500' : 'bg-slate-300')}>
        <span
          className={cx(
            'absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all',
            checked ? 'start-[18px]' : 'start-0.5',
          )}
        />
      </span>
      {label}
    </button>
  )
}

export function Badge({ children, color = 'slate' }: { children: ReactNode; color?: 'slate' | 'amber' | 'emerald' | 'sky' | 'red' | 'violet' }) {
  const c = {
    slate: 'bg-slate-100 text-slate-600',
    amber: 'bg-amber-100 text-amber-700',
    emerald: 'bg-emerald-100 text-emerald-700',
    sky: 'bg-sky-100 text-sky-700',
    red: 'bg-red-100 text-red-700',
    violet: 'bg-violet-100 text-violet-700',
  }[color]
  return <span className={cx('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap', c)}>{children}</span>
}

export function Spinner() {
  return <div className="w-6 h-6 border-2 border-slate-200 border-t-sky-500 rounded-full animate-spin" />
}

export function Empty({ children }: { children: ReactNode }) {
  return <div className="py-10 text-center text-sm text-slate-400">{children}</div>
}

export function Modal({ open, onClose, title, children, wide }: { open: boolean; onClose: () => void; title: ReactNode; children: ReactNode; wide?: boolean }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-slate-900/40 p-3 overflow-y-auto" onMouseDown={onClose}>
      <div
        className={cx('w-full rounded-2xl bg-white shadow-xl my-6', wide ? 'max-w-3xl' : 'max-w-lg')}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="font-semibold text-slate-800">{title}</div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-slate-100 text-slate-500" aria-label="إغلاق">
            ✕
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}

// ---------- Toasts & confirm ----------

type Toast = { id: number; text: string; kind: 'ok' | 'err' }
interface Ui {
  toast: (text: string, kind?: 'ok' | 'err') => void
  confirm: (text: string, danger?: boolean) => Promise<boolean>
}
const UiContext = createContext<Ui | null>(null)

export function UiProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const [ask, setAsk] = useState<{ text: string; danger: boolean; resolve: (v: boolean) => void } | null>(null)

  const toast = useCallback((text: string, kind: 'ok' | 'err' = 'ok') => {
    const id = Date.now() + Math.random()
    setToasts((t) => [...t, { id, text, kind }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), kind === 'err' ? 7000 : 3500)
  }, [])

  const confirm = useCallback(
    (text: string, danger = true) => new Promise<boolean>((resolve) => setAsk({ text, danger, resolve })),
    [],
  )

  const close = (v: boolean) => {
    ask?.resolve(v)
    setAsk(null)
  }

  return (
    <UiContext.Provider value={{ toast, confirm }}>
      {children}
      <div className="fixed bottom-4 inset-x-0 z-[60] flex flex-col items-center gap-2 pointer-events-none px-4">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cx(
              'pointer-events-auto rounded-xl px-4 py-3 text-sm font-medium shadow-lg max-w-md',
              t.kind === 'ok' ? 'bg-slate-900 text-white' : 'bg-red-600 text-white',
            )}
          >
            {t.text}
          </div>
        ))}
      </div>
      <Modal open={!!ask} onClose={() => close(false)} title="تأكيد">
        <p className="text-sm text-slate-600 mb-5 whitespace-pre-line">{ask?.text}</p>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => close(false)}>
            إلغاء
          </Button>
          <Button variant={ask?.danger ? 'danger' : 'primary'} onClick={() => close(true)}>
            تأكيد
          </Button>
        </div>
      </Modal>
    </UiContext.Provider>
  )
}

export function useUi(): Ui {
  const v = useContext(UiContext)
  if (!v) throw new Error('useUi outside UiProvider')
  return v
}

export function errorText(err: unknown): string {
  if (!err) return 'حدث خطأ غير معروف'
  const e = err as { message?: string; details?: string; code?: string }
  const msg = e.message ?? String(err)
  if (/violates foreign key/.test(msg) || e.code === '23503') return 'لا يمكن الحذف لأن هناك بيانات مرتبطة به (مثل رحلات داخل هذه الوجهة).'
  if (e.code === '23505') return 'هذا المعرّف (ID) مستخدم بالفعل، اختر واحدًا آخر.'
  if (/row-level security|permission denied|not authorized/i.test(msg)) return 'ليس لديك صلاحية. تأكد أن حسابك مضاف في جدول admins.'
  if (/Invalid login credentials/i.test(msg)) return 'البريد الإلكتروني أو كلمة المرور غير صحيحة.'
  if (/Failed to fetch|NetworkError/i.test(msg)) return 'تعذر الاتصال بالسيرفر. تحقق من الإنترنت.'
  return msg
}
