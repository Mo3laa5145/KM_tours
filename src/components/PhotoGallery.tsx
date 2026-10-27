import { useEffect, useState } from 'react'
import { useI18n } from '../lib/i18n'

export default function PhotoGallery({ photos, title }: { photos: string[]; title: string }) {
  const { t } = useI18n()
  const [viewer, setViewer] = useState<number | null>(null)
  const thumbs = photos.slice(1, 5)
  const n = photos.length

  useEffect(() => {
    if (viewer === null) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setViewer(null)
      if (e.key === 'ArrowRight') setViewer((v) => (v === null ? v : (v + 1) % n))
      if (e.key === 'ArrowLeft') setViewer((v) => (v === null ? v : (v - 1 + n) % n))
    }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [viewer, n])

  if (n === 0) return <div className="h-[240px] rounded-[20px] bg-[#E5E7EB]" />

  const cols =
    thumbs.length >= 4 ? 'md:grid-cols-[3fr_1fr_1fr] md:grid-rows-2' : thumbs.length >= 1 ? 'md:grid-cols-[2fr_1fr]' : 'md:grid-cols-1'
  const rows = thumbs.length >= 4 ? undefined : thumbs.length >= 1 ? { gridTemplateRows: `repeat(${Math.min(thumbs.length, 3)}, 1fr)` } : undefined
  const shownThumbs = thumbs.length >= 4 ? thumbs : thumbs.slice(0, 3)
  const hidden = n - 1 - shownThumbs.length

  return (
    <>
      <div className={`grid gap-2 grid-cols-1 ${cols} h-[300px] md:h-[480px] rounded-[20px] overflow-hidden`} style={rows}>
        <button
          type="button"
          className="relative overflow-hidden bg-[#E5E7EB] md:row-span-full"
          style={thumbs.length >= 4 ? { gridRow: 'span 2' } : undefined}
          onClick={() => setViewer(0)}
        >
          <img src={photos[0]} alt={title} className="w-full h-full object-cover" />
          {n > 1 && (
            <span className="md:hidden absolute bottom-3 end-3 rounded-full bg-black/60 text-white text-xs px-3 py-1">1 / {n}</span>
          )}
        </button>
        {shownThumbs.map((src, i) => (
          <button
            type="button"
            key={src + i}
            className="relative overflow-hidden bg-[#E5E7EB] hidden md:block"
            onClick={() => setViewer(i + 1)}
          >
            <img src={src} alt={`${title} ${i + 2}`} loading="lazy" className="w-full h-full object-cover transition-transform duration-300 hover:scale-105" />
            {i === shownThumbs.length - 1 && hidden > 0 && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/45">
                <span className="text-white font-semibold text-sm">{t('exp.more', { n: hidden })}</span>
              </div>
            )}
          </button>
        ))}
      </div>

      {viewer !== null && (
        <div className="fixed inset-0 z-[70] bg-black/95 flex items-center justify-center" onClick={() => setViewer(null)} dir="ltr">
          <img
            src={photos[viewer]}
            alt={title}
            className="max-w-[94vw] max-h-[86vh] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
          <button className="absolute top-4 right-4 w-11 h-11 rounded-full bg-white/10 text-white text-xl hover:bg-white/20" aria-label="Close">
            ✕
          </button>
          {n > 1 && (
            <>
              <button
                className="absolute left-3 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 text-white text-2xl hover:bg-white/20"
                onClick={(e) => {
                  e.stopPropagation()
                  setViewer((viewer - 1 + n) % n)
                }}
                aria-label="Previous"
              >
                ‹
              </button>
              <button
                className="absolute right-3 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 text-white text-2xl hover:bg-white/20"
                onClick={(e) => {
                  e.stopPropagation()
                  setViewer((viewer + 1) % n)
                }}
                aria-label="Next"
              >
                ›
              </button>
              <div className="absolute bottom-5 inset-x-0 text-center text-white/70 text-sm">
                {viewer + 1} / {n}
              </div>
            </>
          )}
        </div>
      )}
    </>
  )
}
