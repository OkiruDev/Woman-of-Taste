import { Link } from "wouter";
import { motion } from "framer-motion";
import { Clock, ArrowRight } from "lucide-react";
import type { BlogPost } from "@/data/blog";

interface BlogCardProps {
  post: BlogPost;
  index?: number;
  basePath?: string;
}

const categoryColors: Record<string, string> = {
  Editorial: "text-[hsl(225,50%,30%)] bg-[hsl(225,40%,92%)]",
  Dining: "text-[hsl(38,50%,30%)] bg-[hsl(38,45%,92%)]",
  Lifestyle: "text-[hsl(160,35%,30%)] bg-[hsl(160,30%,92%)]",
  Womanhood: "text-[hsl(350,30%,35%)] bg-[hsl(350,30%,93%)]",
  Culture: "text-[hsl(280,25%,30%)] bg-[hsl(280,25%,93%)]",
  Hospitality: "text-[hsl(28,40%,30%)] bg-[hsl(28,35%,92%)]",
};

const imagePlaceholders = [
  "linear-gradient(135deg, hsl(225,40%,28%) 0%, hsl(225,35%,40%) 100%)",
  "linear-gradient(135deg, hsl(38,45%,45%) 0%, hsl(38,35%,62%) 100%)",
  "linear-gradient(135deg, hsl(350,25%,40%) 0%, hsl(350,20%,56%) 100%)",
  "linear-gradient(135deg, hsl(28,30%,38%) 0%, hsl(28,25%,52%) 100%)",
  "linear-gradient(135deg, hsl(160,25%,32%) 0%, hsl(160,20%,48%) 100%)",
  "linear-gradient(135deg, hsl(280,20%,38%) 0%, hsl(280,15%,52%) 100%)",
];

export default function BlogCard({ post, index = 0, basePath = "/journal" }: BlogCardProps) {
  const catClass = categoryColors[post.category] ?? "text-[hsl(28,18%,35%)] bg-[hsl(35,15%,90%)]";
  const placeholderBg = imagePlaceholders[index % imagePlaceholders.length];

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6, boxShadow: "0 20px 40px rgba(28,20,12,0.13)" }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className="group bg-[hsl(40,30%,98%)] rounded-2xl overflow-hidden border border-[hsl(35,15%,88%)] shadow-sm cursor-pointer"
    >
      <Link href={`${basePath}/${post.slug}`} className="block">
        <div className="h-48 relative overflow-hidden" style={{ background: post.coverImageUrl ? undefined : placeholderBg }}>
          {post.coverImageUrl ? (
            <img src={post.coverImageUrl} alt={post.title} className="w-full h-full object-cover" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <img src="/wot-logo.png" alt="" className="w-20 h-20 object-contain" style={{ mixBlendMode: "screen", opacity: 0.22 }} />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        </div>
        <div className="p-6">
          <div className="flex items-center justify-between mb-3">
            <span className={`text-[10px] font-sans font-semibold tracking-[0.15em] uppercase px-2.5 py-1 rounded-full ${catClass}`}>
              {post.category}
            </span>
            <span className="flex items-center gap-1 text-xs text-[hsl(28,18%,26%)] font-sans">
              <Clock size={11} /> {post.readTime}
            </span>
          </div>
          <h3 className="font-serif text-xl font-medium text-[hsl(225,50%,22%)] leading-snug mb-2 group-hover:text-[hsl(38,45%,45%)] transition-colors">
            {post.title}
          </h3>
          <p className="font-sans text-sm font-normal text-[hsl(28,18%,20%)] leading-relaxed mb-4 line-clamp-2">
            {post.excerpt}
          </p>
          <div className="flex items-center justify-between">
            <span className="font-sans text-xs text-[hsl(28,18%,30%)]">{post.date}</span>
            <span className="flex items-center gap-1 text-xs font-medium text-[hsl(225,50%,30%)] group-hover:gap-2 transition-all">
              Read <ArrowRight size={13} />
            </span>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
