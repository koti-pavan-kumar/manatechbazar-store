// Store configuration constants

export const STORE = {
  name: "Mana Tech Bazar",
  // Canonical production domain — the only URL Google should ever see
  siteUrl: "https://manatechbazar.in",
  description: "Your favourite store on Instagram",
  currency: "INR",
  currencySymbol: "₹",
  minOrderForFreeShipping: 499, // ₹499
  whatsappNumber: "917893653255",
  instagramHandle: "@manatechbazar",
  instagramUrl: "https://www.instagram.com/manatechbazar?utm_source=ig_web_button_share_sheet&stkn=ZDNlZDc0MzIxNw==",
  supportEmail: "support@manatechbazar.in",
} as const;

// Order status labels
export const ORDER_STATUS: Record<string, { label: string; color: string }> = {
  PAYMENT_PENDING: { label: "Payment Pending", color: "bg-orange-100 text-orange-800" },
  PAYMENT_FAILED: { label: "Payment Failed", color: "bg-red-100 text-red-800" },
  PLACED: { label: "Order Placed", color: "bg-blue-100 text-blue-800" },
  CONFIRMED: { label: "Confirmed", color: "bg-indigo-100 text-indigo-800" },
  SHIPPED: { label: "Shipped", color: "bg-yellow-100 text-yellow-800" },
  DELIVERED: { label: "Delivered", color: "bg-green-100 text-green-800" },
  CANCELLED: { label: "Cancelled", color: "bg-red-100 text-red-800" },
  RETURNED: { label: "Returned", color: "bg-gray-100 text-gray-800" },
};

// Coupon type labels
export const COUPON_TYPES = {
  FLAT: { label: "Flat ₹ off", icon: "₹" },
  PERCENT: { label: "% off", icon: "%" },
};

// Navigation items
export const NAV_ITEMS = [
  { label: "Home", href: "/", icon: "Home" },
  { label: "Shop", href: "/products", icon: "ShoppingBag" },
  { label: "Wishlist", href: "/wishlist", icon: "Heart" },
  { label: "Cart", href: "/cart", icon: "ShoppingCart" },
  { label: "Account", href: "/account", icon: "User" },
];

export const ADMIN_NAV_ITEMS = [
  { label: "Dashboard", href: "/admin", icon: "LayoutDashboard" },
  { label: "Products", href: "/admin/products", icon: "Package" },
  { label: "Categories", href: "/admin/categories", icon: "Tag" },
  { label: "Coupons", href: "/admin/coupons", icon: "Ticket" },
  { label: "Orders", href: "/admin/orders", icon: "ClipboardList" },
  { label: "Customers", href: "/admin/customers", icon: "Users" },
  { label: "Settings", href: "/admin/settings", icon: "Settings" },
];
