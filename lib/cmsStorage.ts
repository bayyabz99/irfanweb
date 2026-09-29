import { 
  COMMISSIONS, 
  TEAM_MEMBERS, 
  PROGRAM_DAYS, 
  GALLERY_ITEMS, 
  TIMELINE_MILESTONES, 
  SPONSORS, 
  FAQ_ITEMS 
} from './data';

export interface SliderItem {
  id: string;
  badge: string;
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
  imageUrl: string;
  order: number;
  isActive: boolean;
}

export interface PartyGroup {
  id: string;
  name: string;
  shortName: string;
  slogan: string;
  description: string;
  logoUrl?: string;
  color?: string;
  seatsCount?: number;
  leaderName?: string;
  principles?: string[];
}

export interface PartiesSectionCMS {
  tag: string;
  heading: string;
  description: string;
  parties: PartyGroup[];
}

export interface CMSData {
  siteSettings: {
    siteName: string;
    organizationName: string;
    slogan: string;
    countdownText: string;
    targetDate: string;
    status: 'online' | 'maintenance';
  };
  homepage: {
    badge: string;
    heroPrefix: string;
    heroTitle: string;
    heroDesc: string;
    heroBgImage: string;
    editorialQuote: string;
    aboutSummary: {
      tag: string;
      heading: string;
      paragraph: string;
      quote: string;
      imageUrl?: string;
    };
    features: {
      title: string;
      iconName: string;
    }[];
    atmosphere: {
      tag: string;
      heading: string;
      description: string;
      photos: {
        url: string;
        title: string;
        subtitle: string;
      }[];
    };
    statsSection?: {
      tag: string;
      heading: string;
      description: string;
    };
    stats: {
      value: string;
      suffix: string;
      label: string;
      description: string;
      imageUrl?: string;
    }[];
    commissionsSection: {
      tag: string;
      heading: string;
      description: string;
    };
    programSection: {
      tag: string;
      heading: string;
      description: string;
    };
    sponsors: { name: string; role: string }[];
    faq: typeof FAQ_ITEMS;
    finalCta: {
      heading: string;
      description: string;
      buttonText: string;
    };
  };
  aboutPage: {
    heroBadge: string;
    heroTitle: string;
    heroDesc: string;
    vizyon: {
      badge?: string;
      title: string;
      subtitle: string;
      content: string;
      footerTag?: string;
    };
    irfanMeclisi: {
      badge?: string;
      title: string;
      subtitle: string;
      content: string;
      footerTag?: string;
    };
    misyon: {
      badge?: string;
      title: string;
      subtitle: string;
      content: string;
      footerTag?: string;
    };
    timav: {
      heading: string;
      tag: string;
      p1: string;
      p2: string;
      stat1Number: string;
      stat1Label: string;
      stat2Number: string;
      stat2Label: string;
      videoUrl: string;
    };
    mediaGallery: {
      url: string;
      title: string;
      subtitle: string;
      type: 'image' | 'video';
      videoEmbedUrl?: string;
    }[];
    bottomCta: {
      heading: string;
      description: string;
      buttonText: string;
    };
  };
  commissions: typeof COMMISSIONS;
  team: typeof TEAM_MEMBERS;
  program: typeof PROGRAM_DAYS;
  gallery: typeof GALLERY_ITEMS;
  ekipPage: {
    heroBadge: string;
    heroTitle: string;
    heroDesc: string;
    defaultAffiliation: string;
  };
  basvuruPage: {
    heroBadge: string;
    heroTitle: string;
    heroDesc: string;
    quotaNotice: string;
  };
  galeriPage: {
    heroBadge: string;
    heroTitle: string;
    heroDesc: string;
  };
  contact: {
    address: string;
    phoneTimav: string;
    phoneCoord: string;
    email: string;
    hours: string;
    mapUrl?: string;
    transport: {
      yht: string;
      airport: string;
      tram: string;
      car: string;
    };
  };
  partiesSection: PartiesSectionCMS;
}

