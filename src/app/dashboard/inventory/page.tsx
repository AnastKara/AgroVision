"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  inventoryData,
  getLowStockItems,
  getTotalInventoryValue,
  inventoryCategories,
  type InventoryItem,
  type InventoryCategory,
} from "@/lib/inventory-data";
import {
  Package,
  Search,
  Plus,
  AlertTriangle,
  DollarSign,
  Box,
  Clock,
  RefreshCw,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function InventoryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<InventoryCategory | "All">("All");
  const [sortBy, setSortBy] = useState<"name" | "quantity" | "cost">("name");
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  const lowStockItems = getLowStockItems();
  const totalValue = getTotalInventoryValue();

  const filteredItems = inventoryData.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.supplier.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const sortedItems = [...filteredItems].sort((a, b) => {
    switch (sortBy) {
      case "name": return a.name.localeCompare(b.name);
      case "quantity": return a.quantity - b.quantity;
      case "cost": return b.costPerUnit - a.costPerUnit;
      default: return 0;
    }
  });

  const isLowStock = (item: InventoryItem) => item.quantity <= item.minThreshold;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Inventory</h1>
          <p className="text-muted-foreground mt-1">
            Manage farm supplies, inputs, and equipment parts
          </p>
        </div>
        <Button>
          <Plus size={16} className="mr-1" />
          Add Item
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Items", value: inventoryData.length, icon: Box, color: "text-primary" },
          { label: "Low Stock Items", value: lowStockItems.length, icon: AlertTriangle, color: lowStockItems.length > 0 ? "text-destructive" : "text-green-500" },
          { label: "Est. Value", value: formatCurrency(totalValue), icon: DollarSign, color: "text-green-500" },
          { label: "Categories", value: inventoryCategories.length, icon: RefreshCw, color: "text-blue-500" },
        ].map((stat, i) => (
          <Card key={i}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl bg-current/10 flex items-center justify-center ${stat.color}`}>
                <stat.icon size={18} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
                <p className="text-lg font-bold">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Low Stock Alert */}
      {lowStockItems.length > 0 && (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="p-4 flex items-start gap-3">
            <AlertTriangle size={20} className="text-destructive flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-destructive">
                {lowStockItems.length} item{lowStockItems.length > 1 ? "s" : ""} below minimum threshold
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {lowStockItems.map((i) => i.name).join(", ")} - Consider reordering soon.
              </p>
            </div>
            <Button variant="outline" size="sm" className="ml-auto flex-shrink-0">
              Reorder All
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search inventory..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-1 overflow-x-auto pb-1">
          {["All", ...inventoryCategories].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat as InventoryCategory | "All")}
              className={`px-3 py-1.5 rounded-lg text-xs whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as "name" | "quantity" | "cost")}
          className="h-10 px-3 rounded-xl border border-border bg-background text-xs focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          <option value="name">Sort: Name</option>
          <option value="quantity">Sort: Quantity</option>
          <option value="cost">Sort: Cost</option>
        </select>
      </div>

      {/* Inventory Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {sortedItems.map((item) => (
          <motion.div
            key={item.id}
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => setSelectedItem(item)}
            className={`glass-card p-4 cursor-pointer transition-all hover:shadow-lg ${
              selectedItem?.id === item.id ? "ring-2 ring-primary" : ""
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                  isLowStock(item)
                    ? "bg-destructive/10 text-destructive"
                    : "bg-primary/10 text-primary"
                }`}>
                  <Package size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{item.name}</p>
                  <p className="text-[10px] text-muted-foreground">{item.supplier}</p>
                </div>
              </div>
              <Badge
                variant={isLowStock(item) ? "destructive" : "secondary"}
                className="text-[9px] px-1.5"
              >
                {item.category}
              </Badge>
            </div>

            <div className="space-y-2">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">Stock Level</span>
                  <span className={`font-medium ${
                    isLowStock(item) ? "text-destructive" : "text-green-500"
                  }`}>
                    {item.quantity} {item.unit}
                  </span>
                </div>
                <Progress
                  value={Math.min((item.quantity / Math.max(item.minThreshold * 3, 1)) * 100, 100)}
                  variant={isLowStock(item) ? "danger" : "success"}
                />
              </div>

              <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                <span>Min: {item.minThreshold} {item.unit}</span>
                <span>${item.costPerUnit.toFixed(2)}/{item.unit}</span>
              </div>

              <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <Clock size={10} />
                <span>Last ordered: {item.lastOrdered}</span>
              </div>

              {item.expiryDate && (
                <div className="flex items-center gap-1 text-[10px] text-yellow-500">
                  <AlertTriangle size={10} />
                  <span>Expires: {item.expiryDate}</span>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Item Detail */}
      {selectedItem && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
        >
          <div className="absolute inset-0 bg-black/50" onClick={() => setSelectedItem(null)} />
          <Card className="relative max-w-lg w-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <Package size={24} className="text-primary" />
                  </div>
                  <div>
                    <CardTitle>{selectedItem.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{selectedItem.supplier}</p>
                  </div>
                </div>
                <Badge variant={isLowStock(selectedItem) ? "destructive" : "success"}>
                  {isLowStock(selectedItem) ? "Low Stock" : "In Stock"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: "Quantity", value: `${selectedItem.quantity} ${selectedItem.unit}` },
                  { label: "Min Threshold", value: `${selectedItem.minThreshold} ${selectedItem.unit}` },
                  { label: "Cost/Unit", value: `$${selectedItem.costPerUnit.toFixed(2)}` },
                  { label: "Total Value", value: formatCurrency(selectedItem.quantity * selectedItem.costPerUnit) },
                ].map((stat, i) => (
                  <div key={i} className="glass rounded-xl p-3 text-center">
                    <p className="text-[10px] text-muted-foreground">{stat.label}</p>
                    <p className="text-sm font-semibold">{stat.value}</p>
                  </div>
                ))}
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Location</span>
                  <span className="font-medium">{selectedItem.location}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Category</span>
                  <span className="font-medium">{selectedItem.category}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Last Ordered</span>
                  <span className="font-medium">{selectedItem.lastOrdered}</span>
                </div>
                {selectedItem.expiryDate && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Expiry Date</span>
                    <span className="font-medium text-yellow-500">{selectedItem.expiryDate}</span>
                  </div>
                )}
              </div>

              {selectedItem.notes && (
                <div className="glass rounded-xl p-3">
                  <p className="text-xs font-medium text-muted-foreground mb-1">Notes</p>
                  <p className="text-sm">{selectedItem.notes}</p>
                </div>
              )}

              <div className="flex gap-3">
                <Button className="flex-1">Reorder</Button>
                <Button variant="outline" className="flex-1">Update Stock</Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
}

