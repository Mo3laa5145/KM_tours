import { useState, useRef, useEffect } from 'react'
import type { PageState } from '../data'
import { DESTINATIONS } from '../data'

interface SearchBarProps {
  navigate: (p: PageState) => void
  large?: boolean
  defaultValue?: string
}

export default function SearchBar({ navigate, large, defaultValue = '' }: SearchBarProps) {
  const [query, setQuery] = useState(defaultValue)
  const [open, setOpen] = useState(false)
  const [focused, setFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const filtered = query.trim().length === 0
    ? DESTINATIONS
    : DESTINATIONS.filter((d) =>
        d.name.toLowerCase().includes(query.toLowerCase())
      )

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
        setFocused(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleSelect = (id: string) => {
    setOpen(false)
    setFocused(false)
    setQuery('')
    navigate({ type: 'destination', id })
  }

  const showDropdown = (focused || open) && filtered.length > 0

  return (
    <div ref={containerRef} className={`relative ${large ? 'w-full max-w-2xl' : 'w-full max-w-lg'}`}>
      <div
        className="flex items-center transition-all duration-200"
        style={{
          backgroundColor: '#fff',
          border: `1.5px solid ${focused ? '#0EA5E9' : '#E5E7EB'}`,
          borderRadius: large ? '16px' : '12px',
          boxShadow: focused
            ? '0 0 0 4px rgba(14,165,233,0.1), 0 4px 24px rgba(0,0,0,0.08)'
            : '0 2px 12px rgba(0,0,0,0.06)',
          height: large ? '60px' : '48px',
          padding: large ? '0 20px' : '0 16px',
        }}
      >
        <svg
          className="shrink-0 mr-3"
          style={{ color: focused ? '#0EA5E9' : '#94A3B8', width: large ? '20px' : '18px', height: large ? '20px' : '18px' }}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true) }}
          onFocus={() => { setFocused(true); setOpen(true) }}
          placeholder="Search destinations like Hurghada, Cairo, Luxor..."
          className="flex-1 bg-transparent outline-none"
          style={{
            fontSize: large ? '16px' : '15px',
            color: '#1E293B',
            fontFamily: 'inherit',
          }}
        />
        {query && (
          <button
            onClick={() => { setQuery(''); inputRef.current?.focus() }}
            className="ml-2 shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-colors"
            style={{ backgroundColor: '#E5E7EB', color: '#64748B' }}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Dropdown */}
      {showDropdown && (
        <div
          className="absolute top-full mt-2 w-full rounded-2xl py-2 z-40"
          style={{
            backgroundColor: '#fff',
            border: '1px solid #E5E7EB',
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          }}
        >
          {filtered.length === 0 ? (
            <div className="px-4 py-6 text-center text-sm" style={{ color: '#94A3B8' }}>
              No destinations found
            </div>
          ) : (
            filtered.map((dest) => (
              <button
                key={dest.id}
                onClick={() => handleSelect(dest.id)}
                className="w-full flex items-center gap-3 px-4 py-3 transition-colors text-left"
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = '#F8FCFD')}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = 'transparent')}
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: '#F0F9FF' }}
                >
                  <svg className="w-4 h-4" style={{ color: '#0EA5E9' }} fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-2.003 3.5-4.697 3.5-8.327a8 8 0 10-16 0c0 3.63 1.556 6.326 3.5 8.327a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold" style={{ color: '#1E293B' }}>
                    {dest.name}
                  </div>
                  <div className="text-xs mt-0.5" style={{ color: '#94A3B8' }}>
                    {dest.experiences.length} experiences available
                  </div>
                </div>
                <svg className="w-4 h-4 shrink-0" style={{ color: '#CBD5E1' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}
