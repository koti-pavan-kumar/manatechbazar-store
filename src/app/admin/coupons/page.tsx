import { db } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2 } from "lucide-react";
import { DeleteCouponButton } from "./delete-button";

export default async function AdminCouponsPage() {
  const coupons = await db.coupon.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Coupons ({coupons.length})</h1>
        <Link href="/admin/coupons/new">
          <Button><Plus className="h-4 w-4 mr-2" /> Add Coupon</Button>
        </Link>
      </div>

      <div className="space-y-3">
        {coupons.map((coupon) => (
          <div key={coupon.id} className="flex items-center justify-between p-4 border rounded-xl bg-card">
            <div>
              <div className="flex items-center gap-2">
                <code className="font-bold bg-muted px-2 py-0.5 rounded text-sm">{coupon.code}</code>
                <Badge variant={coupon.isActive ? "success" : "secondary"}>
                  {coupon.isActive ? "Active" : "Inactive"}
                </Badge>
                <Badge variant="info">
                  {coupon.type === "FLAT" ? `${formatPrice(coupon.value)} OFF` : `${coupon.value}% OFF`}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Min: {formatPrice(coupon.minOrder)} • Expires: {new Date(coupon.expiry).toLocaleDateString("en-IN")}
                {coupon.usageLimit ? ` • Used: ${coupon.usedCount}/${coupon.usageLimit}` : ""}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link href={`/admin/coupons/${coupon.id}/edit`}>
                <Button variant="outline" size="sm"><Edit className="h-3.5 w-3.5" /></Button>
              </Link>
              <DeleteCouponButton couponId={coupon.id} couponCode={coupon.code} />
            </div>
          </div>
        ))}
      </div>

      {coupons.length === 0 && (
        <div className="text-center py-12">
          <p className="text-lg font-medium mb-2">No coupons yet</p>
          <Link href="/admin/coupons/new"><Button>Create Your First Coupon</Button></Link>
        </div>
      )}
    </div>
  );
}
