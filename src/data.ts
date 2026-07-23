export type PageState =
  | { type: 'home' }
  | { type: 'destination'; id: string }
  | { type: 'experience'; destinationId: string; experienceId: string }

export type Currency = 'EGP' | 'USD' | 'EUR'
export type Language = 'EN' | 'AR' | 'DE' | 'PL' | 'IT' | 'RU'

export const EXCHANGE_RATES: Record<Currency, number> = {
  EGP: 1,
  USD: 0.021,
  EUR: 0.019,
}

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  EGP: 'EGP',
  USD: '$',
  EUR: '€',
}

export const LANGUAGE_LABELS: Record<Language, string> = {
  EN: 'English',
  AR: 'العربية',
  DE: 'Deutsch',
  PL: 'Polski',
  IT: 'Italiano',
  RU: 'Русский',
}

export function formatPrice(egp: number, currency: Currency): string {
  const rate = EXCHANGE_RATES[currency]
  const amount = Math.round(egp * rate)
  if (currency === 'EGP') return `EGP ${amount.toLocaleString()}`
  if (currency === 'USD') return `$${amount}`
  return `€${amount}`
}

export type ExperienceCategory =
  | 'Water Sports'
  | 'Desert & Adventure'
  | 'Cultural & Historical'
  | 'Cruises & Sailing'
  | 'Nature & Wildlife'

export interface Review {
  id: string
  name: string
  country: string
  date: string
  rating: number
  comment: string
}

export interface Experience {
  id: string
  destinationId: string
  title: string
  category: ExperienceCategory
  photo: string
  photos: string[]
  rating: number
  reviewCount: number
  duration: string
  languages: string[]
  pickupAvailable: boolean
  freeCancellation: boolean
  price: number
  provider: string
  description: string
  highlights: string[]
  itinerary: { time: string; activity: string }[]
  included: string[]
  excluded: string[]
  meetingPoint: string
  whatToBring: string[]
  cancellationPolicy: string
  reviews: Review[]
  faq: { question: string; answer: string }[]
}

export interface Destination {
  id: string
  name: string
  description: string
  coverPhoto: string
  experiences: Experience[]
}

const img = (id: string, w = 800, h = 560) =>
  `https://images.unsplash.com/photo-${id}?w=${w}&h=${h}&fit=crop&auto=format&q=80`