export const INITIAL_CMS_DATA: CMSData = {
  siteSettings: {
    siteName: 'İrfan Meclisi',
    organizationName: 'ÖNDER Derneği Öncülüğünde',
    slogan: 'KÖKÜMÜZ İRFAN, SÖZÜMÜZ İSTİKBAL',
    countdownText: '',
    targetDate: '2026-10-23T09:00:00+03:00',
    status: 'online'
  },
  homepage: {
    badge: 'KÖKÜMÜZ İRFAN • SÖZÜMÜZ İSTİKBAL',
    heroPrefix: 'ÖNDER DERNEĞİ KATKILARIYLA',
    heroTitle: 'İRFAN MECLİSİ',
    heroDesc: '“Kökümüz İrfan, Sözümüz İstikbal”',
    heroBgImage: '/images/anasayfa-arkaplan.png',
    editorialQuote: 'Fikir\nÜreten\nGençlik\nMeclisi',
    aboutSummary: {
      tag: '~ NEDEN İRFAN MECLİSİ? ~',
      heading: 'Sadece Dinleyen Değil,\nGeleceği Şekillendiren',
      paragraph: 'İrfan Meclisi, gençlerin fikirlerini, değerlerini ve potansiyelini bir araya getirerek daha güçlü bir gelecek inşa etmeyi amaçlar.',
      quote: '“Daha iyi bir gelecek, gençlerin fikirleriyle mümkün.”',
      imageUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1000&q=80'
    },
    features: [
      {
        title: '8 İhtisas Masasında Profesyonel Moderasyon & Yasa Teklifi Üretimi',
        iconName: 'Users'
      },
      {
        title: 'Gerçek Meclis Prosedürleriyle Genel Kurul Müzakereleri ve Oylamaları',
        iconName: 'Landmark'
      },
      {
        title: 'Alanında Yetkin Akademisyen, Hukukçu ve Bürokrat Mentorluğu',
        iconName: 'GraduationCap'
      },
      {
        title: 'Tüm Delegelere Özel QR Kodlu Giriş Kartı & Prestijli Katılım Beratı',
        iconName: 'QrCode'
      }
    ],
    atmosphere: {
      tag: '— ETKİNLİKTE YAŞAMAK İÇİN',
      heading: 'Geleceğin Liderleri Burada Buluşuyor',
      description: 'İrfan Meclisi, fikirlerin gerçeğe dönüştüğü, gençliğin gücünün hissedildiği bir platformdur.',
      photos: [
        {
          url: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=800&q=80',
          title: 'Genel Kurul Oturumu',
          subtitle: 'Sultan Selim Ana Salonu'
        },
        {
          url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80',
          title: 'ÖNDER Delege Yaka Kartı',
          subtitle: 'Akreditasyon & QR Kimlik'
        },
        {
          url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80',
          title: 'Komisyon Müzakeresi',
          subtitle: 'Gençler yasa tasarıları üzerinde çalışırken'
        },
        {
          url: 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=800&q=80',
          title: 'Kulis ve Uzlaşma',
          subtitle: 'Partiler arası çapraz müzakereler'
        }
      ]
    },
    statsSection: {
      tag: 'RAKAMLARLA MECLİS',
      heading: 'Sayılarla İrfan Meclisi 2026',
      description: "Dünya Selçuklu Kongre Merkezi'nde gerçekleşecek tarihi buluşmanın organizasyon gücü ve delege kapasitesi."
    },
    stats: [
      {
        value: '250',
        suffix: '+',
        label: 'Asil Delege',
        description: 'Türkiye genelinden nitelikattta seçilen lise ve üniversite delegesi',
        imageUrl: '/images/stats-delege.jpg'
      },
      {
        value: '8',
        suffix: '',
        label: 'İhtisas Komisyonu',
        description: 'Adaletten Dışişlerine, Savunmadan Eğitime stratejik masalar',
        imageUrl: '/images/stats-komisyon.jpg'
      },
      {
        value: '100',
        suffix: '+',
        label: 'Organizasyon Ekibi',
        description: 'Akademik danışmanlar, divan heyeti ve koordinatörler',
        imageUrl: '/images/stats-ekip.jpg'
      }
    ],
    commissionsSection: {
      tag: '— GELECEĞE YÖN VEREN MASALAR',
      heading: '8 İhtisas Komisyonu',
      description: 'Her komisyon, alanında uzman mentörler ve raportörler eşliğinde Türkiye\'nin ve dünyanın stratejik meselelerini masaya yatırır.'
    },
    programSection: {
      tag: 'Meclis Takvimi',
      heading: 'Üç Günlük Zirve Akışı',
      description: '23-24-25 Ekim 2026 Selçuklu Kongre Merkezi\'nde adım adım meclis heyecanı.'
    },
    sponsors: SPONSORS,
    faq: FAQ_ITEMS,
    finalCta: {
      heading: 'Geleceğin Meclisinde Yerinizi Alın',
      description: '250 asil delege kontenjanı için başvurular devam etmektedir. Kişisel QR kodlu biletiniz başvuru sonrası anında oluşturulur.',
      buttonText: 'Delege Başvuru Formuna Git'
    }
  },
  aboutPage: {
    heroBadge: 'ÖNDER KURUMSAL VİZYONU',
    heroTitle: 'Köklü Miras, Çağdaş Müzakere: İrfan Meclisi',
    heroDesc: '“Kökümüz İrfan, Sözümüz İstikbal” anlayışıyla; ilim, irfan ve hikmet ekseninde yetişen genç nesillerin, Türkiye\'nin ve dünyanın temel meselelerine meclis simülasyonu disipliniyle çözüm ürettiği vizyoner bir platformdur.',
    vizyon: {
      badge: 'Gelecek Tasavvuru',
      title: 'VİZYONUMUZ',
      subtitle: 'Şuurlu Gençlik & Kök Miras',
      content: 'İrfan asırlık milli ve manevi medeniyet birikimimizin değerlerinden güç alan, tarihinden aldığı ilhamı istikbaline taşıyan, şuurlu bir gençlik yetiştirmektir. “Kökümüz İrfan, Sözümüz İstikbal” anlayışıyla; milletimizin sahip olduğu ilim, irfan, adalet, ahlak, istişare ve kardeşlik mirasını genç nesillerle buluşturmayı hedefliyoruz. Geçmişinin emanetine sahip çıkan, bugünün meselelerini idrak eden ve yarının Türkiye’sine yön verecek fikir, ahlak ve sorumluluk bilincine sahip gençlerin yetişmesinde öncülük ederek; güçlü bir millet idaresinin, ancak kökleri sağlam bir gençlikle mümkün olduğuna inanıyoruz.',
      footerTag: 'Kadim Değerler & Yeni Perspektifler'
    },
    irfanMeclisi: {
      badge: 'Merkezi Model',
      title: 'İRFAN MECLİSİ',
      subtitle: 'İstişare Kültürü & Gençlik Zemini',
      content: 'İrfan Meclisi; gençlerin milli ve manevi değerlerimizden, tarihi ve medeniyet birikimimizden beslenerek ülke ve dünya meseleleri üzerine fikir ürettiği, istişare kültürünü tecrübe ettiği bir gençlik meclisi simülasyonudur. “Kökümüz İrfan, Sözümüz İstikbal” anlayışıyla; şuurlu, sorumluluk sahibi ve dava sahibi gençlerin yetişmesine katkı sunmayı, fikir ve irfanı buluşturarak istikbale yön verecek bir gençlik zemini oluşturmayı amaçlar.',
      footerTag: 'TBMM Disiplini & Karar Alma Süreçleri'
    },
    misyon: {
      badge: 'Tarihî Sorumluluk',
      title: 'MİSYONUMUZ',
      subtitle: 'Ortak Akıl & Geleceğin Karar Alıcıları',
      content: 'İrfan Meclis Simülasyonu\'nun misyonu; gençlerimizi milletimizin tarihî ve medenî değerleriyle buluşturmak, onlara söz söyleme, fikir üretme, istişare etme ve sorumluluk alma imkânı sunarak geleceğin karar alıcıları olmaya hazırlamaktır. Meclis kültürünü yalnızca bir simülasyon olarak değil, istişare ve ortak akıl geleneğimizin gençler nezdinde yeniden ihyası olarak ele alıyoruz. Bu doğrultuda; vatanına, milletine ve medeniyetine bağlı, millî ve manevî değerlerine sahip çıkan, adalet ve ahlakı rehber edinen, şuurlu ve dava sahibi gençlerin yetişmesine katkı sağlamayı; gençlerimizin sesini fikirle, fikrini irfanla, ve irfanını istikballe buluşturmayı kendimize görev addediyoruz.',
      footerTag: 'Fikir • Ahlak • Adalet • Aksiyon'
    },
    timav: {
      heading: 'ÖNDER Derneği\'nin Gençlik ve Gelecek Vizyonu',
      tag: 'Önder Kurumumuz: ÖNDER',
      p1: 'ÖNDER İmam Hatipliler Derneği; 65 yılı aşkın süredir eğitim, kültür, sanat ve akademi sahasında nesillerin yetişmesine öncülük eden, Türkiye\'nin en köklü ve saygın sivil toplum kuruluşlarındandır.',
      p2: 'İrfan Meclisi; ÖNDER\'in gençlik vizyonunun en somut ve dinamik tezahürlerinden biri olarak, gençleri sadece teorik bilgiyle değil; meclis başkanı, komisyon raportörü, müzakereci ve kanun yapıcı kimlikleriyle geleceğe hazırlar.',
      stat1Number: '65+ Yıl',
      stat1Label: 'Eğitim ve Gençlik Tecrübesi',
      stat2Number: '100.000+',
      stat2Label: 'Gencimize Ulaşan Projeler',
      videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-curved-lines-of-an-auditorium-hall-with-warm-lights-42971-large.mp4'
    },
    mediaGallery: [
      {
        url: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1200&q=80',
        title: 'Selçuklu Kongre Merkezi Sultan Selim Salonu',
        subtitle: '2.200 Delege Kapasiteli Ana Genel Kurul Salonu',
        type: 'image'
      },
      {
        url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80',
        title: 'İrfan Meclisi Tanıtım Filmi & Belgeseli',
        subtitle: 'Meclis Simülasyonunun Doğuşu ve Hedefleri',
        type: 'video',
        videoEmbedUrl: 'https://assets.mixkit.co/videos/preview/mixkit-curved-lines-of-an-auditorium-hall-with-warm-lights-42971-large.mp4'
      },
      {
        url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80',
        title: 'İhtisas Komisyonları Çalıştay Masası',
        subtitle: '8 Stratejik Masada 250 Genç Delegenin Müzakeresi',
        type: 'image'
      },
      {
        url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80',
        title: 'Akreditasyon & Protokol Karşılama',
        subtitle: 'Giriş Kartları ve Delege Beratı Dağıtım Noktası',
        type: 'image'
      }
    ],
    bottomCta: {
      heading: 'Tarihe Not Düşecek 250 Delegeden Biri Olun',
      description: 'Başvurular kontenjanlarla sınırlıdır. Erken başvuru değerlendirmede önceliklidir.',
      buttonText: 'Delege Başvuru Formuna Git'
    }
  },
  commissions: COMMISSIONS,
  team: TEAM_MEMBERS,
  program: PROGRAM_DAYS,
  gallery: GALLERY_ITEMS,
  ekipPage: {
    heroBadge: 'GÖNÜLLÜ VE PROFESYONEL KADRO',
    heroTitle: '100 Kişilik Organizasyon Ekibi',
    heroDesc: '“Kökümüz İrfan, Sözümüz İstikbal” — İrfan Meclisi\'nin planlanmasından oturumların yönetilmesine kadar 3 gün boyunca sahada görev yapan divan heyeti, komisyon başkanları ve koordinasyon birimlerimiz.',
    defaultAffiliation: 'ÖNDER Ekibi'
  },
  basvuruPage: {
    heroBadge: 'MECLİS DELEGE SEÇİMLERİ',
    heroTitle: '2026 Delege Başvuru Formu',
    heroDesc: '“Kökümüz İrfan, Sözümüz İstikbal” anlayışıyla; Türkiye\'nin ve dünyanın geleceğine yön verecek 250 asil delegeden biri olmak için 8 adımlı başvuru formunu doldurunuz.',
    quotaNotice: 'Toplam 8 komisyonda 250 asil delege kabul edilecektir. Başvuru ücretsizdir.'
  },
  galeriPage: {
    heroBadge: 'MEDYA & ETKİNLİK ALANI',
    heroTitle: 'Fotoğraf ve Video Galerisi',
    heroDesc: '“Kökümüz İrfan, Sözümüz İstikbal” — İrfan Meclisi\'nin genel kurul oturumları, komisyon müzakereleri ve kulis anlarından yüksek çözünürlüklü kareler.'
  },
  contact: {
    address: 'Selçuklu Kongre Merkezi (SKM), Yazır Mah. Doç. Dr. Halil Ürün Cad. No: 28 Selçuklu / KONYA',
    phoneTimav: '+90 (212) 521 19 58',
    phoneCoord: '+90 (532) 111 20 26',
    email: 'bilgi@onder.org.tr / irfanmeclisi@onder.org.tr',
    hours: '23 Ekim 2026 Cuma günü 08:30 - 09:30 arası akreditasyon ve kayıt',
    transport: {
      yht: 'Konya YHT Garı\'ndan taksi ile 10 dakika veya Gar önünden kalkan tramvay/otobüs hatlarıyla doğrudan Selçuklu Kongre Merkezi\'ne ulaşım sağlanmaktadır.',
      airport: 'Havalimanından kalkan HAVAŞ servisleri ile şehir merkezine ve SKM kavşağına yaklaşık 20 dakikada rahatça varabilirsiniz.',
      tram: 'Alaaddin - Selçuk Üniversitesi tramvay hattında seyreden tramvaylarla doğrudan Kongre Merkezi durağında inebilirsiniz.',
      car: 'Ankara, İstanbul ve Antalya çevre yollarından Selçuklu / SKM tabelalarını takip ederek 950 araç kapasiteli kapalı otoparka ulaşabilirsiniz.'
    }
  },
  partiesSection: {
    tag: '— MECLİS GRUPLARI & SİYASİ YAPILANMA',
    heading: 'Temsil Edilen Meclis Partileri',
    description: 'İrfan Meclisi simülasyonunda 250 asil delegenin fikirlerini, kanun tekliflerini ve Genel Kurul müzakerelerini yürüttüğü temsil grupları.',
    parties: [
      {
        id: 'parti-1',
        name: 'Adalet ve İrfan Grubu',
        shortName: 'AİG',
        slogan: 'Adalet Mülkün Temeli, İrfan İstikbalin Güvencesidir',
        description: 'Hukuk devleti prensibi, ahlaki liyakat, adil bölüşüm ve şeffaf yönetim ilkelerini meclis komisyonlarında ve Genel Kurul yasama süreçlerinde kararlılıkla savunur.',
        color: '#00B4D8',
        seatsCount: 68,
        leaderName: 'M. Enes Demir • Grup Başkanı',
        principles: ['Hukukun Üstünlüğü', 'Ahlaki Liyakat', 'Sosyal Adalet'],
        logoUrl: ''
      },
      {
        id: 'parti-2',
        name: 'İstikbal ve Maarif Birliği',
        shortName: 'İMB',
        slogan: 'İlimle Dirilen, Maarifle Yükselen Genç Nesil',
        description: 'Milli maarif reformu, fırsat eşitliği, köklü medeniyet müktesebatımızın çağdaş bilim ve teknoloji ile harmanlandığı nitelikli eğitim politikalarını meclise taşır.',
        color: '#10B981',
        seatsCount: 62,
        leaderName: 'Ayşe Zülal Yıldız • Grup Başkanı',
        principles: ['Milli Maarif', 'Kültürel Derinlik', 'Gençlik ve İlim'],
        logoUrl: ''
      },
      {
        id: 'parti-3',
        name: 'Medeniyet ve Kalkınma İttifakı',
        shortName: 'MKİ',
        slogan: 'Üreten Sanayi, Bağımsız ve Güçlü Türkiye',
        description: 'Yerli ve milli teknoloji hamlesi, sürdürülebilir kalkınma modelleri, yeşil ekonomi ve küresel ölçekte rekabetçi genç girişimcilik ekosistemini inşa etmeyi amaçlar.',
        color: '#F59E0B',
        seatsCount: 60,
        leaderName: 'Hakan Selim Karaca • Grup Sözcüsü',
        principles: ['Milli Teknoloji', 'Sürdürülebilir Kalkınma', 'Genç Girişimcilik'],
        logoUrl: ''
      },
      {
        id: 'parti-4',
        name: 'Hür Düşünce ve Dayanışma Hareketi',
        shortName: 'HDH',
        slogan: 'Hür İrade, Ortak Akıl ve Mazluma Kalkan',
        description: 'Uluslararası hak ve diplomasi sahasında Türkiye’nin vicdani liderliğini, sivil toplumun etkinliğini ve temel insan haklarının küresel ölçekte korunmasını savunur.',
        color: '#8B5CF6',
        seatsCount: 60,
        leaderName: 'Zeynep Sare Koç • Grup Başkanı',
        principles: ['İnsani Diplomasi', 'Fikir Hürriyeti', 'Sivil İrade'],
        logoUrl: ''
      }
    ]
  }
};

