import type { Product, Collection, ShippingRate, Coupon, BlogPost, Review } from "@/types";

const n = (en: string, ar: string) => ({ en, ar });

export const COLLECTIONS: Collection[] = [
  {
    id: "col-signature", slug: "signature",
    name: n("The Signature Collection", "المجموعة الأصلية"),
    description: n("Eight eaux de parfum — the founding voice of the maison.", "ثمانية عطور — الصوت المؤسِّس للدار."),
    image: "/images/products/yasmeen.jpg",
  },
  {
    id: "col-lunea", slug: "lunea-line",
    name: n("The Lunéa Line", "خط لونيا"),
    description: n("Our most-loved composition, in every size.", "تركيبتنا الأكثر حباً، بجميع الأحجام."),
    image: "/images/products/lunea.jpg",
  },
  {
    id: "col-coffrets", slug: "coffrets",
    name: n("Coffrets & Gifts", "الأطقم والهدايا"),
    description: n("The discovery set — four 30 ml compositions in one case.", "طقم الاكتشاف — أربع تركيبات ٣٠ مل في علبة واحدة."),
    image: "/images/products/coffret.jpg",
  },
];

const NOW = "2026-07-01T00:00:00.000Z";

export const PRODUCTS: Product[] = [
  {
    id: "p-yasmeen", slug: "yasmeen",
    name: n("Yasmeen", "ياسمين"),
    tagline: n("Damascus at first light", "دمشق عند أول الضوء"),
    description: n(
      "A bright, airy portrait of the city of jasmine. Damascene jasmine absolute opens over green mandarin and neroli, settling into a veil of white amber — luminous, weightless, unmistakably Sham.",
      "لوحة مضيئة وهوائية لمدينة الياسمين. ياسمين دمشقي مطلق يتفتّح فوق اليوسفي الأخضر والنيرولي، ليستقر على غلالة من العنبر الأبيض — نورانيّ، خفيف، شاميّ بلا التباس."
    ),
    size: "50 ml", concentration: "Eau de Parfum", collection: "signature",
    accord: n("Solar white floral", "زهري أبيض مشمس"),
    notes: {
      top: [n("Green mandarin", "يوسفي أخضر"), n("Neroli", "نيرولي")],
      heart: [n("Damascene jasmine", "ياسمين دمشقي"), n("Orange blossom", "زهر البرتقال")],
      base: [n("White amber", "عنبر أبيض"), n("Soft musk", "مسك ناعم")],
    },
    image: "/images/products/yasmeen.jpg", gallery: ["/images/products/yasmeen.jpg"],
    basePriceUSD: 135, prices: { SYP: 1950000 }, inventory: 120, featured: true, hero: true, status: "active", createdAt: NOW,
  },
  {
    id: "p-lunea", slug: "lunea",
    name: n("Lunéa", "لونيا"),
    tagline: n("A rose, after midnight", "وردة بعد منتصف الليل"),
    description: n(
      "Rose water and peony over a whisper of pear, drying down to white musk and sandalwood. Lunéa is the maison's most intimate composition — a fragrance that stays closer than a secret.",
      "ماء الورد والفاوانيا فوق همسة من الإجاص، تهدأ نحو المسك الأبيض وخشب الصندل. لونيا هي أكثر تركيبات الدار حميميةً — عطر يبقى أقرب من السر."
    ),
    size: "50 ml", concentration: "Eau de Parfum", collection: "lunea-line",
    accord: n("Powdery rose", "وردي بودري"),
    notes: {
      top: [n("Pear", "إجاص"), n("Pink berries", "توت وردي")],
      heart: [n("Peony", "فاوانيا"), n("Rose water", "ماء الورد")],
      base: [n("White musk", "مسك أبيض"), n("Sandalwood", "خشب الصندل")],
    },
    image: "/images/products/lunea.jpg", gallery: ["/images/products/lunea.jpg", "/images/products/lunea-100.jpg"],
    basePriceUSD: 135, prices: { SYP: 1950000 }, inventory: 96, featured: true, status: "active", createdAt: NOW,
  },
  {
    id: "p-lunea-100", slug: "lunea-100",
    name: n("Lunéa · 100 ml", "لونيا · ١٠٠ مل"),
    tagline: n("The grand format", "الحجم الكبير"),
    description: n(
      "The maison's most-loved composition in its grand 100 ml format — the same powdery rose accord, in a bottle made for the dressing table.",
      "تركيبة الدار الأكثر حباً بحجمها الكبير ١٠٠ مل — الطابع الوردي البودري نفسه، في قارورة صُنعت لطاولة الزينة."
    ),
    size: "100 ml", concentration: "Eau de Parfum", collection: "lunea-line",
    accord: n("Powdery rose", "وردي بودري"),
    notes: {
      top: [n("Pear", "إجاص"), n("Pink berries", "توت وردي")],
      heart: [n("Peony", "فاوانيا"), n("Rose water", "ماء الورد")],
      base: [n("White musk", "مسك أبيض"), n("Sandalwood", "خشب الصندل")],
    },
    image: "/images/products/lunea-100.jpg", gallery: ["/images/products/lunea-100.jpg"],
    basePriceUSD: 190, prices: { SYP: 2750000 }, inventory: 60, featured: false, status: "active", createdAt: NOW,
  },
  {
    id: "p-moon", slug: "moon",
    name: n("Moon", "مون"),
    tagline: n("A nocturne in plum glass", "معزوفة ليلية في زجاج بلون البرقوق"),
    description: n(
      "Night-blooming jasmine and iris rise through bergamot and black pepper, resting on amber, musk and cedarwood. Moon is worn the way the city wears its evenings — slowly.",
      "ياسمين الليل والسوسن يصعدان عبر البرغموت والفلفل الأسود، ليستقرا على العنبر والمسك وخشب الأرز. يُلبَس «مون» كما تلبس المدينة أمسياتها — ببطء."
    ),
    size: "50 ml", concentration: "Eau de Parfum", collection: "signature",
    accord: n("Ambery night floral", "زهري ليلي عنبري"),
    notes: {
      top: [n("Bergamot", "برغموت"), n("Black pepper", "فلفل أسود")],
      heart: [n("Night jasmine", "ياسمين الليل"), n("Iris", "سوسن")],
      base: [n("Amber", "عنبر"), n("Musk", "مسك"), n("Cedarwood", "خشب الأرز")],
    },
    image: "/images/products/moon.jpg", gallery: ["/images/products/moon.jpg"],
    basePriceUSD: 140, prices: { SYP: 2000000 }, inventory: 88, featured: true, status: "active", createdAt: NOW,
  },
  {
    id: "p-asrar", slug: "asrar",
    name: n("Asrar", "أسرار"),
    tagline: n("What the old souk remembers", "ما يتذكّره السوق القديم"),
    description: n(
      "Saffron and pink pepper open onto Damascus rose wrapped in oud smoke, grounded in leather, vanilla and patchouli. Asrar is the maison's darkest hour — and its most magnetic.",
      "الزعفران والفلفل الوردي يفتتحان على وردة دمشقية ملفوفة بدخان العود، ترسو على الجلد والفانيليا والباتشولي. «أسرار» هي ساعة الدار الأكثر عتمة — وجاذبية."
    ),
    size: "50 ml", concentration: "Eau de Parfum", collection: "signature",
    accord: n("Smoky rose oud", "ورد وعود مدخّن"),
    notes: {
      top: [n("Saffron", "زعفران"), n("Pink pepper", "فلفل وردي")],
      heart: [n("Damascus rose", "ورد دمشقي"), n("Oud smoke", "دخان العود")],
      base: [n("Leather", "جلد"), n("Vanilla", "فانيليا"), n("Patchouli", "باتشولي")],
    },
    image: "/images/products/asrar.jpg", gallery: ["/images/products/asrar.jpg"],
    basePriceUSD: 145, prices: { SYP: 2100000 }, inventory: 74, featured: true, status: "active", createdAt: NOW,
  },
  {
    id: "p-layal", slug: "layal",
    name: n("Layal", "ليالي"),
    tagline: n("A thousand and one evenings", "ألف مساء ومساء"),
    description: n(
      "Plum and cardamom melt into Turkish rose and violet, over a long, warm base of oud, tonka and benzoin. Layal lingers like conversation on a Damascene rooftop.",
      "البرقوق والهيل يذوبان في الورد التركي والبنفسج، فوق قاعدة دافئة طويلة من العود والتونكا والجاوي. «ليالي» يبقى كحديثٍ على سطح دمشقي."
    ),
    size: "50 ml", concentration: "Eau de Parfum", collection: "signature",
    accord: n("Velvet oriental", "شرقي مخملي"),
    notes: {
      top: [n("Plum", "برقوق"), n("Cardamom", "هيل")],
      heart: [n("Turkish rose", "ورد تركي"), n("Violet", "بنفسج")],
      base: [n("Oud", "عود"), n("Tonka bean", "تونكا"), n("Benzoin", "جاوي")],
    },
    image: "/images/products/layal.jpg", gallery: ["/images/products/layal.jpg"],
    basePriceUSD: 140, prices: { SYP: 2000000 }, inventory: 82, featured: false, status: "active", createdAt: NOW,
  },
  {
    id: "p-barq", slug: "barq",
    name: n("Barq", "برق"),
    tagline: n("The second before rain", "الثانية التي تسبق المطر"),
    description: n(
      "An ozonic flash of grapefruit over vetiver and geranium, grounded in ambergris and oakmoss. Barq is electricity bottled — the maison's freshest signature.",
      "ومضة أوزونية من الجريب فروت فوق نجيل الهند وإبرة الراعي، ترسو على العنبر الرمادي وطحلب البلوط. «برق» كهرباء في قارورة — أكثر توقيعات الدار انتعاشاً."
    ),
    size: "50 ml", concentration: "Eau de Parfum", collection: "signature",
    accord: n("Electric vetiver", "نجيل كهربائي"),
    notes: {
      top: [n("Grapefruit", "جريب فروت"), n("Ozonic accord", "طابع أوزوني")],
      heart: [n("Vetiver", "نجيل الهند"), n("Geranium", "إبرة الراعي")],
      base: [n("Ambergris", "عنبر رمادي"), n("Oakmoss", "طحلب البلوط")],
    },
    image: "/images/products/barq.jpg", gallery: ["/images/products/barq.jpg"],
    basePriceUSD: 130, prices: { SYP: 1850000 }, inventory: 105, featured: false, status: "active", createdAt: NOW,
  },
  {
    id: "p-misk", slug: "misk",
    name: n("Misk", "مسك"),
    tagline: n("Clean as morning linen", "نقيّ كالكتان الصباحي"),
    description: n(
      "Aldehydes and lily of the valley over iris butter and white musk, finished with cashmeran and blond woods. Misk is the maison's whisper — the scent of skin, perfected.",
      "ألدهيدات وزنبق الوادي فوق زبدة السوسن والمسك الأبيض، بلمسة نهائية من الكشميران والأخشاب الفاتحة. «مسك» همسة الدار — رائحة البشرة في أكمل صورها."
    ),
    size: "50 ml", concentration: "Eau de Parfum", collection: "signature",
    accord: n("White musk skin scent", "مسك أبيض قريب من البشرة"),
    notes: {
      top: [n("Aldehydes", "ألدهيدات"), n("Lily of the valley", "زنبق الوادي")],
      heart: [n("White musk", "مسك أبيض"), n("Iris butter", "زبدة السوسن")],
      base: [n("Cashmeran", "كشميران"), n("Blond woods", "أخشاب فاتحة")],
    },
    image: "/images/products/misk.jpg", gallery: ["/images/products/misk.jpg"],
    basePriceUSD: 130, prices: { SYP: 1850000 }, inventory: 90, featured: false, status: "active", createdAt: NOW,
  },
  {
    id: "p-waqaar", slug: "waqaar",
    name: n("Waqaar", "وقار"),
    tagline: n("Presence, without a word", "حضور بلا كلمة"),
    description: n(
      "Cypress and incense open onto Taif rose and a dates accord, anchored by oud, sandalwood and labdanum in the grand 100 ml format. Waqaar enters the room before you do.",
      "السرو والبخور يفتتحان على ورد الطائف وطابع التمر، ويرسوان على العود وخشب الصندل واللبان في الحجم الكبير ١٠٠ مل. «وقار» يدخل الغرفة قبلك."
    ),
    size: "100 ml", concentration: "Eau de Parfum", collection: "signature",
    accord: n("Regal incense oud", "عود وبخور ملكي"),
    notes: {
      top: [n("Cypress", "سرو"), n("Incense", "بخور")],
      heart: [n("Taif rose", "ورد الطائف"), n("Dates accord", "طابع التمر")],
      base: [n("Oud", "عود"), n("Sandalwood", "خشب الصندل"), n("Labdanum", "لبان")],
    },
    image: "/images/products/waqaar.jpg", gallery: ["/images/products/waqaar.jpg"],
    basePriceUSD: 195, prices: { SYP: 2800000 }, inventory: 45, featured: true, status: "active", createdAt: NOW,
  },
  {
    id: "p-coffret", slug: "discovery-coffret",
    name: n("The Discovery Coffret", "طقم الاكتشاف"),
    tagline: n("Four compositions, one case", "أربع تركيبات، علبة واحدة"),
    description: n(
      "Lunéa, Misk, Moon and Yasmeen in 30 ml formats, presented in the maison's olive case. The complete introduction to LANTANA — and the gift we are asked for most.",
      "لونيا، مسك، مون وياسمين بحجم ٣٠ مل، في علبة الدار الزيتونية. المدخل الكامل إلى لانتانا — والهدية الأكثر طلباً."
    ),
    size: "4 × 30 ml", concentration: "Eau de Parfum", collection: "coffrets",
    accord: n("The maison, entire", "الدار كاملةً"),
    notes: {
      top: [n("Lunéa", "لونيا"), n("Misk", "مسك")],
      heart: [n("Moon", "مون"), n("Yasmeen", "ياسمين")],
      base: [n("Presented in the olive coffret", "في العلبة الزيتونية")],
    },
    image: "/images/products/coffret.jpg", gallery: ["/images/products/coffret.jpg", "/images/products/coffret-2.jpg"],
    basePriceUSD: 240, prices: { SYP: 3450000 }, inventory: 40, featured: true, status: "active", createdAt: NOW,
  },
];

