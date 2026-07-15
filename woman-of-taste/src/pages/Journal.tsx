import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { Clock, ArrowRight } from "lucide-react";
import { Link } from "wouter";
import Layout from "@/components/Layout";
import FAQ from "@/components/FAQ";
import { faqsByPage } from "@/data/faqData";
import AnimatedBackground from "@/components/AnimatedBackground";
import BlogCard from "@/components/BlogCard";

interface Post {
  slug: string; title: string; excerpt: string; category: string;
  readTime: string; date: string; featured: boolean; content: string;
  coverImageUrl: string | null;
}

function mapPost(p: any): Post {
  return {
    slug: p.slug, title: p.title, excerpt: p.excerpt ?? "",
    category: p.category, readTime: p.readTime ?? "5 min read",
    date: p.publishedAt ? new Date(p.publishedAt).toLocaleDateString("en-ZA", { day: "numeric", month: "long", year: "numeric" }) : "",
    featured: p.featured ?? false, content: p.content ?? "", coverImageUrl: p.coverImageUrl ?? null,
  };
}

const FALLBACK_CATEGORIES = ["All", "Editorial", "Events", "Dining", "Lifestyle", "Womanhood", "Culture", "Hospitality"];

export default function Journal() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<string[]>(FALLBACK_CATEGORIES);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/blog").then(r => r.json()).then(d => {
      if (d.ok && d.posts) {
        const mapped: Post[] = d.posts.map(mapPost);
        setPosts(mapped);
        const cats = ["All", ...Array.from(new Set(mapped.map(p => p.category)))];
        setCategories(cats as string[]);
      }
    }).finally(() => setLoading(false));
  }, []);

  const featured = posts[0];
  const rest = posts.slice(1);
  const filtered = activeCategory === "All"
    ? rest
    : rest.filter(p => p.category === activeCategory);

  return (
    <Layout title="The Journal">
      <Helmet>
        <title>The Journal | Woman of Taste</title>
        <meta name="description" content="Essays, reflections & culture dispatches from Woman of Taste — dining culture, feminine elegance, the art of presence & curated Johannesburg lifestyle." />
        <meta property="og:title" content="The Journal | Woman of Taste" />
        <meta property="og:description" content="Essays on dining culture, elegance, and lifestyle from Woman of Taste." />
        <meta property="og:url" content="https://womanoftaste.co.za/journal" />
        <link rel="canonical" href="https://womanoftaste.co.za/journal" />
      </Helmet>

      {/* ── Hero ── */}
      <section className="relative bg-[hsl(40,25%,96%)] overflow-hidden pt-28 pb-16">
        <AnimatedBackground />
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 text-center">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="font-sans text-[11px] font-semibold tracking-[0.3em] uppercase text-[hsl(38,45%,50%)] mb-3 block">
              Words & Wisdom
            </span>
            <h1 className="font-serif text-5xl sm:text-6xl font-light text-[hsl(225,50%,22%)] mb-4">
              The Journal
            </h1>
            <p className="font-sans text-base font-normal text-[hsl(28,18%,20%)] max-w-xl mx-auto leading-relaxed">
              Long-form essays, dining stories, and editorial perspectives on food, culture, hospitality, and intentional womanhood.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── Featured Post ── */}
      {featured && (
        <section className="py-12 bg-[hsl(40,25%,96%)]">
          <div className="max-w-7xl mx-auto px-6 lg:px-12">
            <motion.p className="font-sans text-[11px] font-semibold tracking-[0.3em] uppercase text-[hsl(38,45%,50%)] mb-6"
              initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
              Latest
            </motion.p>
            <Link href={`/journal/${featured.slug}`}>
              <motion.article
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                whileHover={{ y: -6, boxShadow: "0 24px 48px rgba(28,20,12,0.14)" }}
                viewport={{ once: true }}
                className="group grid lg:grid-cols-5 bg-[hsl(40,30%,98%)] border border-[hsl(35,15%,88%)] rounded-3xl overflow-hidden shadow-sm cursor-pointer"
              >
                <div className="lg:col-span-2 h-64 lg:h-auto relative"
                  style={{ background: featured.coverImageUrl ? undefined : "linear-gradient(135deg, hsl(225,50%,22%) 0%, hsl(225,40%,35%) 100%)" }}>
                  {featured.coverImageUrl
                    ? <img src={featured.coverImageUrl} alt={featured.title} className="w-full h-full object-cover" />
                    : <div className="absolute inset-0 flex items-center justify-center">
                        <img src="/wot-logo.png" alt="" className="w-24 h-24 object-contain" style={{ mixBlendMode: "screen", opacity: 0.22 }} />
                      </div>}
                </div>
                <div className="lg:col-span-3 p-10 lg:p-14 flex flex-col justify-center">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="font-sans text-[10px] font-semibold tracking-[0.15em] uppercase text-[hsl(225,50%,30%)] bg-[hsl(225,40%,92%)] px-3 py-1 rounded-full">
                      {featured.category}
                    </span>
                    <span className="font-sans text-xs text-[hsl(28,18%,30%)]">Latest</span>
                  </div>
                  <h2 className="font-serif text-3xl sm:text-4xl font-medium text-[hsl(225,50%,22%)] leading-tight mb-4 group-hover:text-[hsl(38,45%,45%)] transition-colors">
                    {featured.title}
                  </h2>
                  <p className="font-sans text-base font-normal text-[hsl(28,18%,18%)] leading-relaxed mb-6">
                    {featured.excerpt}
                  </p>
                  <div className="flex items-center gap-6">
                    <span className="font-sans text-sm text-[hsl(28,18%,30%)]">{featured.date}</span>
                    <span className="flex items-center gap-1 font-sans text-xs text-[hsl(28,18%,30%)]">
                      <Clock size={11} /> {featured.readTime}
                    </span>
                    <span className="flex items-center gap-1 ml-auto font-sans text-sm font-medium text-[hsl(225,50%,30%)] group-hover:gap-2 transition-all">
                      Read Essay <ArrowRight size={14} />
                    </span>
                  </div>
                </div>
              </motion.article>
            </Link>
          </div>
        </section>
      )}

      {/* ── Category Filter ── */}
      <section className="py-4 bg-[hsl(35,15%,93%)] border-y border-[hsl(35,15%,88%)]">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`font-sans text-[10px] font-semibold tracking-[0.15em] uppercase px-5 py-2.5 rounded-full transition-all duration-200 ${
                  activeCategory === cat
                    ? "bg-[hsl(225,50%,22%)] text-white shadow-sm"
                    : "bg-[hsl(40,30%,98%)] text-[hsl(28,18%,18%)] border border-[hsl(35,15%,88%)] hover:border-[hsl(225,50%,22%)] hover:text-[hsl(225,50%,22%)]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Blog Grid ── */}
      <section className="py-20 bg-[hsl(35,15%,93%)]">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          {loading ? (
            <div className="text-center py-16">
              <p className="font-serif text-2xl text-[hsl(28,18%,30%)]">Loading articles…</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16">
              <p className="font-serif text-2xl text-[hsl(28,18%,30%)]">No articles in this category yet.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filtered.map((post, i) => (
                <BlogCard key={post.slug} post={post} index={i} basePath="/journal" />
              ))}
            </div>
          )}
        </div>
      </section>

      <FAQ items={faqsByPage.journal} title="Questions About The WOT Journal & Restaurant Content" />
    </Layout>
  );
}
