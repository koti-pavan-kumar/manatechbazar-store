import { StoreLayout } from "@/components/layout/store-layout";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Refund & Cancellation Policy — Mana Tech Bazar",
  description: "Refund and cancellation policy for orders placed on Mana Tech Bazar",
};

export default function RefundPolicyPage() {
  return (
    <StoreLayout>
      <div className="mx-auto max-w-4xl px-4 py-8 sm:py-12">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Store
        </Link>

        <h1 className="text-3xl sm:text-4xl font-extrabold mb-2">Refund & Cancellation Policy</h1>
        <p className="text-sm text-muted-foreground mb-8">Last updated: September 2026</p>

        <div className="prose prose-gray dark:prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-xl font-bold mb-3">1. Order Cancellation</h2>
            <ul className="space-y-2 text-muted-foreground">
              <li>You may cancel your order within <strong>1 hour</strong> of placing it by contacting us via WhatsApp or email.</li>
              <li>Orders that have already been shipped cannot be cancelled. You may refuse delivery or initiate a return after receiving the product.</li>
              <li>COD (Cash on Delivery) orders can be cancelled before dispatch without any charges.</li>
              <li>Prepaid orders (UPI/Cards) cancelled before dispatch will receive a <strong>full refund</strong> to the original payment method within 5-7 business days.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">2. Returns</h2>
            <ul className="space-y-2 text-muted-foreground">
              <li>You may request a return within <strong>7 days</strong> of receiving the product.</li>
              <li>The product must be unused, unwashed, and in its original packaging with all tags attached.</li>
              <li>The following items are <strong>non-returnable</strong>: innerwear, socks, products purchased during final sale events, and customised items.</li>
              <li>To initiate a return, contact us on WhatsApp at <strong>+91 99999 99999</strong> or email <strong>support@manatechbazar.in</strong> with your order ID and reason for return.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">3. Refunds</h2>
            <ul className="space-y-2 text-muted-foreground">
              <li><strong>Prepaid orders:</strong> Refund will be credited to your original payment method (UPI/Card/Netbanking) within <strong>5-7 business days</strong> after we receive and inspect the returned product.</li>
              <li><strong>COD orders:</strong> Refund will be processed via UPI transfer or bank transfer within <strong>7-10 business days</strong>. You will need to provide your UPI ID or bank details.</li>
              <li><strong>Partial refunds</strong> may be issued if the product shows signs of use, damage, or missing tags/packaging.</li>
              <li>Shipping charges are non-refundable unless the return is due to our error (wrong product, defective item).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">4. Damaged or Defective Products</h2>
            <ul className="space-y-2 text-muted-foreground">
              <li>If you receive a damaged or defective product, contact us within <strong>48 hours</strong> of delivery with photos of the damage.</li>
              <li>We will arrange a free pickup and send a replacement or issue a full refund including shipping charges.</li>
              <li>Please do not discard the damaged product until our team advises you to do so.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">5. Exchanges</h2>
            <ul className="space-y-2 text-muted-foreground">
              <li>We offer size exchanges within <strong>7 days</strong> of delivery, subject to availability.</li>
              <li>If the desired size is out of stock, you may opt for a refund or store credit.</li>
              <li>One free exchange per order. Subsequent exchanges will require you to bear return shipping costs.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">6. Contact Us</h2>
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
