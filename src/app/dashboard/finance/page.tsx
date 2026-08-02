"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  allTransactions,
  getAccounts,
  getFinancialSummary,
  getInvoices,
  getInvoiceStats,
  getBudgetComparison,
  getActiveRecurring,
  getUpcomingBills,
  getMonthlyUpcomingBillsTotal,
  getTransactionCategories,
  getTransactionsByMonth,
  getCashFlowProjection,
  formatCurrency,
  type FinancialAccount,
  type Invoice,
  type RecurringTransaction,
  type BudgetCategory,
  type CashFlowProjection,
} from "@/lib/finance-data";
import { formatDate } from "@/lib/utils";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  CreditCard,
  Plus,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  Receipt,
  FileText,
  Download,
  Printer,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle2,
  X,
  Building2,
  Wallet,
  Landmark,
  BarChart3,
  RefreshCw,
  ChevronRight,
  Eye,
  FileDown,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  Cell,
} from "recharts";

const COLORS = ["#22c55e", "#eab308", "#3b82f6", "#ef4444", "#a855f7", "#f97316", "#06b6d4", "#84cc16"];

const accountTypeIcons: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  checking: Wallet,
  savings: PiggyBank,
  credit: CreditCard,
  cash: DollarSign,
};

const invoiceStatusVariant: Record<string, "success" | "warning" | "destructive" | "secondary" | "info"> = {
  paid: "success",
  sent: "info",
  draft: "secondary",
  overdue: "destructive",
  cancelled: "secondary",
};

const recurringStatusVariant: Record<string, "success" | "warning" | "secondary"> = {
  active: "success",
  paused: "warning",
  cancelled: "secondary",
};

