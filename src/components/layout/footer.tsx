import Link from "next/link";
import { Heart, Shield, FileText, RotateCcw, Phone } from "lucide-react";
import { Instagram } from "@/components/ui/icon-instagram";

export function Footer() {
  return (
    <footer className="border-t bg-gradient-to-b from-background to-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:py-14">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="col-span-2 sm:col-span-1">
            <Link href="/" className="text-lg font-extrabold tracking-tight">
              Mana Tech Bazar
            </Link>
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
              Your favourite store on Instagram. Gadgets, home &amp; kitchen, jewellery and toys — delivered to your doorstep, free above ₹499.
            </p>
            <a
              href="https://www.instagram.com/manatechbazar?utm_source=ig_web_button_share_sheet&stkn=ZDNlZDc0MzIxNw=="
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-3 text-sm font-medium text-pink-600 hover:text-pink-700 transition-colors"
            >
              <Instagram className="h-4 w-4" /> @manatechbazar
            </a>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-sm mb-3">Shop</h3>
            <ul className="space-y-2">
              <li><Link href="/products" className="text-sm text-muted-foreground hover:text-foreground transition-colors">All Products</Link></li>
              <li><Link href="/category/gadgets" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Gadgets</Link></li>
              <li><Link href="/category/home-kitchen" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Home &amp; Kitchen</Link></li>
              <li><Link href="/category/jewellery" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Jewellery</Link></li>
              <li><Link href="/category/toys-games" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Toys &amp; Games</Link></li>
              <li><Link href="/offers" className="text-sm text-orange-600 font-medium hover:text-orange-700 transition-colors">🔥 Offers</Link></li>
            </ul>
          </div>

          {/* Help */}
          <div>
            <h3 className="font-bold text-sm mb-3">Help</h3>
            <ul className="space-y-2">
              <li><Link href="/contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5"><Phone className="h-3 w-3" /> Contact Us</Link></li>
              <li><Link href="/refund-policy" className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5"><RotateCcw className="h-3 w-3" /> Refund Policy</Link></li>
              <li><Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5"><FileText className="h-3 w-3" /> Terms & Conditions</Link></li>
              <li><Link href="/privacy-policy" className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5"><Shield className="h-3 w-3" /> Privacy Policy</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-bold text-sm mb-3">Contact</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="https://wa.me/917893653255" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">
                  📱 WhatsApp: +91 78936 53255
                </a>
              </li>
              <li>
                <a href="mailto:support@manatechbazar.in" className="hover:text-foreground transition-colors">
                  📧 support@manatechbazar.in
                </a>
              </li>
              <li>📍 Andhra Pradesh, India</li>
              <li>🕐 Mon-Sat: 10AM - 8PM</li>
            </ul>
          </div>
        </div>

        {/* Payment Badges */}
        <div className="border-t pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1 bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 px-2.5 py-1 rounded-full font-medium">
              ✓ UPI
            </span>
            <span className="inline-flex items-center gap-1 bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 px-2.5 py-1 rounded-full font-medium">
              💳 Cards
            </span>
            <span className="inline-flex items-center gap-1 bg-yellow-50 dark:bg-yellow-950/30 text-yellow-700 dark:text-yellow-400 px-2.5 py-1 rounded-full font-medium">
              🔒 100% Secure Pay
            </span>
            <span className="inline-flex items-center gap-1 bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-400 px-2.5 py-1 rounded-full font-medium">
              🏦 Netbanking
            </span>
          </div>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            Made with <Heart className="h-3 w-3 text-red-500 fill-red-500" /> in India 🇮🇳 &copy; {new Date().getFullYear()} Mana Tech Bazar
          </p>
        </div>
      </div>
    </footer>
  );
}