const CMS_STORAGE_KEY = 'igm_cms_content_v4';

export function getStoredCMSData(): CMSData {
  if (typeof window === 'undefined') return INITIAL_CMS_DATA;
  try {
    const raw = localStorage.getItem(CMS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(CMS_STORAGE_KEY, JSON.stringify(INITIAL_CMS_DATA));
      return INITIAL_CMS_DATA;
    }
    const parsed = JSON.parse(raw);
    return {
      ...INITIAL_CMS_DATA,
      ...parsed,
      siteSettings: { ...INITIAL_CMS_DATA.siteSettings, ...(parsed.siteSettings || {}) },
      homepage: { ...INITIAL_CMS_DATA.homepage, ...(parsed.homepage || {}) },
      aboutPage: { ...INITIAL_CMS_DATA.aboutPage, ...(parsed.aboutPage || {}) },
      commissions: Array.isArray(parsed.commissions) ? parsed.commissions : INITIAL_CMS_DATA.commissions,
      team: Array.isArray(parsed.team) ? parsed.team : INITIAL_CMS_DATA.team,
      program: Array.isArray(parsed.program) ? parsed.program : INITIAL_CMS_DATA.program,
      gallery: Array.isArray(parsed.gallery) ? parsed.gallery : INITIAL_CMS_DATA.gallery,
      ekipPage: { ...INITIAL_CMS_DATA.ekipPage, ...(parsed.ekipPage || {}) },
      basvuruPage: { ...INITIAL_CMS_DATA.basvuruPage, ...(parsed.basvuruPage || {}) },
      galeriPage: { ...INITIAL_CMS_DATA.galeriPage, ...(parsed.galeriPage || {}) },
      contact: { ...INITIAL_CMS_DATA.contact, ...(parsed.contact || {}) },
      partiesSection: parsed.partiesSection && Array.isArray(parsed.partiesSection?.parties)
        ? {
            ...INITIAL_CMS_DATA.partiesSection,
            ...parsed.partiesSection,
            parties: parsed.partiesSection.parties
          }
        : INITIAL_CMS_DATA.partiesSection
    };
  } catch {
    return INITIAL_CMS_DATA;
  }
}