const HURGHADA_EXPERIENCES: Experience[] = [
  {
    id: 'hurg-1',
    destinationId: 'hurghada',
    title: 'Stargazing Desert Safari',
    category: 'Desert & Adventure',
    photo: img('1577085375786-edb0f45560aa'),
    photos: [
      img('1577085375786-edb0f45560aa', 1200, 800),
      img('1713021714419-ca3a7bc12f00', 800, 560),
      img('1509316785289-025f5b846b35', 800, 560),
      img('1577085375786-edb0f45560aa', 800, 560),
      img('1713021714419-ca3a7bc12f00', 800, 560),
    ],
    rating: 4.9,
    reviewCount: 312,
    duration: '5 hours',
    languages: ['English', 'Arabic', 'German'],
    pickupAvailable: true,
    freeCancellation: true,
    price: 890,
    provider: 'Desert Wings Egypt',
    description:
      'Escape the city lights for an unforgettable night under the Sahara sky. This intimate stargazing experience takes you deep into the Eastern Desert where expert astronomers guide you through constellations, planets, and galaxies visible only in Egypt\'s exceptional dark skies. Around a campfire with traditional Bedouin tea, you\'ll witness a sky unlike anything you\'ve seen before.',
    highlights: [
      'Ride in a 4x4 jeep deep into the Eastern Desert, far from light pollution',
      'Professional astronomer leads a live tour of the night sky',
      'Powerful telescope viewing of planets, nebulae, and star clusters',
      'Traditional Bedouin campfire with tea, coffee, and light snacks',
      'Maximum group size of 8 for an intimate, personal experience',
      'Photography tips for capturing the Milky Way',
    ],
    itinerary: [
      { time: '19:00', activity: 'Hotel pickup from Hurghada and Sahl Hasheesh' },
      { time: '20:00', activity: 'Arrive at base camp — welcome drinks and orientation' },
      { time: '20:30', activity: 'Guided star tour begins — naked-eye constellations and storytelling' },
      { time: '21:30', activity: 'Telescope session with deep-sky objects and planets' },
      { time: '22:30', activity: 'Campfire with Bedouin snacks and hot drinks' },
      { time: '23:30', activity: 'Return transfer to hotel' },
    ],
    included: [
      'Hotel pickup and drop-off',
      'Private 4x4 desert transport',
      'Professional English-speaking astronomer',
      'High-powered telescope',
      'Bedouin tea, coffee, and light snacks',
      'Warm blankets for the desert chill',
    ],
    excluded: [
      'Gratuities (recommended)',
      'Alcoholic beverages',
      'Personal travel insurance',
    ],
    meetingPoint:
      'Your hotel lobby in Hurghada, Sahl Hasheesh, or El Gouna. Exact pickup time confirmed 24 hours before.',
    whatToBring: [
      'Warm layer or light jacket (desert nights are cool)',
      'Comfortable closed-toe shoes',
      'Camera or smartphone for astrophotography',
      'Personal water bottle',
    ],
    cancellationPolicy:
      'Free cancellation up to 24 hours before the experience starts. No refund for cancellations within 24 hours or no-shows.',
    faq: [
      {
        question: 'Is this experience suitable for children?',
        answer:
          'Yes, this experience is family-friendly and suitable for children aged 6 and above. Young stargazers often find it magical.',
      },
      {
        question: 'What happens if the weather is bad?',
        answer:
          'In the unlikely event of clouds, we will reschedule at no charge or offer a full refund. Hurghada has over 330 clear nights per year.',
      },
      {
        question: 'How far is the drive into the desert?',
        answer:
          'Approximately 45 minutes from Hurghada center. The road is smooth and the 4x4 handles all terrain comfortably.',
      },
    ],
    reviews: [
      {
        id: 'r1',
        name: 'Anna M.',
        country: 'Germany',
        date: 'December 2024',
        rating: 5,
        comment:
          'Absolutely breathtaking. The astronomer knew the sky so well and made it feel like a personal discovery. The Milky Way was visible with the naked eye — I had never seen anything like it.',
      },
      {
        id: 'r2',
        name: 'James T.',
        country: 'United Kingdom',
        date: 'January 2025',
        rating: 5,
        comment:
          'The highlight of our entire Egypt trip. Small group, excellent guide, and the telescope views of Saturn\'s rings left our kids speechless. Highly recommended.',
      },
      {
        id: 'r3',
        name: 'Sophie B.',
        country: 'France',
        date: 'November 2024',
        rating: 4,
        comment:
          'Magical experience. The Bedouin tea around the campfire was a lovely touch. Docking one star only because pickup was slightly late, but otherwise perfect.',
      },
    ],
  },
  {
    id: 'hurg-2',
    destinationId: 'hurghada',
    title: 'Orange Bay Snorkeling Cruise',
    category: 'Water Sports',
    photo: img('1700482323555-182b61c90794'),
    photos: [
      img('1700482323555-182b61c90794', 1200, 800),
      img('1583157048761-ac1dba033233', 800, 560),
      img('1638123657021-f9aca72f8caf', 800, 560),
      img('1625754884730-ba1e2eaafe91', 800, 560),
      img('1700482323555-182b61c90794', 800, 560),
    ],
    rating: 4.7,
    reviewCount: 891,
    duration: '7 hours',
    languages: ['English', 'Arabic', 'Russian', 'Italian'],
    pickupAvailable: true,
    freeCancellation: true,
    price: 650,
    provider: 'Red Sea Adventures',
    description:
      'Cruise to the pristine shores of Orange Bay, one of the most stunning beaches in the Red Sea. Snorkel vibrant coral gardens teeming with tropical fish, relax on a white-sand beach that sees fewer crowds than the main tourist areas, and enjoy a freshly prepared lunch on board. This full-day boat trip is the definitive Red Sea experience.',
    highlights: [
      'Visit Orange Bay, Giftun Island — some of Egypt\'s most pristine beaches',
      'Two snorkeling stops over thriving coral reef ecosystems',
      'Freshly prepared Egyptian buffet lunch on board',
      'Glass-bottom boat viewing for non-swimmers',
      'Free time to swim, sunbathe, and explore',
      'Professional snorkeling equipment included',
    ],
    itinerary: [
      { time: '08:00', activity: 'Hotel pickup and transfer to Hurghada Marina' },
      { time: '09:00', activity: 'Depart marina — welcome drinks and orientation' },
      { time: '10:00', activity: 'First snorkeling stop at coral reef' },
      { time: '11:30', activity: 'Arrive at Orange Bay beach — free beach time' },
      { time: '13:30', activity: 'Buffet lunch served on board' },
      { time: '14:30', activity: 'Second snorkeling stop at Giftun Island' },
      { time: '16:00', activity: 'Return cruise to Hurghada Marina' },
      { time: '17:00', activity: 'Hotel drop-off' },
    ],
    included: [
      'Hotel transfers',
      'Full-day boat trip',
      'Snorkeling equipment (mask, fins, vest)',
      'Egyptian buffet lunch',
      'Soft drinks and water',
      'National park entry fees',
    ],
    excluded: [
      'Alcoholic beverages (available for purchase)',
      'Underwater camera rental',
      'Gratuities',
    ],
    meetingPoint: 'Hotel pickup throughout Hurghada, El Gouna, and Sahl Hasheesh.',
    whatToBring: [
      'Swimwear and towel',
      'Sunscreen (reef-safe preferred)',
      'Sunglasses and hat',
      'Change of clothes',
      'Underwater camera (optional)',
    ],
    cancellationPolicy:
      'Free cancellation up to 24 hours before departure. In case of bad sea conditions, a full refund or reschedule is offered.',
    faq: [
      {
        question: 'Can non-swimmers participate?',
        answer:
          'Absolutely. Life vests are provided and the glass-bottom boat section is perfect for those who prefer not to snorkel.',
      },
      {
        question: 'Is lunch suitable for vegetarians?',
        answer:
          'Yes, the buffet includes multiple vegetarian options. Please notify us of any dietary requirements when booking.',
      },
    ],
    reviews: [
      {
        id: 'r1',
        name: 'Maria K.',
        country: 'Poland',
        date: 'March 2025',
        rating: 5,
        comment:
          'Perfect day out. Orange Bay truly is a paradise — turquoise water, white sand, colorful fish everywhere. The crew was friendly and the food was great.',
      },
      {
        id: 'r2',
        name: 'David L.',
        country: 'USA',
        date: 'February 2025',
        rating: 4,
        comment:
          'Really enjoyed this trip. The coral was stunning and we saw a sea turtle! Boat was comfortable. Slightly crowded at Orange Bay but still beautiful.',
      },
    ],
  },
  {
    id: 'hurg-3',
    destinationId: 'hurghada',
    title: '3 Islands Dolphin Yacht Trip',
    category: 'Cruises & Sailing',
    photo: img('1583157048761-ac1dba033233'),
    photos: [
      img('1583157048761-ac1dba033233', 1200, 800),
      img('1625754884730-ba1e2eaafe91', 800, 560),
      img('1700482323555-182b61c90794', 800, 560),
      img('1638123657021-f9aca72f8caf', 800, 560),
      img('1583157048761-ac1dba033233', 800, 560),
    ],
    rating: 4.8,
    reviewCount: 543,
    duration: '8 hours',
    languages: ['English', 'Arabic', 'German', 'Russian'],
    pickupAvailable: true,
    freeCancellation: true,
    price: 1200,
    provider: 'Blue Horizon Yachts',
    description:
      'Sail to three of the Red Sea\'s most beautiful islands on a private or semi-private yacht and encounter wild spinner dolphins in their natural habitat. This premium trip includes the best snorkeling spots, a freshly prepared seafood lunch, and the chance to witness dolphin pods swimming alongside the boat — one of the most memorable experiences in Egypt.',
    highlights: [
      'Visit three uninhabited islands including the famous Dolphin House reef',
      'High chance of encountering wild spinner dolphins',
      'Premium yacht with shaded deck and sun loungers',
      'Two world-class snorkeling stops',
      'Fresh seafood and Egyptian lunch on board',
      'Small group — maximum 12 guests',
    ],
    itinerary: [
      { time: '07:30', activity: 'Hotel pickup and transfer to private marina' },
      { time: '08:30', activity: 'Welcome aboard — safety briefing and refreshments' },
      { time: '09:30', activity: 'Dolphin House reef — dolphin spotting and snorkeling' },
      { time: '11:30', activity: 'First island stop — swimming and relaxation' },
      { time: '13:00', activity: 'Seafood lunch served on board' },
      { time: '14:00', activity: 'Second snorkeling stop at Giftun South' },
      { time: '15:30', activity: 'Final island visit — beach time' },
      { time: '16:30', activity: 'Sail back to marina' },
      { time: '17:30', activity: 'Hotel drop-off' },
    ],
    included: [
      'Hotel transfers',
      'Full-day private yacht',
      'Professional snorkeling equipment',
      'Fresh seafood and Egyptian buffet lunch',
      'Soft drinks, water, and fresh juice',
      'Marine biologist guide',
    ],
    excluded: ['Alcoholic beverages', 'Gratuities', 'Travel insurance'],
    meetingPoint: 'Hotel lobby. Pickup available from all Hurghada hotels.',
    whatToBring: ['Swimwear', 'Sunscreen', 'Camera with underwater housing', 'Light jacket'],
    cancellationPolicy:
      'Free cancellation up to 48 hours before departure. No refund for cancellations within 48 hours.',
    faq: [
      {
        question: 'Are dolphin sightings guaranteed?',
        answer:
          'Dolphin sightings occur on approximately 95% of trips. We go to Dolphin House reef where resident spinner dolphin pods are consistently present.',
      },
    ],
    reviews: [
      {
        id: 'r1',
        name: 'Lena S.',
        country: 'Germany',
        date: 'January 2025',
        rating: 5,
        comment:
          'We swam with an entire pod of dolphins for 20 minutes. This was a dream come true. The yacht was luxurious, the crew was wonderful, and the seafood lunch was delicious.',
      },
      {
        id: 'r2',
        name: 'Oliver W.',
        country: 'Australia',
        date: 'February 2025',
        rating: 5,
        comment:
          'Absolutely the best day of our entire Egypt trip. The dolphins came right up to us. Incredible experience — worth every penny.',
      },
    ],
  },
  {
    id: 'hurg-4',
    destinationId: 'hurghada',
    title: 'Private Yacht Charter',
    category: 'Cruises & Sailing',
    photo: img('1625754884730-ba1e2eaafe91'),
    photos: [
      img('1625754884730-ba1e2eaafe91', 1200, 800),
      img('1583157048761-ac1dba033233', 800, 560),
      img('1780304348073-f690427f70ec', 800, 560),
      img('1625754884730-ba1e2eaafe91', 800, 560),
      img('1638123657021-f9aca72f8caf', 800, 560),
    ],
    rating: 5.0,
    reviewCount: 87,
    duration: 'Full day (8–10 hrs)',
    languages: ['English', 'Arabic'],
    pickupAvailable: true,
    freeCancellation: false,
    price: 8500,
    provider: 'KM Luxury Yachts',
    description:
      'Experience the Red Sea in complete privacy on your own luxury yacht. You choose the islands, you set the pace. Ideal for honeymoons, anniversaries, or intimate gatherings, this exclusive charter includes a private chef, premium snorkeling equipment, and a customized itinerary tailored entirely to your wishes. This is the Red Sea as it should be experienced.',
    highlights: [
      'Fully private yacht for up to 10 guests — no strangers on board',
      'Customizable route across the best Red Sea islands',
      'On-board private chef with à la carte menu',
      'Premium snorkeling and paddleboard equipment',
      'Chilled champagne and premium beverages on arrival',
      'Dedicated host and crew throughout',
    ],
    itinerary: [
      { time: 'Flexible', activity: 'Departure time and route customized to your preference' },
      { time: 'Morning', activity: 'Sail to your chosen first destination' },
      { time: 'Midday', activity: 'Private chef prepares your bespoke lunch' },
      { time: 'Afternoon', activity: 'Islands, snorkeling, swimming, sunbathing at your leisure' },
      { time: 'Sunset', activity: 'Sundowner cocktails on deck as we return to marina' },
    ],
    included: [
      'Private luxury yacht for up to 10 guests',
      'Professional captain and crew',
      'Private chef with customized menu',
      'All food and premium beverages',
      'Snorkeling equipment and paddleboards',
      'Hotel transfers',
    ],
    excluded: ['Gratuities (warmly appreciated)', 'Specialty alcohol (on request)'],
    meetingPoint: 'Private marina in Hurghada. Full details provided upon booking.',
    whatToBring: [
      'Swimwear',
      'Light cover-up',
      'Sunscreen',
      'Camera',
      'Anything that makes the day yours',
    ],
    cancellationPolicy:
      'Cancellations made 7+ days before departure receive a 50% refund. No refund within 7 days.',
    faq: [
      {
        question: 'Can we bring our own food and drinks?',
        answer:
          'The experience includes a private chef, but you\'re welcome to bring anything additional. Let us know your preferences in advance.',
      },
    ],
    reviews: [
      {
        id: 'r1',
        name: 'Charlotte & Thomas R.',
        country: 'Switzerland',
        date: 'March 2025',
        rating: 5,
        comment:
          'Booked for our honeymoon and it was simply perfect. Every detail was considered, the chef was exceptional, and the crew made us feel like royalty. An unforgettable day.',
      },
    ],
  },
  {
    id: 'hurg-5',
    destinationId: 'hurghada',
    title: 'Quad Bike Desert Adventure',
    category: 'Desert & Adventure',
    photo: img('1509316785289-025f5b846b35'),
    photos: [
      img('1509316785289-025f5b846b35', 1200, 800),
      img('1577085375786-edb0f45560aa', 800, 560),
      img('1713021714419-ca3a7bc12f00', 800, 560),
      img('1509316785289-025f5b846b35', 800, 560),
      img('1577085375786-edb0f45560aa', 800, 560),
    ],
    rating: 4.6,
    reviewCount: 674,
    duration: '2.5 hours',
    languages: ['English', 'Arabic', 'Russian'],
    pickupAvailable: true,
    freeCancellation: true,
    price: 750,
    provider: 'Desert Riders Hurghada',
    description:
      'Tear across Egypt\'s Eastern Desert on a powerful quad bike for an adrenaline-filled adventure unlike anything else. Navigate through dramatic sand dunes, rocky plateaus, and sweeping desert panoramas. This guided ride ends at a Bedouin camp where you can enjoy tea, shisha, and the extraordinary silence of the Sahara at sunset.',
    highlights: [
      'Ride across sand dunes, desert flats, and rocky terrain',
      'Professional guided ride — all skill levels welcome',
      'Stunning desert panoramas and photo opportunities',
      'Bedouin camp visit with traditional tea and shisha',
      'Sunset timing available for golden-hour photography',
      'Safety equipment, helmet, and goggles provided',
    ],
    itinerary: [
      { time: '15:30', activity: 'Hotel pickup and transfer to desert base' },
      { time: '16:00', activity: 'Safety briefing and quad bike orientation' },
      { time: '16:30', activity: 'Desert ride begins — guided trail through dunes and rocky terrain' },
      { time: '17:30', activity: 'Bedouin camp stop — tea, coffee, and shisha' },
      { time: '18:00', activity: 'Sunset ride back to base' },
      { time: '18:30', activity: 'Return transfer to hotel' },
    ],
    included: [
      'Hotel pickup and drop-off',
      'Quad bike (one per person or one per couple)',
      'Safety helmet, goggles, and gloves',
      'Professional desert guide',
      'Bedouin tea and coffee',
      'Bottled water',
    ],
    excluded: ['Gratuities', 'Shisha (available for additional fee)'],
    meetingPoint: 'Hotel lobby. Pickup from all Hurghada hotels.',
    whatToBring: [
      'Closed-toe shoes (mandatory)',
      'Long trousers recommended',
      'Sunglasses',
      'Scarf or bandana for dust protection',
    ],
    cancellationPolicy:
      'Free cancellation up to 24 hours before the experience. No refund within 24 hours.',
    faq: [
      {
        question: 'Do I need experience to ride a quad bike?',
        answer:
          'No prior experience is needed. Our guides provide a full briefing and the bikes are easy to operate. We cater to all levels.',
      },
      {
        question: 'Is this suitable for children?',
        answer:
          'Children aged 10+ can ride as a passenger with an adult. Children aged 16+ may operate their own quad bike.',
      },
    ],
    reviews: [
      {
        id: 'r1',
        name: 'Piotr K.',
        country: 'Poland',
        date: 'February 2025',
        rating: 5,
        comment:
          'So much fun! The dunes were incredible and the Bedouin camp at sunset was magical. Great value and great guides.',
      },
      {
        id: 'r2',
        name: 'Elena V.',
        country: 'Russia',
        date: 'January 2025',
        rating: 4,
        comment:
          'Really enjoyable experience. The route was varied and the views were stunning. Quad bikes were well-maintained.',
      },
    ],
  },
]

