/**
 * Financial Ledger & Accounting — Mock Data
 *
 * Extends the Transaction type from data.ts with accounts, invoices,
 * budgets, and recurring transactions. Follows the same data-layer
 * pattern as inventory-data.ts and sensor-data.ts.
 */

import { transactions as baseTransactions, type Transaction } from "@/lib/data";

// ============================================================
// Types
// ============================================================

export interface FinancialAccount {
  id: string;
  name: string;
  type: "checking" | "savings" | "credit" | "cash";
  balance: number;
  currency: string;
  accountNumber: string;
  institution: string;
  lastTransaction: string;
  color: string;
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Invoice {
  id: string;
  number: string;
  clientName: string;
  clientEmail: string;
  clientAddress: string;
  items: InvoiceItem[];
  subtotal: number;
  taxRate: number;
  tax: number;
  total: number;
  status: "draft" | "sent" | "paid" | "overdue" | "cancelled";
  issuedDate: string;
  dueDate: string;
  paidDate?: string;
  notes?: string;
}

export interface BudgetCategory {
  id: string;
  name: string;
  icon: string;
  budgeted: number;
  actual: number;
  period: string; // e.g. "2024-Q1"
  color: string;
}

export interface RecurringTransaction {
  id: string;
  name: string;
  description: string;
  amount: number;
  type: "income" | "expense";
  category: string;
  frequency: "weekly" | "monthly" | "quarterly" | "yearly";
  nextDue: string;
  lastProcessed?: string;
  status: "active" | "paused" | "cancelled";
  vendor?: string;
}

export interface CashFlowProjection {
  month: string;
  label: string;
  projectedIncome: number;
  projectedExpenses: number;
  actualIncome?: number;
  actualExpenses?: number;
}

// ============================================================
// Mock Accounts
// ============================================================

export const accounts: FinancialAccount[] = [
  {
    id: "acct-1",
    name: "Farm Operating Account",
    type: "checking",
    balance: 48250.00,
    currency: "USD",
    accountNumber: "**** 4832",
    institution: "Farm Credit Bank",
    lastTransaction: "2024-03-18",
    color: "from-green-400 to-emerald-500",
  },
  {
    id: "acct-2",
    name: "Farm Savings",
    type: "savings",
    balance: 125000.00,
    currency: "USD",
    accountNumber: "**** 7751",
    institution: "Farm Credit Bank",
    lastTransaction: "2024-03-15",
    color: "from-blue-400 to-indigo-500",
  },
  {
    id: "acct-3",
    name: "Equipment Credit Line",
    type: "credit",
    balance: -35000.00,
    currency: "USD",
    accountNumber: "**** 9023",
    institution: "AgriLend Corp",
    lastTransaction: "2024-03-12",
    color: "from-orange-400 to-red-500",
  },
  {
    id: "acct-4",
    name: "Petty Cash",
    type: "cash",
    balance: 1200.00,
    currency: "USD",
    accountNumber: "CASH-001",
    institution: "On Farm",
    lastTransaction: "2024-03-17",
    color: "from-purple-400 to-pink-500",
  },
];

// ============================================================
// Mock Invoices
// ============================================================

export const invoices: Invoice[] = [
  {
    id: "inv-001",
    number: "INV-2024-001",
    clientName: "Green Valley Co-op",
    clientEmail: "billing@greenvalley.coop",
    clientAddress: "123 Co-op Lane, Iowa City, IA 52240",
    items: [
      { description: "Premium Wheat — 2,400 kg", quantity: 2400, unitPrice: 0.45, total: 1080 },
      { description: "Organic Corn — 1,800 kg", quantity: 1800, unitPrice: 0.55, total: 990 },
    ],
    subtotal: 2070,
    taxRate: 0.08,
    tax: 165.60,
    total: 2235.60,
    status: "paid",
    issuedDate: "2024-03-01",
    dueDate: "2024-03-15",
    paidDate: "2024-03-14",
    notes: "Payment received via wire transfer",
  },
  {
    id: "inv-002",
    number: "INV-2024-002",
    clientName: "Fresh Harvest Markets",
    clientEmail: "ap@freshharvest.com",
    clientAddress: "456 Market St, Des Moines, IA 50309",
    items: [
      { description: "Free-Range Eggs — 30 dozen", quantity: 30, unitPrice: 4.50, total: 135 },
      { description: "Milk — 200 gallons", quantity: 200, unitPrice: 3.25, total: 650 },
    ],
    subtotal: 785,
    taxRate: 0.06,
    tax: 47.10,
    total: 832.10,
    status: "sent",
    issuedDate: "2024-03-15",
    dueDate: "2024-03-29",
    notes: "Net 14 days",
  },
  {
    id: "inv-003",
    number: "INV-2024-003",
    clientName: "Organic Valley Distributors",
    clientEmail: "orders@organicvalley.com",
    clientAddress: "789 Organic Ave, Cedar Rapids, IA 52401",
    items: [
      { description: "Soybeans — 3,200 kg", quantity: 3200, unitPrice: 0.50, total: 1600 },
      { description: "Apples — 500 kg", quantity: 500, unitPrice: 1.20, total: 600 },
      { description: "Wool — 45 kg", quantity: 45, unitPrice: 8.00, total: 360 },
    ],
    subtotal: 2560,
    taxRate: 0.07,
    tax: 179.20,
    total: 2739.20,
    status: "draft",
    issuedDate: "2024-03-18",
    dueDate: "2024-04-01",
  },
  {
    id: "inv-004",
    number: "INV-2024-004",
    clientName: "Farmers Market Collective",
    clientEmail: "payments@fmcollective.org",
    clientAddress: "321 Market Square, Ames, IA 50010",
    items: [
      { description: "Lamb Meat — 120 kg", quantity: 120, unitPrice: 12.00, total: 1440 },
      { description: "Pork — 80 kg", quantity: 80, unitPrice: 8.50, total: 680 },
    ],
    subtotal: 2120,
    taxRate: 0.07,
    tax: 148.40,
    total: 2268.40,
    status: "overdue",
    issuedDate: "2024-02-15",
    dueDate: "2024-03-01",
    notes: "Second reminder sent on 03/10",
  },
  {
    id: "inv-005",
    number: "INV-2024-005",
    clientName: "Local Schools Nutrition Program",
    clientEmail: "nutrition@schools.gov",
    clientAddress: "555 Education Blvd, Iowa City, IA 52245",
    items: [
      { description: "Mixed Vegetables — 600 kg", quantity: 600, unitPrice: 2.00, total: 1200 },
    ],
    subtotal: 1200,
    taxRate: 0.0,
    tax: 0,
    total: 1200,
    status: "paid",
    issuedDate: "2024-02-28",
    dueDate: "2024-03-14",
    paidDate: "2024-03-12",
    notes: "Tax exempt",
  },
];

// ============================================================
// Mock Budget Categories
// ============================================================

export const budgetCategories: BudgetCategory[] = [
  { id: "bud-1", name: "Seeds & Plants", icon: "🌱", budgeted: 15000, actual: 12800, period: "2024-Q1", color: "text-green-500" },
  { id: "bud-2", name: "Fertilizers & Chemicals", icon: "🧪", budgeted: 22000, actual: 24500, period: "2024-Q1", color: "text-yellow-500" },
  { id: "bud-3", name: "Equipment & Maintenance", icon: "🚜", budgeted: 35000, actual: 28000, period: "2024-Q1", color: "text-orange-500" },
  { id: "bud-4", name: "Labor & Wages", icon: "👥", budgeted: 45000, actual: 43200, period: "2024-Q1", color: "text-blue-500" },
  { id: "bud-5", name: "Utilities & Water", icon: "💧", budgeted: 8000, actual: 8200, period: "2024-Q1", color: "text-cyan-500" },
  { id: "bud-6", name: "Insurance & Licenses", icon: "🛡️", budgeted: 12000, actual: 12000, period: "2024-Q1", color: "text-purple-500" },
  { id: "bud-7", name: "Livestock Feed", icon: "🐄", budgeted: 18000, actual: 16500, period: "2024-Q1", color: "text-emerald-500" },
  { id: "bud-8", name: "Marketing & Sales", icon: "📢", budgeted: 5000, actual: 3200, period: "2024-Q1", color: "text-pink-500" },
];

// ============================================================
// Mock Recurring Transactions
// ============================================================

export const recurringTransactions: RecurringTransaction[] = [
  {
    id: "rec-1",
    name: "Equipment Lease — John Deere 8R",
    description: "Monthly lease payment for tractor",
    amount: 3200,
    type: "expense",
    category: "Equipment",
    frequency: "monthly",
    nextDue: "2024-04-01",
    lastProcessed: "2024-03-01",
    status: "active",
    vendor: "John Deere Financial",
  },
  {
    id: "rec-2",
    name: "Farm Insurance Premium",
    description: "Comprehensive farm insurance",
    amount: 1500,
    type: "expense",
    category: "Insurance",
    frequency: "monthly",
    nextDue: "2024-04-05",
    lastProcessed: "2024-03-05",
    status: "active",
    vendor: "AgriSure Insurance",
  },
  {
    id: "rec-3",
    name: "Milk Contract — Green Valley",
    description: "Monthly milk supply contract",
    amount: 5800,
    type: "income",
    category: "Dairy",
    frequency: "monthly",
    nextDue: "2024-04-15",
    lastProcessed: "2024-03-13",
    status: "active",
    vendor: "Green Valley Co-op",
  },
  {
    id: "rec-4",
    name: "Internet & Software Subscriptions",
    description: "Farm management software + Starlink",
    amount: 350,
    type: "expense",
    category: "Utilities",
    frequency: "monthly",
    nextDue: "2024-04-10",
    lastProcessed: "2024-03-10",
    status: "active",
    vendor: "Various",
  },
  {
    id: "rec-5",
    name: "Property Tax Installment",
    description: "Quarterly property tax payment",
    amount: 4200,
    type: "expense",
    category: "Insurance",
    frequency: "quarterly",
    nextDue: "2024-06-15",
    lastProcessed: "2024-03-15",
    status: "active",
    vendor: "County Tax Office",
  },
  {
    id: "rec-6",
    name: "Egg Subscription — Fresh Harvest",
    description: "Weekly egg delivery to Fresh Harvest Markets",
    amount: 540,
    type: "income",
    category: "Eggs",
    frequency: "weekly",
    nextDue: "2024-03-25",
    lastProcessed: "2024-03-18",
    status: "active",
    vendor: "Fresh Harvest Markets",
  },
  {
    id: "rec-7",
    name: "CSA Box Program Revenue",
    description: "Seasonal community-supported agriculture subscriptions",
    amount: 2400,
    type: "income",
    category: "Crop Sales",
    frequency: "monthly",
    nextDue: "2024-04-01",
    lastProcessed: "2024-03-01",
    status: "active",
    vendor: "CSA Members",
  },
  {
    id: "rec-8",
    name: "Pesticide Sprayer Loan",
    description: "Equipment loan repayment",
    amount: 1800,
    type: "expense",
    category: "Equipment",
    frequency: "monthly",
    nextDue: "2024-04-20",
    lastProcessed: "2024-03-20",
    status: "active",
    vendor: "AgriLend Corp",
  },
];

// ============================================================
// Additional Mock Transactions (to enrich the ledger)
// ============================================================

export const extendedTransactions: Transaction[] = [
  { id: "tr11", type: "income", category: "Crop Sales", amount: 8500, description: "Soybean sale to ADM", date: "2024-03-05", status: "completed" },
  { id: "tr12", type: "expense", category: "Supplies", amount: 4200, description: "Seasonal seed purchase", date: "2024-03-04", status: "completed" },
  { id: "tr13", type: "income", category: "Livestock", amount: 3200, description: "Cattle auction (2 head)", date: "2024-03-03", status: "completed" },
  { id: "tr14", type: "expense", category: "Labor", amount: 2400, description: "Part-time seasonal workers", date: "2024-03-02", status: "completed" },
  { id: "tr15", type: "expense", category: "Equipment", amount: 5600, description: "Tractor repair parts", date: "2024-02-28", status: "completed" },
  { id: "tr16", type: "income", category: "Crop Sales", amount: 18000, description: "Winter wheat contract", date: "2024-02-25", status: "completed" },
  { id: "tr17", type: "expense", category: "Supplies", amount: 1200, description: "Fencing materials", date: "2024-02-22", status: "completed" },
  { id: "tr18", type: "income", category: "Dairy", amount: 5600, description: "Milk sales - February", date: "2024-02-20", status: "completed" },
  { id: "tr19", type: "expense", category: "Labor", amount: 8500, description: "February payroll", date: "2024-02-15", status: "completed" },
  { id: "tr20", type: "expense", category: "Utilities", amount: 1950, description: "Water & electricity - February", date: "2024-02-12", status: "completed" },
  { id: "tr21", type: "income", category: "Livestock", amount: 4800, description: "Wool sale", date: "2024-02-10", status: "completed" },
  { id: "tr22", type: "expense", category: "Supplies", amount: 6800, description: "Fertilizer order", date: "2024-02-08", status: "completed" },
  { id: "tr23", type: "income", category: "Eggs", amount: 2200, description: "Egg sales - February", date: "2024-02-05", status: "completed" },
  { id: "tr24", type: "expense", category: "Insurance", amount: 1500, description: "Monthly insurance premium", date: "2024-02-05", status: "completed" },
  { id: "tr25", type: "income", category: "Crop Sales", amount: 12600, description: "Apple orchard harvest", date: "2024-01-28", status: "completed" },
  { id: "tr26", type: "expense", category: "Labor", amount: 7800, description: "January payroll", date: "2024-01-31", status: "completed" },
  { id: "tr27", type: "expense", category: "Equipment", amount: 3200, description: "Drone maintenance & parts", date: "2024-01-20", status: "completed" },
  { id: "tr28", type: "income", category: "Dairy", amount: 5900, description: "Milk sales - January", date: "2024-01-18", status: "completed" },
  { id: "tr29", type: "expense", category: "Utilities", amount: 2100, description: "Water & electricity - January", date: "2024-01-15", status: "completed" },
  { id: "tr30", type: "income", category: "Crop Sales", amount: 32000, description: "Corn harvest bulk sale", date: "2024-01-10", status: "completed" },
];

// Combined transaction list
export const allTransactions: Transaction[] = [...baseTransactions, ...extendedTransactions];

// ============================================================
// Helper Functions
// ============================================================

export function getAccounts(): FinancialAccount[] {
  return accounts;
}

export function getAccountById(id: string): FinancialAccount | undefined {
  return accounts.find((a) => a.id === id);
}

export function getTotalBalance(): number {
  return accounts.reduce((sum, a) => sum + a.balance, 0);
}

export function getInvoices(): Invoice[] {
  return invoices;
}

export function getInvoiceById(id: string): Invoice | undefined {
  return invoices.find((inv) => inv.id === id);
}

export function getInvoiceStats() {
  return {
    total: invoices.length,
    paid: invoices.filter((i) => i.status === "paid").length,
    overdue: invoices.filter((i) => i.status === "overdue").length,
    draft: invoices.filter((i) => i.status === "draft").length,
    sent: invoices.filter((i) => i.status === "sent").length,
    totalOutstanding: invoices
      .filter((i) => i.status === "sent" || i.status === "overdue")
      .reduce((sum, i) => sum + i.total, 0),
    totalPaid: invoices
      .filter((i) => i.status === "paid")
      .reduce((sum, i) => sum + i.total, 0),
  };
}

export function getBudgetCategories(): BudgetCategory[] {
  return budgetCategories;
}

export function getBudgetComparison() {
  const totalBudgeted = budgetCategories.reduce((sum, c) => sum + c.budgeted, 0);
  const totalActual = budgetCategories.reduce((sum, c) => sum + c.actual, 0);
  return {
    categories: budgetCategories,
    totalBudgeted,
    totalActual,
    variance: totalBudgeted - totalActual,
    variancePercent: totalBudgeted > 0 ? ((totalBudgeted - totalActual) / totalBudgeted) * 100 : 0,
  };
}

export function getRecurringTransactions(): RecurringTransaction[] {
  return recurringTransactions;
}

export function getActiveRecurring(): RecurringTransaction[] {
  return recurringTransactions.filter((r) => r.status === "active");
}

export function getUpcomingBills(days = 30): RecurringTransaction[] {
  const now = new Date();
  const cutoff = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
  return recurringTransactions.filter((r) => {
    if (r.status !== "active") return false;
    const dueDate = new Date(r.nextDue);
    return dueDate >= now && dueDate <= cutoff;
  });
}

export function getMonthlyUpcomingBillsTotal(): number {
  return getUpcomingBills(30).reduce((sum, r) => sum + r.amount, 0);
}

/**
 * Get all unique categories from transactions
 */
export function getTransactionCategories(): string[] {
  const cats = new Set(allTransactions.map((t) => t.category));
  return Array.from(cats).sort();
}

/**
 * Get financial summary stats
 */
export function getFinancialSummary() {
  const completed = allTransactions.filter((t) => t.status === "completed");
  const totalRevenue = completed
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = completed
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);
  const netProfit = totalRevenue - totalExpenses;
  const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

