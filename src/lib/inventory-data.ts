/**
 * Inventory Management - Mock Data
 *
 * Tracks farm supplies: fertilizers, pesticides, seeds, animal feed, equipment parts, etc.
 */

export interface InventoryItem {
  id: string;
  name: string;
  category: InventoryCategory;
  quantity: number;
  unit: string;
  minThreshold: number;
  location: string;
  costPerUnit: number;
  supplier: string;
  lastOrdered: string;
  expiryDate?: string;
  notes?: string;
}

export type InventoryCategory =
  | "Fertilizers"
  | "Pesticides"
  | "Seeds"
  | "Animal Feed"
  | "Animal Medicine"
  | "Equipment Parts"
  | "Fuel & Lubricants"
  | "Tools"
  | "Packaging"
  | "Other";

export const inventoryCategories: InventoryCategory[] = [
  "Fertilizers",
  "Pesticides",
  "Seeds",
  "Animal Feed",
  "Animal Medicine",
  "Equipment Parts",
  "Fuel & Lubricants",
  "Tools",
  "Packaging",
  "Other",
];

export const inventoryData: InventoryItem[] = [
  {
    id: "inv-1",
    name: "NPK 20-20-20 Fertilizer",
    category: "Fertilizers",
    quantity: 850,
    unit: "kg",
    minThreshold: 200,
    location: "Barn A - Shelf 3",
    costPerUnit: 1.2,
    supplier: "NutriField Inc.",
    lastOrdered: "2024-02-15",
    notes: "Balanced fertilizer for general crop use",
  },
  {
    id: "inv-2",
    name: "Urea (46% Nitrogen)",
    category: "Fertilizers",
    quantity: 120,
    unit: "kg",
    minThreshold: 300,
    location: "Barn A - Shelf 1",
    costPerUnit: 0.85,
    supplier: "GreenGrow Co.",
    lastOrdered: "2024-01-20",
    notes: "⚠️ Low stock - reorder soon",
  },
  {
    id: "inv-3",
    name: "Glyphosate Herbicide",
    category: "Pesticides",
    quantity: 45,
    unit: "L",
    minThreshold: 20,
    location: "Chemical Shed - Rack 2",
    costPerUnit: 8.5,
    supplier: "AgroChem Ltd.",
    lastOrdered: "2024-03-01",
    expiryDate: "2025-03-01",
    notes: "Handle with protective equipment",
  },
  {
    id: "inv-4",
    name: "Chlorpyrifos Insecticide",
    category: "Pesticides",
    quantity: 12,
    unit: "L",
    minThreshold: 10,
    location: "Chemical Shed - Rack 1",
    costPerUnit: 15.0,
    supplier: "AgroChem Ltd.",
    lastOrdered: "2024-02-10",
    expiryDate: "2024-12-15",
  },
  {
    id: "inv-5",
    name: "Winter Wheat Seeds",
    category: "Seeds",
    quantity: 500,
    unit: "kg",
    minThreshold: 100,
    location: "Seed Storage - Bin 1",
    costPerUnit: 2.5,
    supplier: "GreenGrow Co.",
    lastOrdered: "2024-01-05",
    notes: "Hardy variety, disease resistant",
  },
  {
    id: "inv-6",
    name: "Corn Seeds (Hybrid)",
    category: "Seeds",
    quantity: 320,
    unit: "kg",
    minThreshold: 80,
    location: "Seed Storage - Bin 3",
    costPerUnit: 3.8,
    supplier: "Monsanto",
    lastOrdered: "2024-02-01",
  },
  {
    id: "inv-7",
    name: "Dairy Cattle Feed Pellets",
    category: "Animal Feed",
    quantity: 2000,
    unit: "kg",
    minThreshold: 500,
    location: "Feed Silo 1",
    costPerUnit: 0.45,
    supplier: "FeedMaster Corp.",
    lastOrdered: "2024-03-10",
  },
  {
    id: "inv-8",
    name: "Chicken Layer Feed",
    category: "Animal Feed",
    quantity: 150,
    unit: "kg",
    minThreshold: 100,
    location: "Feed Silo 2",
    costPerUnit: 0.55,
    supplier: "FeedMaster Corp.",
    lastOrdered: "2024-03-12",
    notes: "⚠️ Low stock - reorder soon",
  },
  {
    id: "inv-9",
    name: "Bovine Vaccination Kit",
    category: "Animal Medicine",
    quantity: 15,
    unit: "doses",
    minThreshold: 10,
    location: "Vet Room - Fridge",
    costPerUnit: 45.0,
    supplier: "VetSupply Co.",
    lastOrdered: "2024-02-20",
    expiryDate: "2025-02-20",
  },
  {
    id: "inv-10",
    name: "Tractor Oil Filter",
    category: "Equipment Parts",
    quantity: 8,
    unit: "pcs",
    minThreshold: 4,
    location: "Workshop - Parts Cabinet",
    costPerUnit: 22.0,
    supplier: "FarmParts USA",
    lastOrdered: "2024-01-15",
  },
  {
    id: "inv-11",
    name: "Diesel Fuel",
    category: "Fuel & Lubricants",
    quantity: 600,
    unit: "L",
    minThreshold: 200,
    location: "Fuel Tank 1",
    costPerUnit: 1.35,
    supplier: "Regional Fuel Co.",
    lastOrdered: "2024-03-14",
  },
  {
    id: "inv-12",
    name: "Hydraulic Oil (10W)",
    category: "Fuel & Lubricants",
    quantity: 45,
    unit: "L",
    minThreshold: 20,
    location: "Workshop - Oil Rack",
    costPerUnit: 4.2,
    supplier: "Regional Fuel Co.",
    lastOrdered: "2024-02-28",
  },
  {
    id: "inv-13",
    name: "Pruning Shears",
    category: "Tools",
    quantity: 12,
    unit: "pcs",
    minThreshold: 6,
    location: "Tool Shed - Wall B",
    costPerUnit: 18.5,
    supplier: "FarmTools Inc.",
    lastOrdered: "2024-01-10",
  },
  {
    id: "inv-14",
    name: "Egg Cartons (30-pack)",
    category: "Packaging",
    quantity: 200,
    unit: "pcs",
    minThreshold: 50,
    location: "Storage Room - Box C",
    costPerUnit: 0.75,
    supplier: "PackRight Ltd.",
    lastOrdered: "2024-03-05",
  },
  {
    id: "inv-15",
    name: "Irrigation Drip Tape",
    category: "Equipment Parts",
    quantity: 500,
    unit: "m",
    minThreshold: 200,
    location: "Barn B - Coil Rack",
    costPerUnit: 0.3,
    supplier: "DripTech Systems",
    lastOrdered: "2024-02-20",
  },
];

/**
 * Get items that are below their minimum threshold (need reorder)
 */
export function getLowStockItems(): InventoryItem[] {
  return inventoryData.filter((item) => item.quantity <= item.minThreshold);
}

/**
 * Get items that are expiring within a given number of days
 */
export function getExpiringItems(days: number = 30): InventoryItem[] {
  const now = new Date();
  const future = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
  return inventoryData.filter((item) => {
    if (!item.expiryDate) return false;
    const expiry = new Date(item.expiryDate);
    return expiry >= now && expiry <= future;
  });
}

/**
 * Get total inventory value
 */
export function getTotalInventoryValue(): number {
  return inventoryData.reduce(
    (sum, item) => sum + item.quantity * item.costPerUnit,
    0
  );
}