const CAIRO_EXPERIENCES: Experience[] = [
  {
    id: 'cairo-1',
    destinationId: 'cairo',
    title: 'Grand Egyptian Museum Private Tour',
    category: 'Cultural & Historical',
    photo: img('1587975844577-56dfe5d3fca8'),
    photos: [
      img('1587975844577-56dfe5d3fca8', 1200, 800),
      img('1587975844610-40f1ad10d07e', 800, 560),
      img('1539768942893-daf53e448371', 800, 560),
      img('1553913861-c0fddf2619ee', 800, 560),
      img('1559738933-d69ac3ff674b', 800, 560),
    ],
    rating: 4.9,
    reviewCount: 428,
    duration: '4 hours',
    languages: ['English', 'Arabic', 'German', 'Italian'],
    pickupAvailable: true,
    freeCancellation: true,
    price: 1450,
    provider: 'Cairo Heritage Tours',
    description:
      'Explore one of the world\'s greatest museums with a certified Egyptologist who brings ancient history to life. The Grand Egyptian Museum houses over 100,000 artefacts including the complete treasures of Tutankhamun. Skip the general queues and access the private galleries for an intimate encounter with 5,000 years of human civilization.',
    highlights: [
      'Private certified Egyptologist guide for your group only',
      'Full Tutankhamun treasure collection including the golden death mask',
      'Access to the Grand Atrium with the 11-meter Ramesses II statue',
      'Behind-the-scenes access to galleries before they open to the public',
      'Detailed commentary on hieroglyphics, mummification, and royal dynasties',
      'Skip-the-line entry tickets included',
    ],
    itinerary: [
      { time: '08:30', activity: 'Hotel pickup from Cairo or Giza' },
      { time: '09:30', activity: 'Arrive at the Grand Egyptian Museum — skip-the-line entry' },
      { time: '09:45', activity: 'Grand Atrium and Ramesses II statue' },
      { time: '10:30', activity: 'Tutankhamun galleries — 5,400+ artefacts' },
      { time: '12:00', activity: 'Royal Mummies Hall and ancient jewellery' },
      { time: '13:00', activity: 'Final walk through civilisation halls' },
      { time: '13:30', activity: 'Return transfer to hotel' },
    ],
    included: [
      'Hotel pickup and drop-off',
      'Skip-the-line GEM entrance tickets',
      'Private licensed Egyptologist guide',
      'Bottled water',
    ],
    excluded: ['Personal shopping', 'Camera permits', 'Gratuities'],
    meetingPoint: 'Hotel lobby. Service available from Cairo, Giza, and Zamalek.',
    whatToBring: [
      'Comfortable walking shoes',
      'Light jacket (museum is air-conditioned)',
      'Camera',
    ],
    cancellationPolicy: 'Free cancellation up to 24 hours before the experience.',
    faq: [
      {
        question: 'Is the golden mask of Tutankhamun on display?',
        answer:
          'Yes — the complete Tutankhamun collection including the iconic golden death mask is permanently housed at the Grand Egyptian Museum.',
      },
    ],
    reviews: [
      {
        id: 'r1',
        name: 'Michael H.',
        country: 'USA',
        date: 'March 2025',
        rating: 5,
        comment:
          'Our guide was extraordinary — her knowledge was encyclopaedic and her passion for Egyptology was infectious. The Tutankhamun collection left us speechless. Essential.',
      },
      {
        id: 'r2',
        name: 'Giulia M.',
        country: 'Italy',
        date: 'February 2025',
        rating: 5,
        comment:
          'The private guide made all the difference. We understood context and meaning that you simply can\'t get from a sign on a wall. The best museum experience I\'ve ever had.',
      },
    ],
  },
  {
    id: 'cairo-2',
    destinationId: 'cairo',
    title: 'Pyramids & Sphinx Private Tour',
    category: 'Cultural & Historical',
    photo: img('1539768942893-daf53e448371'),
    photos: [
      img('1539768942893-daf53e448371', 1200, 800),
      img('1553913861-c0fddf2619ee', 800, 560),
      img('1559738933-d69ac3ff674b', 800, 560),
      img('1587975844577-56dfe5d3fca8', 800, 560),
      img('1587975844610-40f1ad10d07e', 800, 560),
    ],
    rating: 4.8,
    reviewCount: 1204,
    duration: '5 hours',
    languages: ['English', 'Arabic', 'German', 'Italian', 'Russian'],
    pickupAvailable: true,
    freeCancellation: true,
    price: 1200,
    provider: 'Pharaoh\'s Path',
    description:
      'Stand before the last surviving wonder of the ancient world with a private Egyptologist guide who knows every stone. This tour covers the Great Pyramid of Khufu, the Pyramid of Khafre, the Pyramid of Menkaure, and the iconic Great Sphinx — with optional entry inside the pyramid chambers. This is not a group bus tour: it\'s a thoughtful, unhurried exploration of one of humanity\'s greatest achievements.',
    highlights: [
      'Private guide for your group — no strangers, no rushing',
      'Great Pyramid, Pyramid of Khafre, and Pyramid of Menkaure',
      'The Great Sphinx and the Valley Temple',
      'Optional interior entry to a pyramid chamber',
      'Panoramic photo spot with all three pyramids',
      'Camel or horse ride option (paid locally)',
    ],
    itinerary: [
      { time: '07:00', activity: 'Hotel pickup from Cairo or Giza' },
      { time: '08:00', activity: 'Arrive at Giza Plateau — Great Pyramid of Khufu' },
      { time: '09:30', activity: 'Pyramid of Khafre and panoramic viewpoint' },
      { time: '10:30', activity: 'The Great Sphinx and Valley Temple' },
      { time: '11:30', activity: 'Solar Boat Museum' },
      { time: '12:30', activity: 'Return transfer to hotel' },
    ],
    included: [
      'Hotel pickup and drop-off',
      'Entry tickets to the Giza Plateau',
      'Private licensed Egyptologist guide',
      'Air-conditioned vehicle',
      'Bottled water',
    ],
    excluded: ['Interior pyramid entry (optional, paid locally)', 'Camel or horse ride', 'Gratuities'],
    meetingPoint: 'Hotel lobby. Available from all Cairo and Giza hotels.',
    whatToBring: ['Comfortable shoes', 'Sun hat and sunscreen', 'Camera'],
    cancellationPolicy: 'Free cancellation up to 24 hours before the tour.',
    faq: [
      {
        question: 'Can we go inside the pyramid?',
        answer:
          'Yes — interior entry to the Great Pyramid is available for an additional fee paid on site. The guide will explain what to expect.',
      },
    ],
    reviews: [
      {
        id: 'r1',
        name: 'Sarah J.',
        country: 'United Kingdom',
        date: 'January 2025',
        rating: 5,
        comment:
          'Seeing the pyramids was on my bucket list for 30 years. Our guide brought them alive in a way I never expected. Private tour was absolutely worth it.',
      },
      {
        id: 'r2',
        name: 'Kazimiera W.',
        country: 'Poland',
        date: 'December 2024',
        rating: 5,
        comment:
          'Perfect tour from start to finish. The early morning timing meant no crowds at the Sphinx. Our guide was brilliant and incredibly knowledgeable.',
      },
    ],
  },
  {
    id: 'cairo-3',
    destinationId: 'cairo',
    title: 'Old Cairo & Islamic Quarter Walking Tour',
    category: 'Cultural & Historical',
    photo: img('1559738933-d69ac3ff674b'),
    photos: [
      img('1559738933-d69ac3ff674b', 1200, 800),
      img('1553913861-c0fddf2619ee', 800, 560),
      img('1587975844577-56dfe5d3fca8', 800, 560),
      img('1539768942893-daf53e448371', 800, 560),
      img('1587975844610-40f1ad10d07e', 800, 560),
    ],
    rating: 4.7,
    reviewCount: 332,
    duration: '4 hours',
    languages: ['English', 'Arabic', 'German'],
    pickupAvailable: true,
    freeCancellation: true,
    price: 550,
    provider: 'Cairo Hidden Paths',
    description:
      'Walk through a city within a city — the medieval Islamic quarter of Cairo that UNESCO has declared a World Heritage Site. Your guide takes you through narrow alleys that have barely changed since the 10th century, past ancient mosques, covered bazaars, craftsmen\'s workshops, and hidden courtyards. This is Cairo beyond the tourist sites.',
    highlights: [
      'Al-Muizz Street — the world\'s longest open-air museum of Islamic architecture',
      'Khan el-Khalili bazaar — Egypt\'s most famous market',
      'Al-Azhar Mosque — over 1,000 years of Islamic scholarship',
      'Coptic Cairo — ancient churches and the Hanging Church',
      'Traditional tea in a 14th-century caravanserai',
      'Small group maximum 8 people',
    ],
    itinerary: [
      { time: '09:00', activity: 'Meet at Al-Hussein Mosque, Islamic Quarter' },
      { time: '09:15', activity: 'Al-Muizz Street and Fatimid city gates' },
      { time: '10:00', activity: 'Al-Azhar Mosque visit' },
      { time: '10:45', activity: 'Khan el-Khalili bazaar — craft workshops and tea' },
      { time: '12:00', activity: 'Coptic Cairo — Hanging Church and Ben Ezra Synagogue' },
      { time: '13:00', activity: 'Tour ends. Optional lunch nearby.' },
    ],
    included: [
      'Private licensed guide',
      'Entrance fees to religious sites',
      'Traditional Egyptian tea',
      'Bottled water',
    ],
    excluded: ['Lunch', 'Shopping', 'Transportation to meeting point', 'Gratuities'],
    meetingPoint: 'Al-Hussein Mosque courtyard, Islamic Cairo. Hotel pickup available for extra charge.',
    whatToBring: [
      'Comfortable walking shoes',
      'Modest clothing (shoulders and knees covered — scarves provided if needed)',
      'Cash for shopping',
    ],
    cancellationPolicy: 'Free cancellation up to 24 hours before the tour.',
    faq: [
      {
        question: 'Do I need to dress modestly?',
        answer:
          'Yes, for mosque visits shoulders and knees should be covered. We provide scarves and covers at no extra cost.',
      },
    ],
    reviews: [
      {
        id: 'r1',
        name: 'Francesco B.',
        country: 'Italy',
        date: 'March 2025',
        rating: 5,
        comment:
          'The best walking tour I\'ve ever taken, anywhere. Our guide knew every alley, every story, every hidden door. Khan el-Khalili was fascinating with his guidance.',
      },
    ],
  },
  {
    id: 'cairo-4',
    destinationId: 'cairo',
    title: 'Nile Dinner Cruise',
    category: 'Cruises & Sailing',
    photo: img('1730190202188-bc742975d595'),
    photos: [
      img('1730190202188-bc742975d595', 1200, 800),
      img('1734777360073-397330427a3f', 800, 560),
      img('1684100096410-fd39cdff91a3', 800, 560),
      img('1707266327255-1f0199f22b33', 800, 560),
      img('1625754884730-ba1e2eaafe91', 800, 560),
    ],
    rating: 4.5,
    reviewCount: 987,
    duration: '3 hours',
    languages: ['English', 'Arabic'],
    pickupAvailable: true,
    freeCancellation: true,
    price: 980,
    provider: 'Nile Star Cruises',
    description:
      'Glide along the Nile at night on a beautifully lit dinner cruise, watching Cairo\'s skyline shimmer on the water. Enjoy a lavish buffet dinner with Egyptian and international dishes, live oriental music, and traditional Tanoura whirling dervish and belly dance performances. The Nile at night is one of Cairo\'s great spectacles.',
    highlights: [
      'Two-deck Nile cruise ship with panoramic views',
      'Lavish buffet — Egyptian mezze, grills, and desserts',
      'Live oriental music and traditional performances',
      'Tanoura dance and belly dance show',
      'Views of Cairo, Zamalek, and the iconic bridges lit at night',
    ],
    itinerary: [
      { time: '20:00', activity: 'Hotel pickup and transfer to Nile marina' },
      { time: '20:30', activity: 'Board the cruise ship — welcome drinks' },
      { time: '21:00', activity: 'Cruise departs — dinner service begins' },
      { time: '21:30', activity: 'Live music and cultural performances' },
      { time: '23:00', activity: 'Return to dock' },
      { time: '23:30', activity: 'Hotel drop-off' },
    ],
    included: [
      'Hotel transfers',
      'Cruise ticket',
      'Buffet dinner',
      'Soft drinks and juices',
      'Live entertainment',
    ],
    excluded: ['Alcoholic beverages', 'Gratuities'],
    meetingPoint: 'Hotel pickup throughout Cairo.',
    whatToBring: ['Smart-casual attire', 'Camera'],
    cancellationPolicy: 'Free cancellation up to 24 hours before departure.',
    faq: [
      { question: 'Is alcohol available?', answer: 'Yes, alcoholic beverages are available for purchase on board.' },
    ],
    reviews: [
      {
        id: 'r1',
        name: 'Thomas G.',
        country: 'Germany',
        date: 'February 2025',
        rating: 4,
        comment:
          'Lovely evening on the Nile. The food was good, the performances were entertaining, and the views were beautiful. A classic Cairo experience.',
      },
    ],
  },
  {
    id: 'cairo-5',
    destinationId: 'cairo',
    title: 'Saqqara, Memphis & Dahshur Private Tour',
    category: 'Cultural & Historical',
    photo: img('1587975844610-40f1ad10d07e'),
    photos: [
      img('1587975844610-40f1ad10d07e', 1200, 800),
      img('1587975844577-56dfe5d3fca8', 800, 560),
      img('1539768942893-daf53e448371', 800, 560),
      img('1553913861-c0fddf2619ee', 800, 560),
      img('1559738933-d69ac3ff674b', 800, 560),
    ],
    rating: 4.8,
    reviewCount: 213,
    duration: '7 hours',
    languages: ['English', 'Arabic', 'Italian'],
    pickupAvailable: true,
    freeCancellation: true,
    price: 880,
    provider: 'Pharaoh\'s Path',
    description:
      'Venture beyond Giza to the older, quieter pyramid fields of Saqqara, Memphis, and Dahshur. See the world\'s first pyramid — Djoser\'s Step Pyramid — and descend into ancient tombs decorated with vivid murals. Visit the ancient capital of Memphis and the hauntingly beautiful Bent Pyramid at Dahshur. These sites see a fraction of Giza\'s visitors — making this the connoisseur\'s choice.',
    highlights: [
      'Saqqara\'s Step Pyramid — the world\'s oldest monumental stone structure (2650 BC)',
      'Decorated tombs of Mereruka, Kagemni, and Unas',
      'Memphis — ancient capital with colossal statue of Ramesses II',
      'Dahshur — the Bent Pyramid and Red Pyramid, rarely visited',
      'Fully private tour with certified Egyptologist',
    ],
    itinerary: [
      { time: '08:00', activity: 'Hotel pickup from Cairo or Giza' },
      { time: '09:00', activity: 'Saqqara — Step Pyramid, tomb complexes' },
      { time: '11:00', activity: 'Memphis open-air museum' },
      { time: '12:00', activity: 'Lunch at local restaurant (included)' },
      { time: '13:00', activity: 'Dahshur — Bent Pyramid and Red Pyramid' },
      { time: '15:00', activity: 'Return to hotel' },
    ],
    included: ['Hotel transfers', 'All entrance fees', 'Private Egyptologist guide', 'Lunch', 'Bottled water'],
    excluded: ['Personal shopping', 'Gratuities'],
    meetingPoint: 'Hotel lobby throughout Cairo and Giza.',
    whatToBring: ['Comfortable shoes', 'Sun protection', 'Camera', 'Torch (for tomb interiors)'],
    cancellationPolicy: 'Free cancellation up to 24 hours before the tour.',
    faq: [
      {
        question: 'Are these pyramids less crowded than Giza?',
        answer:
          'Significantly less. Saqqara and Dahshur attract a fraction of Giza\'s visitors. You\'ll often have sites to yourself.',
      },
    ],
    reviews: [
      {
        id: 'r1',
        name: 'Andrew P.',
        country: 'Canada',
        date: 'January 2025',
        rating: 5,
        comment:
          'Far better than Giza in my opinion. The tombs at Saqqara are breathtaking — the murals look freshly painted. We were virtually alone at Dahshur. Extraordinary.',
      },
    ],
  },
]