  return {
    totalRevenue,
    totalExpenses,
    netProfit,
    profitMargin: Math.round(profitMargin * 10) / 10,
    transactionCount: allTransactions.length,
    pendingCount: allTransactions.filter((t) => t.status === "pending").length,
  };
}

/**
 * Get transactions grouped by month for cash flow analysis
 */
export function getTransactionsByMonth() {
  const monthly: Record<string, { income: number; expenses: number }> = {};

  for (const t of allTransactions) {
    if (t.status !== "completed") continue;
    const month = t.date.slice(0, 7); // "2024-03"
    if (!monthly[month]) monthly[month] = { income: 0, expenses: 0 };
    if (t.type === "income") monthly[month].income += t.amount;
    else monthly[month].expenses += t.amount;
  }

  return Object.entries(monthly)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, data]) => ({
      month,
      label: new Date(month + "-01").toLocaleDateString("en-US", {
        month: "short",
        year: "2-digit",
      }),
      ...data,
      net: data.income - data.expenses,
    }));
}

/**
 * Get year-to-date summary
 */
export function getYearToDate(): { revenue: number; expenses: number; profit: number } {
  const currentYear = new Date().getFullYear().toString();
  const ytdTransactions = allTransactions.filter(
    (t) => t.date.startsWith(currentYear) && t.status === "completed"
  );
  const revenue = ytdTransactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
  const expenses = ytdTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);
  return { revenue, expenses, profit: revenue - expenses };
}

