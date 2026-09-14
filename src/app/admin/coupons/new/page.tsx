"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { couponSchema } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export default function NewCouponPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(couponSchema),
    defaultValues: { isActive: true },
  });

  const type = watch("type");

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) { router.push("/admin/coupons"); router.refresh(); }
      else { const r = await res.json(); alert(r.error); }
    } finally { setLoading(false); }
  };

  return (
    <div className="max-w-xl space-y-6">
      <h1 className="text-2xl font-bold">New Coupon</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Card>
          <CardContent className="p-6 space-y-4">
            <div>
              <Label>Coupon Code *</Label>
              <Input {...register("code")} placeholder="e.g. FLAT100" className="uppercase" />
              {errors.code && <p className="text-xs text-red-500 mt-1">{errors.code.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Discount Type *</Label>
                <select {...register("type")} className="w-full h-11 rounded-lg border bg-background px-3 text-sm">
                  <option value="FLAT">Flat ₹ Off</option>
                  <option value="PERCENT">% Off</option>
                </select>
              </div>
              <div>
                <Label>Value *</Label>
                <Input type="number" {...register("value")} placeholder={type === "PERCENT" ? "20" : "100"} />
                {errors.value && <p className="text-xs text-red-500 mt-1">{errors.value.message}</p>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Min Order (₹)</Label>
                <Input type="number" {...register("minOrder")} placeholder="0" />
              </div>
              <div>
                <Label>Max Discount (₹) — for % coupons</Label>
                <Input type="number" {...register("maxDiscount")} placeholder="Optional" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Expiry Date *</Label>
                <Input type="datetime-local" {...register("expiry")} />
                {errors.expiry && <p className="text-xs text-red-500 mt-1">{errors.expiry.message}</p>}
              </div>
              <div>
                <Label>Usage Limit (optional)</Label>
                <Input type="number" {...register("usageLimit")} placeholder="Unlimited" />
              </div>
            </div>
            <label className="flex items-center gap-2 min-h-[44px]">
              <Checkbox checked={watch("isActive")} onCheckedChange={(c) => setValue("isActive", c as boolean)} />
              <span className="text-sm">Active</span>
            </label>
          </CardContent>
        </Card>
        <Button type="submit" size="lg" disabled={loading}>
          {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />} Create Coupon
        </Button>
      </form>
    </div>
  );
}