const LUXOR_EXPERIENCES: Experience[] = [
  {
    id: 'luxor-1',
    destinationId: 'luxor',
    title: 'Valley of the Kings Private Tour',
    category: 'Cultural & Historical',
    photo: img('1713021714419-ca3a7bc12f00'),
    photos: [
      img('1713021714419-ca3a7bc12f00', 1200, 800),
      img('1587975844577-56dfe5d3fca8', 800, 560),
      img('1587975844610-40f1ad10d07e', 800, 560),
      img('1553913861-c0fddf2619ee', 800, 560),
      img('1559738933-d69ac3ff674b', 800, 560),
    ],
    rating: 4.9,
    reviewCount: 567,
    duration: '5 hours',
    languages: ['English', 'Arabic', 'German', 'Italian'],
    pickupAvailable: true,
    freeCancellation: true,
    price: 1650,
    provider: 'Thebes Heritage',
    description:
      'Descend into the royal necropolis of Egypt\'s greatest pharaohs. The Valley of the Kings holds 63 known tombs — your private Egyptologist will take you inside the finest, with detailed commentary on the vivid painted walls that have preserved stories of the afterlife for over 3,000 years. This is one of the most powerful encounters with the ancient world.',
    highlights: [
      'Entry to three royal tombs including the tomb of Ramesses IV or VI',
      'Optional entry to Tutankhamun\'s tomb (additional fee)',
      'Hatshepsut\'s funerary temple at Deir el-Bahari',
      'The Colossi of Memnon — twin statues standing since 1350 BC',
      'Private certified Egyptologist guide',
    ],
    itinerary: [
      { time: '06:30', activity: 'Hotel pickup from Luxor — beat the heat and crowds' },
      { time: '07:00', activity: 'Colossi of Memnon — photo stop and explanation' },
      { time: '07:30', activity: 'Valley of the Kings — three royal tombs' },
      { time: '10:00', activity: 'Temple of Hatshepsut at Deir el-Bahari' },
      { time: '12:00', activity: 'Return to hotel' },
    ],
    included: [
      'Hotel transfers',
      'Valley of the Kings entry (3 tombs)',
      'Deir el-Bahari temple entry',
      'Private Egyptologist guide',
      'Air-conditioned vehicle',
      'Bottled water',
    ],
    excluded: ["Tutankhamun's tomb entry (optional)", 'Gratuities'],
    meetingPoint: 'Hotel lobby in Luxor East or West Bank.',
    whatToBring: ['Comfortable shoes', 'Torch (useful in tombs)', 'Sun hat', 'Camera'],
    cancellationPolicy: 'Free cancellation up to 24 hours before the tour.',
    faq: [
      {
        question: 'Is photography allowed in the tombs?',
        answer:
          "Photography is permitted in most tombs. Tutankhamun's tomb requires a separate photography permit. Flash is not allowed.",
      },
    ],
    reviews: [
      {
        id: 'r1',
        name: 'Helena K.',
        country: 'Czech Republic',
        date: 'February 2025',
        rating: 5,
        comment:
          'Walking into a 3,200-year-old royal tomb is genuinely humbling. Our guide explained every scene on every wall. One of the greatest experiences of my life.',
      },
    ],
  },
  {
    id: 'luxor-2',
    destinationId: 'luxor',
    title: 'Hot Air Balloon over Luxor at Sunrise',
    category: 'Nature & Wildlife',
    photo: img('1777672351192-a7220589c25e'),
    photos: [
      img('1777672351192-a7220589c25e', 1200, 800),
      img('1703902770170-7cc56c8c3067', 800, 560),
      img('1737819605173-9ddc0178102a', 800, 560),
      img('1713021714419-ca3a7bc12f00', 800, 560),
      img('1684100096410-fd39cdff91a3', 800, 560),
    ],
    rating: 4.9,
    reviewCount: 1102,
    duration: '1 hour flight',
    languages: ['English', 'Arabic'],
    pickupAvailable: true,
    freeCancellation: false,
    price: 3200,
    provider: 'Sky Luxor Balloons',
    description:
      'Float silently above the world\'s greatest concentration of ancient monuments as the sun rises over the Nile Valley. The temples, the tombs, the green strip of the Nile against the limestone desert — seen from above at dawn, Luxor is simply breathtaking. This one-hour flight is considered by many travelers to be the single best experience in all of Egypt.',
    highlights: [
      'One-hour sunrise balloon flight over the West Bank of Luxor',
      'Bird\'s-eye views of the Valley of the Kings, Karnak, and the Nile',
      'Expert pilot with thousands of flight hours',
      'Champagne celebration on landing',
      'Certificate of flight provided',
      'Pre-dawn hotel pickup for optimum sunrise timing',
    ],
    itinerary: [
      { time: '04:00', activity: 'Hotel pickup from Luxor — while the city sleeps' },
      { time: '04:45', activity: 'Arrive at launch site — witness balloon inflation' },
      { time: '05:30', activity: 'Take off at first light' },
      { time: '06:30', activity: 'Landing followed by champagne celebration' },
      { time: '07:30', activity: 'Return transfer to hotel' },
    ],
    included: [
      'Hotel pickup and drop-off',
      'One-hour balloon flight',
      'Champagne on landing',
      'Flight certificate',
    ],
    excluded: ['Travel insurance', 'Gratuities'],
    meetingPoint: 'Hotel lobby in Luxor. Pickup time confirmed the evening before.',
    whatToBring: ['Warm layer (it is cool before sunrise)', 'Camera', 'Comfortable footwear'],
    cancellationPolicy:
      'Full refund if the flight is cancelled due to weather conditions. No refund for guest cancellations within 48 hours.',
    faq: [
      {
        question: 'Is this safe?',
        answer:
          'Hot air ballooning in Luxor is regulated by the Egyptian Civil Aviation Authority. Our company meets the highest international safety standards and our pilots are fully certified.',
      },
      {
        question: 'What is the minimum age?',
        answer: 'Minimum age is 6 years. Children must be able to stand unassisted for the full duration of the flight.',
      },
    ],
    reviews: [
      {
        id: 'r1',
        name: 'Laura C.',
        country: 'USA',
        date: 'March 2025',
        rating: 5,
        comment:
          'Watching the sun rise over the temples of Luxor from a balloon was the most beautiful thing I have ever seen. Totally silent, totally magical. Book this.',
      },
      {
        id: 'r2',
        name: 'Tobias F.',
        country: 'Germany',
        date: 'January 2025',
        rating: 5,
        comment:
          'The undisputed highlight of our Egypt trip. The scale of Karnak Temple from above is humbling. The champagne on landing was a lovely touch.',
      },
    ],
  },
  {
    id: 'luxor-3',
    destinationId: 'luxor',
    title: 'Karnak Temple at Sunset',
    category: 'Cultural & Historical',
    photo: img('1587975844610-40f1ad10d07e'),
    photos: [
      img('1587975844610-40f1ad10d07e', 1200, 800),
      img('1587975844577-56dfe5d3fca8', 800, 560),
      img('1553913861-c0fddf2619ee', 800, 560),
      img('1713021714419-ca3a7bc12f00', 800, 560),
      img('1559738933-d69ac3ff674b', 800, 560),
    ],
    rating: 4.8,
    reviewCount: 445,
    duration: '2.5 hours',
    languages: ['English', 'Arabic', 'French'],
    pickupAvailable: true,
    freeCancellation: true,
    price: 850,
    provider: 'Thebes Heritage',
    description:
      'The Karnak Temple complex is the largest religious structure ever built by mankind — and it is most magnificent at golden hour. Walk the avenue of ram-headed sphinxes, stand beneath 134 towering hypostyle columns, and watch the sandstone glow amber in the setting sun. Your Egyptologist guide decodes thousands of inscriptions and carvings as twilight transforms this ancient sacred precinct.',
    highlights: [
      'Sunset timing for spectacular photography and cooler temperatures',
      'The Great Hypostyle Hall — 134 massive columns, the largest ever constructed',
      'Avenue of Sphinxes stretching to Luxor Temple',
      'Sacred Lake and the granite Scarab of Amenhotep III',
      'Private Egyptologist guide for in-depth insight',
    ],
    itinerary: [
      { time: '15:30', activity: 'Hotel pickup' },
      { time: '16:00', activity: 'Arrive at Karnak — entrance and orientation' },
      { time: '16:15', activity: 'Ram-headed sphinx avenue and First Pylon' },
      { time: '16:45', activity: 'Great Hypostyle Hall — detailed guided tour' },
      { time: '17:30', activity: 'Sacred Lake, Festival Hall, and Obelisks' },
      { time: '18:15', activity: 'Free time and photography at golden hour' },
      { time: '18:45', activity: 'Return to hotel' },
    ],
    included: ['Hotel transfers', 'Karnak entry ticket', 'Private Egyptologist guide', 'Bottled water'],
    excluded: ['Gratuities'],
    meetingPoint: 'Hotel lobby in Luxor.',
    whatToBring: ['Camera', 'Comfortable shoes', 'Light jacket for after sunset'],
    cancellationPolicy: 'Free cancellation up to 24 hours before the tour.',
    faq: [],
    reviews: [
      {
        id: 'r1',
        name: 'Sandra N.',
        country: 'Netherlands',
        date: 'February 2025',
        rating: 5,
        comment:
          'The hypostyle hall at sunset was genuinely overwhelming. The scale of it, the light, the carvings — extraordinary. Our guide was passionate and knowledgeable.',
      },
    ],
  },
  {
    id: 'luxor-4',
    destinationId: 'luxor',
    title: 'Luxor Temple by Night',
    category: 'Cultural & Historical',
    photo: img('1553913861-c0fddf2619ee'),
    photos: [
      img('1553913861-c0fddf2619ee', 1200, 800),
      img('1587975844577-56dfe5d3fca8', 800, 560),
      img('1587975844610-40f1ad10d07e', 800, 560),
      img('1559738933-d69ac3ff674b', 800, 560),
      img('1539768942893-daf53e448371', 800, 560),
    ],
    rating: 4.7,
    reviewCount: 298,
    duration: '2 hours',
    languages: ['English', 'Arabic'],
    pickupAvailable: true,
    freeCancellation: true,
    price: 700,
    provider: 'Thebes Heritage',
    description:
      'Luxor Temple is among the most beautifully illuminated ancient monuments in the world. After dark, the sandstone glows a warm gold against the night sky — dramatically different from the daytime experience. Walk the colonnaded hall of Amenhotep III, stand before the Abu el-Haggag Mosque built atop the ancient temple, and feel the layers of 3,000 years of continuous human presence at this extraordinary site.',
    highlights: [
      'Luxor Temple fully illuminated after dark — stunning light and shadow',
      'Colossal statues of Ramesses II at the entrance pylon',
      'The magnificent colonnade of Amenhotep III',
      'Abu el-Haggag Mosque — built inside the ancient temple',
      'The Luxor corniche promenade by night',
    ],
    itinerary: [
      { time: '19:30', activity: 'Hotel pickup' },
      { time: '20:00', activity: 'Luxor Temple — entrance pylon and statues' },
      { time: '20:30', activity: 'Colonnaded hall and inner sanctuaries' },
      { time: '21:15', activity: 'Photography and free exploration' },
      { time: '21:45', activity: 'Evening walk along the Luxor corniche' },
      { time: '22:15', activity: 'Return to hotel' },
    ],
    included: ['Hotel transfers', 'Luxor Temple entry ticket', 'Private guide', 'Bottled water'],
    excluded: ['Gratuities'],
    meetingPoint: 'Hotel lobby in Luxor.',
    whatToBring: ['Camera (tripod recommended for night shots)', 'Light jacket'],
    cancellationPolicy: 'Free cancellation up to 24 hours before the tour.',
    faq: [],
    reviews: [
      {
        id: 'r1',
        name: 'Patrick D.',
        country: 'Ireland',
        date: 'March 2025',
        rating: 5,
        comment:
          'Seeing Luxor Temple lit up at night was one of the most beautiful things I\'ve ever witnessed. The photos do not do it justice. Do not miss this.',
      },
    ],
  },
  {
    id: 'luxor-5',
    destinationId: 'luxor',
    title: 'Dendera & Abydos Temples Day Trip',
    category: 'Cultural & Historical',
    photo: img('1587975844577-56dfe5d3fca8'),
    photos: [
      img('1587975844577-56dfe5d3fca8', 1200, 800),
      img('1587975844610-40f1ad10d07e', 800, 560),
      img('1553913861-c0fddf2619ee', 800, 560),
      img('1713021714419-ca3a7bc12f00', 800, 560),
      img('1559738933-d69ac3ff674b', 800, 560),
    ],
    rating: 4.9,
    reviewCount: 176,
    duration: '9 hours',
    languages: ['English', 'Arabic'],
    pickupAvailable: true,
    freeCancellation: true,
    price: 1100,
    provider: 'Thebes Heritage',
    description:
      'Journey beyond Luxor to two of Egypt\'s most spectacular and least visited temples. Dendera features the only complete zodiac ceiling in the ancient world. Abydos holds the finest painted reliefs anywhere in Egypt — colours so vivid they appear freshly applied. These sites receive a small fraction of Karnak\'s visitors, making this a genuinely special, unhurried encounter with ancient Egypt.',
    highlights: [
      'Dendera Temple of Hathor — the most complete Roman-era temple in Egypt',
      'The famous Dendera Zodiac ceiling and crypts',
      'Abydos Temple of Seti I — finest painted reliefs in Egypt',
      'The Osireion — a mysterious underground cenotaph',
      'Private certified Egyptologist guide throughout',
    ],
    itinerary: [
      { time: '07:00', activity: 'Hotel pickup' },
      { time: '09:00', activity: 'Dendera Temple complex' },
      { time: '11:30', activity: 'Drive to Abydos' },
      { time: '13:00', activity: 'Lunch at local restaurant (included)' },
      { time: '14:00', activity: 'Abydos Temple of Seti I and Osireion' },
      { time: '17:00', activity: 'Return to Luxor hotel' },
    ],
    included: ['Hotel transfers', 'All entry fees', 'Private Egyptologist guide', 'Lunch', 'Bottled water'],
    excluded: ['Personal shopping', 'Gratuities'],
    meetingPoint: 'Hotel lobby in Luxor.',
    whatToBring: ['Comfortable shoes', 'Torch (useful in crypts)', 'Camera'],
    cancellationPolicy: 'Free cancellation up to 24 hours before the tour.',
    faq: [],
    reviews: [
      {
        id: 'r1',
        name: 'Rebecca M.',
        country: 'New Zealand',
        date: 'February 2025',
        rating: 5,
        comment:
          'The painted walls at Abydos look like they were done last week. Unbelievably vivid and beautiful. Dendera is magnificent. This tour is for serious Egypt lovers.',
      },
    ],
  },
]

