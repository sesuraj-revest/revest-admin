"use client";

import { Edit2, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
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

// Mock hotel categories data
const MOCK_CATEGORIES = [
  { id: "1", name: "Food", description: "Food" },
  { id: "2", name: "groceries", description: "Groceries" },
  { id: "3", name: "beverages", description: "Beverages" },
];

export default function ProductsPage() {
  const [categories] = useState(MOCK_CATEGORIES);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Hotels Management
        </h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Total Categories</p>
          <p className="text-3xl font-bold text-primary">{categories.length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Total Food Items</p>
          <p className="text-3xl font-bold text-primary">12</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Total Groceries</p>
          <p className="text-3xl font-bold text-primary">48</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Active Beverages</p>
          <p className="text-3xl font-bold text-primary">8</p>
        </Card>
      </div>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-foreground">
            Available Product Categories
          </h2>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((category) => (
              <TableRow key={category.id}>
                <TableCell className="font-medium">{category.name}</TableCell>
                <TableCell>{category.description}</TableCell>
                <TableCell>
                  <div className="flex gap-2">-</div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
