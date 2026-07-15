import { db } from "@workspace/db";
import { blogPostsTable, blogCategoriesTable } from "@workspace/db/schema";
import { eq, count } from "drizzle-orm";

interface SeedPost {
  slug: string; title: string; category: string; date: string;
  readTime: string; excerpt: string; content: string; featured?: boolean;
}

const SEED_POSTS: SeedPost[] = [
  {
    slug: "devil-wears-prada-ii-private-screening-johannesburg",
    title: "The Devil Wears Prada II Is Coming — And We're Hosting a Private Screening in Johannesburg",
    category: "Events", date: "21 March 2026", readTime: "5 min read", featured: true,
    excerpt: "On 1 May 2026, Woman of Taste hosts an exclusive private screening of The Devil Wears Prada II in Johannesburg — champagne, fashion editorial dressing, and thirty seats for the women who have always known that style is a way of living.",
    content: `<p>Miranda Priestly never explained herself. She didn't need to. She walked into a room, and the room adjusted.</p><p>When the original film released in 2006, it did something that most fashion films fail to do: it told the truth. About ambition. About the cost of wanting more.</p><h2>A Private Screening Like No Other — 1 May 2026, Johannesburg</h2><p>On <strong>1 May 2026</strong>, Woman of Taste opens the doors to a private cinema in Johannesburg for an evening that is not simply a movie night. Thirty women. Welcome drinks. Champagne reception at <strong>6:30 PM</strong>.</p><h2>Why This Event Is Different</h2><p>This is not a screening at a mainstream cinema. This is thirty seats in a private cinema, surrounded by women who are building something — careers, brands, legacies.</p><h2>Dress the Part: Fashion Editorial Is the Brief</h2><p>The dress code is <strong>Fashion Editorial</strong> — your most compelling look. The best-dressed guest wins a Woman of Taste prize.</p><h2>What to Expect</h2><p><strong>The Champagne Reception:</strong> Welcome drinks in a styled reception area.</p><p><strong>The Screening:</strong> The Devil Wears Prada II — before it takes over social media.</p><p><strong>The WOT Goodie Bag:</strong> Every guest leaves with a curated Woman of Taste gifting set.</p><h2>Tickets: R650 | Limited to 30 Guests</h2><p>Seats are limited to thirty guests. Intimacy is the point.</p>`,
  },
  {
    slug: "what-taste-really-means-in-a-noisy-world",
    title: "What Taste Really Means in a Noisy World",
    category: "Editorial", date: "10 March 2026", readTime: "6 min read",
    excerpt: "In an era of endless content and constant noise, genuine taste is the rarest form of discernment. It is not what you consume — it is how you consume it.",
    content: `<p>We live in an age that has made taste democratic and, in doing so, has made it almost meaningless. When everything is available to everyone, at all times, curation becomes the most radical act a person can perform.</p><p>Taste, in its truest sense, is not about what is expensive or what is fashionable. It is about intentionality.</p><h2>The Dining Room as a Laboratory of Taste</h2><p>Few experiences reveal a person's relationship with taste as clearly as the way they approach a meal. Not the ingredients on the plate, but the quality of presence brought to the table.</p><h2>Reclaiming the Deliberate Moment</h2><p>Taste is cultivated through practice — through the discipline of choosing well, repeatedly, across many small moments. The restaurant you choose, the way you dress for it, the conversation you bring to it.</p>`,
  },
  {
    slug: "the-modern-elegant-womans-table",
    title: "The Modern Elegant Woman's Table",
    category: "Dining", date: "3 March 2026", readTime: "5 min read",
    excerpt: "The table is more than a surface. It is a statement. A declaration of how you value time, presence, and the people you choose to share a meal with.",
    content: `<p>There are women who eat. And there are women who dine. The difference between the two is not a matter of budget or circumstance — it is a matter of intention.</p><h2>The Art of the Table</h2><p>Elegance at table is about more than cutlery placement. It is the quality of conversation, the absence of urgency, the genuine appreciation of what has been prepared.</p><p>The modern elegant woman knows that dining is an act of culture. In many African traditions, the shared meal is where stories are passed down, where bonds are sealed, where identity is affirmed.</p><h2>Setting Your Own Standard</h2><p>You do not need a five-star restaurant to dine elegantly. You need intention. You need presence. You need the willingness to treat an ordinary Tuesday dinner as something worth showing up for fully.</p>`,
  },
  {
    slug: "soft-power-and-the-art-of-presence",
    title: "Soft Power and the Art of Presence",
    category: "Womanhood", date: "24 February 2026", readTime: "7 min read",
    excerpt: "Presence is not loudness. The woman who commands a room through grace, stillness and deliberate attention wields a form of power that never needs to announce itself.",
    content: `<p>There is a particular quality possessed by certain women that has nothing to do with their position, their wealth, or the volume of their voice. It is a quality of presence — a settled, unhurried energy that transforms any room it enters.</p><p>Soft power is the art of influence through attraction rather than assertion.</p><h2>Presence at the Table</h2><p>The dining table is one of the most revealing arenas for soft power. Watch how a woman enters a restaurant. How she greets the host. Whether she studies the menu with genuine curiosity. How she treats the waiting staff.</p><h2>Cultivating Soft Power</h2><p>Soft power cannot be performed. It is the natural outcome of an interior life that has been tended carefully. It grows from self-knowledge, from the practice of presence, from genuine curiosity about the world.</p>`,
  },
  {
    slug: "the-restaurant-experience-economy",
    title: "The Restaurant Experience Economy: What Modern Diners Really Want",
    category: "Hospitality", date: "17 February 2026", readTime: "6 min read",
    excerpt: "Today's diners are not simply looking for a good meal. They are investing in an experience, a memory, a feeling. Restaurants that understand this are the ones that endure.",
    content: `<p>The language of dining has changed. Where guests once asked "is the food good?", they now ask "is the experience worth it?" The shift marks a fundamental change in what people believe dining is for.</p><p>Dining has become a form of self-expression.</p><h2>The Emotional Return on Investment</h2><p>Modern diners are calculating, consciously or not, the emotional return on their investment. Will this evening leave me feeling enriched? Will this meal be worth remembering?</p><h2>From Transactional to Transformational</h2><p>Restaurants that thrive have understood that their product is not food. Their product is transformation — the transformation of an ordinary evening into something worth talking about.</p>`,
  },
  {
    slug: "the-art-of-entering-a-room",
    title: "The Art of Entering a Room",
    category: "Lifestyle", date: "10 February 2026", readTime: "5 min read",
    excerpt: "Presence is not about volume — it is about intention. The woman who commands a space is not necessarily the loudest. She is the most grounded.",
    content: `<p>There is a particular kind of woman who walks into a room and changes its atmosphere without saying a word. She moves with quiet certainty.</p><p>Presence is not a performance. It cannot be manufactured through louder shoes or more dramatic entrances.</p><h2>The Practice of Groundedness</h2><p>Before you enter any room, pause. This pause is not hesitation. It is intention-setting. The most elegant women share one quality: they are unhurried.</p><h2>Elegance Is an Inside Affair</h2><p>Your wardrobe helps. Your posture matters. But the true foundation of presence is what you carry internally — your sense of worthiness, your quiet confidence.</p>`,
  },
  {
    slug: "curating-the-dining-experience",
    title: "Curating the Dining Experience: A Guide to Eating with Intention",
    category: "Dining", date: "1 February 2026", readTime: "6 min read",
    excerpt: "The difference between eating and dining is entirely a matter of intention. Here is how to bring that intention to every table you sit at.",
    content: `<p>To dine with intention is to decide, before you even read the menu, that this meal matters. That the hour ahead deserves your full presence.</p><h2>Begin Before You Arrive</h2><p>The experienced diner understands that a meal begins before the food arrives. It begins in the selection of where to go.</p><h2>The Menu as a Conversation</h2><p>A menu is not simply a list of options. In a well-run restaurant, it is a window into the philosophy of the kitchen.</p><h2>The Quality of Attention</h2><p>Perhaps the most powerful thing you can do at any table is simply be there, fully. Not performing the experience for a photograph. But actually here — tasting, noticing, appreciating, connecting.</p>`,
  },
  {
    slug: "things-to-do-this-weekend-johannesburg",
    title: "Things to Do This Weekend in Johannesburg — Curated for Women Who Live Well",
    category: "Events", date: "18 March 2026", readTime: "5 min read",
    excerpt: "Johannesburg is never short of things to do — but the art is knowing which moments are worth your weekend.",
    content: `<p>Johannesburg moves fast. The challenge is not finding things to do. It is finding the right things to do.</p><h2>Start With a Breakfast That Means Something</h2><p>Johannesburg has a remarkable brunch culture. Look for venues that prioritise quality over Instagram-worthiness.</p><h2>A Cultural Moment That You'll Actually Remember</h2><p>The Johannesburg Art Gallery, the Origins Centre at Wits, the Apartheid Museum — Johannesburg is a city of extraordinary cultural depth.</p><h2>The Right Kind of Evening Out</h2><p>If you are looking for a curated evening — a Woman of Taste event might be exactly what your weekend needs. Private screenings, intimate dining, high tea gatherings.</p><h2>An Investment in Yourself</h2><p>The best use of a weekend is one that leaves you slightly better than you began it.</p>`,
  },
  {
    slug: "best-womens-events-south-africa-2026",
    title: "The Best Women's Events in South Africa to Attend in 2026",
    category: "Events", date: "15 March 2026", readTime: "7 min read",
    excerpt: "South Africa's women's events landscape is growing — and 2026 is shaping up to be a remarkable year for curated experiences.",
    content: `<p>South Africa has always been a country of remarkable women. In 2026, the women's events landscape reflects this energy.</p><h2>Woman of Taste Events — Johannesburg</h2><p>2026 is our fullest calendar yet. From the Devil Wears Prada II private screening in May, to High Tea at Buitengeluk in June, She Who Gathers in August, and the December Braai at Farmhouse 58.</p><h2>Women's Month Events — August 2026</h2><p>August belongs to women in South Africa. Look for events that feature genuine voices, real stories, and rooms that leave you feeling seen and energised.</p><h2>Year-End Gatherings — November and December</h2><p>December in South Africa is extraordinary. Women's year-end events and community braais provide the perfect backdrop for gratitude and connection.</p>`,
  },
  {
    slug: "unique-experiences-cape-town-women",
    title: "Unique Experiences in Cape Town for Women Who Appreciate the Extraordinary",
    category: "Lifestyle", date: "12 March 2026", readTime: "6 min read",
    excerpt: "Cape Town is one of the world's most beautiful cities — and for the woman who has moved beyond the tourist trail, the city reveals itself in extraordinary ways.",
    content: `<p>Cape Town is not a city you can exhaust. The more you know it, the more it reveals.</p><h2>The Winelands at Their Most Intimate</h2><p>Seek out the private tastings, the cellar tours led by the winemaker, the farm table lunches that seat eight people in a vineyard the world hasn't discovered.</p><h2>A Meal That Feels Like a Discovery</h2><p>Cape Town has some of Africa's finest restaurants. But the truly unique dining experiences often exist slightly off the main list: the chef's table at an emerging restaurant, the supper club run by a chef who cooks for twenty people at a time.</p><h2>Woman of Taste — Coming to Cape Town</h2><p>Woman of Taste is expanding to Cape Town. Register your interest on our website for priority access.</p>`,
  },
  {
    slug: "private-dining-experiences-johannesburg-guide",
    title: "Private Dining Experiences in Johannesburg: A Guide for the Discerning Woman",
    category: "Dining", date: "8 March 2026", readTime: "6 min read",
    excerpt: "Johannesburg's private dining scene is richer than most of its residents know. Beyond the restaurant booking lies a world of chef's tables and intimate evenings.",
    content: `<p>There is a difference between eating at a restaurant and experiencing one. The difference lies not in the food — but in the quality of access, the depth of engagement, and the thoughtfulness of everything that surrounds the meal.</p><h2>What Makes a Private Dining Experience Different</h2><p>A private dining experience is curated rather than booked. It typically involves exclusive access — a private room, a chef's table, a behind-the-scenes journey through the kitchen.</p><h2>The Woman of Taste Restaurant Immersion</h2><p>Our Restaurant Immersion Experience is our flagship private dining offering. A small group of women. A chef-led evening. Courses explained as they arrive. Wine paired with intention.</p>`,
  },
  {
    slug: "womens-networking-events-that-feel-premium",
    title: "Women's Networking Events That Actually Feel Worth Attending",
    category: "Events", date: "5 March 2026", readTime: "5 min read",
    excerpt: "Most networking events leave you tired rather than inspired. The ones worth attending share a different set of qualities.",
    content: `<p>Most networking events are built around the wrong premise. They assume that proximity creates connection.</p><h2>What Actually Creates Connection</h2><p>Genuine connection between women happens when two conditions are met: there is something meaningful shared, and the environment makes space for real rather than performative interaction.</p><h2>The Woman of Taste Standard</h2><p>Every Woman of Taste gathering is built on this principle. We curate the guest list. We design the setting. We keep the numbers small enough that every woman present can have a real conversation with every other woman in the room.</p><h2>Signs of a Networking Event Worth Your Time</h2><p>Look for events where the guest list is curated rather than open. Where the setting is beautiful rather than functional. Where there is food and drink chosen with care.</p>`,
  },
  {
    slug: "rise-of-curated-experiences-women-south-africa",
    title: "The Rise of Curated Experiences for Women in South Africa",
    category: "Lifestyle", date: "1 March 2026", readTime: "7 min read",
    excerpt: "Across South Africa, a quiet revolution is underway. Women are choosing experience over consumption.",
    content: `<p>Something has shifted in the way South African women are choosing to spend their discretionary time. The old markers of a good weekend have given way to something more deliberate. More curated.</p><h2>From Consumption to Experience</h2><p>The woman who five years ago might have spent a Saturday afternoon at a mall is increasingly choosing a curated dining experience, a cultural event, an intimate gathering with women who share her values.</p><h2>What Curated Means in the South African Context</h2><p>Curation means making deliberate choices at every level: the guest list, the setting, the programming, the food and drink, the atmosphere. It means treating the woman who attends as someone whose time, energy, and intelligence deserve to be honoured.</p><h2>The Community Dimension</h2><p>Women are not just seeking beautiful settings and good food — they are seeking other women who share their values.</p>`,
  },
  {
    slug: "how-to-choose-lifestyle-event-worth-your-time",
    title: "How to Choose a Lifestyle Event Worth Your Time",
    category: "Lifestyle", date: "25 February 2026", readTime: "5 min read",
    excerpt: "Not every event that markets itself as premium actually is. Here is the discerning woman's guide to identifying the experiences worth your calendar.",
    content: `<p>The events industry has become crowded with options that describe themselves as "exclusive," "curated," and "premium." Some of them are. Most of them are not.</p><h2>Look at the Guest Curation</h2><p>The first question to ask about any event is: who is in the room? Has the organiser thought carefully about who they are gathering? The best events keep their guest lists small and intentional.</p><h2>Evaluate the Setting</h2><p>The setting is atmosphere — and atmosphere is one of the primary determinants of how people feel, connect, and remember an experience.</p><h2>Read the Programming</h2><p>The best lifestyle events create a programme that gives guests something to engage with. If the "programme" is simply "mingle for three hours," the event is relying on its guests to create the experience themselves.</p><h2>Check the Track Record</h2><p>The most reliable indicator of a quality event is what people say about the previous ones.</p>`,
  },
  {
    slug: "what-to-wear-premium-womens-event",
    title: "What to Wear to a Premium Women's Event — The Complete Guide",
    category: "Lifestyle", date: "20 February 2026", readTime: "5 min read",
    excerpt: "How you dress for a premium event is an act of respect — for the experience, for the other women in the room, and for the version of yourself who deserves to feel extraordinary.",
    content: `<p>There is a particular kind of anxiety that accompanies the question of what to wear to a premium event.</p><h2>Understand the Dress Code as a Brief, Not a Rule</h2><p>When Woman of Taste describes a dress code as "Fashion Editorial," we are offering a creative brief. The best responses are personal, considered, and confident.</p><h2>Invest in a Signature Look, Not a One-Off</h2><p>The most elegant women at any event are rarely wearing something new. They are wearing something that is deeply theirs — a piece they have worn before and will wear again, with absolute confidence.</p><h2>The Details Are the Declaration</h2><p>At premium events, the details distinguish the thoughtfully dressed woman from the simply dressed one. Shoes that complement rather than compete. A bag chosen for the evening rather than the workday.</p><h2>Wear Something That Makes You Feel Like Yourself — at Your Best</h2><p>The most important quality of any outfit for a Woman of Taste event is that it makes you feel like the best version of yourself.</p>`,
  },
  {
    slug: "winter-events-johannesburg-2026",
    title: "Winter Events in Johannesburg 2026 — Curated for the Season",
    category: "Events", date: "15 February 2026", readTime: "5 min read",
    excerpt: "Johannesburg winters are extraordinary — crisp, golden, and full of the specific quality of light that only the highveld knows. Here is how to spend the season well.",
    content: `<p>June and July in Johannesburg are the months that the city's devotees hold close. What there is is something quieter and more beautiful — the specific stillness of a highveld winter morning.</p><h2>High Tea at Buitengeluk — June 2026</h2><p>On 16 June 2026, Woman of Taste hosts a winter high tea at Buitengeluk in Broadacres. Tiered stands, finger sandwiches, tea blends, and open fires. Tickets limited to twenty guests. Dress code: garden elegance.</p><h2>Other Winter Events Worth Watching</h2><p>Johannesburg's winter social calendar is quieter than summer — and that is precisely what makes it valuable. Look for gallery openings, intimate dinner parties, wine evenings.</p><h2>How to Make the Most of a Johannesburg Winter</h2><p>The woman of taste approaches winter not as something to be endured but as something to be savoured. She books the high tea. She plans the long Sunday roast.</p>`,
  },
  {
    slug: "social-events-women-south-africa-2026",
    title: "The Best Social Events for Women in South Africa in 2026",
    category: "Events", date: "10 February 2026", readTime: "6 min read",
    excerpt: "South Africa's social events landscape for women is expanding — and 2026 brings a calendar worth planning around.",
    content: `<p>The concept of a social event for women has evolved. The lunches and sundowners of a previous generation have given way to something more intentional.</p><h2>Woman of Taste Events — A Full Calendar in Johannesburg</h2><p>2026 represents our most ambitious year yet. Five signature events: The Devil Wears Prada II private screening in May. High Tea at Buitengeluk in June. She Who Gathers Women's Month celebration in August. In Full Bloom in September. The December Braai at Farmhouse 58.</p><h2>Cape Town and Pretoria — Watch This Space</h2><p>Woman of Taste is expanding beyond Johannesburg in 2026. Register your interest for priority access.</p><h2>What to Look for in a Quality Social Event</h2><p>The best social events share common qualities: curated guest lists, beautiful settings, thoughtful programming, and the specific feeling — walking out — that the evening was worth every moment it asked of you.</p>`,
  },
];

const CATEGORIES = ["Editorial", "Events", "Dining", "Lifestyle", "Womanhood", "Culture", "Hospitality"];

export async function seedBlogPosts() {
  try {
    const [{ cnt }] = await db.select({ cnt: count() }).from(blogPostsTable) as any;
    if (Number(cnt) > 0) return;

    console.log("[seeder] Seeding blog categories...");
    for (const name of CATEGORIES) {
      await db.insert(blogCategoriesTable).values({ name }).onConflictDoNothing();
    }

    console.log("[seeder] Seeding 17 blog posts...");
    for (const post of SEED_POSTS) {
      await db.insert(blogPostsTable).values({
        slug: post.slug, title: post.title, category: post.category,
        author: "Patience Bwanya", excerpt: post.excerpt, content: post.content,
        readTime: post.readTime, status: "published", featured: post.featured ?? false,
        publishedAt: new Date(post.date),
      }).onConflictDoNothing();
    }
    console.log("[seeder] Blog seed complete.");
  } catch (err) {
    console.error("[seeder] Blog seed failed:", err);
  }
}