const ASWAN_EXPERIENCES: Experience[] = [
  {
    id: 'aswan-1',
    destinationId: 'aswan',
    title: 'Philae Temple Motorboat Tour',
    category: 'Cultural & Historical',
    photo: img('1684100096410-fd39cdff91a3'),
    photos: [
      img('1684100096410-fd39cdff91a3', 1200, 800),
      img('1707266327255-1f0199f22b33', 800, 560),
      img('1587975844577-56dfe5d3fca8', 800, 560),
      img('1648139209977-61e0e6ed68b9', 800, 560),
      img('1684100096410-fd39cdff91a3', 800, 560),
    ],
    rating: 4.8,
    reviewCount: 312,
    duration: '3 hours',
    languages: ['English', 'Arabic', 'German'],
    pickupAvailable: true,
    freeCancellation: true,
    price: 950,
    provider: 'Aswan Nile Tours',
    description:
      'Boat across Nasser Lake to the island temple of Philae — the jewel of Egyptian temples dedicated to the goddess Isis. Rescued stone by stone from rising floodwaters in one of history\'s greatest archaeological rescue operations, Philae sits on its own island and is accessible only by boat. At sunset, the pink granite glows against the deep blue Nile in one of Egypt\'s most romantic settings.',
    highlights: [
      'Motorboat transfer across Lake Nasser to Philae Island',
      'Temple of Isis — the last active pagan temple in the Roman world',
      'Kiosk of Trajan — Egypt\'s most photographed ancient structure',
      'Sound and Light Show option in the evening',
      'Private Egyptologist guide',
    ],
    itinerary: [
      { time: '15:00', activity: 'Hotel pickup from Aswan' },
      { time: '15:30', activity: 'Arrive at Shellal dock — board motorboat' },
      { time: '16:00', activity: 'Philae Island — Temple of Isis guided tour' },
      { time: '17:30', activity: 'Kiosk of Trajan and photography' },
      { time: '18:00', activity: 'Return motorboat to dock' },
      { time: '18:30', activity: 'Return to hotel' },
    ],
    included: ['Hotel transfers', 'Motorboat transfer', 'Philae entry ticket', 'Private guide', 'Bottled water'],
    excluded: ['Sound & Light Show (optional evening event)', 'Gratuities'],
    meetingPoint: 'Hotel lobby in Aswan.',
    whatToBring: ['Camera', 'Comfortable shoes', 'Sun protection'],
    cancellationPolicy: 'Free cancellation up to 24 hours before the tour.',
    faq: [],
    reviews: [
      {
        id: 'r1',
        name: 'Monika R.',
        country: 'Poland',
        date: 'January 2025',
        rating: 5,
        comment:
          'Philae at sunset is simply one of the most beautiful things I\'ve ever seen. An island temple, glowing pink in the last light, reflected in the Nile. Perfection.',
      },
    ],
  },
  {
    id: 'aswan-2',
    destinationId: 'aswan',
    title: 'Abu Simbel Temples Day Trip',
    category: 'Cultural & Historical',
    photo: img('1559738933-d69ac3ff674b'),
    photos: [
      img('1559738933-d69ac3ff674b', 1200, 800),
      img('1539768942893-daf53e448371', 800, 560),
      img('1587975844577-56dfe5d3fca8', 800, 560),
      img('1553913861-c0fddf2619ee', 800, 560),
      img('1587975844610-40f1ad10d07e', 800, 560),
    ],
    rating: 5.0,
    reviewCount: 489,
    duration: 'Full day (10–11 hrs)',
    languages: ['English', 'Arabic', 'German'],
    pickupAvailable: true,
    freeCancellation: true,
    price: 2800,
    provider: 'Aswan Nile Tours',
    description:
      'The great temples of Abu Simbel are among the most awe-inspiring monuments on earth. Carved directly into the mountainside by Ramesses II over 3,200 years ago and relocated — intact — to save them from the rising waters of Lake Nasser, they represent both ancient genius and modern engineering marvel. An early morning convoy from Aswan arrives as the temples are bathed in golden desert light.',
    highlights: [
      'The Great Temple of Ramesses II — four colossal statues, 20 metres tall',
      "The smaller Temple of Hathor, dedicated to Nefertari",
      'Incredible painted interior reliefs and hypostyle hall',
      'Sunrise arrival for the best light and thinnest crowds',
      'Private Egyptologist guide',
    ],
    itinerary: [
      { time: '03:30', activity: 'Hotel pickup for the pre-dawn convoy' },
      { time: '07:00', activity: 'Arrive at Abu Simbel as the temples catch the morning sun' },
      { time: '07:15', activity: 'Great Temple of Ramesses II — guided tour' },
      { time: '09:00', activity: 'Temple of Hathor (Nefertari) — guided tour' },
      { time: '10:00', activity: 'Free photography time and independent exploration' },
      { time: '10:30', activity: 'Depart for Aswan' },
      { time: '14:00', activity: 'Return to hotel' },
    ],
    included: [
      'Hotel pickup and drop-off',
      'Air-conditioned convoy vehicle',
      'Abu Simbel entry tickets',
      'Private Egyptologist guide',
      'Breakfast en route',
      'Bottled water',
    ],
    excluded: ['Gratuities', 'Personal shopping'],
    meetingPoint: 'Hotel lobby in Aswan.',
    whatToBring: ['Camera', 'Comfortable shoes', 'Warm layer (departure is pre-dawn)', 'Sunscreen'],
    cancellationPolicy: 'Free cancellation up to 48 hours before the tour.',
    faq: [
      {
        question: 'Why is the pickup so early?',
        answer:
          'Abu Simbel is 280 km from Aswan and vehicles travel in a convoy for safety. Arriving at sunrise offers the best light and the fewest crowds.',
      },
    ],
    reviews: [
      {
        id: 'r1',
        name: 'Christopher B.',
        country: 'United Kingdom',
        date: 'March 2025',
        rating: 5,
        comment:
          'The four statues of Ramesses are simply staggering in scale. Nothing prepares you for this. The early start was absolutely worth it. A once-in-a-lifetime experience.',
      },
    ],
  },
  {
    id: 'aswan-3',
    destinationId: 'aswan',
    title: 'Nubian Village Experience',
    category: 'Cultural & Historical',
    photo: img('1648139209977-61e0e6ed68b9'),
    photos: [
      img('1648139209977-61e0e6ed68b9', 1200, 800),
      img('1684100096410-fd39cdff91a3', 800, 560),
      img('1707266327255-1f0199f22b33', 800, 560),
      img('1648139209977-61e0e6ed68b9', 800, 560),
      img('1684100096410-fd39cdff91a3', 800, 560),
    ],
    rating: 4.6,
    reviewCount: 234,
    duration: '3 hours',
    languages: ['English', 'Arabic'],
    pickupAvailable: true,
    freeCancellation: true,
    price: 650,
    provider: 'Aswan Nile Tours',
    description:
      'Cross the Nile by traditional felucca to visit an authentic Nubian village on the West Bank. The Nubian people have one of the world\'s oldest continuous civilizations, and their painted houses, music, and traditions are unlike anything else in Egypt. Share tea and karkade with a Nubian family, see the village Nile crocodiles, and browse hand-made crafts in this warm, genuine cultural encounter.',
    highlights: [
      'Traditional felucca crossing to the West Bank',
      'Walking tour of a colorfully painted Nubian village',
      'Cultural exchange with a Nubian family home visit',
      'Traditional karkade tea and Nubian coffee',
      'Live Nubian music demonstration',
      'Interaction with the village crocodiles',
    ],
    itinerary: [
      { time: '10:00', activity: 'Hotel pickup' },
      { time: '10:30', activity: 'Board felucca — sail to Nubian village' },
      { time: '11:00', activity: 'Village walking tour with local guide' },
      { time: '11:30', activity: 'Nubian family home visit — tea and conversation' },
      { time: '12:30', activity: 'Music, crafts, and crocodile encounter' },
      { time: '13:00', activity: 'Felucca return and hotel drop-off' },
    ],
    included: ['Hotel transfers', 'Felucca crossing', 'Local guide', 'Karkade tea', 'Bottled water'],
    excluded: ['Craft shopping', 'Gratuities'],
    meetingPoint: 'Hotel lobby in Aswan.',
    whatToBring: ['Cash for craft shopping', 'Camera', 'Comfortable footwear'],
    cancellationPolicy: 'Free cancellation up to 24 hours before the experience.',
    faq: [],
    reviews: [
      {
        id: 'r1',
        name: 'Elisa V.',
        country: 'Italy',
        date: 'February 2025',
        rating: 4,
        comment:
          'A very different side of Egypt. The Nubian people are warm and welcoming and the painted houses are beautiful. Lovely way to spend a morning.',
      },
    ],
  },
  {
    id: 'aswan-4',
    destinationId: 'aswan',
    title: 'Felucca Sunset Sail on the Nile',
    category: 'Cruises & Sailing',
    photo: img('1707266327255-1f0199f22b33'),
    photos: [
      img('1707266327255-1f0199f22b33', 1200, 800),
      img('1684100096410-fd39cdff91a3', 800, 560),
      img('1648139209977-61e0e6ed68b9', 800, 560),
      img('1707266327255-1f0199f22b33', 800, 560),
      img('1684100096410-fd39cdff91a3', 800, 560),
    ],
    rating: 4.7,
    reviewCount: 521,
    duration: '2 hours',
    languages: ['English', 'Arabic'],
    pickupAvailable: false,
    freeCancellation: true,
    price: 450,
    provider: 'Aswan Felucca Co.',
    description:
      'There is no more peaceful way to experience Aswan than a traditional felucca sail at sunset. Drift silently past granite islands, Elephantine Island, and the Botanical Garden as the sky turns gold and pink above the desert. This is the simplest and most beautiful experience on the Nile — the unhurried pace, the gentle wind, the silence.',
    highlights: [
      'Traditional Egyptian felucca — no engine, pure sail',
      'Sunset timing for extraordinary sky colors over the Nile',
      'Views of Elephantine Island, Kitchener\'s Island, and Aga Khan Mausoleum',
      'Karkade (hibiscus tea) and fresh fruit served on board',
      'Maximum 8 guests — intimate and peaceful',
    ],
    itinerary: [
      { time: '16:30', activity: 'Meet at the felucca dock near the Aswan corniche' },
      { time: '16:45', activity: 'Set sail — captain explains the islands' },
      { time: '17:30', activity: 'Reach the best sunset viewpoint — karkade and fruit served' },
      { time: '18:30', activity: 'Sail back to dock' },
    ],
    included: ['Felucca hire', 'Captain', 'Karkade tea and fruit'],
    excluded: ['Hotel transfer (walking distance from most corniche hotels)', 'Gratuities'],
    meetingPoint: 'Aswan Corniche, near the Mövenpick Hotel dock. 5-minute walk from most corniche hotels.',
    whatToBring: ['Light jacket (it cools after sunset)', 'Camera', 'Small cash for gratuity'],
    cancellationPolicy: 'Free cancellation up to 24 hours before the sail.',
    faq: [
      {
        question: 'Is this suitable for children?',
        answer: 'Yes — felucca sailing is peaceful and safe for children of all ages. Life vests are available.',
      },
    ],
    reviews: [
      {
        id: 'r1',
        name: 'Nadia P.',
        country: 'France',
        date: 'January 2025',
        rating: 5,
        comment:
          'The most serene two hours of our entire Egypt trip. No engine, no noise — just wind, water, and the most beautiful sunset you\'ve ever seen. Perfect.',
      },
    ],
  },
  {
    id: 'aswan-5',
    destinationId: 'aswan',
    title: 'Aswan High Dam & Unfinished Obelisk Tour',
    category: 'Cultural & Historical',
    photo: img('1713021714419-ca3a7bc12f00'),
    photos: [
      img('1713021714419-ca3a7bc12f00', 1200, 800),
      img('1684100096410-fd39cdff91a3', 800, 560),
      img('1587975844577-56dfe5d3fca8', 800, 560),
      img('1559738933-d69ac3ff674b', 800, 560),
      img('1707266327255-1f0199f22b33', 800, 560),
    ],
    rating: 4.4,
    reviewCount: 187,
    duration: '3 hours',
    languages: ['English', 'Arabic'],
    pickupAvailable: true,
    freeCancellation: true,
    price: 800,
    provider: 'Aswan Nile Tours',
    description:
      'A half-day tour combining modern and ancient engineering feats. The Aswan High Dam is one of the 20th century\'s greatest infrastructure achievements — your guide explains how it transformed Egypt\'s economy and agriculture while flooding Nubia. The Unfinished Obelisk in the ancient granite quarries reveals exactly how the Egyptians carved these massive monuments — abandoned 3,500 years ago mid-cut.',
    highlights: [
      'Aswan High Dam — engineering wonder that reshaped modern Egypt',
      'View over Lake Nasser — the world\'s largest artificial lake',
      'The Unfinished Obelisk — abandoned in the quarry 3,500 years ago',
      'Insight into ancient stone-cutting and obelisk transportation techniques',
      'Contrast of ancient and modern Egyptian ingenuity',
    ],
    itinerary: [
      { time: '09:00', activity: 'Hotel pickup' },
      { time: '09:30', activity: 'Aswan High Dam — viewpoint and guided explanation' },
      { time: '10:30', activity: 'Drive to the ancient granite quarries' },
      { time: '11:00', activity: 'The Unfinished Obelisk — full guided tour' },
      { time: '12:00', activity: 'Return to hotel' },
    ],
    included: ['Hotel transfers', 'Entry fees', 'Guide', 'Bottled water'],
    excluded: ['Gratuities'],
    meetingPoint: 'Hotel lobby in Aswan.',
    whatToBring: ['Comfortable shoes', 'Sun hat', 'Camera'],
    cancellationPolicy: 'Free cancellation up to 24 hours before the tour.',
    faq: [],
    reviews: [
      {
        id: 'r1',
        name: 'Erik H.',
        country: 'Sweden',
        date: 'December 2024',
        rating: 4,
        comment:
          'The Unfinished Obelisk is fascinating — it completely changed how I think about the pyramids and what the ancient Egyptians achieved. Very informative tour.',
      },
    ],
  },
]

