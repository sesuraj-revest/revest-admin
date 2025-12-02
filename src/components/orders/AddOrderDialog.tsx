"use client";

import { useEffect, useState } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Api from "@/core/service/api";

type ProductStatus = "ACTIVE" | "INACTIVE";

type ProductApi = {
  id: string;
  sku: string;
  name: string;
  base_price: string;
  currency_code: string;
  status: ProductStatus;
};

export type OrderApi = {
  id: string;
  country_code: string;
  status: string;
  subtotal: string;
  tax_total: string;
  grand_total: string;
  created_at: string;
  items?: OrderItemApi[];
};

export type OrderItemApi = {
  id: string;
  product_id: string;
  product_name: string;
  sku: string | null;
  hsn_code: string | null;
  quantity: number;
  unit_price: string;
  tax_rate: string;
  tax_amount: string;
  line_total: string;
};

type AddOrderDialogProps = {
  onOrderCreated?: (order: OrderApi) => void;
};

type ItemForm = {
  productId: string;
  quantity: string;
};

type FormValues = {
  countryCode: string;
  items: ItemForm[];
};

export function AddOrderDialog({ onOrderCreated }: AddOrderDialogProps) {
  const [open, setOpen] = useState(false);
  const [products, setProducts] = useState<ProductApi[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      countryCode: "IN",
      items: [{ productId: "", quantity: "1" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  // Load products when dialog opens
  useEffect(() => {
    if (!open) return;
    (async () => {
      try {
        setLoadingProducts(true);
        setError(null);

        const data = await new Api().get("/products");
        setProducts(Array.isArray(data) ? data : []);
      } catch (err: any) {
        console.error(err);
        setError(err.message ?? "Failed to load products");
      } finally {
        setLoadingProducts(false);
      }
    })();
  }, [open]);

  const resetForm = () => {
    reset({
      countryCode: "IN",
      items: [{ productId: "", quantity: "1" }],
    });
    setError(null);
  };

  const onSubmit = async (values: FormValues) => {
    setError(null);

    const validItems = values.items
      .map((item) => ({
        productId: item.productId,
        quantity: Number(item.quantity),
      }))
      .filter((i) => i.productId && i.quantity > 0);

    if (!validItems.length) {
      setError("Add at least one valid item (product + quantity > 0)");
      return;
    }

    try {
      setSaving(true);

      // If you store JWT in localStorage:
      let token: string | null = null;
      if (typeof window !== "undefined") {
        token = localStorage.getItem("accessToken");
      }

      const payload = {
        countryCode: values.countryCode.toUpperCase(),
        items: validItems,
      };

      // });
      const data = await new Api().post("/os/orders", payload);

      const order: OrderApi = {
        id: data.order.id,
        country_code: data.order.country_code,
        status: data.order.status,
        subtotal: String(data.order.subtotal),
        tax_total: String(data.order.tax_total),
        grand_total: String(data.order.grand_total),
        created_at: data.order.created_at,
        items: data.items,
      };

      onOrderCreated?.(order);
      resetForm();
      setOpen(false);
    } catch (err: any) {
      console.error(err);
      setError(err.message ?? "Failed to create order");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) resetForm();
        setOpen(next);
      }}
    >
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Create Order
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create Order</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
          {error && (
            <p className="text-sm text-red-500 border border-red-200 rounded-md px-3 py-2 bg-red-50">
              {error}
            </p>
          )}

          {/* Country */}
          <div className="space-y-1">
            <Label htmlFor="countryCode">Country</Label>
            <Controller
              name="countryCode"
              control={control}
              rules={{ required: "Country is required" }}
              render={({ field }) => (
                <>
                  <Select
                    value={field.value}
                    onValueChange={(val) => field.onChange(val)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="IN">India (IN)</SelectItem>
                      {/* You can add more countries later */}
                    </SelectContent>
                  </Select>
                  {errors.countryCode && (
                    <p className="text-xs text-red-500">
                      {errors.countryCode.message}
                    </p>
                  )}
                </>
              )}
            />
          </div>

          {/* Items */}
          <div className="space-y-2">
            <Label>Items</Label>
            <div className="space-y-3">
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="grid grid-cols-1 md:grid-cols-[2fr_1fr_auto] gap-2 items-end"
                >
                  {/* Product */}
                  <div className="space-y-1">
                    <Label>Product</Label>
                    <Controller
                      name={`items.${index}.productId`}
                      control={control}
                      rules={{ required: "Product is required" }}
                      render={({ field }) => (
                        <>
                          <Select
                            value={field.value}
                            disabled={loadingProducts}
                            onValueChange={(val) => field.onChange(val)}
                          >
                            <SelectTrigger>
                              <SelectValue
                                placeholder={
                                  loadingProducts
                                    ? "Loading products..."
                                    : "Select product"
                                }
                              />
                            </SelectTrigger>
                            <SelectContent>
                              {products.map((p) => (
                                <SelectItem key={p.id} value={p.id}>
                                  {p.name} ({p.sku}) – {p.currency_code}{" "}
                                  {Number(p.base_price).toFixed(2)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {errors.items?.[index]?.productId && (
                            <p className="text-xs text-red-500">
                              {errors.items[index]?.productId?.message}
                            </p>
                          )}
                        </>
                      )}
                    />
                  </div>

                  {/* Quantity */}
                  <div className="space-y-1">
                    <Label>Quantity</Label>
                    <Controller
                      name={`items.${index}.quantity`}
                      control={control}
                      rules={{
                        required: "Quantity is required",
                        validate: (value) =>
                          Number(value) > 0 || "Quantity must be > 0",
                      }}
                      render={({ field }) => (
                        <>
                          <Input type="number" min="1" step="1" {...field} />
                          {errors.items?.[index]?.quantity && (
                            <p className="text-xs text-red-500">
                              {errors.items[index]?.quantity?.message}
                            </p>
                          )}
                        </>
                      )}
                    />
                  </div>

                  {/* Remove item */}
                  <div className="flex justify-end">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      disabled={fields.length === 1}
                      onClick={() => remove(index)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-1 gap-2"
              onClick={() => append({ productId: "", quantity: "1" })}
            >
              <Plus className="w-4 h-4" />
              Add Item
            </Button>
          </div>

          <DialogFooter className="mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                resetForm();
                setOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saving || loadingProducts}>
              {saving ? "Creating..." : "Create Order"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