/**
 * Sunucu API'sinden (/api/cms) en güncel veriyi çeker, localStorage'a yazar ve günceller.
 */
export async function fetchServerCMSData(): Promise<CMSData> {
  if (typeof window === 'undefined') return INITIAL_CMS_DATA;
  try {
    const res = await fetch('/api/cms', {
      method: 'GET',
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });
    if (res.ok) {
      const serverData = await res.json();
      if (serverData && typeof serverData === 'object') {
        const merged: CMSData = {
          ...INITIAL_CMS_DATA,
          ...serverData,
          siteSettings: { ...INITIAL_CMS_DATA.siteSettings, ...(serverData.siteSettings || {}) },
          homepage: { ...INITIAL_CMS_DATA.homepage, ...(serverData.homepage || {}) },
          aboutPage: { ...INITIAL_CMS_DATA.aboutPage, ...(serverData.aboutPage || {}) },
          commissions: Array.isArray(serverData.commissions) ? serverData.commissions : INITIAL_CMS_DATA.commissions,
          team: Array.isArray(serverData.team) ? serverData.team : INITIAL_CMS_DATA.team,
          program: Array.isArray(serverData.program) ? serverData.program : INITIAL_CMS_DATA.program,
          gallery: Array.isArray(serverData.gallery) ? serverData.gallery : INITIAL_CMS_DATA.gallery,
          ekipPage: { ...INITIAL_CMS_DATA.ekipPage, ...(serverData.ekipPage || {}) },
          basvuruPage: { ...INITIAL_CMS_DATA.basvuruPage, ...(serverData.basvuruPage || {}) },
          galeriPage: { ...INITIAL_CMS_DATA.galeriPage, ...(serverData.galeriPage || {}) },
          contact: { ...INITIAL_CMS_DATA.contact, ...(serverData.contact || {}) },
          partiesSection: serverData.partiesSection && Array.isArray(serverData.partiesSection?.parties)
            ? {
                ...INITIAL_CMS_DATA.partiesSection,
                ...serverData.partiesSection,
                parties: serverData.partiesSection.parties
              }
            : INITIAL_CMS_DATA.partiesSection
        };
        localStorage.setItem(CMS_STORAGE_KEY, JSON.stringify(merged));
        window.dispatchEvent(new Event('igm_cms_updated'));
        return merged;
      }
    }
  } catch (err) {
    console.warn('Could not fetch CMS from server, using local fallback:', err);
  }
  return getStoredCMSData();
}

