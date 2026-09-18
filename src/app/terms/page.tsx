import { StoreLayout } from "@/components/layout/store-layout";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Terms & Conditions — Mana Tech Bazar",
  description: "Terms and conditions for using Mana Tech Bazar",
};

export default function TermsPage() {
  return (
    <StoreLayout>
      <div className="mx-auto max-w-4xl px-4 py-8 sm:py-12">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Store
        </Link>

        <h1 className="text-3xl sm:text-4xl font-extrabold mb-2">Terms & Conditions</h1>
        <p className="text-sm text-muted-foreground mb-8">Last updated: September 2026</p>

        <div className="prose prose-gray dark:prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-xl font-bold mb-3">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground">
              By accessing and using the Mana Tech Bazar website (<a href="https://manatechbazar.in" className="text-primary hover:underline">manatechbazar.in</a>), you agree to be bound by these Terms & Conditions. If you do not agree, please do not use our website.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">2. Products & Pricing</h2>
            <ul className="space-y-2 text-muted-foreground">
              <li>All products displayed are subject to availability. We reserve the right to discontinue any product at any time.</li>
              <li>Prices are in Indian Rupees (₹) and include all applicable taxes unless stated otherwise.</li>
              <li>We reserve the right to modify prices without prior notice. However, price changes will not affect orders already confirmed.</li>
              <li>Product images are for illustration purposes. Actual product colour, texture, and size may vary slightly.</li>
              <li>MRP (Maximum Retail Price) shown is the manufacturer's suggested retail price. Our selling price may be lower.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">3. Orders & Payment</h2>
            <ul className="space-y-2 text-muted-foreground">
              <li>Placing an order does not guarantee acceptance. We reserve the right to refuse or cancel any order for any reason.</li>
              <li>Accepted payment methods: UPI (Google Pay, PhonePe, Paytm), Credit/Debit Cards, Netbanking, Wallets, and Cash on Delivery (COD).</li>
              <li>All online payments are processed securely through Razorpay. We do not store your card or banking details.</li>
              <li>Orders are confirmed only after successful payment (for prepaid) or manual verification (for COD).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">4. Shipping & Delivery</h2>
            <ul className="space-y-2 text-muted-foreground">
              <li>We ship across India. Delivery times are estimates and may vary based on location and logistics partner.</li>
              <li>Standard delivery: 3-7 business days. Express delivery (where available): 1-3 business days.</li>
              <li>Free shipping on orders above ₹499. A flat ₹49 shipping fee applies to orders below ₹499.</li>
              <li>Risk of loss and title for products pass to you upon delivery to the shipping carrier.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">5. User Accounts</h2>
            <ul className="space-y-2 text-muted-foreground">
              <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
              <li>You must be at least 18 years old to create an account and make purchases.</li>
              <li>One account per person. Creating multiple accounts for fraudulent purposes will result in account termination.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">6. Intellectual Property</h2>
            <p className="text-muted-foreground">
              All content on this website — including text, images, logos, graphics, and design — is the property of Mana Tech Bazar and is protected by Indian copyright and trademark laws. You may not reproduce, distribute, or create derivative works without written permission.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">7. Limitation of Liability</h2>
            <p className="text-muted-foreground">
              Mana Tech Bazar shall not be liable for any indirect, incidental, or consequential damages arising from the use of our products or website. Our total liability shall not exceed the purchase price of the product in question.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">8. Governing Law</h2>
            <p className="text-muted-foreground">
              These Terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of courts in Andhra Pradesh, India.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">9. Changes to Terms</h2>
            <p className="text-muted-foreground">
              We reserve the right to update these Terms at any time. Changes will be effective immediately upon posting on this page. Continued use of the website constitutes acceptance of the updated Terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">10. Contact Us</h2>
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
