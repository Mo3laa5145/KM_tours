import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  destinationFromRow,
  localizeCatalog,
  tripFromRow,
  type DestinationRecord,
  type DestinationRow,
  type LocalizedDestination,
  type LocalizedExperience,
  type TripRecord,
  type TripRow,
} from './catalog'
import { supabase } from './supabase'
import { useI18n } from './i18n'

interface CatalogValue {
  loading: boolean
  source: 'database' | 'demo'
  destinations: LocalizedDestination[]
  allExperiences: LocalizedExperience[]
  getDestination: (id: string) => LocalizedDestination | undefined
  getExperience: (destinationId: string, id: string) => LocalizedExperience | undefined
  /** true when the trip has text in the current language (otherwise English is shown) */
  hasTranslation: (id: string) => boolean
  reload: () => Promise<void>
}

const CatalogContext = createContext<CatalogValue | null>(null)

/** Built-in demo trips, only downloaded when the database isn't available. */
async function loadDemo() {
  const m = await import('./staticCatalog')
  return m.staticCatalog()
}

export async function fetchCatalog(includeUnpublished = false): Promise<{
  destinations: DestinationRecord[]
  trips: TripRecord[]
}> {
  if (!supabase) return loadDemo()
  let dq = supabase.from('destinations').select('*').order('sort_order')
  let tq = supabase.from('experiences').select('*').order('sort_order')
  if (!includeUnpublished) {
    dq = dq.eq('published', true)
    tq = tq.eq('published', true)
  }
  const [d, t] = await Promise.all([dq, tq])
  if (d.error) throw d.error
  if (t.error) throw t.error
  return {
    destinations: (d.data as DestinationRow[]).map(destinationFromRow),
    trips: (t.data as TripRow[]).map(tripFromRow),
  }
}

export function CatalogProvider({ children }: { children: ReactNode }) {
  const { lang, durationLabel } = useI18n()
  const [raw, setRaw] = useState<{ destinations: DestinationRecord[]; trips: TripRecord[] } | null>(null)
  const [source, setSource] = useState<'database' | 'demo'>(supabase ? 'database' : 'demo')

  const reload = useCallback(async () => {
    if (!supabase) {
      setRaw(await loadDemo())
      return
    }
    try {
      const data = await fetchCatalog()
      setRaw(data)
      setSource('database')
    } catch (err) {
      console.error('[KM Tours] Could not load trips from the database, showing demo data.', err)
      setRaw(await loadDemo())
      setSource('demo')
    }
  }, [])

  useEffect(() => {
    void reload()
  }, [reload])

  const value = useMemo<CatalogValue>(() => {
    const destinations = raw ? localizeCatalog(raw.destinations, raw.trips, lang, durationLabel) : []
    const allExperiences = destinations.flatMap((d) => d.experiences)
    return {
      loading: raw === null,
      source,
      destinations,
      allExperiences,
      getDestination: (id) => destinations.find((d) => d.id === id),
      getExperience: (destId, id) => allExperiences.find((e) => e.id === id && e.destinationId === destId),
      hasTranslation: (id) => {
        if (lang === 'en') return true
        const c = raw?.trips.find((t) => t.id === id)?.content[lang]
        return Boolean(c?.description?.trim())
      },
      reload,
    }
  }, [raw, lang, durationLabel, source, reload])

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>
}

export function useCatalog(): CatalogValue {
  const v = useContext(CatalogContext)
  if (!v) throw new Error('useCatalog must be used inside CatalogProvider')
  return v
}