/**
 * CMS verilerini hem yerel tarayıcı belleğine hem de sunucu diskine (/api/cms) kalıcı olarak kaydeder.
 */
export function saveStoredCMSData(data: CMSData): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CMS_STORAGE_KEY, JSON.stringify(data));
    window.dispatchEvent(new Event('igm_cms_updated'));

    // Sunucu diskine asenkron kaydet
    fetch('/api/cms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).catch((err) => {
      console.error('Failed to persist CMS data to server:', err);
    });
  } catch (err) {
    console.error('Failed to save CMS data:', err);
  }
}

/**
 * CMS verilerini hem yerel belleğe hem sunucu diskine kaydeder ve sunucu sonucunu bekler.
 */
export async function saveStoredCMSDataAsync(data: CMSData): Promise<{ success: boolean; error?: string }> {
  if (typeof window === 'undefined') return { success: false, error: 'No window context' };
  try {
    // 1. Yerel belleğe anında yaz
    localStorage.setItem(CMS_STORAGE_KEY, JSON.stringify(data));
    window.dispatchEvent(new Event('igm_cms_updated'));

    // 2. Sunucuya gönder
    const res = await fetch('/api/cms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      return { success: false, error: errJson.error || `Server returned ${res.status}` };
    }

    return { success: true };
  } catch (err: any) {
    console.error('saveStoredCMSDataAsync error:', err);
    return { success: false, error: err?.message || 'Sunucuya kaydedilemedi' };
  }
}

