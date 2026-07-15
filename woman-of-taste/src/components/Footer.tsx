import { Link } from "wouter";
import { FaTiktok, FaInstagram, FaPinterest } from "react-icons/fa";
import { ExternalLink, Mail } from "lucide-react";
import { socialLinks, brandInfo, partnerLinks } from "@/data/social";

export default function Footer() {
  return (
    <footer className="bg-[hsl(225,50%,18%)] text-[hsl(40,25%,90%)]">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 pt-16 pb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <img src="/wot-logo.png" alt="Woman of Taste" className="h-28 w-28 object-contain mb-4" style={{ mixBlendMode: "screen", opacity: 0.92 }} />
            <p className="font-sans text-xs font-medium leading-relaxed text-[hsl(40,25%,72%)] mb-3">
              South Africa's premium lifestyle events brand for women. Curated experiences, intimate gatherings, and curated moments of culture and taste.
            </p>
            <a href="mailto:info@womanoftaste.co.za" className="flex items-center gap-2 font-sans text-xs font-medium text-[hsl(38,45%,65%)] hover:text-[hsl(38,45%,80%)] transition-colors">
              <Mail size={12} /> info@womanoftaste.co.za
            </a>
          </div>

          {/* Navigate */}
          <div>
            <h4 className="font-serif text-base font-medium text-[hsl(38,45%,65%)] mb-4 tracking-wide">Navigate</h4>
            <nav className="flex flex-col gap-2">
              {[
                { label: "Home", href: "/" },
                { label: "About Us", href: "/about" },
                { label: "Explore", href: "/restaurants" },
                { label: "The Journal", href: "/journal" },
                { label: "Events", href: "/events" },
                { label: "Partnerships", href: "/partnerships" },
                { label: "Contact", href: "/contact" },
              ].map((item) => (
                <Link key={item.href} href={item.href}>
                  <span className="font-sans text-xs font-medium text-[hsl(40,25%,68%)] hover:text-[hsl(38,45%,65%)] transition-colors cursor-pointer tracking-wide">
                    {item.label}
                  </span>
                </Link>
              ))}
            </nav>
          </div>

          {/* Experiences */}
          <div>
            <h4 className="font-serif text-base font-medium text-[hsl(38,45%,65%)] mb-4 tracking-wide">Experiences</h4>
            <nav className="flex flex-col gap-2">
              {[
                { label: "All Experiences", href: "/experiences/lifestyle" },
                { label: "Private Dining", href: "/experiences/private-dining" },
                { label: "Wine Tasting Events", href: "/experiences/wine-tasting" },
                { label: "Women's Networking", href: "/experiences/networking" },
                { label: "Lifestyle Events SA", href: "/experiences/lifestyle" },
              ].map((item) => (
                <Link key={item.href + item.label} href={item.href}>
                  <span className="font-sans text-xs font-medium text-[hsl(40,25%,68%)] hover:text-[hsl(38,45%,65%)] transition-colors cursor-pointer tracking-wide">
                    {item.label}
                  </span>
                </Link>
              ))}
            </nav>
          </div>

          {/* Locations */}
          <div>
            <h4 className="font-serif text-base font-medium text-[hsl(38,45%,65%)] mb-4 tracking-wide">Locations</h4>
            <nav className="flex flex-col gap-2 mb-6">
              {[
                { label: "Events Johannesburg", href: "/events/johannesburg" },
                { label: "Events Cape Town", href: "/events/cape-town" },
                { label: "Events Pretoria", href: "/events/pretoria" },
              ].map((item) => (
                <Link key={item.href} href={item.href}>
                  <span className="font-sans text-xs font-medium text-[hsl(40,25%,68%)] hover:text-[hsl(38,45%,65%)] transition-colors cursor-pointer tracking-wide">
                    {item.label}
                  </span>
                </Link>
              ))}
            </nav>
            <h4 className="font-serif text-base font-medium text-[hsl(38,45%,65%)] mb-3 tracking-wide">Follow the Journey</h4>
            <div className="flex flex-col gap-2">
              <a href={socialLinks.tiktok} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-3 font-sans text-xs font-medium text-[hsl(40,25%,68%)] hover:text-[hsl(38,45%,65%)] transition-colors">
                <FaTiktok size={13} className="text-[hsl(38,45%,65%)]" />
                {brandInfo.tiktokHandle}
              </a>
              <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-3 font-sans text-xs font-medium text-[hsl(40,25%,68%)] hover:text-[hsl(38,45%,65%)] transition-colors">
                <FaInstagram size={13} className="text-[hsl(38,45%,65%)]" />
                {brandInfo.instagramHandle}
              </a>
              <a href={socialLinks.pinterest} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-3 font-sans text-xs font-medium text-[hsl(40,25%,68%)] hover:text-[hsl(38,45%,65%)] transition-colors">
                <FaPinterest size={13} className="text-[hsl(38,45%,65%)]" />
                {brandInfo.pinterestHandle}
              </a>
            </div>
          </div>

          {/* Partners */}
          <div>
            <h4 className="font-serif text-base font-medium text-[hsl(38,45%,65%)] mb-4 tracking-wide">Partners</h4>
            <p className="font-sans text-xs font-medium text-[hsl(40,25%,62%)] leading-relaxed mb-4">
              In strategic collaboration with DineXP for hospitality excellence, and Okiru powering our AI intelligence layer.
            </p>
            <div className="flex flex-col gap-3 mb-4">
              <a href={partnerLinks.dinexpWebsite} target="_blank" rel="noopener noreferrer"
                className="group flex items-center gap-2 hover:opacity-90 transition-opacity">
                <img src="/dinexp-logo-new.png" alt="DineXP" className="h-6 object-contain" style={{ filter: "brightness(0) invert(1) opacity(0.7)" }} />
                <span className="font-sans text-xs font-medium text-[hsl(40,25%,68%)] group-hover:text-[hsl(38,45%,65%)] transition-colors">Visit DineXP</span>
                <ExternalLink size={10} className="text-[hsl(40,25%,55%)]" />
              </a>
            </div>
            <a href={partnerLinks.okiruWebsite} target="_blank" rel="noopener noreferrer"
              className="group inline-flex items-center gap-2 mb-5 hover:opacity-90 transition-opacity">
              <img src="/okiru-logo.png" alt="Okiru" className="h-5 object-contain" style={{ filter: "brightness(0) invert(1) opacity(0.6)" }} />
              <span className="font-sans text-xs font-medium text-[hsl(40,25%,68%)] group-hover:text-[hsl(38,45%,65%)] transition-colors">Visit Okiru</span>
              <ExternalLink size={11} className="text-[hsl(40,25%,68%)]" />
            </a>
            <h4 className="font-serif text-base font-medium text-[hsl(38,45%,65%)] mt-4 mb-2 tracking-wide">Get in Touch</h4>
            <a href="mailto:info@womanoftaste.co.za"
              className="flex items-center gap-2 font-sans text-xs font-medium text-[hsl(40,25%,68%)] hover:text-[hsl(38,45%,65%)] transition-colors">
              <Mail size={11} /> info@womanoftaste.co.za
            </a>
          </div>
        </div>

        <div className="border-t border-[hsl(225,30%,25%)] pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-sans text-[10px] font-medium text-[hsl(40,25%,48%)] tracking-widest uppercase">
            &copy; {new Date().getFullYear()} {brandInfo.name}. All rights reserved.
          </p>
          <p className="font-serif text-sm italic text-[hsl(38,45%,55%)]">
            {brandInfo.tagline}
          </p>
          <Link href="/admin">
            <span className="font-sans text-[9px] font-medium tracking-widest uppercase text-[hsl(40,25%,32%)] hover:text-[hsl(40,25%,52%)] transition-colors cursor-pointer">
              Admin
            </span>
          </Link>
        </div>
      </div>
    </footer>
  );
}
