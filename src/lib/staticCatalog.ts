import { DESTINATIONS as STATIC_DESTINATIONS } from '../data'
import { DESTINATION_TRANSLATIONS } from './seedTranslations'
import AR from '../content/trips.ar.json'
import FR from '../content/trips.fr.json'
import DE from '../content/trips.de.json'

const TRANSLATED = { ar: AR, fr: FR, de: DE } as unknown as Record<'ar' | 'fr' | 'de', Record<string, TripContent>>
import { parseDurationHours, type DestinationRecord, type TripContent, type TripRecord } from './catalog'

// ---------- Built-in demo catalog (used when Supabase is not configured) ----------

export function staticCatalog(): { destinations: DestinationRecord[]; trips: TripRecord[] } {
  const destinations: DestinationRecord[] = STATIC_DESTINATIONS.map((d, i) => {
    const tr = DESTINATION_TRANSLATIONS[d.id]
    return {
      id: d.id,
      name: { en: d.name, ar: tr?.ar.name, fr: tr?.fr.name, de: tr?.de.name },
      description: { en: d.description, ar: tr?.ar.description, fr: tr?.fr.description, de: tr?.de.description },
      coverPhoto: d.coverPhoto,
      sortOrder: i,
      published: true,
    }
  })
  const trips: TripRecord[] = STATIC_DESTINATIONS.flatMap((d) =>
    d.experiences.map((e, i) => {
      const en: TripContent = {
        title: e.title,
        duration: e.duration,
        description: e.description,
        highlights: e.highlights,
        itinerary: e.itinerary,
        included: e.included,
        excluded: e.excluded,
        meetingPoint: e.meetingPoint,
        whatToBring: e.whatToBring,
        cancellationPolicy: e.cancellationPolicy,
        faq: e.faq,
      }
      return {
        id: e.id,
        destinationId: d.id,
        category: e.category,
        price: e.price,
        childPrice: Math.round(e.price * 0.5),
        durationHours: parseDurationHours(e.duration),
        tourLanguages: e.languages,
        pickupAvailable: e.pickupAvailable,
        freeCancellation: e.freeCancellation,
        provider: e.provider,
        photos: uniqueByImage([...e.photos, e.photo]),
        rating: e.rating,
        reviewCount: e.reviewCount,
        reviews: e.reviews,
        content: {
          en,
          ar: TRANSLATED.ar[e.id],
          fr: TRANSLATED.fr[e.id],
          de: TRANSLATED.de[e.id],
        },
        published: true,
        featured: false,
        sortOrder: i,
        maxGuests: null,
        childrenAllowed: true,
        childMinAge: 4,
        childMaxAge: 11,
        infantsAllowed: true,
      }
    }),
  )
  return { destinations, trips }
}


/** Same Unsplash image in different sizes counts once (keeps the first, larger version). */
function uniqueByImage(urls: string[]): string[] {
  const seen = new Set<string>()
  return urls.filter((u) => {
    const key = u.split('?')[0]
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}