export function resetCMSData(): CMSData {
  if (typeof window !== 'undefined') {
    localStorage.setItem(CMS_STORAGE_KEY, JSON.stringify(INITIAL_CMS_DATA));
    window.dispatchEvent(new Event('igm_cms_updated'));

    fetch('/api/cms', {
      method: 'DELETE'
    }).catch((err) => {
      console.error('Failed to reset CMS data on server:', err);
    });
  }
  return INITIAL_CMS_DATA;
}


// -------------------------------------------------------------
// CMS CRUD HELPERS (Direct mutations with event trigger)
// -------------------------------------------------------------

export function addCommissionItem(commission: any): CMSData {
  const current = getStoredCMSData();
  const updated = {
    ...current,
    commissions: [...current.commissions, commission]
  };
  saveStoredCMSData(updated);
  return updated;
}

export function updateCommissionItem(id: string, updates: any): CMSData {
  const current = getStoredCMSData();
  const updated = {
    ...current,
    commissions: current.commissions.map((c: any) => (c.id === id ? { ...c, ...updates } : c))
  };
  saveStoredCMSData(updated);
  return updated;
}

export function deleteCommissionItem(id: string): CMSData {
  const current = getStoredCMSData();
  const updated = {
    ...current,
    commissions: current.commissions.filter((c: any) => c.id !== id)
  };
  saveStoredCMSData(updated);
  return updated;
}

