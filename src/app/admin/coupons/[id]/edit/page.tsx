"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export default function EditCouponPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [coupon, setCoupon] = useState<any>(null);

  useEffect(() => {
    fetch("/api/admin/coupons")
      .then((r) => r.json())
      .then((data) => {
        const c = data.coupons?.find((c: any) => c.id === params.id);
        if (c) {
          // Convert from paise to rupees for display
          setCoupon({
            ...c,
            value: c.type === "FLAT" ? c.value / 100 : c.value,
            minOrder: c.minOrder / 100,
            maxDiscount: c.maxDiscount ? c.maxDiscount / 100 : "",
            expiry: new Date(c.expiry).toISOString().slice(0, 16),
          });
        }
        setLoading(false);
      });
  }, [params.id]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/coupons", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: params.id, ...coupon }),
      });
      if (res.ok) router.push("/admin/coupons");
    } finally { setSaving(false); }
  };

  if (loading || !coupon) {
    return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  }

  return (
    <div className="max-w-xl space-y-6">
      <h1 className="text-2xl font-bold">Edit Coupon</h1>
      <Card>
        <CardContent className="p-6 space-y-4">
          <div>
            <Label>Code</Label>
            <Input value={coupon.code} disabled className="uppercase" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Type</Label>
              <select value={coupon.type} onChange={(e) => setCoupon({ ...coupon, type: e.target.value })} className="w-full h-11 rounded-lg border bg-background px-3 text-sm">
                <option value="FLAT">Flat ₹ Off</option>
                <option value="PERCENT">% Off</option>
              </select>
            </div>
            <div>
              <Label>Value</Label>
              <Input type="number" value={coupon.value} onChange={(e) => setCoupon({ ...coupon, value: Number(e.target.value) })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Min Order (₹)</Label>
              <Input type="number" value={coupon.minOrder} onChange={(e) => setCoupon({ ...coupon, minOrder: Number(e.target.value) })} />
            </div>
            <div>
              <Label>Expiry</Label>
              <Input type="datetime-local" value={coupon.expiry} onChange={(e) => setCoupon({ ...coupon, expiry: e.target.value })} />
            </div>
          </div>
          <label className="flex items-center gap-2 min-h-[44px]">
            <Checkbox checked={coupon.isActive} onCheckedChange={(c) => setCoupon({ ...coupon, isActive: c })} />
            <span className="text-sm">Active</span>
          </label>
        </CardContent>
      </Card>
      <Button size="lg" onClick={handleSave} disabled={saving}>
        {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />} Save Changes
      </Button>
    </div>
  );
}
