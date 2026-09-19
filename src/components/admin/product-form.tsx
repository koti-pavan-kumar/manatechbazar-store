"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { productSchema } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, X, Upload } from "lucide-react";
import { calcDiscount, safeJsonParse } from "@/lib/utils";

interface Props {
  product?: any;
  categories: any[];
  mode: "create" | "edit";
}

export function ProductForm({ product, categories, mode }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<string[]>(
    product ? safeJsonParse(product.images, []) : []
  );
  const [uploading, setUploading] = useState(false);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>(
    product?.categoryProducts?.map((cp: any) => cp.categoryId) || []
  );

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: {
      title: product?.title || "",
      description: product?.description || "",
      mrp: product?.mrp ? product.mrp / 100 : 0,
      price: product?.price ? product.price / 100 : 0,
      stock: product?.stock || 0,
      sku: product?.sku || "",
      isActive: product?.isActive ?? true,              isFeatured: product?.isFeatured ?? false,
              isDealOfTheDay: product?.isDealOfTheDay ?? false,
              freeShipping: product?.freeShipping ?? false,
      categoryIds: selectedCategoryIds,
      tags: product?.tags ? (typeof product.tags === "string" ? safeJsonParse(product.tags, []).join(", ") : product.tags.join(", ")) : "",
      images: images,
    },
  });

  // Sync selectedCategoryIds to form field whenever it changes
  const syncCategories = (newIds: string[]) => {
    setSelectedCategoryIds(newIds);
    setValue("categoryIds", newIds, { shouldValidate: false });
  };

  // Sync images to form field whenever it changes
  const syncImages = (newImgs: string[]) => {
    setImages(newImgs);
    setValue("images", newImgs, { shouldValidate: false });
  };

  const mrp = watch("mrp");
  const price = watch("price");
  const discount = mrp > 0 && price > 0 ? calcDiscount(mrp * 100, price * 100) : 0;

  const [imageUrlInput, setImageUrlInput] = useState("");
  const [uploadError, setUploadError] = useState("");

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    setUploading(true);
    setUploadError("");
    try {
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        const data = await res.json();
        if (data.url) {
          syncImages([...images, data.url]);
        } else {
          setUploadError(data.error || "Upload failed — try pasting an image URL below instead");
        }
      }
    } catch {
      setUploadError("Upload failed — try pasting an image URL below instead");
    } finally {
      setUploading(false);
    }
  };

  const addImageUrl = () => {
    const url = imageUrlInput.trim();
    if (url && (url.startsWith("http://") || url.startsWith("https://"))) {
      syncImages([...images, url]);
      setImageUrlInput("");
      setUploadError("");
    }
  };

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      const payload = {
        ...data,
        images,
        categoryIds: selectedCategoryIds,
      };

      const url = mode === "create" ? "/api/admin/products" : `/api/admin/products?id=${product.id}`;
      const method = mode === "create" ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (res.ok) {
        router.push("/admin/products");
        router.refresh();
      } else {
        alert(result.error || "Failed to save product");
      }
    } catch {
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-3xl">
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader><CardTitle>Product Details</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Title *</Label>
                <Input {...register("title")} placeholder="e.g. Premium Cotton T-Shirt" />
                {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>}
              </div>
              <div>
                <Label>Description *</Label>
                <Textarea {...register("description")} rows={4} placeholder="Product description..." />
                {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description.message}</p>}
              </div>
              <div>
                <Label>Tags (comma separated)</Label>
                <Input {...register("tags")} placeholder="e.g. cotton, casual, summer" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Pricing & Stock</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>MRP (₹) *</Label>
                  <Input type="number" step="0.01" {...register("mrp")} />
                  {errors.mrp && <p className="text-xs text-red-500 mt-1">{errors.mrp.message}</p>}
                </div>
                <div>
                  <Label>Selling Price (₹) *</Label>
                  <Input type="number" step="0.01" {...register("price")} />
                  {errors.price && <p className="text-xs text-red-500 mt-1">{errors.price.message}</p>}
                </div>
              </div>
              {discount > 0 && (
                <p className="text-sm text-green-600 font-medium">
                  Discount: {discount}% off — Customer saves ₹{(mrp - price).toFixed(0)}
                </p>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Stock *</Label>
                  <Input type="number" {...register("stock")} />
                </div>
                <div>
                  <Label>SKU (optional)</Label>
                  <Input {...register("sku")} placeholder="e.g. TSH-001" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Images */}
          <Card>
            <CardHeader><CardTitle>Images *</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                {images.map((img, i) => (
                  <div key={i} className="relative aspect-square rounded-lg overflow-hidden bg-muted group">
                    <img src={img} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => syncImages(images.filter((_, j) => j !== i))}
                      className="absolute top-1 right-1 h-6 w-6 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
              <label className="flex items-center justify-center gap-2 p-4 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors min-h-[44px]">
                <Upload className="h-4 w-4" />
                <span className="text-sm">{uploading ? "Uploading..." : "Upload Image"}</span>
                <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" disabled={uploading} />
              </label>
              {uploadError && <p className="text-xs text-amber-600 mt-1">{uploadError}</p>}
              <div className="flex gap-2">
                <input
                  type="url"
                  value={imageUrlInput}
                  onChange={(e) => setImageUrlInput(e.target.value)}
                  placeholder="Or paste image URL here..."
                  className="flex-1 h-9 px-3 rounded-lg border bg-background text-xs"
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addImageUrl())}
                />
                <button type="button" onClick={addImageUrl} className="px-3 h-9 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors">
                  Add
                </button>
              </div>
              <p className="text-[11px] text-muted-foreground">💡 Tip: You can paste image URLs from any website (Unsplash, Google Images, etc.)</p>
              {errors.images && <p className="text-xs text-red-500 mt-1">{errors.images.message as string}</p>}
              {images.length === 0 && !errors.images && <p className="text-xs text-amber-500 mt-1">⚠️ At least one image is required</p>}
            </CardContent>
          </Card>

          {/* Categories */}
          <Card>
            <CardHeader><CardTitle>Categories *</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {categories.map((cat) => (
                <label key={cat.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 cursor-pointer min-h-[44px]">
                  <Checkbox
                    checked={selectedCategoryIds.includes(cat.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        syncCategories([...selectedCategoryIds, cat.id]);
                      } else {
                        syncCategories(selectedCategoryIds.filter((id) => id !== cat.id));
                      }
                    }}
                  />
                  <span className="text-sm">{cat.name}</span>
                </label>
              ))}
              {errors.categoryIds && <p className="text-xs text-red-500 mt-1">{errors.categoryIds.message as string}</p>}
              {selectedCategoryIds.length === 0 && !errors.categoryIds && <p className="text-xs text-amber-500 mt-1">⚠️ Select at least one category</p>}
            </CardContent>
          </Card>

          {/* Status */}
          <Card>
            <CardHeader><CardTitle>Status</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <label className="flex items-center gap-2 min-h-[44px]">
                <Checkbox
                  checked={watch("isActive")}
                  onCheckedChange={(c) => setValue("isActive", c as boolean)}
                />
                <span className="text-sm">Active (visible on store)</span>
              </label>
              <label className="flex items-center gap-2 min-h-[44px]">
                <Checkbox
                  checked={watch("isFeatured")}
                  onCheckedChange={(c) => setValue("isFeatured", c as boolean)}
                />
                <span className="text-sm">Featured</span>
              </label>
              <label className="flex items-center gap-2 min-h-[44px]">
                <Checkbox
                  checked={watch("isDealOfTheDay")}
                  onCheckedChange={(c) => setValue("isDealOfTheDay", c as boolean)}
                />
                <span className="text-sm">Deal of the Day</span>
              </label>
              <div className="border-t pt-3 mt-2">
                <label className="flex items-center justify-between min-h-[44px]">
                  <div>
                    <span className="text-sm font-medium">🚚 Free Shipping</span>
                    <p className="text-[11px] text-muted-foreground">Skip the ₹49 shipping fee for this product</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setValue("freeShipping", !watch("freeShipping"))}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      watch("freeShipping") ? "bg-green-500" : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        watch("freeShipping") ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </label>
              </div>
            </CardContent>
          </Card>

          {Object.keys(errors).length > 0 && (
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800">
              <p className="text-sm font-medium text-red-600 dark:text-red-400">⚠️ Please fix these errors:</p>
              <ul className="mt-1 text-xs text-red-500 space-y-0.5">
                {errors.title && <li>• Title is required</li>}
                {errors.description && <li>• Description must be at least 10 characters</li>}
                {errors.mrp && <li>• MRP must be greater than 0</li>}
                {errors.price && <li>• {errors.price.message}</li>}
                {errors.stock && <li>• Stock cannot be negative</li>}
                {errors.images && <li>• Upload at least one image</li>}
                {errors.categoryIds && <li>• Select at least one category</li>}
              </ul>
            </div>
          )}
          <Button type="submit" size="lg" className="w-full" disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            {mode === "create" ? "Create Product" : "Save Changes"}
          </Button>
        </div>
      </div>
    </form>
  );
}
