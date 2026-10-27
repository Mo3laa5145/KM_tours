import type { Experience, ExperienceCategory, Review, Destination } from '../data'

export type Lang = 'en' | 'ar' | 'fr' | 'de'
export const LANGS: Lang[] = ['en', 'ar', 'fr', 'de']

export type I18nText = Partial<Record<Lang, string>>

export interface TripContent {
  title: string
  duration: string
  description: string
  highlights: string[]
  itinerary: { time: string; activity: string }[]
  included: string[]
  excluded: string[]
  meetingPoint: string
  whatToBring: string[]
  cancellationPolicy: string
  faq: { question: string; answer: string }[]
}

/** A trip as stored in the database (all languages). */
export interface TripRecord {
  id: string
  destinationId: string
  category: ExperienceCategory
  price: number
  childPrice: number | null
  durationHours: number | null
  tourLanguages: string[]
  pickupAvailable: boolean
  freeCancellation: boolean
  provider: string
  photos: string[]
  rating: number
  reviewCount: number
  reviews: Review[]
  content: Partial<Record<Lang, Partial<TripContent>>>
  published: boolean
  featured: boolean
  sortOrder: number
  maxGuests: number | null
  childrenAllowed: boolean
  childMinAge: number
  childMaxAge: number
  infantsAllowed: boolean
}

export interface DestinationRecord {
  id: string
  name: I18nText
  description: I18nText
  coverPhoto: string
  sortOrder: number
  published: boolean
}

/** Localized trip used by the public pages. */
export interface LocalizedExperience extends Experience {
  durationHours: number | null
  childPrice: number
  maxGuests: number | null
  childrenAllowed: boolean
  childMinAge: number
  childMaxAge: number
  infantsAllowed: boolean
}

export interface LocalizedDestination extends Omit<Destination, 'experiences'> {
  experiences: LocalizedExperience[]
}

export const CATEGORIES: ExperienceCategory[] = [
  'Water Sports',
  'Desert & Adventure',
  'Cultural & Historical',
  'Cruises & Sailing',
  'Nature & Wildlife',
]

export function emptyContent(): TripContent {
  return {
    title: '',
    duration: '',
    description: '',
    highlights: [],
    itinerary: [],
    included: [],
    excluded: [],
    meetingPoint: '',
    whatToBring: [],
    cancellationPolicy: '',
    faq: [],
  }
}

export function pickText(text: I18nText | undefined, lang: Lang): string {
  if (!text) return ''
  return text[lang]?.trim() || text.en?.trim() || Object.values(text).find((v) => v?.trim()) || ''
}

function pickList<T>(lang: Lang, content: TripRecord['content'], key: keyof TripContent): T[] {
  for (const l of [lang, 'en', ...LANGS] as Lang[]) {
    const v = content[l]?.[key] as T[] | undefined
    if (v && v.length > 0) return v
  }
  return []
}

function pickStr(lang: Lang, content: TripRecord['content'], key: keyof TripContent): string {
  for (const l of [lang, 'en', ...LANGS] as Lang[]) {
    const v = content[l]?.[key] as string | undefined
    if (v && v.trim()) return v
  }
  return ''
}

export function parseDurationHours(text: string): number | null {
  const nums = (text.match(/\d+(\.\d+)?/g) ?? []).map(Number)
  if (nums.length === 0) return null
  return nums.reduce((a, b) => a + b, 0) / nums.length
}

export function localizeTrip(t: TripRecord, lang: Lang, durationLabel: (h: number) => string): LocalizedExperience {
  const c = t.content
  let duration = pickStr(lang, c, 'duration')
  // Use an automatic localized label when no translation exists for this language.
  if ((!c[lang]?.duration || !c[lang]?.duration?.trim()) && lang !== 'en' && t.durationHours) {
    duration = durationLabel(t.durationHours)
  }
  if (!duration && t.durationHours) duration = durationLabel(t.durationHours)
  const photos = t.photos.length > 0 ? t.photos : []
  return {
    id: t.id,
    destinationId: t.destinationId,
    title: pickStr(lang, c, 'title') || t.id,
    category: t.category,
    photo: photos[0] ?? '',
    photos,
    rating: t.rating,
    reviewCount: t.reviewCount,
    duration,
    durationHours: t.durationHours,
    languages: t.tourLanguages,
    pickupAvailable: t.pickupAvailable,
    freeCancellation: t.freeCancellation,
    price: t.price,
    childPrice: t.childPrice ?? Math.round(t.price * 0.5),
    maxGuests: t.maxGuests,
    childrenAllowed: t.childrenAllowed,
    childMinAge: t.childMinAge,
    childMaxAge: t.childMaxAge,
    infantsAllowed: t.infantsAllowed,
    provider: t.provider,
    description: pickStr(lang, c, 'description'),
    highlights: pickList(lang, c, 'highlights'),
    itinerary: pickList(lang, c, 'itinerary'),
    included: pickList(lang, c, 'included'),
    excluded: pickList(lang, c, 'excluded'),
    meetingPoint: pickStr(lang, c, 'meetingPoint'),
    whatToBring: pickList(lang, c, 'whatToBring'),
    cancellationPolicy: pickStr(lang, c, 'cancellationPolicy'),
    reviews: t.reviews,
    faq: pickList(lang, c, 'faq'),
  }
}