const SHARM_EXPERIENCES: Experience[] = [
  {
    id: 'sharm-1',
    destinationId: 'sharm',
    title: 'Ras Mohammed Snorkeling & Dive Safari',
    category: 'Water Sports',
    photo: img('1700482323555-182b61c90794'),
    photos: [
      img('1700482323555-182b61c90794', 1200, 800),
      img('1638123657021-f9aca72f8caf', 800, 560),
      img('1583157048761-ac1dba033233', 800, 560),
      img('1625754884730-ba1e2eaafe91', 800, 560),
      img('1700482323555-182b61c90794', 800, 560),
    ],
    rating: 4.8,
    reviewCount: 723,
    duration: '6 hours',
    languages: ['English', 'Arabic', 'Russian', 'Italian'],
    pickupAvailable: true,
    freeCancellation: true,
    price: 750,
    provider: 'Sinai Blue Diving',
    description:
      'Ras Mohammed National Park protects some of the most pristine coral reefs in the world — and this boat trip takes you straight to the best snorkeling and diving sites within it. The Shark Bay and Eel Garden reefs feature walls of coral dropping hundreds of metres, teeming with hundreds of species of fish. This is world-class marine life in one of Egypt\'s most protected natural treasures.',
    highlights: [
      'Two snorkeling and diving stops inside Ras Mohammed National Park',
      'Shark Bay — coral walls, reef sharks, and tropical fish',
      'Eel Garden — moray eels, turtles, and reef life',
      'Scuba diving option for certified divers',
      'PADI-certified dive instructor on board',
      'All snorkeling and diving equipment included',
    ],
    itinerary: [
      { time: '08:30', activity: 'Hotel pickup from Sharm el-Sheikh and Na\'ama Bay' },
      { time: '09:30', activity: 'Depart marina — briefing and equipment fitting' },
      { time: '10:30', activity: 'First stop: Shark Bay snorkeling or dive' },
      { time: '12:30', activity: 'Lunch served on board' },
      { time: '13:30', activity: 'Second stop: Eel Garden snorkeling or dive' },
      { time: '15:30', activity: 'Return to marina and hotel drop-off' },
    ],
    included: [
      'Hotel transfers',
      'Boat trip with park fees',
      'Snorkeling equipment',
      'Dive equipment (for divers)',
      'PADI instructor',
      'Lunch and soft drinks',
    ],
    excluded: ['Dive certification (must be PADI Open Water or equivalent)', 'Alcoholic beverages', 'Gratuities'],
    meetingPoint: "Hotel lobby in Sharm el-Sheikh or Na'ama Bay.",
    whatToBring: ['Swimwear', 'Sunscreen (reef-safe)', 'Towel', 'Underwater camera', 'Dive certification card (divers)'],
    cancellationPolicy: 'Free cancellation up to 24 hours before departure.',
    faq: [
      {
        question: 'Do I need to be a certified diver?',
        answer:
          'Snorkeling is open to all. Scuba diving requires PADI Open Water certification or equivalent. We offer introductory dives for beginners.',
      },
    ],
    reviews: [
      {
        id: 'r1',
        name: 'Natalia Z.',
        country: 'Russia',
        date: 'March 2025',
        rating: 5,
        comment:
          'The coral at Ras Mohammed is unbelievably beautiful. I saw a reef shark, two turtles, and more species of fish than I could count. World class.',
      },
    ],
  },
  {
    id: 'sharm-2',
    destinationId: 'sharm',
    title: 'White Island Boat Trip',
    category: 'Cruises & Sailing',
    photo: img('1638123657021-f9aca72f8caf'),
    photos: [
      img('1638123657021-f9aca72f8caf', 1200, 800),
      img('1583157048761-ac1dba033233', 800, 560),
      img('1700482323555-182b61c90794', 800, 560),
      img('1625754884730-ba1e2eaafe91', 800, 560),
      img('1638123657021-f9aca72f8caf', 800, 560),
    ],
    rating: 4.6,
    reviewCount: 412,
    duration: '6 hours',
    languages: ['English', 'Arabic', 'Russian'],
    pickupAvailable: true,
    freeCancellation: true,
    price: 650,
    provider: 'Sinai Blue Diving',
    description:
      'Sail to the stunning White Island — a pristine sandbar in the Straits of Tiran that appears and disappears with the tide. The surrounding reef is one of the richest in the Red Sea, home to schools of barracuda, Napoleon wrasse, and colourful reef fish in water of extraordinary clarity. This is a full day of sun, sea, snorkeling, and total relaxation.',
    highlights: [
      'White Island sandbar — swim in crystal-clear turquoise shallows',
      'Two snorkeling stops on the renowned Tiran reefs',
      'Tiran Island and the four coral reef systems of the Straits',
      'Fresh seafood and Egyptian lunch on board',
      'Peaceful, less crowded than Ras Mohammed',
    ],
    itinerary: [
      { time: '08:00', activity: 'Hotel pickup' },
      { time: '09:00', activity: 'Depart Sharm marina' },
      { time: '10:30', activity: 'First snorkeling stop — Tiran reef' },
      { time: '12:00', activity: 'White Island — swimming and beach time' },
      { time: '13:00', activity: 'Lunch on board' },
      { time: '14:00', activity: 'Second snorkeling stop' },
      { time: '16:00', activity: 'Return to marina — hotel drop-off' },
    ],
    included: ['Hotel transfers', 'Boat trip', 'Snorkeling equipment', 'Lunch and drinks'],
    excluded: ['Alcoholic beverages', 'Gratuities'],
    meetingPoint: "Hotel lobby in Sharm el-Sheikh or Na'ama Bay.",
    whatToBring: ['Swimwear', 'Reef-safe sunscreen', 'Towel'],
    cancellationPolicy: 'Free cancellation up to 24 hours before departure.',
    faq: [],
    reviews: [
      {
        id: 'r1',
        name: 'Aleksandra B.',
        country: 'Poland',
        date: 'February 2025',
        rating: 5,
        comment:
          'White Island is absolutely magical. The water is every shade of blue and the snorkeling was spectacular. One of the best days of my life.',
      },
    ],
  },
  {
    id: 'sharm-3',
    destinationId: 'sharm',
    title: 'Sinai Desert ATV Safari',
    category: 'Desert & Adventure',
    photo: img('1577085375786-edb0f45560aa'),
    photos: [
      img('1577085375786-edb0f45560aa', 1200, 800),
      img('1509316785289-025f5b846b35', 800, 560),
      img('1713021714419-ca3a7bc12f00', 800, 560),
      img('1577085375786-edb0f45560aa', 800, 560),
      img('1713021714419-ca3a7bc12f00', 800, 560),
    ],
    rating: 4.7,
    reviewCount: 534,
    duration: '3 hours',
    languages: ['English', 'Arabic', 'Russian'],
    pickupAvailable: true,
    freeCancellation: true,
    price: 850,
    provider: 'Sinai Desert Riders',
    description:
      'The Sinai Peninsula\'s dramatic desert landscape — red and ochre mountains, sweeping plains, and ancient Bedouin trails — is best explored by ATV. This guided ride takes you through breathtaking desert terrain with sweeping views of the Red Sea and the mountains of Saudi Arabia across the water. The tour ends at a Bedouin camp for traditional hospitality under the stars.',
    highlights: [
      'ATV ride through Sinai Desert terrain — dunes, rocky trails, and mountain views',
      'Panoramic views of the Red Sea and Tiran Island',
      'Bedouin camp visit — tea, shisha, and stargazing',
      'Sunset timing for golden-hour photography',
      'All safety equipment provided',
    ],
    itinerary: [
      { time: '15:30', activity: 'Hotel pickup' },
      { time: '16:00', activity: 'Safety briefing and ATV orientation' },
      { time: '16:30', activity: 'Desert ride begins — varied terrain with panoramic stops' },
      { time: '17:30', activity: 'Bedouin camp — sunset views, tea, and shisha' },
      { time: '18:30', activity: 'Return transfer to hotel' },
    ],
    included: ['Hotel transfers', 'ATV', 'Safety equipment', 'Bedouin tea', 'Guide'],
    excluded: ['Shisha (optional, paid at camp)', 'Gratuities'],
    meetingPoint: "Hotel lobby in Sharm el-Sheikh or Na'ama Bay.",
    whatToBring: ['Closed shoes', 'Long trousers', 'Sunglasses', 'Scarf for dust protection'],
    cancellationPolicy: 'Free cancellation up to 24 hours before the experience.',
    faq: [],
    reviews: [
      {
        id: 'r1',
        name: 'Marco R.',
        country: 'Italy',
        date: 'January 2025',
        rating: 5,
        comment:
          'The desert around Sharm is stunningly beautiful — craggy red mountains and desert silence. The Bedouin camp at sunset was a lovely ending. Great fun.',
      },
    ],
  },
  {
    id: 'sharm-4',
    destinationId: 'sharm',
    title: 'Intro Scuba Diving Experience',
    category: 'Water Sports',
    photo: img('1638123657021-f9aca72f8caf'),
    photos: [
      img('1638123657021-f9aca72f8caf', 1200, 800),
      img('1700482323555-182b61c90794', 800, 560),
      img('1583157048761-ac1dba033233', 800, 560),
      img('1638123657021-f9aca72f8caf', 800, 560),
      img('1700482323555-182b61c90794', 800, 560),
    ],
    rating: 4.9,
    reviewCount: 298,
    duration: '3 hours',
    languages: ['English', 'Arabic', 'Russian', 'German', 'Italian'],
    pickupAvailable: true,
    freeCancellation: true,
    price: 1800,
    provider: 'Sinai Blue Diving',
    description:
      'No certification required. Our PADI instructors give you everything you need to breathe underwater for the first time at one of the world\'s best diving destinations. After a thorough pool briefing, you\'ll enter the crystal-clear Red Sea for a guided reef dive alongside your instructor. The reefs of Sharm el-Sheikh have a density of marine life that rivals anywhere on earth.',
    highlights: [
      'No prior experience required — full PADI instructor guidance',
      'Pool session to learn breathing and basic skills',
      'Open-water reef dive at a protected site',
      'Maximum 2 students per instructor for safety and personal attention',
      'All equipment provided — wetsuit, tank, BCD, mask',
      'Underwater photos taken by your instructor',
    ],
    itinerary: [
      { time: '09:00', activity: 'Hotel pickup and transfer to dive center' },
      { time: '09:30', activity: 'Theory briefing and equipment fitting' },
      { time: '10:00', activity: 'Pool session — breathing and basic skills' },
      { time: '11:00', activity: 'Transfer to dive site' },
      { time: '11:30', activity: 'Open-water reef dive (approximately 40 minutes)' },
      { time: '12:30', activity: 'Debrief and hotel drop-off' },
    ],
    included: [
      'Hotel transfers',
      'PADI instructor',
      'All dive equipment',
      'Pool session',
      'Open-water dive',
      'Underwater photos',
    ],
    excluded: ['Gratuities', 'Personal diving certification (separate course available)'],
    meetingPoint: "Hotel lobby in Sharm el-Sheikh or Na'ama Bay.",
    whatToBring: ['Swimwear', 'Towel', 'Sunscreen', 'Change of clothes'],
    cancellationPolicy: 'Free cancellation up to 24 hours before the experience.',
    faq: [
      {
        question: 'Is this safe for non-swimmers?',
        answer:
          'Basic swimming ability is required — you should be comfortable in water. Full flotation equipment is always worn.',
      },
    ],
    reviews: [
      {
        id: 'r1',
        name: 'Yulia M.',
        country: 'Russia',
        date: 'March 2025',
        rating: 5,
        comment:
          'I was terrified to try diving but our instructor was calm, patient, and incredibly professional. The reef was extraordinary. I am now a certified diver because of this experience.',
      },
    ],
  },
  {
    id: 'sharm-5',
    destinationId: 'sharm',
    title: 'Parasailing over the Red Sea',
    category: 'Desert & Adventure',
    photo: img('1625754884730-ba1e2eaafe91'),
    photos: [
      img('1625754884730-ba1e2eaafe91', 1200, 800),
      img('1583157048761-ac1dba033233', 800, 560),
      img('1638123657021-f9aca72f8caf', 800, 560),
      img('1625754884730-ba1e2eaafe91', 800, 560),
      img('1700482323555-182b61c90794', 800, 560),
    ],
    rating: 4.6,
    reviewCount: 456,
    duration: '1.5 hours',
    languages: ['English', 'Arabic', 'Russian'],
    pickupAvailable: true,
    freeCancellation: true,
    price: 950,
    provider: 'Fly High Sharm',
    description:
      'Soar 150 metres above the turquoise Red Sea on a tandem parasail for a bird\'s-eye view of Sharm el-Sheikh, Tiran Island, and the Sinai mountains. The launch and landing are from the motorboat — no beach run required — and the flight is smooth, peaceful, and breathtaking. Pairs go together, making this perfect for couples or friends.',
    highlights: [
      '150-metre flight above the Red Sea — panoramic views in every direction',
      'Tandem option for couples or friends flying together',
      'Smooth boat launch and landing — no running required',
      'Views of Tiran Island, the Sinai mountains, and Sharm coastline',
      'GoPro footage included',
    ],
    itinerary: [
      { time: '10:00', activity: 'Hotel pickup' },
      { time: '10:30', activity: 'Arrive at beach — briefing and equipment fitting' },
      { time: '11:00', activity: 'Parasail flight — approximately 15 minutes in the air' },
      { time: '11:30', activity: 'Landing on motorboat — GoPro footage review' },
      { time: '12:00', activity: 'Return to hotel' },
    ],
    included: ['Hotel transfers', 'Parasail flight', 'Life jacket', 'GoPro footage'],
    excluded: ['Gratuities'],
    meetingPoint: "Hotel lobby in Sharm el-Sheikh or Na'ama Bay.",
    whatToBring: ['Swimwear', 'Sunglasses', 'Secure footwear', 'Sunscreen'],
    cancellationPolicy: 'Free cancellation up to 24 hours before. Rescheduled if wind conditions are unsafe.',
    faq: [
      {
        question: 'Is there a weight limit?',
        answer: 'For safety reasons, maximum single participant weight is 120 kg. Tandem maximum combined weight is 200 kg.',
      },
    ],
    reviews: [
      {
        id: 'r1',
        name: 'Joanna K.',
        country: 'Poland',
        date: 'February 2025',
        rating: 5,
        comment:
          'Absolutely exhilarating. The view of the Red Sea from above is stunning and the GoPro footage is brilliant. Over too soon but 100% worth it!',
      },
    ],
  },
]