export function addTeamMemberItem(member: any): CMSData {
  const current = getStoredCMSData();
  const updated = {
    ...current,
    team: [...current.team, member]
  };
  saveStoredCMSData(updated);
  return updated;
}

export function updateTeamMemberItem(id: string, updates: any): CMSData {
  const current = getStoredCMSData();
  const updated = {
    ...current,
    team: current.team.map((m: any) => (m.id === id ? { ...m, ...updates } : m))
  };
  saveStoredCMSData(updated);
  return updated;
}

export function deleteTeamMemberItem(id: string): CMSData {
  const current = getStoredCMSData();
  const updated = {
    ...current,
    team: current.team.filter((m: any) => m.id !== id)
  };
  saveStoredCMSData(updated);
  return updated;
}

export function addProgramSessionItem(dayNumber: number, session: any): CMSData {
  const current = getStoredCMSData();
  const updated = {
    ...current,
    program: current.program.map((day: any) => {
      if (day.dayNumber === dayNumber) {
        return { ...day, sessions: [...day.sessions, session] };
      }
      return day;
    })
  };
  saveStoredCMSData(updated);
  return updated;
}

export function updateProgramSessionItem(dayNumber: number, sessionId: string, updates: any): CMSData {
  const current = getStoredCMSData();
  const updated = {
    ...current,
    program: current.program.map((day: any) => {
      if (day.dayNumber === dayNumber) {
        return {
          ...day,
          sessions: day.sessions.map((s: any) => (s.id === sessionId ? { ...s, ...updates } : s))
        };
      }
      return day;
    })
  };
  saveStoredCMSData(updated);
  return updated;
}