export function localizeCatalog(
  destinations: DestinationRecord[],
  trips: TripRecord[],
  lang: Lang,
  durationLabel: (h: number) => string,
  includeUnpublished = false,
): LocalizedDestination[] {
  return destinations
    .filter((d) => includeUnpublished || d.published)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((d) => ({
      id: d.id,
      name: pickText(d.name, lang) || d.id,
      description: pickText(d.description, lang),
      coverPhoto: d.coverPhoto,
      experiences: trips
        .filter((t) => t.destinationId === d.id && (includeUnpublished || t.published))
        .sort((a, b) => Number(b.featured) - Number(a.featured) || a.sortOrder - b.sortOrder)
        .map((t) => localizeTrip(t, lang, durationLabel)),
    }))
}

// ---------- Database mapping ----------

export interface TripRow {
  id: string
  destination_id: string
  category: string
  price: number
  child_price: number | null
  duration_hours: number | null
  tour_languages: string[] | null
  pickup_available: boolean
  free_cancellation: boolean
  provider: string | null
  photos: string[] | null
  rating: number | null
  review_count: number | null
  reviews: Review[] | null
  content: TripRecord['content'] | null
  published: boolean
  featured: boolean
  sort_order: number | null
  max_guests: number | null
  children_allowed?: boolean | null
  child_min_age?: number | null
  child_max_age?: number | null
  infants_allowed?: boolean | null
}

export interface DestinationRow {
  id: string
  name: I18nText | null
  description: I18nText | null
  cover_photo: string | null
  sort_order: number | null
  published: boolean
}

export function tripFromRow(r: TripRow): TripRecord {
  return {
    id: r.id,
    destinationId: r.destination_id,
    category: r.category as ExperienceCategory,
    price: Number(r.price) || 0,
    childPrice: r.child_price === null ? null : Number(r.child_price),
    durationHours: r.duration_hours === null ? null : Number(r.duration_hours),
    tourLanguages: r.tour_languages ?? [],
    pickupAvailable: r.pickup_available,
    freeCancellation: r.free_cancellation,
    provider: r.provider ?? '',
    photos: r.photos ?? [],
    rating: Number(r.rating ?? 5),
    reviewCount: r.review_count ?? 0,
    reviews: r.reviews ?? [],
    content: r.content ?? {},
    published: r.published,
    featured: r.featured,
    sortOrder: r.sort_order ?? 0,
    maxGuests: r.max_guests,
    childrenAllowed: r.children_allowed ?? true,
    childMinAge: r.child_min_age ?? 4,
    childMaxAge: r.child_max_age ?? 11,
    infantsAllowed: r.infants_allowed ?? true,
  }
}

export function tripToRow(t: TripRecord): TripRow {
  return {
    id: t.id,
    destination_id: t.destinationId,
    category: t.category,
    price: t.price,
    child_price: t.childPrice,
    duration_hours: t.durationHours,
    tour_languages: t.tourLanguages,
    pickup_available: t.pickupAvailable,
    free_cancellation: t.freeCancellation,
    provider: t.provider,
    photos: t.photos,
    rating: t.rating,
    review_count: t.reviewCount,
    reviews: t.reviews,
    content: t.content,
    published: t.published,
    featured: t.featured,
    sort_order: t.sortOrder,
    max_guests: t.maxGuests,
    children_allowed: t.childrenAllowed,
    child_min_age: t.childMinAge,
    child_max_age: t.childMaxAge,
    infants_allowed: t.infantsAllowed,
  }
}

export function destinationFromRow(r: DestinationRow): DestinationRecord {
  return {
    id: r.id,
    name: r.name ?? {},
    description: r.description ?? {},
    coverPhoto: r.cover_photo ?? '',
    sortOrder: r.sort_order ?? 0,
    published: r.published,
  }
}

export function destinationToRow(d: DestinationRecord): DestinationRow {
  return {
    id: d.id,
    name: d.name,
    description: d.description,
    cover_photo: d.coverPhoto,
    sort_order: d.sortOrder,
    published: d.published,
  }
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
}