export default function FinancePage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("All");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [selectedTransaction, setSelectedTransaction] = useState<typeof allTransactions[0] | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const summary = useMemo(() => getFinancialSummary(), []);
  const accounts = useMemo(() => getAccounts(), []);
  const invoices = useMemo(() => getInvoices(), []);
  const invoiceStats = useMemo(() => getInvoiceStats(), []);
  const budgetComparison = useMemo(() => getBudgetComparison(), []);
  const activeRecurring = useMemo(() => getActiveRecurring(), []);
  const upcomingBills = useMemo(() => getUpcomingBills(30), []);
  const upcomingBillsTotal = useMemo(() => getMonthlyUpcomingBillsTotal(), []);
  const categories = useMemo(() => getTransactionCategories(), []);
  const monthlyData = useMemo(() => getTransactionsByMonth(), []);
  const cashFlowProjection = useMemo(() => getCashFlowProjection(6), []);

  // Filtered transactions
  const filteredTransactions = allTransactions.filter((t) => {
    const matchesSearch =
      t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === "All" || t.type === typeFilter;
    const matchesCategory = categoryFilter === "All" || t.category === categoryFilter;
    return matchesSearch && matchesType && matchesCategory;
  });

  // Budget chart data
  const budgetChartData = budgetComparison.categories.map((c) => ({
    name: c.name.split(" ")[0],
    budgeted: c.budgeted,
    actual: c.actual,
    color: c.color,
  }));

  // Cash flow chart data (combine historical + projection)
  const cashFlowData = [
    ...monthlyData.map((m) => ({
      label: m.label,
      income: m.income,
      expenses: m.expenses,
    })),
    ...cashFlowProjection.map((p) => ({
      label: p.label,
      income: p.projectedIncome,
      expenses: p.projectedExpenses,
      projected: true,
    })),
  ];

  const tabs = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "transactions", label: "Transactions", icon: DollarSign },
    { id: "invoices", label: "Invoices", icon: FileText },
    { id: "budget", label: "Budget", icon: PiggyBank },
    { id: "recurring", label: "Recurring", icon: RefreshCw },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold">Financial Ledger</h1>
          <p className="text-muted-foreground mt-1">
            Manage accounts, track transactions, invoices, and budgets
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="glass"
            size="sm"
            onClick={() => {
              import("@/lib/export-service").then((m) => {
                m.exportTransactionsToCsv(allTransactions);
              });
            }}
          >
            <Download size={14} className="mr-1" />
            Export CSV
          </Button>
          <Button
            variant="glass"
            size="sm"
            onClick={() => {
              import("@/lib/export-service").then((m) => {
                m.printFinancialReport();
              });
            }}
          >
            <Printer size={14} className="mr-1" />
            Print Report
          </Button>
          <Button size="sm">
            <Plus size={14} className="mr-1" />
            Add Transaction
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Revenue", value: formatCurrency(summary.totalRevenue), change: "+12% vs last month", icon: TrendingUp, color: "text-green-500" },
          { label: "Total Expenses", value: formatCurrency(summary.totalExpenses), change: "+8% vs last month", icon: TrendingDown, color: "text-red-500" },
          { label: "Net Profit", value: formatCurrency(summary.netProfit), change: `${summary.profitMargin}% margin`, icon: DollarSign, color: "text-primary" },
          { label: "Pending", value: summary.pendingCount.toString(), change: `${summary.transactionCount} total transactions`, icon: Clock, color: "text-yellow-500" },
        ].map((stat, i) => (
          <Card key={i}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-muted-foreground">{stat.label}</span>
                <div className={`w-9 h-9 rounded-xl bg-current/10 flex items-center justify-center ${stat.color}`}>
                  <stat.icon size={16} />
                </div>
              </div>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 overflow-x-auto pb-1 border-b border-border">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-all border-b-2 -mb-[1px] ${
                activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon size={14} className="inline mr-1.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ===== OVERVIEW TAB ===== */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Accounts */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {accounts.map((account) => {
              const Icon = accountTypeIcons[account.type] || Building2;
              const isNegative = account.balance < 0;
              return (
                <Card key={account.id} className="overflow-hidden">
                  <div className={`h-2 bg-gradient-to-r ${account.color}`} />
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${account.color} flex items-center justify-center`}>
                          <Icon size={16} className="text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{account.name}</p>
                          <p className="text-[10px] text-muted-foreground">{account.institution}</p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="text-[9px]">{account.type}</Badge>
                    </div>
                    <p className={`text-xl font-bold ${isNegative ? "text-red-500" : "text-foreground"}`}>
                      {formatCurrency(account.balance)}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      {account.accountNumber} · Last: {account.lastTransaction}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Cash Flow + Quick Actions */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Cash Flow Chart */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <TrendingUp size={16} className="text-primary" />
                  Cash Flow (Historical + Projected)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={cashFlowData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} />
                      <XAxis dataKey="label" stroke="currentColor" opacity={0.5} fontSize={11} />
                      <YAxis stroke="currentColor" opacity={0.5} fontSize={11} />
                      <Tooltip
                        contentStyle={{
                          background: "var(--glass-bg)",
                          backdropFilter: "blur(20px)",
                          border: "1px solid var(--glass-border)",
                          borderRadius: "12px",
                          fontSize: "12px",
                        }}
                      />
                      <Bar dataKey="income" name="Income" fill="#22c55e" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="expenses" name="Expenses" fill="#ef4444" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {[
                    { label: "Record Income", icon: TrendingUp, color: "text-green-500 bg-green-500/10" },
                    { label: "Record Expense", icon: TrendingDown, color: "text-red-500 bg-red-500/10" },
                    { label: "Transfer Funds", icon: ArrowUpRight, color: "text-blue-500 bg-blue-500/10" },
                    { label: "Create Invoice", icon: FileText, color: "text-purple-500 bg-purple-500/10" },
                  ].map((action, i) => (
                    <button
                      key={i}
                      className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-all text-left"
                    >
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${action.color}`}>
                        <action.icon size={16} />
                      </div>
                      <span className="text-sm font-medium flex-1">{action.label}</span>
                      <ChevronRight size={14} className="text-muted-foreground" />
                    </button>
                  ))}
                </CardContent>
              </Card>

              {/* Upcoming Bills */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Clock size={14} className="text-primary" />
                    Upcoming Bills (30 days)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-red-500">{formatCurrency(upcomingBillsTotal)}</p>
                  <p className="text-xs text-muted-foreground mt-1">{upcomingBills.length} bills due</p>
                  <div className="mt-3 space-y-1">
                    {upcomingBills.slice(0, 4).map((bill) => (
                      <div key={bill.id} className="flex justify-between text-xs">
                        <span className="text-muted-foreground truncate">{bill.name}</span>
                        <span className="font-medium">{formatCurrency(bill.amount)}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* ===== TRANSACTIONS TAB ===== */}
      {activeTab === "transactions" && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search transactions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="h-10 px-3 rounded-xl border border-border bg-background text-xs focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="All">All Types</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="h-10 px-3 rounded-xl border border-border bg-background text-xs focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="All">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Transaction List */}
          <Card>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {filteredTransactions.length > 0 ? (
                  filteredTransactions.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setSelectedTransaction(t)}
                      className="w-full flex items-center gap-4 p-4 hover:bg-muted/50 transition-all text-left"
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        t.type === "income" ? "bg-green-500/10" : "bg-red-500/10"
                      }`}>
                        {t.type === "income" ? (
                          <ArrowUpRight size={18} className="text-green-500" />
                        ) : (
                          <ArrowDownRight size={18} className="text-red-500" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{t.description}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                          <span>{t.category}</span>
                          <span>·</span>
                          <span>{formatDate(t.date)}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-semibold ${
                          t.type === "income" ? "text-green-500" : "text-red-500"
                        }`}>
                          {t.type === "income" ? "+" : "-"}{formatCurrency(t.amount)}
                        </p>
                        <Badge
                          variant={
                            t.status === "completed" ? "success" :
                            t.status === "pending" ? "warning" : "destructive"
                          }
                          className="text-[9px] px-1.5"
                        >
                          {t.status}
                        </Badge>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="p-12 text-center">
                    <DollarSign size={40} className="mx-auto text-muted-foreground/30 mb-4" />
                    <p className="text-muted-foreground font-medium">No transactions found</p>
                    <p className="text-sm text-muted-foreground/60 mt-1">Try adjusting your search or filters</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ===== INVOICES TAB ===== */}
      {activeTab === "invoices" && (
        <div className="space-y-6">
          {/* Invoice Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              { label: "Total", value: invoiceStats.total, color: "text-foreground" },
              { label: "Paid", value: invoiceStats.paid, color: "text-green-500" },
              { label: "Sent", value: invoiceStats.sent, color: "text-blue-500" },
              { label: "Overdue", value: invoiceStats.overdue, color: "text-red-500" },
              { label: "Draft", value: invoiceStats.draft, color: "text-muted-foreground" },
            ].map((stat, i) => (
              <Card key={i}>
                <CardContent className="p-4 text-center">
                  <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Outstanding summary */}
          <div className="grid sm:grid-cols-2 gap-4">
            <Card className="border-green-500/20">
              <CardContent className="p-4 flex items-center gap-3">
                <CheckCircle2 size={20} className="text-green-500" />
                <div>
                  <p className="text-sm font-medium">Total Collected</p>
                  <p className="text-lg font-bold text-green-500">{formatCurrency(invoiceStats.totalPaid)}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-red-500/20">
              <CardContent className="p-4 flex items-center gap-3">
                <AlertTriangle size={20} className="text-red-500" />
                <div>
                  <p className="text-sm font-medium">Outstanding</p>
                  <p className="text-lg font-bold text-red-500">{formatCurrency(invoiceStats.totalOutstanding)}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Invoice List */}
          <Card>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {invoices.map((inv) => (
                  <button
                    key={inv.id}
                    onClick={() => setSelectedInvoice(inv)}
                    className="w-full flex items-center gap-4 p-4 hover:bg-muted/50 transition-all text-left"
                  >
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <FileText size={18} className="text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{inv.number}</p>
                      <p className="text-xs text-muted-foreground">{inv.clientName}</p>
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5">
                        <Calendar size={10} />
                        <span>Due: {formatDate(inv.dueDate)}</span>
                        {inv.paidDate && (
                          <>
                            <span>·</span>
                            <CheckCircle2 size={10} className="text-green-500" />
                            <span>Paid: {formatDate(inv.paidDate)}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold">{formatCurrency(inv.total)}</p>
                      <Badge variant={invoiceStatusVariant[inv.status]} className="text-[9px] px-1.5">
                        {inv.status}
                      </Badge>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ===== BUDGET TAB ===== */}
      {activeTab === "budget" && (
        <div className="space-y-6">
          {/* Budget Summary */}
          <div className="grid sm:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-xs text-muted-foreground">Total Budgeted</p>
                <p className="text-2xl font-bold">{formatCurrency(budgetComparison.totalBudgeted)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-xs text-muted-foreground">Total Spent</p>
                <p className="text-2xl font-bold">{formatCurrency(budgetComparison.totalActual)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-xs text-muted-foreground">Variance</p>
                <p className={`text-2xl font-bold ${budgetComparison.variance >= 0 ? "text-green-500" : "text-red-500"}`}>
                  {budgetComparison.variance >= 0 ? "+" : ""}{formatCurrency(budgetComparison.variance)}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Budget vs Actual Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Budget vs Actual by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={budgetChartData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} />
                    <XAxis type="number" stroke="currentColor" opacity={0.5} fontSize={11} />
                    <YAxis dataKey="name" type="category" stroke="currentColor" opacity={0.5} fontSize={10} width={80} />
                    <Tooltip
                      contentStyle={{
                        background: "var(--glass-bg)",
                        backdropFilter: "blur(20px)",
                        border: "1px solid var(--glass-border)",
                        borderRadius: "12px",
                        fontSize: "12px",
                      }}
                    />
                    <Bar dataKey="budgeted" name="Budgeted" fill="#22c55e" radius={[0, 4, 4, 0]} />
                    <Bar dataKey="actual" name="Actual" fill="#eab308" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Budget Details */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {budgetComparison.categories.map((cat) => {
              const percent = cat.budgeted > 0 ? Math.round((cat.actual / cat.budgeted) * 100) : 0;
              const isOver = cat.actual > cat.budgeted;
              return (
                <Card key={cat.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm">{cat.icon} {cat.name}</span>
                      <Badge variant={isOver ? "destructive" : "success"} className="text-[9px]">
                        {percent}%
                      </Badge>
                    </div>
                    <Progress
                      value={Math.min(percent, 100)}
                      variant={isOver ? "danger" : "success"}
                      className="h-1.5 mb-2"
                    />
                    <div className="flex justify-between text-[10px] text-muted-foreground">
                      <span>Budget: {formatCurrency(cat.budgeted)}</span>
                      <span>Spent: {formatCurrency(cat.actual)}</span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* ===== RECURRING TAB ===== */}
      {activeTab === "recurring" && (
        <div className="space-y-6">
          {/* Summary */}
          <div className="grid sm:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-xs text-muted-foreground">Active Recurring</p>
                <p className="text-2xl font-bold">{activeRecurring.length}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-xs text-muted-foreground">Monthly Recurring Expense</p>
                <p className="text-2xl font-bold text-red-500">
                  {formatCurrency(
                    activeRecurring
                      .filter((r) => r.type === "expense" && r.frequency === "monthly")
                      .reduce((s, r) => s + r.amount, 0)
                  )}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-xs text-muted-foreground">Monthly Recurring Income</p>
                <p className="text-2xl font-bold text-green-500">
                  {formatCurrency(
                    activeRecurring
                      .filter((r) => r.type === "income" && r.frequency === "monthly")
                      .reduce((s, r) => s + r.amount, 0)
                  )}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recurring List */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeRecurring.map((rec) => (
              <Card key={rec.id}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                        rec.type === "income" ? "bg-green-500/10" : "bg-red-500/10"
                      }`}>
                        {rec.type === "income" ? (
                          <TrendingUp size={16} className="text-green-500" />
                        ) : (
                          <TrendingDown size={16} className="text-red-500" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{rec.name}</p>
                        <p className="text-[10px] text-muted-foreground">{rec.category}</p>
                      </div>
                    </div>
                    <Badge variant={recurringStatusVariant[rec.status]} className="text-[9px]">
                      {rec.frequency}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">{rec.description}</p>
                  <div className="flex items-center justify-between">
                    <p className={`text-lg font-bold ${
                      rec.type === "income" ? "text-green-500" : "text-red-500"
                    }`}>
                      {rec.type === "income" ? "+" : "-"}{formatCurrency(rec.amount)}
                    </p>
                    <span className="text-[10px] text-muted-foreground">
                      Next: {formatDate(rec.nextDue)}
                    </span>
                  </div>
                  {rec.vendor && (
                    <p className="text-[10px] text-muted-foreground mt-2">{rec.vendor}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ===== TRANSACTION DETAIL MODAL ===== */}
      <AnimatePresence>
        {selectedTransaction && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
          >
            <div className="absolute inset-0 bg-black/50" onClick={() => setSelectedTransaction(null)} />
            <Card className="relative max-w-md w-full">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                      selectedTransaction.type === "income" ? "bg-green-500/10" : "bg-red-500/10"
                    }`}>
                      {selectedTransaction.type === "income" ? (
                        <ArrowUpRight size={22} className="text-green-500" />
                      ) : (
                        <ArrowDownRight size={22} className="text-red-500" />
                      )}
                    </div>
                    <div>
                      <CardTitle className="text-base">{selectedTransaction.description}</CardTitle>
                      <p className="text-sm text-muted-foreground">{selectedTransaction.category}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setSelectedTransaction(null)}>
                    <X size={16} />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center py-4">
                  <p className="text-3xl font-bold">
                    <span className={selectedTransaction.type === "income" ? "text-green-500" : "text-red-500"}>
                      {selectedTransaction.type === "income" ? "+" : "-"}{formatCurrency(selectedTransaction.amount)}
                    </span>
                  </p>
                  <Badge
                    variant={
                      selectedTransaction.status === "completed" ? "success" :
                      selectedTransaction.status === "pending" ? "warning" : "destructive"
                    }
                    className="mt-2"
                  >
                    {selectedTransaction.status}
                  </Badge>
                </div>

                <Separator />

                <div className="space-y-3">
                  {[
                    { label: "Date", value: formatDate(selectedTransaction.date), icon: Calendar },
                    { label: "Type", value: selectedTransaction.type, icon: DollarSign },
                    { label: "Category", value: selectedTransaction.category, icon: FileText },
                    { label: "Status", value: selectedTransaction.status, icon: Clock },
                  ].map((stat, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <stat.icon size={14} />
                        <span>{stat.label}</span>
                      </div>
                      <span className="font-medium capitalize">{stat.value}</span>
                    </div>
                  ))}
                </div>

                <div className="flex gap-3 pt-2">
                  <Button variant="outline" className="flex-1" onClick={() => setSelectedTransaction(null)}>
                    Close
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <FileDown size={14} className="mr-1" />
                    Receipt
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== INVOICE DETAIL MODAL ===== */}
      <AnimatePresence>
        {selectedInvoice && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
          >
            <div className="absolute inset-0 bg-black/50" onClick={() => setSelectedInvoice(null)} />
            <Card className="relative max-w-lg w-full max-h-[85vh] overflow-y-auto">
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                      <FileText size={22} className="text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{selectedInvoice.number}</CardTitle>
                      <p className="text-sm text-muted-foreground">{selectedInvoice.clientName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={invoiceStatusVariant[selectedInvoice.status]}>{selectedInvoice.status}</Badge>
                    <Button variant="ghost" size="icon" onClick={() => setSelectedInvoice(null)}>
                      <X size={16} />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Client Info */}
                <div className="glass rounded-xl p-4">
                  <p className="text-xs font-medium text-muted-foreground mb-2">Client</p>
                  <p className="text-sm font-medium">{selectedInvoice.clientName}</p>
                  <p className="text-xs text-muted-foreground">{selectedInvoice.clientEmail}</p>
                  <p className="text-xs text-muted-foreground mt-1">{selectedInvoice.clientAddress}</p>
                </div>

                {/* Invoice Items */}
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2">Line Items</p>
                  <div className="space-y-2">
                    {selectedInvoice.items.map((item, i) => (
                      <div key={i} className="flex items-center justify-between text-sm">
                        <div className="flex-1">
                          <p className="font-medium">{item.description}</p>
                          <p className="text-xs text-muted-foreground">{item.quantity} × {formatCurrency(item.unitPrice)}</p>
                        </div>
                        <p className="font-medium">{formatCurrency(item.total)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Totals */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatCurrency(selectedInvoice.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax ({(selectedInvoice.taxRate * 100).toFixed(0)}%)</span>
                    <span>{formatCurrency(selectedInvoice.tax)}</span>
                  </div>
                  <div className="flex justify-between text-base font-bold">
                    <span>Total</span>
                    <span>{formatCurrency(selectedInvoice.total)}</span>
                  </div>
                </div>

                <Separator />

                {/* Dates */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="glass rounded-xl p-3 text-center">
                    <Calendar size={14} className="mx-auto mb-1 text-primary" />
                    <p className="text-[10px] text-muted-foreground">Issued</p>
                    <p className="text-xs font-medium">{formatDate(selectedInvoice.issuedDate)}</p>
                  </div>
                  <div className="glass rounded-xl p-3 text-center">
                    <Calendar size={14} className="mx-auto mb-1 text-primary" />
                    <p className="text-[10px] text-muted-foreground">Due</p>
                    <p className="text-xs font-medium">{formatDate(selectedInvoice.dueDate)}</p>
                  </div>
                </div>

                {selectedInvoice.notes && (
                  <div className="glass rounded-xl p-3">
                    <p className="text-xs font-medium text-muted-foreground mb-1">Notes</p>
                    <p className="text-sm">{selectedInvoice.notes}</p>
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <Button className="flex-1">
                    <Eye size={14} className="mr-1" />
                    View Full
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Download size={14} className="mr-1" />
                    Download PDF
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