export function deleteProgramSessionItem(dayNumber: number, sessionId: string): CMSData {
  const current = getStoredCMSData();
  const updated = {
    ...current,
    program: current.program.map((day: any) => {
      if (day.dayNumber === dayNumber) {
        return {
          ...day,
          sessions: day.sessions.filter((s: any) => s.id !== sessionId)
        };
      }
      return day;
    })
  };
  saveStoredCMSData(updated);
  return updated;
}

export function addPartyItem(party: PartyGroup): CMSData {
  const current = getStoredCMSData();
  const updated = {
    ...current,
    partiesSection: {
      ...current.partiesSection,
      parties: [...(current.partiesSection?.parties || []), party]
    }
  };
  saveStoredCMSData(updated);
  return updated;
}

export function updatePartyItem(id: string, updates: Partial<PartyGroup>): CMSData {
  const current = getStoredCMSData();
  const updated = {
    ...current,
    partiesSection: {
      ...current.partiesSection,
      parties: (current.partiesSection?.parties || []).map((p) => (p.id === id ? { ...p, ...updates } : p))
    }
  };
  saveStoredCMSData(updated);
  return updated;
}

export function deletePartyItem(id: string): CMSData {
  const current = getStoredCMSData();
  const updated = {
    ...current,
    partiesSection: {
      ...current.partiesSection,
      parties: (current.partiesSection?.parties || []).filter((p) => p.id !== id)
    }
  };
  saveStoredCMSData(updated);
  return updated;
}


