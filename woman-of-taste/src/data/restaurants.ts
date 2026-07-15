export type PlaceCategory = "Restaurant" | "Experience" | "Stay";

export interface Place {
  slug: string;
  name: string;
  tagline: string;
  category: PlaceCategory;
  cuisine?: string;
  neighborhood: string;
  city: string;
  address: string;
  priceRange: "R" | "RR" | "RRR" | "RRRR";
  tiktokViews: number;
  datePosted: string;
  coverImage: string;
  excerpt: string;
  description: string;
  highlights: string[];
  mustTry: { name: string; note: string }[];
  vibe: string;
  perfectFor: string[];
  tiktokUrl: string;
  tags: string[];
  openingHours?: string;
  reservations?: boolean;
  website?: string;
  instagramHandle?: string;
  seoKeywords: string[];
}

export const places: Place[] = [
  {
    slug: "marble-rosebank-johannesburg",
    name: "Marble",
    tagline: "Joburg's iconic fire-kitchen — 191K views on TikTok",
    category: "Restaurant",
    cuisine: "Wood-fired contemporary South African",
    neighborhood: "Rosebank",
    city: "Johannesburg",
    address: "2 Keyes Ave, Rosebank, Johannesburg, 2196",
    priceRange: "RRRR",
    tiktokViews: 191200,
    datePosted: "2024-10-01",
    coverImage: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&q=80",
    excerpt: "Marble in Rosebank is one of the most-watched restaurant features on PashieB's TikTok — 191K views and counting. This is Joburg's fire-kitchen institution, and for good reason.",
    description: `Marble Restaurant in Rosebank is the video that started it all for many viewers on the Woman of Taste TikTok page. With over 191K views, it remains the most-watched restaurant feature — and when you visit, you understand exactly why it resonates.

The concept at Marble is built around live-fire cooking. A custom wood-fired oven and open grill sit at the heart of the kitchen and dining room, and everything on the menu comes through that fire in some way. It is simple in idea and extraordinary in execution.

What to expect when you walk in: a warm, dimly lit dining room with energy that never feels forced. The fire is visible, the aromas are immediate, and the service team knows their menu deeply. This is the kind of restaurant where you can trust the recommendation, whether you are choosing wine or deciding between cuts.

The dry-aged beef is sourced from South African farms and prepared with confidence. The starters are equally considered — the bone marrow and the bread course alone justify the reservation. For a celebration, a date, or a dinner that simply needs to be remembered, Marble delivers consistently.`,
    highlights: [
      "191K TikTok views — Joburg's most-featured restaurant on the WOT page",
      "Live-fire wood oven is the centrepiece of the kitchen",
      "South African-sourced dry-aged beef",
      "Wine list focused on South African estates",
    ],
    mustTry: [
      { name: "Dry-aged Beef", note: "The signature. Ask your server for the cut of the day" },
      { name: "Wood-roasted Bone Marrow", note: "Rich, silky and served with exceptional bread" },
      { name: "Marble Bread Course", note: "Do not skip this — it sets the tone for the whole meal" },
    ],
    vibe: "Fire-lit, energetic and romantic. Dress to match the room.",
    perfectFor: ["Celebration dinners", "Date nights", "Impressing out-of-towners", "Milestone moments"],
    tiktokUrl: "https://www.tiktok.com/@pashieb_the_wot",
    tags: ["Fine Dining", "Wood-Fired", "Rosebank", "Special Occasion"],
    reservations: true,
    website: "https://www.marble.restaurant",
    instagramHandle: "@marblejoburg",
    openingHours: "Mon–Sat 12:00–22:00, Sun 12:00–21:00",
    seoKeywords: ["Marble restaurant Rosebank Johannesburg", "best restaurants Joburg 2025", "wood-fired restaurant Johannesburg", "Woman of Taste Marble restaurant"],
  },
  {
    slug: "farmhouse-58-muldersdrift",
    name: "Farmhouse 58",
    tagline: "Muldersdrift escape that hit 166K views on PashieB's page",
    category: "Stay",
    neighborhood: "Muldersdrift",
    city: "Johannesburg",
    address: "Farmhouse 58, Muldersdrift, Gauteng",
    priceRange: "RRR",
    tiktokViews: 166300,
    datePosted: "2024-09-15",
    coverImage: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1200&q=80",
    excerpt: "The Farmhouse 58 video is one of PashieB's most-watched ever — 166K views. A Muldersdrift stay that offers farm-style accommodation, a pool, and the kind of reset Joburg women genuinely need.",
    description: `With 166K views, the Farmhouse 58 TikTok from the Woman of Taste page is one of the platform's highest-performing pieces of content — and it speaks directly to what the WOT community is looking for: a beautiful, considered space to exhale, an hour from the city.

Farmhouse 58 in Muldersdrift sits in the quiet west of Gauteng, away from the pace of Sandton and Rosebank. The accommodation is farm-style with considered touches — think open-air living, a pool, greenery, and the particular kind of quiet that Johannesburg residents forget exists.

What makes it the kind of place that resonates on TikTok is exactly what makes it worth visiting: the setting is genuinely beautiful and easy to photograph, but the experience goes well beyond aesthetics. It is the kind of place you drive to on a Thursday afternoon and feel immediately different — lighter, present, unhurried.

For a weekend escape, a girls' getaway, a birthday celebration, or simply a night to mark a transition, Farmhouse 58 delivers the farm-meets-luxury feeling that the Joburg market responds to deeply.`,
    highlights: [
      "166K TikTok views — one of the most-watched WOT features ever",
      "Farm accommodation with pool and open landscapes",
      "Muldersdrift location — approximately 1 hour from central Joburg",
      "Perfect for overnight stays and long weekends",
    ],
    mustTry: [
      { name: "Pool morning", note: "The pool experience is central to why people come — make the most of it" },
      { name: "Sunrise on the farm", note: "Wake up earlier than you normally would. Worth it." },
    ],
    vibe: "Farm-calm, beautiful and restorative. Leave your schedule at home.",
    perfectFor: ["Weekend getaways", "Birthday escapes", "Girls' trips", "Digital detox"],
    tiktokUrl: "https://www.tiktok.com/@pashieb_the_wot",
    tags: ["Stay", "Muldersdrift", "Farm Escape", "Weekend Getaway", "Joburg Experience"],
    reservations: true,
    openingHours: "Check-in from 14:00",
    seoKeywords: ["Farmhouse 58 Muldersdrift", "farm stay near Johannesburg", "weekend getaway Joburg", "Woman of Taste Muldersdrift"],
  },
  {
    slug: "egrek-cinema-parkhurst",
    name: "Egrek Cinema",
    tagline: "Parkhurst's outdoor cinema experience — 69.5K views",
    category: "Experience",
    neighborhood: "Parkhurst",
    city: "Johannesburg",
    address: "Parkhurst Square, Block A, 4th Ave, Parkhurst, Johannesburg",
    priceRange: "RR",
    tiktokViews: 69500,
    datePosted: "2024-08-20",
    coverImage: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1200&q=80",
    excerpt: "Egrek Cinema in Parkhurst was the Joburg Experience video that hit 69.5K views on the WOT TikTok. An outdoor cinema at Parkhurst Square — the kind of evening that feels like a gift.",
    description: `The Egrek Cinema video clocked 69.5K views on the Woman of Taste TikTok page, making it one of the highest-performing experience features on the account. And if you have been to Parkhurst Square on an Egrek evening, you already know why.

Egrek Cinema is an outdoor cinema experience located at Parkhurst Square, nestled in one of Johannesburg's most walkable and beloved neighbourhoods. It brings the pleasure of watching a film to an open-air setting — blankets, evening air, the glow of the screen against Joburg's night sky.

The experience is curated: you bring or order food and drinks, find your spot, and settle into a film in a setting that feels genuinely special rather than simply functional. The intimacy of the outdoor format transforms something ordinary (watching a movie) into something worth marking in your calendar and capturing on your camera.

For the WOT community — women who approach evenings as experiences to be savoured — Egrek is the kind of Joburg event that belongs on a shortlist. It is accessible (not expensive), beautiful (outdoors, lit well), and social in exactly the right way.`,
    highlights: [
      "69.5K TikTok views on the WOT page",
      "Open-air cinema in the heart of Parkhurst",
      "Community, atmospheric and completely Joburg",
      "Accessible entry — bring a blanket and enjoy",
    ],
    mustTry: [
      { name: "Pre-cinema dinner on 4th Ave", note: "Walk the strip before settling in — Parkhurst's 4th Ave has excellent options" },
      { name: "The blanket setup", note: "Come prepared — blanket, snacks, camera ready for the golden hour before the film" },
    ],
    vibe: "Warm, communal and cinematic. Joburg evenings at their most charming.",
    perfectFor: ["Date nights", "Girl's evenings out", "Birthday celebrations", "Sunday escapes"],
    tiktokUrl: "https://www.tiktok.com/@pashieb_the_wot",
    tags: ["Experience", "Parkhurst", "Outdoor Cinema", "Joburg Experience", "Date Night"],
    reservations: true,
    seoKeywords: ["Egrek Cinema Parkhurst Johannesburg", "outdoor cinema Joburg", "things to do Parkhurst", "Woman of Taste Joburg Experience"],
  },
  {
    slug: "chuay-chau-sandton",
    name: "Chuay Chau",
    tagline: "Pan-Asian fusion dining in Sandton — 39.4K views",
    category: "Restaurant",
    cuisine: "Pan-Asian fusion",
    neighborhood: "Sandton",
    city: "Johannesburg",
    address: "Sandton, Johannesburg",
    priceRange: "RRR",
    tiktokViews: 39400,
    datePosted: "2024-11-05",
    coverImage: "https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=1200&q=80",
    excerpt: "Chuay Chau in Sandton is the Pan-Asian fusion experience that racked up 39.4K views on the WOT TikTok. Flavours that pull from across the continent, in a setting that keeps Joburg talking.",
    description: `Chuay Chau in Sandton brings Pan-Asian fusion dining to Joburg's most cosmopolitan suburb, and the response from the Woman of Taste TikTok community was immediate — 39.4K views on a single feature.

Pan-Asian fusion dining draws from multiple Asian culinary traditions and interprets them in a contemporary framework. At Chuay Chau, this translates to a menu that is layered, flavourful, and consistently surprising — dishes with the warmth of South-East Asian spice, the precision of Japanese technique, and the richness of South Asian influence, all under one roof.

The Sandton location places it squarely in Joburg's most visited dining corridor, making it accessible for business dinners, date nights, and post-shopping meals. The interior is designed with the same visual energy that the food brings — considered, warm, and worth photographing.

What drew the WOT community was the combination of flavour adventure and elevated setting: this is not a casual pan-Asian eatery but a full dining experience. If you eat with intention and appreciate food that asks you to pay attention, Chuay Chau is worth the booking.`,
    highlights: [
      "39.4K views on the Woman of Taste TikTok feature",
      "Pan-Asian fusion — multiple Asian culinary traditions in one menu",
      "Sandton location — ideal for pre- or post-event dining",
      "Visually striking interior and plating",
    ],
    mustTry: [
      { name: "Signature dim sum selection", note: "Start here to understand the kitchen's range and technique" },
      { name: "The wok-fired mains", note: "Where the flavour profile of the menu reaches its peak" },
    ],
    vibe: "Dynamic, flavour-forward and visually striking. A step away from the expected.",
    perfectFor: ["Adventurous eaters", "Business dinners", "Date nights", "Post-Sandton City exploration"],
    tiktokUrl: "https://www.tiktok.com/@pashieb_the_wot",
    tags: ["Restaurant", "Pan-Asian", "Sandton", "Fusion Dining"],
    reservations: true,
    openingHours: "Tue–Sun 12:00–22:00",
    seoKeywords: ["Chuay Chau Sandton Johannesburg", "Pan-Asian restaurant Sandton", "best Asian food Joburg", "Woman of Taste Sandton restaurant"],
  },
  {
    slug: "the-test-bakery-braamfontein",
    name: "The Test Bakery",
    tagline: "Braam's cult bakery — 34K views on the WOT page",
    category: "Restaurant",
    cuisine: "Artisan bakery & café",
    neighborhood: "Braamfontein",
    city: "Johannesburg",
    address: "Braamfontein, Johannesburg",
    priceRange: "R",
    tiktokViews: 34000,
    datePosted: "2024-07-14",
    coverImage: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1200&q=80",
    excerpt: "The Test Bakery in Braam hit 34K views on PashieB's TikTok — and it earned every one of them. An artisan bakery in the heart of Joburg's most creative neighbourhood, before Pablo & Princess came along.",
    description: `The Test Bakery in Braamfontein is one of those Joburg spots that feels like a local secret — except that 34K TikTok views on the Woman of Taste page have made it considerably less secret.

Braamfontein has been Johannesburg's creative quarter for years, and The Test Bakery fits the neighbourhood perfectly: independent, quality-focused, and operating with a level of craft that most bigger establishments can only aspire to. This is an artisan bakery in the truest sense — the bread is made with attention, the pastries are worth the trip on their own, and the coffee is consistently good.

What PashieB's feature captured was the atmosphere as much as the food: Braam's street energy, the bakery's unhurried pace, the satisfaction of something made with care. It is the kind of place that makes a midweek morning feel like a choice rather than a routine.

For the WOT community, The Test Bakery represents exactly the kind of Joburg discovery that belongs in a rotating list of go-to spots: not the most expensive or the most glamorous, but genuine, craft-forward, and located in a neighbourhood worth exploring.`,
    highlights: [
      "34K TikTok views on the WOT Braamfontein feature",
      "Artisan bread and pastries made with real craft",
      "Braamfontein location — walk the neighbourhood while you're here",
      "Accessible price point for exceptional quality",
    ],
    mustTry: [
      { name: "Sourdough loaf", note: "The bread that built the reputation — dense, deeply flavoured, exceptional crust" },
      { name: "Pastry of the day", note: "Whatever is at the counter when you arrive is the right answer" },
      { name: "Flat white", note: "Coffee is taken seriously here — as it should be" },
    ],
    vibe: "Creative, unhurried and genuinely Joburg. Neighbourhood energy at its best.",
    perfectFor: ["Weekend morning explorations", "Working from a good café", "Braam walks", "Bread lovers"],
    tiktokUrl: "https://www.tiktok.com/@pashieb_the_wot",
    tags: ["Café", "Bakery", "Braamfontein", "Artisan", "Affordable"],
    reservations: false,
    seoKeywords: ["Test Bakery Braamfontein Johannesburg", "best bakery Joburg", "artisan bread Braam", "Woman of Taste Braamfontein café"],
  },
  {
    slug: "nineteen-on-fourth-parkhurst",
    name: "Nineteen on Fourth",
    tagline: "Parkhurst staple with 30.2K views and consistent appeal",
    category: "Restaurant",
    cuisine: "Contemporary café dining",
    neighborhood: "Parkhurst",
    city: "Johannesburg",
    address: "19 4th Ave, Parkhurst, Johannesburg, 2193",
    priceRange: "RR",
    tiktokViews: 30200,
    datePosted: "2024-06-08",
    coverImage: "https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=1200&q=80",
    excerpt: "Nineteen on Fourth in Parkhurst is the neighbourhood favourite that PashieB's TikTok took to 30.2K views. Fourth Avenue dining at its most reliable — always worth the drive to Parkhurst.",
    description: `Nineteen on Fourth sits on Parkhurst's beloved 4th Avenue and represents exactly what makes that strip one of Joburg's most enjoyable dining destinations: a menu that covers the day confidently, a setting that works morning to evening, and the kind of consistent quality that makes you a regular.

The Woman of Taste TikTok feature generated 30.2K views and resonated with a community that knows Parkhurst well and appreciates seeing its favourites championed. Nineteen on Fourth is the kind of place that Joburg women have had in their rotation for years, and PashieB's feature introduced it to a generation of viewers discovering the neighbourhood for the first time.

The menu spans breakfast, brunch, lunch and dinner — all done with care. The coffee is solid, the food is reliably good, and the al fresco seating along 4th Ave gives you front-row access to one of the best people-watching strips in the city.

For first-time Parkhurst visitors, Nineteen on Fourth is the entry point. For regulars, it is the baseline against which everything else is measured.`,
    highlights: [
      "30.2K TikTok views on the WOT feature",
      "4th Avenue location — Joburg's best café strip",
      "All-day dining from morning coffee to dinner",
      "Outdoor seating on one of the city's most pleasant streets",
    ],
    mustTry: [
      { name: "Breakfast plate", note: "One of the better renditions of the classic Joburg breakfast format" },
      { name: "Coffee and pastry pairing", note: "For a quick stop between other 4th Ave explorations" },
    ],
    vibe: "Neighbourhood warmth, consistent and always pleasant. Parkhurst at its best.",
    perfectFor: ["Weekend brunches", "Parkhurst explorations", "Casual lunch dates", "Post-Egrek Cinema dinners"],
    tiktokUrl: "https://www.tiktok.com/@pashieb_the_wot",
    tags: ["Restaurant", "Parkhurst", "Brunch", "All-Day Dining", "4th Avenue"],
    reservations: false,
    website: "https://www.nineteenonfourth.co.za",
    openingHours: "Mon–Sun 07:00–22:00",
    seoKeywords: ["Nineteen on Fourth Parkhurst", "4th Avenue restaurants Parkhurst Joburg", "Parkhurst café Johannesburg", "Woman of Taste Parkhurst"],
  },
  {
    slug: "saint-sandton",
    name: "SAINT",
    tagline: "Sandton's most talked-about opening — 24.6K views",
    category: "Restaurant",
    cuisine: "Contemporary dining bar",
    neighborhood: "Sandton",
    city: "Johannesburg",
    address: "Sandton, Johannesburg",
    priceRange: "RRR",
    tiktokViews: 24600,
    datePosted: "2024-10-22",
    coverImage: "https://images.unsplash.com/photo-1551218808-94e220e084d2?w=1200&q=80",
    excerpt: "SAINT in Sandton is the Joburg restaurant that arrived and immediately needed to be talked about — 24.6K views on PashieB's TikTok confirms the city felt the same way.",
    description: `SAINT in Sandton arrived in Joburg's dining landscape and generated the kind of immediate conversation that only a well-executed concept can. With 24.6K views on the Woman of Taste TikTok feature, it is clearly resonating with the city's discerning dining community.

The restaurant occupies the intersection of dining room and bar, where the cocktail programme is as considered as the food menu and both are elevated by a space that has been thoughtfully designed for evening energy. This is Sandton dining that understands its audience: people who want the food to be genuinely good, the drinks to be interesting, and the setting to make them feel like the evening was worth getting dressed for.

What PashieB's TikTok feature communicated about SAINT was the atmosphere as much as the food — the way the room felt at a certain hour, the quality of what arrived at the table, and the overall experience of choosing SAINT for the evening.

For the Sandton dining circuit, SAINT has positioned itself as a destination for evenings that want to begin at the bar and end at the table, or move fluidly between both.`,
    highlights: [
      "24.6K TikTok views on the WOT feature",
      "Dining-bar hybrid — cocktails and food equally considered",
      "Sandton's newest notable opening",
      "Evening energy in a well-designed space",
    ],
    mustTry: [
      { name: "The cocktail list", note: "Start here — the drinks programme is where SAINT first signals its intent" },
      { name: "Small plates selection", note: "Order widely — the menu rewards sharing and exploration" },
    ],
    vibe: "Fashionable, energetic and evening-ready. Sandton at its most current.",
    perfectFor: ["After-work drinks into dinner", "Celebrating with the city", "Date evenings", "Group outings"],
    tiktokUrl: "https://www.tiktok.com/@pashieb_the_wot",
    tags: ["Restaurant", "Sandton", "Dining Bar", "Evening Dining", "Cocktails"],
    reservations: true,
    seoKeywords: ["SAINT restaurant Sandton Johannesburg", "new restaurants Sandton 2025", "best bar dining Sandton", "Woman of Taste SAINT Joburg"],
  },
  {
    slug: "artistry-sandton",
    name: "Artistry",
    tagline: "Sandton's creative dining destination — 21.8K views",
    category: "Restaurant",
    cuisine: "Contemporary South African",
    neighborhood: "Sandton",
    city: "Johannesburg",
    address: "Sandton, Johannesburg",
    priceRange: "RRR",
    tiktokViews: 21800,
    datePosted: "2024-09-03",
    coverImage: "https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=1200&q=80",
    excerpt: "Artistry in Sandton is where Joburg's creative class eats — PashieB's TikTok feature generated 21.8K views and sparked exactly the kind of dinner conversation the restaurant is built for.",
    description: `Artistry in Sandton arrives at the intersection of food and creative culture, and PashieB's Woman of Taste TikTok feature — 21.8K views — captured that sensibility accurately.

The restaurant's name is not just a positioning statement; it communicates the kitchen's approach to the plate. Artistry operates with the belief that what arrives in front of you should look as considered as it tastes, and that a dining room is a space for something more than just eating.

The menu draws on South African ingredients and contemporary technique, with a plating aesthetic that rewards the camera and, more importantly, the palate. For a Sandton location that could easily default to the familiar — steak, sushi, safe international dishes — Artistry makes bolder choices and is better for them.

What the WOT community responded to was both the visual quality of the TikTok content and the sense that this is a Sandton restaurant worth discovering deliberately, not stumbling into by accident.`,
    highlights: [
      "21.8K TikTok views on the WOT feature",
      "Plating and presentation that justifies the name",
      "South African ingredients with contemporary technique",
      "Sandton location with genuine creative identity",
    ],
    mustTry: [
      { name: "The visual starter", note: "Whatever is most photographed on the menu when you visit — order it" },
      { name: "Seasonal main", note: "The kitchen changes with intention — trust what the season has produced" },
    ],
    vibe: "Creative, considered and visually rich. Joburg dining that takes itself seriously.",
    perfectFor: ["Creative industry dinners", "Special evenings", "Food photography enthusiasts", "Sandton date nights"],
    tiktokUrl: "https://www.tiktok.com/@pashieb_the_wot",
    tags: ["Restaurant", "Sandton", "Contemporary", "Creative Dining"],
    reservations: true,
    seoKeywords: ["Artistry restaurant Sandton Johannesburg", "contemporary dining Sandton", "best restaurants Sandton 2025", "Woman of Taste Artistry Joburg"],
  },
  {
    slug: "ethos-rosebank",
    name: "ETHOS",
    tagline: "Rosebank dining with intention — 21.1K views on WOT",
    category: "Restaurant",
    cuisine: "Modern café dining",
    neighborhood: "Rosebank",
    city: "Johannesburg",
    address: "Rosebank, Johannesburg",
    priceRange: "RR",
    tiktokViews: 21100,
    datePosted: "2024-08-01",
    coverImage: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1200&q=80",
    excerpt: "ETHOS in Rosebank captured 21.1K views on PashieB's TikTok — a Rosebank spot that takes its name seriously, bringing thoughtfulness to every part of the experience.",
    description: `ETHOS in Rosebank earned its 21.1K TikTok views on the Woman of Taste page by doing something that many restaurants claim and few achieve: genuine intentionality across the entire experience.

The name ETHOS speaks to a belief system in how the space operates. The food is prepared with care about sourcing and quality. The coffee is taken seriously. The environment is designed to feel considered rather than incidental. And the result is a Rosebank dining spot that feels meaningfully different from the options surrounding it.

PashieB's feature highlighted the café's ability to function for different parts of the day without losing its identity — a morning coffee feels as at home here as an afternoon lunch or an early evening meal. The Rosebank location places it conveniently within walking distance of the galleries, retail, and residential spaces that make the neighbourhood work for an extended visit.

For the WOT community, ETHOS is the Rosebank addition to a list of reliable, high-quality neighbourhood spots that respect your time and your palate.`,
    highlights: [
      "21.1K TikTok views on the WOT Rosebank feature",
      "All-day café dining with genuine quality focus",
      "Rosebank location — combine with gallery visits and retail",
      "Coffee programme taken seriously",
    ],
    mustTry: [
      { name: "Single-origin coffee", note: "The coffee here is the anchor — whatever the barista recommends is the right order" },
      { name: "Daytime plate", note: "The food menu supports the coffee programme with equal care" },
    ],
    vibe: "Considered, unhurried and quality-driven. The Rosebank café you keep coming back to.",
    perfectFor: ["Working mornings", "Lunch between Rosebank appointments", "Post-gallery catch-ups", "Solo dining"],
    tiktokUrl: "https://www.tiktok.com/@pashieb_the_wot",
    tags: ["Restaurant", "Rosebank", "Café", "All-Day Dining", "Coffee"],
    reservations: false,
    seoKeywords: ["ETHOS Rosebank Johannesburg", "best café Rosebank Joburg", "coffee shop Rosebank 2025", "Woman of Taste ETHOS Rosebank"],
  },
  {
    slug: "the-potato-shed-waterfall",
    name: "The Potato Shed",
    tagline: "Waterfall's most unexpected dining destination — 25.3K views",
    category: "Restaurant",
    cuisine: "Contemporary South African comfort",
    neighborhood: "Waterfall",
    city: "Johannesburg",
    address: "Waterfall, Midrand, Johannesburg",
    priceRange: "RR",
    tiktokViews: 25300,
    datePosted: "2024-10-10",
    coverImage: "https://images.unsplash.com/photo-1544148103-0773bf10d330?w=1200&q=80",
    excerpt: "The Potato Shed at Waterfall surprised the WOT TikTok community with 25.3K views — a Joburg restaurant that has built genuine following on the back of food that actually delivers.",
    description: `The Potato Shed in Waterfall generated 25.3K views on the Woman of Taste TikTok page, which tells you everything you need to know: this is the kind of Joburg dining spot that people share because they genuinely want others to experience it.

The name gives you the warmth — this is not a fine dining exercise in restraint, but a kitchen that cooks with generosity and confidence. Comfort is the core value, executed with enough ambition that the food feels worthwhile rather than merely filling.

The Waterfall location places it conveniently for residents of Midrand, Modderfontein, Kyalami and the northern suburbs, and makes it a destination-worthy drive for those coming from further afield. The restaurant has built its following through word-of-mouth and through exactly the kind of social content that PashieB creates — honest, unfiltered, and genuinely enthusiastic.

For a gathering, a relaxed group lunch, or a dinner that prioritises comfort over ceremony, The Potato Shed delivers.`,
    highlights: [
      "25.3K TikTok views on the WOT Waterfall feature",
      "Comfort-forward cooking with genuine quality",
      "Waterfall location — accessible from across northern Joburg",
      "Strong local following and repeat-visitor base",
    ],
    mustTry: [
      { name: "The signature potato dish", note: "The restaurant's namesake — try it in whatever current form it takes on the menu" },
      { name: "The sharing plates", note: "Built for groups — order widely and share the table" },
    ],
    vibe: "Warm, generous and completely unpretentious. Joburg comfort dining done right.",
    perfectFor: ["Group lunches", "Family meals", "Northern suburbs gatherings", "Comfort food cravings"],
    tiktokUrl: "https://www.tiktok.com/@pashieb_the_wot",
    tags: ["Restaurant", "Waterfall", "Comfort Food", "Group Dining"],
    reservations: true,
    seoKeywords: ["The Potato Shed Waterfall Johannesburg", "restaurants Waterfall Midrand", "best comfort food Joburg", "Woman of Taste Waterfall restaurant"],
  },
  {
    slug: "nomad-fourways",
    name: "Nomad",
    tagline: "Fourways dining that travels well — 12K views on WOT",
    category: "Restaurant",
    cuisine: "Contemporary international",
    neighborhood: "Fourways",
    city: "Johannesburg",
    address: "Fourways, Johannesburg",
    priceRange: "RR",
    tiktokViews: 12000,
    datePosted: "2024-11-18",
    coverImage: "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=1200&q=80",
    excerpt: "Nomad in Fourways reached 12K views on PashieB's TikTok — a Fourways restaurant that takes its name literally, borrowing flavours from across the globe and landing them well in Joburg's north.",
    description: `Nomad in Fourways earned 12K TikTok views on the Woman of Taste page through what the platform communicates best: a sense of genuine discovery. This is a Fourways dining option that goes beyond the expected, with a menu that borrows from global flavour traditions and makes them its own.

The name 'Nomad' signals the kitchen's intent — a restlessness with single-cuisine thinking, a willingness to draw from multiple food cultures, and the confidence to put eclectic pairings on the same menu without it feeling chaotic. When it works (and the WOT feature suggests it does), the result is a dining experience that keeps you engaged from first course to last.

The Fourways location makes Nomad a natural stop for the northern suburbs circuit — easily combined with an evening out in the Fourways and Lonehill area. The restaurant's approach to food positions it as a destination for those who have grown slightly bored with familiar formats.`,
    highlights: [
      "12K TikTok views on the WOT Fourways feature",
      "Global flavour influences — menu that covers significant culinary ground",
      "Fourways location — northern suburbs dining with genuine ambition",
      "A restaurant for diners who want to be surprised",
    ],
    mustTry: [
      { name: "The globe-trotting starter", note: "Open the menu widely and let the kitchen show its range from the first course" },
      { name: "Main course — ask the waiter", note: "The kitchen's strength shifts with the season — take the staff recommendation" },
    ],
    vibe: "Curious, eclectic and confidently Joburg-north. Food that travels.",
    perfectFor: ["Adventurous palates", "Fourways evenings", "Dates that want something different", "Northern suburbs residents"],
    tiktokUrl: "https://www.tiktok.com/@pashieb_the_wot",
    tags: ["Restaurant", "Fourways", "International", "Contemporary"],
    reservations: true,
    seoKeywords: ["Nomad restaurant Fourways Johannesburg", "restaurants Fourways Joburg 2025", "international cuisine Fourways", "Woman of Taste Fourways restaurant"],
  },
  {
    slug: "dos-manos-melville",
    name: "Dos Manos",
    tagline: "Melville's neighbourhood gem — 10.5K views on the WOT page",
    category: "Restaurant",
    cuisine: "Mexican-Latin",
    neighborhood: "Melville",
    city: "Johannesburg",
    address: "Melville, Johannesburg",
    priceRange: "RR",
    tiktokViews: 10500,
    datePosted: "2024-09-27",
    coverImage: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=1200&q=80",
    excerpt: "Dos Manos in Melville reached 10.5K views on PashieB's TikTok — the Latin American spot that sits comfortably in Joburg's most eclectic neighbourhood.",
    description: `Dos Manos in Melville arrived on the Woman of Taste TikTok page and gathered 10.5K views — an honest response to a restaurant that fits its neighbourhood so well that it feels inevitable.

Melville has long been one of Johannesburg's most interesting and characterful dining destinations. The 7th Street strip offers variety, personality, and a community of diners who take their neighbourhood restaurants seriously. Dos Manos has found its place in that ecosystem with a Latin-leaning menu that brings warmth, spice, and the kind of flavour that Joburg's eclectic dining community embraces.

Mexican and Latin American food occupies a particular space in the dining landscape — generous, communal, and deeply satisfying. At Dos Manos, the kitchen works within that tradition without reducing it to tacos-and-nachos minimalism. The food has depth, the cocktail list is appropriate, and the setting has the Melville energy that makes the suburb worth the drive.

For a relaxed evening, a group meal, or a dinner that wants to feel lively and warm, Dos Manos is the Melville answer.`,
    highlights: [
      "10.5K TikTok views on the WOT Melville feature",
      "Latin-Mexican flavours in Joburg's most characterful suburb",
      "Melville 7th Street location — walk before or after dinner",
      "Communal, generous food that works for groups",
    ],
    mustTry: [
      { name: "Tacos selection", note: "Order across the menu — variety is the point here" },
      { name: "Cocktail from the Latin-leaning list", note: "The drinks programme complements the food naturally" },
    ],
    vibe: "Lively, warm and thoroughly Melville. Latin flavours in a Joburg neighbourhood setting.",
    perfectFor: ["Group dinners", "Melville evenings", "Relaxed date nights", "7th Street explorations"],
    tiktokUrl: "https://www.tiktok.com/@pashieb_the_wot",
    tags: ["Restaurant", "Melville", "Mexican-Latin", "Group Dining", "7th Street"],
    reservations: false,
    seoKeywords: ["Dos Manos Melville Johannesburg", "Mexican restaurant Melville Joburg", "Melville restaurants 7th Street", "Woman of Taste Melville dining"],
  },
  {
    slug: "life-grand-cafe-waterfall",
    name: "Life Grand Café",
    tagline: "Waterfall's grand café experience — 10.5K views on WOT",
    category: "Restaurant",
    cuisine: "Contemporary all-day café",
    neighborhood: "Waterfall",
    city: "Johannesburg",
    address: "Waterfall Corner, Midrand, Johannesburg",
    priceRange: "RR",
    tiktokViews: 10500,
    datePosted: "2024-08-12",
    coverImage: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=1200&q=80",
    excerpt: "Life Grand Café at Waterfall hit 10.5K views on PashieB's TikTok — a grand café in the European tradition planted in the heart of Joburg's Waterfall precinct.",
    description: `Life Grand Café in Waterfall positions itself in the European grand café tradition — spacious, light-filled, and designed to be spent in across the day. PashieB's TikTok feature generated 10.5K views and introduced the café to a WOT audience looking for exactly this kind of refined, accessible daytime experience.

The 'grand café' format is deliberate: a restaurant designed to accommodate the full arc of a day, from morning coffee and pastry through lunch and well into the afternoon. The scale of the space supports this — it does not feel cramped at breakfast or echoing at lunch. The kitchen adapts to whichever part of the day you are occupying.

The Waterfall location, within the Waterfall Corner precinct, positions Life Grand Café as a natural anchor for morning meetings, midday meals, and post-shopping afternoons in one of Joburg's fastest-growing commercial nodes.

For women who appreciate an environment that looks good and functions well — that rare combination of aesthetic quality and genuine hospitality — Life Grand Café is a Waterfall visit that earns its place in the rotation.`,
    highlights: [
      "10.5K TikTok views on the WOT Waterfall feature",
      "European grand café format — ideal across the full day",
      "Waterfall Corner precinct — parking, shopping, convenience",
      "Light-filled, spacious and designed for lingering",
    ],
    mustTry: [
      { name: "Morning coffee and pastry", note: "The café begins well and the morning offering sets the tone for the day" },
      { name: "Lunch plate", note: "The kitchen's strength is in its midday menu — reliable, well-executed, generous" },
    ],
    vibe: "Grand, light-filled and unhurried. A European afternoon in the middle of Joburg.",
    perfectFor: ["Morning meetings", "All-day remote working", "Post-gym brunch", "Waterfall precinct visits"],
    tiktokUrl: "https://www.tiktok.com/@pashieb_the_wot",
    tags: ["Restaurant", "Café", "Waterfall", "All-Day Dining", "Brunch"],
    reservations: false,
    seoKeywords: ["Life Grand Café Waterfall Johannesburg", "grand café Midrand Joburg", "Waterfall Corner restaurants", "Woman of Taste Waterfall café"],
  },
];

export function getPlaceBySlug(slug: string): Place | undefined {
  return places.find(p => p.slug === slug);
}

export function getRelatedPlaces(slug: string, limit = 3): Place[] {
  const current = getPlaceBySlug(slug);
  if (!current) return places.slice(0, limit);
  return places
    .filter(p => p.slug !== slug)
    .sort((a, b) => {
      const aScore = (a.city === current.city ? 2 : 0)
        + (a.category === current.category ? 1 : 0)
        + (a.neighborhood === current.neighborhood ? 1 : 0);
      const bScore = (b.city === current.city ? 2 : 0)
        + (b.category === current.category ? 1 : 0)
        + (b.neighborhood === current.neighborhood ? 1 : 0);
      return bScore - aScore;
    })
    .slice(0, limit);
}

export const priceLabel = { R: "Budget", RR: "Mid-range", RRR: "Upscale", RRRR: "Fine Dining" };
export const priceFull = { R: "Under R200pp", RR: "R200–R400pp", RRR: "R400–R800pp", RRRR: "R800+ pp" };

export function fmtViews(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}K`;
  return String(n);
}
