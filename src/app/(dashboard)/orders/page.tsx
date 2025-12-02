"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AddOrderDialog, OrderApi } from "@/components/orders/AddOrderDialog";
import Api from "@/core/service/api";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3002/api/cm";

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<OrderApi[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      let token: string | null = null;
      if (typeof window !== "undefined") {
        token = localStorage.getItem("accessToken");
      }

      const data = await new Api().get("/os/orders");
      debugger;
      setOrders(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error(err);
      setError(err.message ?? "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleOrderCreated = (order: OrderApi) => {
    setOrders((prev) => [order, ...prev]);
  };

  const handleViewOrder = (id: string) => {
    router.push(`/admin/orders/${id}`);
  };

  // Simple stats
  const totalOrders = orders.length;
  const cancelledOrders = orders.filter((o) => o.status === "CANCELLED").length;
  const completedOrders = orders.filter((o) => o.status === "COMPLETED").length;

  const totalRevenue = orders.reduce((sum, o) => {
    const v = Number(o.grand_total || 0);
    return sum + (Number.isNaN(v) ? 0 : v);
  }, 0);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Orders Management
        </h1>
        <p className="text-muted-foreground">
          Create and manage customer orders, and view their status & totals.
        </p>
      </div>

      {/* Dashboard cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Total Orders</p>
          <p className="text-3xl font-bold text-primary">{totalOrders}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Completed Orders</p>
          <p className="text-3xl font-bold text-primary">{completedOrders}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Cancelled Orders</p>
          <p className="text-3xl font-bold text-primary">{cancelledOrders}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Total Revenue</p>
          <p className="text-3xl font-bold text-primary">
            ₹{totalRevenue.toFixed(2)}
          </p>
        </Card>
      </div>

      {/* Orders table */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6 gap-3">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Orders</h2>
            {error && (
              <p className="text-sm text-red-500 mt-1">
                {error} (check backend / auth)
              </p>
            )}
          </div>

          <AddOrderDialog onOrderCreated={handleOrderCreated} />
        </div>

        {loading ? (
          <p className="text-sm text-muted-foreground">Loading orders…</p>
        ) : orders.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No orders yet. Click &quot;Create Order&quot; to create one.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Country</TableHead>
                <TableHead>Subtotal</TableHead>
                <TableHead>Tax</TableHead>
                <TableHead>Total</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-mono text-xs md:text-sm">
                    {order.id}
                  </TableCell>
                  <TableCell>
                    <span
                      className={
                        order.status === "CANCELLED"
                          ? "inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700"
                          : order.status === "COMPLETED"
                          ? "inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700"
                          : "inline-flex items-center rounded-full bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-700"
                      }
                    >
                      {order.status}
                    </span>
                  </TableCell>
                  <TableCell>{order.country_code}</TableCell>
                  <TableCell>₹{Number(order.subtotal).toFixed(2)}</TableCell>
                  <TableCell>₹{Number(order.tax_total).toFixed(2)}</TableCell>
                  <TableCell>₹{Number(order.grand_total).toFixed(2)}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewOrder(order.id)}
                    >
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}