export const SHIPPING_RATES: ShippingRate[] = [
  { country: "SY", label: n("Damascus & Syria — courier", "دمشق وسوريا — مندوب توصيل"), priceUSD: 3, etaDays: [1, 3] },
  { country: "AE", label: n("United Arab Emirates — express", "الإمارات — سريع"), priceUSD: 12, etaDays: [2, 4] },
  { country: "SA", label: n("Saudi Arabia — express", "السعودية — سريع"), priceUSD: 14, etaDays: [3, 5] },
  { country: "QA", label: n("Qatar — express", "قطر — سريع"), priceUSD: 14, etaDays: [3, 5] },
  { country: "KW", label: n("Kuwait — express", "الكويت — سريع"), priceUSD: 14, etaDays: [3, 5] },
  { country: "WW", label: n("International — DHL", "دولي — DHL"), priceUSD: 28, etaDays: [5, 10] },
];

export const COUPONS: Coupon[] = [
  { code: "DAMASCUS10", type: "percent", value: 10, active: true, minSubtotalUSD: 0 },
  { code: "MAISON25", type: "fixed", value: 25, active: true, minSubtotalUSD: 200 },
];

export const REVIEWS: Review[] = [
  { id: "r1", productId: "p-yasmeen", author: "Rima K.", rating: 5, body: "It smells like the courtyards of the old city in June. I wear nothing else now.", approved: true, createdAt: "2026-06-20T10:00:00Z" },
  { id: "r2", productId: "p-lunea", author: "Sarah A.", rating: 5, body: "Soft, close to the skin, and people always ask what it is.", approved: true, createdAt: "2026-06-22T10:00:00Z" },
  { id: "r3", productId: "p-asrar", author: "Omar H.", rating: 4, body: "Deep and smoky without being heavy. Lasts from morning to night.", approved: true, createdAt: "2026-06-25T10:00:00Z" },
];

