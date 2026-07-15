import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { Link, useParams } from "wouter";
import { Clock, ArrowLeft, Calendar } from "lucide-react";
import Layout from "@/components/Layout";
import BlogCard from "@/components/BlogCard";
import { brandInfo } from "@/data/social";

interface Post {
  slug: string; title: string; excerpt: string; category: string;
  readTime: string; date: string; dateIso: string; content: string; author: string;
  featured: boolean; coverImageUrl: string | null;
}

function mapPost(p: any): Post {
  return {
    slug: p.slug, title: p.title, excerpt: p.excerpt ?? "",
    category: p.category, readTime: p.readTime ?? "5 min read",
    date: p.publishedAt ? new Date(p.publishedAt).toLocaleDateString("en-ZA", { day: "numeric", month: "long", year: "numeric" }) : "",
    dateIso: p.publishedAt ? new Date(p.publishedAt).toISOString() : "",
    content: p.content ?? "", author: p.author ?? "Woman of Taste Editorial",
    featured: p.featured ?? false, coverImageUrl: p.coverImageUrl ?? null,
  };
}

export default function JournalPost() {
  const params = useParams<{ slug: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [related, setRelated] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!params.slug) return;
    setLoading(true); setNotFound(false);
    fetch(`/api/blog/${params.slug}`).then(r => r.json()).then(d => {
      if (d.ok && d.post) {
        const p = mapPost(d.post);
        setPost(p);
        // Load related posts
        fetch("/api/blog").then(r2 => r2.json()).then(d2 => {
          if (d2.ok && d2.posts) {
            const rel = d2.posts.filter((r: any) => r.slug !== p.slug && r.category === p.category).slice(0, 3).map(mapPost);
            setRelated(rel);
          }
        });
      } else { setNotFound(true); }
    }).finally(() => setLoading(false));
  }, [params.slug]);

  useEffect(() => {
    if (!post) return;
    const schema = {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "headline": post.title,
      "description": post.excerpt,
      "datePublished": post.dateIso || post.date,
      "dateModified": post.dateIso || post.date,
      "author": { "@type": "Person", "name": "Patience Bwanya", "alternateName": "PashieB", "url": "https://womanoftaste.co.za/about" },
      "publisher": { "@type": "Organization", "name": "Woman of Taste", "logo": { "@type": "ImageObject", "url": "https://womanoftaste.co.za/wot-logo.png" } },
      "url": `https://womanoftaste.co.za/journal/${post.slug}`,
      "mainEntityOfPage": { "@type": "WebPage", "@id": `https://womanoftaste.co.za/journal/${post.slug}` },
      "articleSection": post.category,
      "image": post.coverImageUrl ?? "https://womanoftaste.co.za/opengraph.jpg",
      "inLanguage": "en-ZA",
    };
    const script = document.createElement("script");
    script.type = "application/ld+json"; script.id = "blog-post-schema";
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);
    return () => { document.getElementById("blog-post-schema")?.remove(); };
  }, [post?.slug]);

  if (loading) {
    return (
      <Layout title="Loading…">
        <div className="min-h-screen flex items-center justify-center bg-[hsl(40,25%,96%)] pt-20">
          <p className="font-serif text-2xl text-[hsl(225,50%,22%)]">Loading article…</p>
        </div>
      </Layout>
    );
  }

  if (notFound || !post) {
    return (
      <Layout title="Article Not Found">
        <div className="min-h-screen flex items-center justify-center bg-[hsl(40,25%,96%)] pt-20">
          <div className="text-center">
            <h1 className="font-serif text-4xl text-[hsl(225,50%,22%)] mb-4">Article Not Found</h1>
            <Link href="/journal">
              <button className="font-sans text-sm font-medium text-[hsl(225,50%,22%)] underline underline-offset-4">
                Return to the Journal
              </button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={post.title}>
      <Helmet>
        <title>{post.title} | Woman of Taste Journal</title>
        <meta name="description" content={post.excerpt} />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.excerpt} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={`https://womanoftaste.co.za/journal/${post.slug}`} />
        {post.coverImageUrl && <meta property="og:image" content={post.coverImageUrl} />}
        <link rel="canonical" href={`https://womanoftaste.co.za/journal/${post.slug}`} />
      </Helmet>

      {/* ── Article Hero ── */}
      <section className="bg-[hsl(225,50%,22%)] pt-28 pb-16 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10"
          style={{ background: "radial-gradient(ellipse at top right, hsl(38,45%,60%), transparent 60%)" }} />
        {post.coverImageUrl && (
          <div className="absolute inset-0 opacity-20">
            <img src={post.coverImageUrl} alt="" className="w-full h-full object-cover" />
          </div>
        )}
        <div className="relative z-10 max-w-4xl mx-auto px-6 lg:px-12">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <Link href="/journal">
              <button className="flex items-center gap-2 font-sans text-sm text-[hsl(40,25%,75%)] hover:text-[hsl(38,45%,65%)] transition-colors mb-8">
                <ArrowLeft size={14} /> Back to the Journal
              </button>
            </Link>
            <span className="font-sans text-[10px] font-semibold tracking-[0.2em] uppercase text-[hsl(38,45%,65%)] mb-4 block">
              {post.category}
            </span>
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-light text-[hsl(40,25%,96%)] leading-tight mb-6">
              {post.title}
            </h1>
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-2 font-sans text-sm text-[hsl(40,25%,70%)]">
                <Calendar size={14} /> {post.date}
              </div>
              <div className="flex items-center gap-2 font-sans text-sm text-[hsl(40,25%,70%)]">
                <Clock size={14} /> {post.readTime}
              </div>
              <div className="font-sans text-sm text-[hsl(40,25%,70%)]">
                By <span className="text-[hsl(38,45%,65%)]">{post.author}</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Article Content ── */}
      <section className="py-16 bg-[hsl(40,25%,96%)]">
        <div className="max-w-3xl mx-auto px-6 lg:px-12">
          <motion.p
            className="font-serif text-xl sm:text-2xl font-light italic text-[hsl(225,50%,30%)] leading-relaxed mb-10 border-l-4 border-[hsl(38,45%,60%)] pl-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {post.excerpt}
          </motion.p>

          <motion.div
            className="prose-wot"
            dangerouslySetInnerHTML={{ __html: post.content }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          />

          <div className="mt-16 pt-8 border-t border-[hsl(35,15%,85%)]">
            <div className="flex items-center gap-4">
              <img src="/wot-logo.png" alt="Woman of Taste" className="w-14 h-14 object-contain" style={{ mixBlendMode: "multiply" }} />
              <div>
                <p className="font-serif text-base font-medium text-[hsl(225,50%,22%)]">{brandInfo.name} Editorial</p>
                <p className="font-sans text-xs text-[hsl(28,18%,26%)]">By {brandInfo.founder} · {brandInfo.founderAlias}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="py-20 bg-[hsl(35,15%,93%)]">
          <div className="max-w-7xl mx-auto px-6 lg:px-12">
            <h2 className="font-serif text-3xl font-light text-[hsl(225,50%,22%)] mb-10">You May Also Enjoy</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {related.map((p, i) => (
                <BlogCard key={p.slug} post={p} index={i} basePath="/journal" />
              ))}
            </div>
          </div>
        </section>
      )}
    </Layout>
  );
}
