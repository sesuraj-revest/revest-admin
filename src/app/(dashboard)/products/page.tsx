"use client";

import { Edit2, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Api from "@/core/service/api";
import { AddProductDialog } from "@/components/products/AddProductDialog";

// Adjust this to your setup:
// - If your Next app is served from the same origin as orders-service (gateway),
//   you can set NEXT_PUBLIC_API_BASE_URL=/api/cm in .env.local
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3002/api/cm";

type ProductStatus = "ACTIVE" | "INACTIVE";

type ProductApi = {
  id: string;
  sku: string;
  name: string;
  description: string | null;
  base_price: string; // comes as string from Postgres numeric
  currency_code: string;
  status: ProductStatus;
  // if you later join HSN in the list endpoint, you can add: hsn_code, hsn_short_description etc.
};

export default function ProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<ProductApi[]>([]);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await new Api().get("/products");

      setProducts(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error(err);
      setError(err.message ?? "Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    fetchProducts();
  }, []);

  const handleAddProduct = () => {
    router.push("/admin/products/create");
  };

  const handleEdit = (id: string) => {
    router.push(`/admin/products/${id}`);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      setDeletingId(id);
      const res = await fetch(`${API_BASE_URL}/products/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        throw new Error(`Failed to delete product: ${res.status}`);
      }

      // Remove from local state
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err: any) {
      console.error(err);
      alert(err.message ?? "Failed to delete product");
    } finally {
      setDeletingId(null);
    }
  };

  // Simple stats
  const totalProducts = products.length;
  const activeProducts = products.filter((p) => p.status === "ACTIVE").length;
  const inactiveProducts = products.filter(
    (p) => p.status === "INACTIVE"
  ).length;

  const totalValue = products.reduce((sum, p) => {
    const price = Number(p.base_price || 0);
    return sum + price;
  }, 0);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Products Management
        </h1>
        <p className="text-muted-foreground">
          Manage your products, pricing, and HSN mapping.
        </p>
      </div>

      {/* Dashboard cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Total Products</p>
          <p className="text-3xl font-bold text-primary">{totalProducts}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Active Products</p>
          <p className="text-3xl font-bold text-primary">{activeProducts}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Inactive Products</p>
          <p className="text-3xl font-bold text-primary">{inactiveProducts}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">
            Total Base Value (approx)
          </p>
          <p className="text-3xl font-bold text-primary">
            ₹{totalValue.toFixed(2)}
          </p>
        </Card>
      </div>

      {/* Products table */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6 gap-3">
          <div>
            <h2 className="text-xl font-semibold text-foreground">
              Available Products
            </h2>
            {error && (
              <p className="text-sm text-red-500 mt-1">
                {error} (check backend)
              </p>
            )}
          </div>
          {/* <Button className="gap-2" onClick={handleAddProduct}>
            <Plus className="w-4 h-4" />
            Add Product
          </Button> */}
          <AddProductDialog
            onProductCreated={(product) =>
              setProducts((prev) => [product, ...prev])
            }
          />
        </div>

        {loading ? (
          <p className="text-sm text-muted-foreground">Loading products…</p>
        ) : products.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No products found. Click &quot;Add Product&quot; to create one.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>SKU</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                {/* Later you can add HSN, tax info here */}
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-mono text-xs md:text-sm">
                    {product.sku}
                  </TableCell>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>
                    {product.currency_code}{" "}
                    {Number(product.base_price).toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <span
                      className={
                        product.status === "ACTIVE"
                          ? "inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700"
                          : "inline-flex items-center rounded-full bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-700"
                      }
                    >
                      {product.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleEdit(product.id)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="icon"
                        disabled={deletingId === product.id}
                        onClick={() => handleDelete(product.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
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
