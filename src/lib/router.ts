import { useEffect, useState } from 'react'
import type { PageState } from '../data'

// Hash-based routing so the site works on any static host without server rewrites.
//   #/                      → home
//   #/d/<destination>       → destination
//   #/e/<destination>/<id>  → experience
//   #/review/<reference>    → leave a review for a booking
//   #/admin/...             → admin panel

export function pageToHash(p: PageState): string {
  switch (p.type) {
    case 'home':
      return '#/'
    case 'destination':
      return `#/d/${encodeURIComponent(p.id)}`
    case 'experience':
      return `#/e/${encodeURIComponent(p.destinationId)}/${encodeURIComponent(p.experienceId)}`
    case 'review':
      return `#/review/${encodeURIComponent(p.reference)}`
  }
}

export function currentPath(): string {
  const h = window.location.hash.replace(/^#/, '')
  return h.startsWith('/') ? h : '/' + h
}

export function pathToPage(path: string): PageState {
  const parts = path.split('?')[0].split('/').filter(Boolean).map(decodeURIComponent)
  if (parts[0] === 'd' && parts[1]) return { type: 'destination', id: parts[1] }
  if (parts[0] === 'e' && parts[1] && parts[2]) return { type: 'experience', destinationId: parts[1], experienceId: parts[2] }
  if (parts[0] === 'review' && parts[1]) return { type: 'review', reference: parts[1] }
  return { type: 'home' }
}

export function usePath(): string {
  const [path, setPath] = useState(currentPath)
  useEffect(() => {
    const onChange = () => setPath(currentPath())
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])
  return path
}

export function go(hashPath: string) {
  const target = hashPath.startsWith('#') ? hashPath : '#' + hashPath
  if (window.location.hash !== target) window.location.hash = target
}
