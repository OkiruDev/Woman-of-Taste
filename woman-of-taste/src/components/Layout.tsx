import { ReactNode, useEffect } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import NewsletterSignup from "./NewsletterSignup";
import ChatBot from "./ChatBot";
import Breadcrumb from "./Breadcrumb";
import { motion } from "framer-motion";

interface LayoutProps {
  children: ReactNode;
  title?: string;
}

export default function Layout({ children, title }: LayoutProps) {
  useEffect(() => {
    if (title) {
      document.title = `${title} | Woman of Taste`;
    } else {
      document.title = "Woman of Taste | Savory & Soulful";
    }
  }, [title]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div
        className="sticky z-40 w-full"
        style={{ top: "80px" }}
      >
        <Breadcrumb />
      </div>
      <motion.main
        className="flex-1"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        {children}
      </motion.main>
      <NewsletterSignup />
      <Footer />
      <ChatBot />
    </div>
  );
}
