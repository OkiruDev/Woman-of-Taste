import { motion } from "framer-motion";
import { Link, useParams } from "wouter";
import { Clock, ArrowLeft, Calendar } from "lucide-react";
import Layout from "@/components/Layout";
import BlogCard from "@/components/BlogCard";
import { getBlogPost, blogPosts } from "@/data/blog";

export default function BlogPost() {
  const params = useParams<{ slug: string }>();
  const post = getBlogPost(params.slug ?? "");

  if (!post) {
    return (
      <Layout title="Article Not Found">
        <div className="min-h-screen flex items-center justify-center bg-[hsl(40,25%,96%)] pt-20">
          <div className="text-center">
            <h1 className="font-serif text-4xl text-[hsl(225,50%,22%)] mb-4">Article Not Found</h1>
            <Link href="/blog">
              <button className="font-sans text-sm font-medium text-[hsl(225,50%,22%)] underline underline-offset-4">
                Return to the Journal
              </button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  const related = blogPosts.filter((p) => p.slug !== post.slug && p.category === post.category).slice(0, 3);

  return (
    <Layout title={post.title}>
      {/* ── Article Hero ── */}
      <section className="bg-[hsl(225,50%,22%)] pt-28 pb-16 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{ background: "radial-gradient(ellipse at top right, hsl(38,45%,60%), transparent 60%)" }}
        />
        <div className="relative z-10 max-w-4xl mx-auto px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Link href="/blog">
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
                <Calendar size={14} />
                {post.date}
              </div>
              <div className="flex items-center gap-2 font-sans text-sm text-[hsl(40,25%,70%)]">
                <Clock size={14} />
                {post.readTime}
              </div>
              <div className="font-sans text-sm text-[hsl(40,25%,70%)]">
                By <span className="text-[hsl(38,45%,65%)]">Woman of Taste Editorial</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Article Content ── */}
      <section className="py-16 bg-[hsl(40,25%,96%)]">
        <div className="max-w-3xl mx-auto px-6 lg:px-12">
          {/* Intro excerpt */}
          <motion.p
            className="font-serif text-xl sm:text-2xl font-light italic text-[hsl(225,50%,30%)] leading-relaxed mb-10 border-l-4 border-[hsl(38,45%,60%)] pl-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {post.excerpt}
          </motion.p>

          {/* Article body */}
          <motion.div
            className="prose-wot"
            dangerouslySetInnerHTML={{ __html: post.content }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          />

          {/* Article footer */}
          <div className="mt-16 pt-8 border-t border-[hsl(35,15%,85%)]">
            <div className="flex items-center gap-4">
              <img
                src="/wot-logo.png"
                alt="Woman of Taste"
                className="w-16 h-16 object-contain"
                style={{ mixBlendMode: "multiply" }}
              />
              <div>
                <p className="font-serif text-base font-medium text-[hsl(225,50%,22%)]">
                  Woman of Taste Editorial
                </p>
                <p className="font-sans text-xs text-[hsl(28,18%,26%)]">
                  Premium lifestyle content for the modern woman of taste.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Related Articles ── */}
      {related.length > 0 && (
        <section className="py-20 bg-[hsl(35,15%,93%)]">
          <div className="max-w-7xl mx-auto px-6 lg:px-12">
            <h2 className="font-serif text-3xl font-light text-[hsl(225,50%,22%)] mb-10">
              You May Also Enjoy
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {related.map((p, i) => (
                <BlogCard key={p.slug} post={p} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}
    </Layout>
  );
}