export const DESTINATIONS: Destination[] = [
  {
    id: 'hurghada',
    name: 'Hurghada',
    description:
      'Egypt\'s premier Red Sea resort destination — a city that lives on sun, sea, and some of the world\'s finest coral reefs. From the azure waters of Orange Bay to the star-filled Eastern Desert, Hurghada offers an extraordinary range of experiences year-round.',
    coverPhoto: img('1583157048761-ac1dba033233', 1600, 900),
    experiences: HURGHADA_EXPERIENCES,
  },
  {
    id: 'sharm',
    name: 'Sharm El Sheikh',
    description:
      'Perched at the southern tip of the Sinai Peninsula where two gulfs meet, Sharm el-Sheikh is home to the legendary reefs of Ras Mohammed National Park and a striking desert landscape that frames the Red Sea in every direction.',
    coverPhoto: img('1700482323555-182b61c90794', 1600, 900),
    experiences: SHARM_EXPERIENCES,
  },
  {
    id: 'cairo',
    name: 'Cairo',
    description:
      'The city of a thousand minarets — ancient and electric, chaotic and magnificent. Cairo is home to the last surviving wonder of the ancient world, a new museum of global importance, and one of the most layered and fascinating urban experiences on earth.',
    coverPhoto: img('1553913861-c0fddf2619ee', 1600, 900),
    experiences: CAIRO_EXPERIENCES,
  },
  {
    id: 'luxor',
    name: 'Luxor',
    description:
      'Ancient Thebes — once the world\'s greatest city, now the open-air museum of a civilization. Both banks of the Nile here are saturated with temples, tombs, and monuments spanning 1,500 years of pharaonic rule. Nowhere on earth concentrates this much antiquity.',
    coverPhoto: img('1777672351192-a7220589c25e', 1600, 900),
    experiences: LUXOR_EXPERIENCES,
  },
  {
    id: 'aswan',
    name: 'Aswan',
    description:
      'Where Egypt slows to the rhythm of the Nile. Aswan is Egypt\'s most beautiful city — granite islands, sailing feluccas, Nubian villages painted in vivid colours, and some of ancient Egypt\'s most extraordinary monuments within easy reach.',
    coverPhoto: img('1684100096410-fd39cdff91a3', 1600, 900),
    experiences: ASWAN_EXPERIENCES,
  },
]

export function getDestination(id: string): Destination | undefined {
  return DESTINATIONS.find((d) => d.id === id)
}

export function getExperience(destinationId: string, experienceId: string): Experience | undefined {
  const dest = getDestination(destinationId)
  return dest?.experiences.find((e) => e.id === experienceId)
}
