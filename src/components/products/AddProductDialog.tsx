"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { Plus, Search } from "lucide-react";

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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Api from "@/core/service/api";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3002/api/cm";

type ProductStatus = "ACTIVE" | "INACTIVE";

export type ProductApi = {
  id: string;
  sku: string;
  name: string;
  description: string | null;
  base_price: string;
  currency_code: string;
  status: ProductStatus;
};

type HsnOption = {
  id: string;
  code: string;
  shortDescription: string | null;
  description: string;
  taxRate: number | null;
};

type AddProductDialogProps = {
  onProductCreated?: (product: ProductApi) => void;
};

type FormValues = {
  sku: string;
  name: string;
  description: string;
  basePrice: string;
  currencyCode: string;
  status: ProductStatus;
  hsnId: string; // selected HSN ID
};

export function AddProductDialog({ onProductCreated }: AddProductDialogProps) {
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [hsnSearch, setHsnSearch] = useState("");
  const [hsnOptions, setHsnOptions] = useState<HsnOption[]>([]);
  const [hsnLoading, setHsnLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      sku: "",
      name: "",
      description: "",
      basePrice: "",
      currencyCode: "INR",
      status: "ACTIVE",
      hsnId: "",
    },
  });

  const resetForm = () => {
    reset();
    setHsnSearch("");
    setHsnOptions([]);
    setGlobalError(null);
  };

  const handleSearchHsn = async () => {
    if (!hsnSearch.trim()) return;
    try {
      setHsnLoading(true);
      setGlobalError(null);

      //   const url = new URL(`${API_BASE_URL}/products/hsn/search`);
      //   url.searchParams.set("q", hsnSearch.trim());
      //   url.searchParams.set("country", "IN");

      //   const res = await fetch(url.toString(), {
      //     headers: { "Content-Type": "application/json" },
      //   });

      //   if (!res.ok) {
      //     throw new Error(`Failed to search HSN: ${res.status}`);
      //   }
      const data = await new Api().get("/products/hsn/search", {
        params: { q: hsnSearch.trim() },
      });
      //   const data = await res.json();
      const normalized: HsnOption[] = (data || []).map((item: any) => ({
        id: item.id,
        code: item.code,
        shortDescription:
          item.shortDescription ?? item.short_description ?? null,
        description: item.description,
        taxRate:
          item.taxRate ?? item.tax_rate
            ? Number(item.taxRate ?? item.tax_rate)
            : null,
      }));

      setHsnOptions(normalized);
      if (normalized.length === 1) {
        setValue("hsnId", normalized[0].id, { shouldValidate: true });
      }
    } catch (err: any) {
      console.error(err);
      setGlobalError(err.message ?? "Failed to search HSN");
    } finally {
      setHsnLoading(false);
    }
  };

  const onSubmit = async (values: FormValues) => {
    setGlobalError(null);

    const priceNumber = Number(values.basePrice);
    if (Number.isNaN(priceNumber) || priceNumber <= 0) {
      setGlobalError("Base price must be a positive number");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        sku: values.sku.trim(),
        name: values.name.trim(),
        description: values.description.trim() || null,
        basePrice: priceNumber,
        currencyCode: values.currencyCode,
        hsnId: values.hsnId,
        status: values.status,
      };

      const resp = await new Api().post("/products", payload);

      onProductCreated?.(resp);
      resetForm();
      setOpen(false);
      // if SSR data: router.refresh();
    } catch (err: any) {
      console.error(err);
      setGlobalError(err.message ?? "Failed to create product");
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
          Add Product
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Add Product</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
          {globalError && (
            <p className="text-sm text-red-500 border border-red-200 rounded-md px-3 py-2 bg-red-50">
              {globalError}
            </p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* SKU */}
            <div className="space-y-1">
              <Label htmlFor="sku">SKU</Label>
              <Input
                id="sku"
                placeholder="SKU-001"
                {...register("sku", { required: "SKU is required" })}
              />
              {errors.sku && (
                <p className="text-xs text-red-500">{errors.sku.message}</p>
              )}
            </div>

            {/* Name */}
            <div className="space-y-1">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="Basmati Rice 1kg"
                {...register("name", { required: "Name is required" })}
              />
              {errors.name && (
                <p className="text-xs text-red-500">{errors.name.message}</p>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              rows={3}
              placeholder="Optional description"
              {...register("description")}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Base price */}
            <div className="space-y-1">
              <Label htmlFor="basePrice">Base Price</Label>
              <Input
                id="basePrice"
                type="number"
                min="0"
                step="0.01"
                placeholder="120.50"
                {...register("basePrice", {
                  required: "Base price is required",
                })}
              />
              {errors.basePrice && (
                <p className="text-xs text-red-500">
                  {errors.basePrice.message}
                </p>
              )}
            </div>

            {/* Currency */}
            <div className="space-y-1">
              <Label>Currency</Label>
              <Controller
                name="currencyCode"
                control={control}
                rules={{ required: "Currency is required" }}
                render={({ field }) => (
                  <>
                    <Select
                      value={field.value}
                      onValueChange={(val) => field.onChange(val)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="INR">INR</SelectItem>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.currencyCode && (
                      <p className="text-xs text-red-500">
                        {errors.currencyCode.message}
                      </p>
                    )}
                  </>
                )}
              />
            </div>

            {/* Status */}
            <div className="space-y-1">
              <Label>Status</Label>
              <Controller
                name="status"
                control={control}
                rules={{ required: "Status is required" }}
                render={({ field }) => (
                  <>
                    <Select
                      value={field.value}
                      onValueChange={(val: ProductStatus) =>
                        field.onChange(val)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ACTIVE">ACTIVE</SelectItem>
                        <SelectItem value="INACTIVE">INACTIVE</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.status && (
                      <p className="text-xs text-red-500">
                        {errors.status.message}
                      </p>
                    )}
                  </>
                )}
              />
            </div>
          </div>

          {/* HSN search + select */}
          <div className="space-y-2">
            <Label>HSN Code</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Search HSN (e.g. rice, 1006...)"
                value={hsnSearch}
                onChange={(e) => setHsnSearch(e.target.value)}
              />
              <Button
                type="button"
                variant="outline"
                className="gap-2"
                onClick={handleSearchHsn}
                disabled={hsnLoading || !hsnSearch.trim()}
              >
                <Search className="w-4 h-4" />
                {hsnLoading ? "Searching..." : "Search"}
              </Button>
            </div>

            <Controller
              name="hsnId"
              control={control}
              rules={{ required: "Please select an HSN code" }}
              render={({ field }) => (
                <>
                  <Select
                    value={field.value}
                    onValueChange={(val) => field.onChange(val)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select HSN from search results" />
                    </SelectTrigger>
                    <SelectContent>
                      {hsnOptions.length === 0 && (
                        <SelectItem value="__none" disabled>
                          {hsnLoading ? "Searching..." : "No results yet"}
                        </SelectItem>
                      )}
                      {hsnOptions.map((hsn) => (
                        <SelectItem key={hsn.id} value={hsn.id}>
                          {hsn.code} – {hsn.shortDescription || hsn.description}
                          {hsn.taxRate != null ? ` (Tax: ${hsn.taxRate}%)` : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.hsnId && (
                    <p className="text-xs text-red-500">
                      {errors.hsnId.message}
                    </p>
                  )}
                </>
              )}
            />
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
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save Product"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
