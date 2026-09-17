import { Resend } from "resend";
import { formatPrice } from "./utils";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

interface OrderEmailData {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  items: Array<{ title: string; quantity: number; total: number }>;
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  paymentMode: string;
  address: string;
}

export async function sendOrderConfirmation(data: OrderEmailData) {
  if (!resend) {
    console.log("📧 Email not sent (RESEND_API_KEY not configured)");
    return;
  }

  try {
    const itemsList = data.items
      .map(
        (item) =>
          `<tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.title}</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">${formatPrice(item.total)}</td>
          </tr>`
      )
      .join("");

    await resend.emails.send({
      from: "Mana Tech Bazar <onboarding@resend.dev>",
      to: data.customerEmail,
      subject: `Order Confirmed #${data.orderNumber} 🎉`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #1a1a1a;">Thank you for your order! 🎉</h1>
          <p>Hi ${data.customerName},</p>
          <p>Your order <strong>#${data.orderNumber}</strong> has been confirmed.</p>
          
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <thead>
              <tr style="background: #f5f5f5;">
                <th style="padding: 8px; text-align: left;">Item</th>
                <th style="padding: 8px; text-align: center;">Qty</th>
                <th style="padding: 8px; text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>${itemsList}</tbody>
          </table>
          
          <div style="background: #f5f5f5; padding: 16px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 4px 0;">Subtotal: ${formatPrice(data.subtotal)}</p>
            ${data.discount > 0 ? `<p style="margin: 4px 0; color: green;">Discount: -${formatPrice(data.discount)}</p>` : ""}
            <p style="margin: 4px 0;">Shipping: ${data.shipping === 0 ? "FREE" : formatPrice(data.shipping)}</p>
            <p style="margin: 8px 0 0; font-size: 18px; font-weight: bold;">Total: ${formatPrice(data.total)}</p>
          </div>
          
          <p><strong>Payment:</strong> ${data.paymentMode === "RAZORPAY" ? "Online Payment" : "Cash on Delivery"}</p>
          <p><strong>Shipping to:</strong> ${data.address}</p>
          
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;" />
          <p style="color: #666; font-size: 12px;">
            Questions? Reply to this email or chat with us on WhatsApp.
            <br />— Team Mana Tech Bazar
          </p>
        </div>
      `,
    });

    console.log(`📧 Order confirmation sent to ${data.customerEmail}`);
  } catch (error) {
    console.error("Failed to send order email:", error);
  }
}
