import { StoreLayout } from "@/components/layout/store-layout";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Privacy Policy — Mana Tech Bazar",
  description: "Privacy policy for Mana Tech Bazar",
};

export default function PrivacyPolicyPage() {
  return (
    <StoreLayout>
      <div className="mx-auto max-w-4xl px-4 py-8 sm:py-12">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Store
        </Link>

        <h1 className="text-3xl sm:text-4xl font-extrabold mb-2">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground mb-8">Last updated: September 2026</p>

        <div className="prose prose-gray dark:prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-xl font-bold mb-3">1. Information We Collect</h2>
            <ul className="space-y-2 text-muted-foreground">
              <li><strong>Personal Information:</strong> Name, email address, phone number, and delivery address when you register or place an order.</li>
              <li><strong>Payment Information:</strong> We do NOT store your credit card, debit card, or bank details. All payments are processed securely through Razorpay.</li>
              <li><strong>Usage Data:</strong> Pages visited, products viewed, time spent on site, and browser type — collected anonymously to improve our services.</li>
              <li><strong>Cookies:</strong> We use essential cookies for login sessions and cart functionality. You can disable cookies in your browser settings.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">2. How We Use Your Information</h2>
            <ul className="space-y-2 text-muted-foreground">
              <li>To process and fulfil your orders, including shipping and delivery.</li>
              <li>To send order confirmations, shipping updates, and delivery notifications.</li>
              <li>To provide customer support and respond to your queries.</li>
              <li>To improve our website, products, and services.</li>
              <li>To send promotional emails and offers (only with your consent — you can unsubscribe anytime).</li>
              <li>To prevent fraud and ensure the security of our platform.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">3. Information Sharing</h2>
            <ul className="space-y-2 text-muted-foreground">
              <li>We do <strong>NOT sell or rent</strong> your personal information to third parties.</li>
              <li>We share information only with trusted service providers who help us operate our business:
                <ul className="mt-1 ml-4">
                  <li><strong>Razorpay</strong> — for payment processing</li>
                  <li><strong>Shipping partners</strong> — for order delivery (name, address, phone)</li>
                  <li><strong>Email service (Resend)</strong> — for sending transactional emails</li>
                  <li><strong>Vercel</strong> — for website hosting</li>
                  <li><strong>Neon</strong> — for database hosting</li>
                </ul>
              </li>
              <li>We may disclose information if required by law or to protect our legal rights.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">4. Data Security</h2>
            <ul className="space-y-2 text-muted-foreground">
              <li>We implement industry-standard security measures including SSL encryption, bcrypt password hashing, and secure API authentication.</li>
              <li>While we take every precaution, no method of transmission over the Internet is 100% secure.</li>
              <li>Your password is encrypted and cannot be read by anyone, including us.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">5. Your Rights</h2>
            <ul className="space-y-2 text-muted-foreground">
              <li><strong>Access:</strong> You can view your personal data in your account settings.</li>
              <li><strong>Update:</strong> You can update your name, phone, and addresses from your account.</li>
              <li><strong>Delete:</strong> You can request deletion of your account and data by contacting us.</li>
              <li><strong>Opt-out:</strong> You can unsubscribe from promotional emails by clicking the unsubscribe link.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">6. Data Retention</h2>
            <p className="text-muted-foreground">
              We retain your personal information for as long as your account is active or as needed to provide services. Order history is retained for 5 years for legal and tax compliance. Account data is deleted within 30 days of account deletion request.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">7. Children&apos;s Privacy</h2>
            <p className="text-muted-foreground">
              Our services are not directed to individuals under 18 years of age. We do not knowingly collect personal information from children. If we become aware that we have collected data from a child, we will delete it promptly.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">8. Changes to This Policy</h2>
            <p className="text-muted-foreground">
              We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated date. We encourage you to review this policy periodically.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">9. Contact Us</h2>
            <div className="bg-muted/50 rounded-2xl p-6 not-prose">
              <p className="font-semibold mb-2">Mana Tech Bazar</p>
              <p className="text-sm text-muted-foreground space-y-1">
                📧 Email: <a href="mailto:support@manatechbazar.in" className="text-primary hover:underline">support@manatechbazar.in</a><br />
                📱 WhatsApp: <a href="https://wa.me/919999999999" className="text-primary hover:underline">+91 99999 99999</a><br />
                🌐 Website: <a href="https://manatechbazar.in" className="text-primary hover:underline">manatechbazar.in</a>
              </p>
            </div>
          </section>
        </div>
      </div>
    </StoreLayout>
  );
}