export const BLOG_POSTS: BlogPost[] = [
  {
    id: "b1", slug: "the-city-of-jasmine",
    title: n("The city of jasmine", "مدينة الياسمين"),
    excerpt: n("Why Damascus is the only city where LANTANA could have been born.", "لماذا دمشق هي المدينة الوحيدة التي كان يمكن أن تولد فيها لانتانا."),
    body: n(
      "Every fragrance house has an origin. Ours is a city. Damascus has perfumed the world for a thousand years — rose water from Ghouta, jasmine over every courtyard wall, oud in the covered souks. LANTANA begins where that history lives: not as nostalgia, but as raw material. Our compositions take the Levant's memory and set it in French essences, macerated slowly and finished by hand in Dubai. The result is not a souvenir of Damascus. It is Damascus, worn.",
      "لكل دار عطور أصل. أصلنا مدينة. عطّرت دمشق العالم لألف عام — ماء الورد من الغوطة، والياسمين فوق كل جدار، والعود في الأسواق المسقوفة. تبدأ لانتانا حيث تعيش تلك الذاكرة: ليس حنيناً، بل مادةً خام. تأخذ تركيباتنا ذاكرة الشام وتصوغها بخلاصاتٍ فرنسية، تُنقَع ببطء وتُنهى يدوياً في دبي. النتيجة ليست تذكاراً من دمشق. إنها دمشق، تُلبَس."
    ),
    image: "/images/products/yasmeen.jpg", publishedAt: "2026-06-15T00:00:00Z",
  },
  {
    id: "b2", slug: "how-to-wear-eau-de-parfum",
    title: n("How to wear an eau de parfum", "كيف تلبس أو دو بارفان"),
    excerpt: n("Less, placed well, lasts longer than more, placed anywhere.", "القليل في المكان الصحيح يدوم أكثر من الكثير في أي مكان."),
    body: n(
      "Two sprays. Warm points — the inner wrist, the base of the throat, behind the ear. Never rub; friction breaks the top notes before they open. Spray onto skin after moisturising, when the surface holds scent longest. And choose by hour, not occasion: bright compositions like Yasmeen belong to daylight, while Asrar and Moon are made for the evening. A fragrance worn quietly is noticed more, not less.",
      "رشّتان. على نقاط الدفء — باطن المعصم، أسفل العنق، خلف الأذن. لا تفرك أبداً؛ الاحتكاك يكسر نوتات المقدمة قبل أن تتفتّح. رشّ على البشرة بعد الترطيب، حين تحتفظ بالعطر أطول. واختر بحسب الساعة لا المناسبة: التركيبات المضيئة مثل ياسمين لضوء النهار، بينما صُنع أسرار ومون للمساء. العطر الذي يُلبَس بهدوء يُلاحَظ أكثر، لا أقل."
    ),
    image: "/images/products/lunea.jpg", publishedAt: "2026-06-28T00:00:00Z",
  },
];

export const BANK_TRANSFER_DETAILS = {
  en: "Bank: Byblos Bank Syria — Account: LANTANA Fragrances LLC — IBAN sent with your confirmation email. Your order ships once the transfer clears.",
  ar: "البنك: بنك بيبلوس سورية — الحساب: لانتانا للعطور — يُرسل رقم الآيبان مع بريد التأكيد. يُشحن طلبك فور وصول الحوالة.",
};
