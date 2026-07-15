import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { FAQItem } from "@/data/faqData";

interface FAQProps {
  items: FAQItem[];
  title?: string;
}

export default function FAQ({ items, title = "Frequently Asked Questions" }: FAQProps) {
  const [open, setOpen] = useState<number | null>(null);
  if (!items || items.length === 0) return null;

  return (
    <section className="py-20 px-6 lg:px-10" style={{ background: "hsl(40,25%,97%)" }}>
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <p className="font-sans text-[10px] tracking-[0.25em] uppercase text-[hsl(38,45%,52%)] mb-3">
            Have Questions?
          </p>
          <h2
            className="font-serif text-3xl md:text-4xl font-light mb-4"
            style={{ color: "hsl(225,50%,22%)" }}
          >
            {title}
          </h2>
          <div
            className="w-12 h-px mx-auto"
            style={{ background: "hsl(38,45%,60%)" }}
          />
        </div>

        <div className="space-y-2">
          {items.map((item, i) => (
            <motion.div
              key={i}
              initial={false}
              className="border border-[hsl(35,15%,88%)] rounded-2xl overflow-hidden"
              style={{ background: open === i ? "white" : "hsl(40,25%,98%)" }}
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-start justify-between gap-4 px-6 py-4 text-left transition-colors"
                aria-expanded={open === i}
              >
                <span
                  className="font-sans text-sm font-medium leading-snug flex-1 pr-2"
                  style={{ color: open === i ? "hsl(225,50%,22%)" : "hsl(28,18%,18%)" }}
                >
                  {item.q}
                </span>
                <motion.span
                  animate={{ rotate: open === i ? 180 : 0 }}
                  transition={{ duration: 0.22, ease: "easeOut" }}
                  className="flex-shrink-0 mt-0.5"
                  style={{ color: "hsl(38,45%,55%)" }}
                >
                  <ChevronDown size={17} />
                </motion.span>
              </button>

              <AnimatePresence initial={false}>
                {open === i && (
                  <motion.div
                    key="answer"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.28, ease: "easeOut" }}
                    style={{ overflow: "hidden" }}
                  >
                    <div
                      className="px-6 pb-5 font-sans text-sm leading-relaxed border-t border-[hsl(35,15%,90%)] pt-4"
                      style={{ color: "hsl(28,18%,28%)" }}
                    >
                      {item.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
