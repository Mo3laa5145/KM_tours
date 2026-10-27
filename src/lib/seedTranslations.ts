// Translations of the built-in destinations (names and descriptions).
// Used for the offline fallback catalog and for generating supabase/seed.sql.
// Full trip descriptions can be translated from the admin panel (language tabs).

export type SeedLang = 'ar' | 'fr' | 'de'

export const DESTINATION_TRANSLATIONS: Record<string, Record<SeedLang, { name: string; description: string }>> = {
  hurghada: {
    ar: {
      name: 'الغردقة',
      description:
        'أشهر منتجعات البحر الأحمر في مصر، مدينة تعيش على الشمس والبحر وأجمل الشعاب المرجانية في العالم. من مياه أورانج باي الفيروزية إلى سماء الصحراء الشرقية المرصّعة بالنجوم، تقدّم الغردقة تجارب مميزة طوال العام.',
    },
    fr: {
      name: 'Hurghada',
      description:
        "La grande station balnéaire égyptienne de la mer Rouge : soleil, mer et certains des plus beaux récifs coralliens du monde. Des eaux turquoise d'Orange Bay au ciel étoilé du désert oriental, Hurghada offre des expériences extraordinaires toute l'année.",
    },
    de: {
      name: 'Hurghada',
      description:
        'Ägyptens führender Badeort am Roten Meer – Sonne, Meer und einige der schönsten Korallenriffe der Welt. Vom türkisblauen Wasser der Orange Bay bis zum Sternenhimmel der Östlichen Wüste bietet Hurghada das ganze Jahr über außergewöhnliche Erlebnisse.',
    },
  },
  sharm: {
    ar: {
      name: 'شرم الشيخ',
      description:
        'في الطرف الجنوبي لشبه جزيرة سيناء حيث يلتقي الخليجان، تضم شرم الشيخ الشعاب الأسطورية لمحمية رأس محمد ومناظر صحراوية خلابة تحيط بالبحر الأحمر من كل اتجاه.',
    },
    fr: {
      name: 'Charm el-Cheikh',
      description:
        "À la pointe sud de la péninsule du Sinaï, là où se rejoignent deux golfes, Charm el-Cheikh abrite les récifs légendaires du parc national de Ras Mohammed et un paysage désertique saisissant qui encadre la mer Rouge.",
    },
    de: {
      name: 'Scharm El-Scheich',
      description:
        'An der Südspitze der Sinai-Halbinsel, wo zwei Golfe aufeinandertreffen, liegen die legendären Riffe des Ras-Mohammed-Nationalparks und eine beeindruckende Wüstenlandschaft rund um das Rote Meer.',
    },
  },
  cairo: {
    ar: {
      name: 'القاهرة',
      description:
        'مدينة الألف مئذنة، عريقة ونابضة بالحياة. تضم القاهرة آخر عجائب الدنيا السبع الباقية، ومتحفًا جديدًا ذا أهمية عالمية، وواحدة من أغنى التجارب الحضرية على وجه الأرض.',
    },
    fr: {
      name: 'Le Caire',
      description:
        "La ville aux mille minarets, antique et électrique. Le Caire abrite la dernière merveille du monde antique encore debout, un nouveau musée d'importance mondiale et l'une des expériences urbaines les plus fascinantes de la planète.",
    },
    de: {
      name: 'Kairo',
      description:
        'Die Stadt der tausend Minarette – uralt und voller Energie. Kairo beherbergt das letzte erhaltene Weltwunder der Antike, ein neues Museum von Weltrang und eines der faszinierendsten Stadterlebnisse der Welt.',
    },
  },
  luxor: {
    ar: {
      name: 'الأقصر',
      description:
        'طيبة القديمة، أعظم مدن العالم يومًا، وهي اليوم متحف مفتوح لحضارة كاملة. ضفتا النيل هنا مليئتان بالمعابد والمقابر والآثار الممتدة عبر 1500 عام من حكم الفراعنة.',
    },
    fr: {
      name: 'Louxor',
      description:
        "L'antique Thèbes, jadis la plus grande ville du monde, aujourd'hui un musée à ciel ouvert. Les deux rives du Nil regorgent de temples, de tombeaux et de monuments couvrant 1 500 ans de règne pharaonique.",
    },
    de: {
      name: 'Luxor',
      description:
        'Das antike Theben – einst die größte Stadt der Welt, heute ein Freilichtmuseum einer ganzen Zivilisation. Beide Nilufer sind voller Tempel, Gräber und Monumente aus 1.500 Jahren Pharaonenherrschaft.',
    },
  },
  aswan: {
    ar: {
      name: 'أسوان',
      description:
        'حيث تهدأ مصر على إيقاع النيل. أسوان أجمل مدن مصر: جزر من الجرانيت، وفلوكات شراعية، وقرى نوبية بألوان زاهية، وبعض أروع آثار مصر القديمة على مقربة منك.',
    },
    fr: {
      name: 'Assouan',
      description:
        "Là où l'Égypte ralentit au rythme du Nil. Assouan est la plus belle ville d'Égypte : îles de granit, felouques, villages nubiens aux couleurs vives et monuments extraordinaires à portée de main.",
    },
    de: {
      name: 'Assuan',
      description:
        'Hier passt sich Ägypten dem Rhythmus des Nils an. Assuan ist Ägyptens schönste Stadt – Granitinseln, Feluken, farbenfrohe nubische Dörfer und außergewöhnliche Monumente in greifbarer Nähe.',
    },
  },
}
