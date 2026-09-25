import { z } from "zod";

// ─── Auth ──────────────────────────────────────────────────────
export const loginSchema = z.object({
  phone: z.string().min(10, "Please enter a valid 10-digit phone number"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").optional().or(z.literal("")),
  phone: z.string().min(10, "Please enter a valid 10-digit phone number"),
  email: z.string().email("Please enter a valid email").optional().or(z.literal("")),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// ─── Product ───────────────────────────────────────────────────
export const productSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().optional(),
  description: z.string().min(10, "Description must be at least 10 characters"),
  mrp: z.coerce.number().min(1, "Market price must be greater than 0"),
  price: z.coerce.number().min(1, "Price must be greater than 0"),
  stock: z.coerce.number().min(0, "Stock cannot be negative"),
  sku: z.string().optional(),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  isDealOfTheDay: z.boolean().default(false),
  freeShipping: z.boolean().default(false),
  categoryIds: z.array(z.string()).min(1, "Select at least one category"),
  tags: z.string().optional(),
  images: z.array(z.string()).min(1, "Upload at least one image"),
  variants: z.array(z.object({
    size: z.string().optional(),
    color: z.string().optional(),
    colorCode: z.string().optional(),
    sku: z.string().optional(),
    price: z.coerce.number().optional(),
    stock: z.coerce.number().min(0),
    image: z.string().optional(),
  })).optional(),
}).refine((data) => data.price <= data.mrp, {
  message: "Selling price must be less than or equal to the market price",
  path: ["price"],
});

export type ProductInput = z.infer<typeof productSchema>;

// ─── Category ──────────────────────────────────────────────────
export const categorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().optional(),
  image: z.string().optional(),
  parentId: z.string().optional(),
  sortOrder: z.coerce.number().default(0),
});

// ─── Coupon ────────────────────────────────────────────────────
export const couponSchema = z.object({
  code: z.string().min(3, "Code must be at least 3 characters").toUpperCase(),
  type: z.enum(["FLAT", "PERCENT"]),
  value: z.coerce.number().min(1, "Value must be greater than 0"),
  minOrder: z.coerce.number().min(0).default(0),
  maxDiscount: z.coerce.number().optional(),
  expiry: z.string().min(1, "Expiry date is required"),
  usageLimit: z.coerce.number().min(1).optional(),
  isActive: z.boolean().default(true),
}).refine((data) => {
  if (data.type === "PERCENT" && data.value > 100) return false;
  return true;
}, { message: "Percent value cannot exceed 100", path: ["value"] });

// ─── Address ───────────────────────────────────────────────────
export const addressSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z.string().min(10, "Valid phone number is required"),
  line1: z.string().min(1, "Address line 1 is required"),
  line2: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  pincode: z.string().min(6, "Valid pincode is required"),
  country: z.string().default("IN"),
  isDefault: z.boolean().default(false),
});

// ─── Review ────────────────────────────────────────────────────
export const reviewSchema = z.object({
  rating: z.coerce.number().min(1).max(5),
  title: z.string().optional(),
  comment: z.string().min(3, "Review must be at least 3 characters"),
});

// ─── Store Settings ────────────────────────────────────────────
export const storeSettingsSchema = z.object({
  storeName: z.string().min(1, "Store name is required"),
  storeDescription: z.string().optional(),
  announcementText: z.string().optional(),
  announcementActive: z.boolean().default(false),
  heroImages: z.array(z.string()).optional(),
  whatsappNumber: z.string().optional(),
  instagramHandle: z.string().optional(),
  freeShippingThreshold: z.coerce.number().min(0),
  defaultPincode: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
});

// ─── Checkout ──────────────────────────────────────────────────
export const checkoutSchema = z.object({
  addressId: z.string().optional(),
  newAddress: addressSchema.optional(),
  paymentMode: z.enum(["RAZORPAY", "COD"]),
  notes: z.string().optional(),
}).refine((data) => {
  return data.addressId || data.newAddress;
}, { message: "Please select or add a delivery address" });
