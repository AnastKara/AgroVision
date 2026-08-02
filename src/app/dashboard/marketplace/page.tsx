"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { marketplaceItems } from "@/lib/data";
import {
  ShoppingBag,
  Search,
  Filter,
  Star,
  MapPin,
  Package,
  Plus,
  ChevronDown,
} from "lucide-react";

const categories = ["All", "Seeds", "Fertilizers", "Animals", "Equipment", "Services", "Workers"];

export default function MarketplacePage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredItems = marketplaceItems.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.seller.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Marketplace</h1>
          <p className="text-muted-foreground mt-1">Buy and sell farming products, equipment, and services</p>
        </div>
<Button onClick={() => router.push("/dashboard/marketplace/sell")}>
          <Plus size={16} className="mr-1" />
          Sell Item
        </Button>
      </div>

      {/* Search & Categories */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search marketplace..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-1 overflow-x-auto pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-sm whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Items Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredItems.map((item, i) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass-card p-5 hover:shadow-lg transition-all duration-300 group"
          >
            {/* Image placeholder */}
            <div className="w-full h-32 rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center mb-4">
              <ShoppingBag size={32} className="text-primary/30" />
            </div>

            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm truncate">{item.name}</h3>
                  <p className="text-xs text-muted-foreground">{item.seller}</p>
                </div>
                <Badge variant="secondary" className="text-[10px] ml-2">
                  {item.category}
                </Badge>
              </div>

              <p className="text-xs text-muted-foreground line-clamp-2">{item.description}</p>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-bold text-primary">${item.price}</p>
                  <p className="text-xs text-muted-foreground">
                    <Package size={12} className="inline mr-1" />
                    {item.quantity} available
                  </p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-yellow-500 text-xs">
                    <Star size={12} className="fill-yellow-500" />
                    {item.rating}
                  </div>
                  <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <MapPin size={10} />
                    {item.location}
                  </p>
                </div>
              </div>

<Button className="w-full" size="sm" onClick={() => router.push(`/dashboard/marketplace?contact=${item.id}`)}>
                Contact Seller
              </Button>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