/**
 * Format currency (delegates to utils.formatCurrency but included for convenience)
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Generate a cash flow projection for upcoming months
 */
export function getCashFlowProjection(months = 6): CashFlowProjection[] {
  const projections: CashFlowProjection[] = [];
  const now = new Date();

  for (let i = 0; i < months; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });

    // Project recurring income/expenses for this month
    let projectedIncome = 0;
    let projectedExpenses = 0;

    for (const rec of recurringTransactions) {
      if (rec.status !== "active") continue;
      const dueDate = new Date(rec.nextDue);
      const dueMonth = dueDate.getMonth();
      const dueYear = dueDate.getFullYear();

      // Check if this recurring falls in this projection month
      if (rec.frequency === "monthly") {
        // Always add for all months (simplified)
        if (rec.type === "income") projectedIncome += rec.amount;
        else projectedExpenses += rec.amount;
      } else if (rec.frequency === "weekly") {
        // ~4 weeks per month
        const weeklyAmount = rec.amount * 4;
        if (rec.type === "income") projectedIncome += weeklyAmount;
        else projectedExpenses += weeklyAmount;
      } else if (rec.frequency === "quarterly") {
        // Check if this quarter matches
        const dueQuarter = Math.floor(dueMonth / 3);
        const projQuarter = Math.floor(d.getMonth() / 3);
        if (dueQuarter === projQuarter && dueYear === d.getFullYear()) {
          if (rec.type === "income") projectedIncome += rec.amount;
          else projectedExpenses += rec.amount;
        }
      } else if (rec.frequency === "yearly") {
        if (dueMonth === d.getMonth() && dueYear === d.getFullYear()) {
          if (rec.type === "income") projectedIncome += rec.amount;
          else projectedExpenses += rec.amount;
        }
      }
    }

    projections.push({
      month: monthKey,
      label,
      projectedIncome: Math.round(projectedIncome),
      projectedExpenses: Math.round(projectedExpenses),
    });
  }

  return projections;
}
