import { db } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function AdminCustomersPage() {
  const customers = await db.user.findMany({
    where: { role: "CUSTOMER" },
    include: { orders: { select: { id: true, total: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Customers ({customers.length})</h1>

      <div className="space-y-3">
        {customers.map((customer) => (
          <Card key={customer.id}>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="font-medium">{customer.name}</p>
                <p className="text-sm text-muted-foreground">{customer.email}</p>
                {customer.phone && <p className="text-sm text-muted-foreground">📞 {customer.phone}</p>}
              </div>
              <div className="text-right">
                <Badge variant="secondary">{customer.orders.length} orders</Badge>
                <p className="text-xs text-muted-foreground mt-1">
                  Joined {new Date(customer.createdAt).toLocaleDateString("en-IN")}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {customers.length === 0 && (
        <div className="text-center py-12">
          <p className="text-lg font-medium">No customers yet</p>
        </div>
      )}
    </div>
  );
}
