"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { analyticsData, transactions } from "@/lib/data";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  TrendingUp,
  DollarSign,
  Sprout,
  Droplets,
  Activity,
  BarChart3,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
} from "lucide-react";

const COLORS = ["#22c55e", "#eab308", "#3b82f6", "#ef4444", "#a855f7", "#f97316"];

export default function AnalyticsPage() {
  const totalRevenue = transactions
    .filter((t) => t.type === "income" && t.status === "completed")
    .reduce((acc, t) => acc + t.amount, 0);
  const totalExpenses = transactions
    .filter((t) => t.type === "expense" && t.status === "completed")
    .reduce((acc, t) => acc + t.amount, 0);
  const profit = totalRevenue - totalExpenses;

  const expenseByCategory = transactions
    .filter((t) => t.type === "expense" && t.status === "completed")
    .reduce((acc: Record<string, number>, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {});

  const expensePieData = Object.entries(expenseByCategory).map(([name, value]) => ({
    name,
    value,
  }));

  const incomeByCategory = transactions
    .filter((t) => t.type === "income" && t.status === "completed")
    .reduce((acc: Record<string, number>, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {});

  const incomePieData = Object.entries(incomeByCategory).map(([name, value]) => ({
    name,
    value,
  }));

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-muted-foreground mt-1">Comprehensive farm analytics and insights</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Revenue", value: `$${totalRevenue.toLocaleString()}`, change: "+15%", icon: DollarSign, color: "text-green-500" },
          { label: "Total Expenses", value: `$${totalExpenses.toLocaleString()}`, change: "+8%", icon: DollarSign, color: "text-red-500" },
          { label: "Net Profit", value: `$${profit.toLocaleString()}`, change: "+22%", icon: TrendingUp, color: "text-primary" },
          { label: "Profit Margin", value: `${((profit / totalRevenue) * 100).toFixed(1)}%`, change: "+3%", icon: Activity, color: "text-blue-500" },
        ].map((stat, i) => (
          <Card key={i}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-muted-foreground">{stat.label}</span>
                <stat.icon size={18} className={stat.color} />
              </div>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-xs text-green-500 mt-1">{stat.change} vs last month</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Yield Prediction */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp size={16} className="text-primary" />
              Yield Prediction
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analyticsData.yieldPrediction}>
                  <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} />
                  <XAxis dataKey="year" stroke="currentColor" opacity={0.5} fontSize={12} />
                  <YAxis stroke="currentColor" opacity={0.5} fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      background: "var(--glass-bg)",
                      backdropFilter: "blur(20px)",
                      border: "1px solid var(--glass-border)",
                      borderRadius: "12px",
                    }}
                  />
                  <Line type="monotone" dataKey="wheat" stroke="#22c55e" strokeWidth={2} dot={{ fill: "#22c55e" }} name="Wheat" />
                  <Line type="monotone" dataKey="corn" stroke="#eab308" strokeWidth={2} dot={{ fill: "#eab308" }} name="Corn" />
                  <Line type="monotone" dataKey="soybeans" stroke="#3b82f6" strokeWidth={2} dot={{ fill: "#3b82f6" }} name="Soybeans" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Crop Health */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity size={16} className="text-primary" />
              Crop Health Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analyticsData.cropHealth}>
                  <defs>
                    <linearGradient id="wheatGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} />
                  <XAxis dataKey="month" stroke="currentColor" opacity={0.5} fontSize={12} />
                  <YAxis stroke="currentColor" opacity={0.5} fontSize={12} />
                  <Tooltip />
                  <Area type="monotone" dataKey="wheat" stroke="#22c55e" fill="url(#wheatGrad)" strokeWidth={2} name="Wheat" />
                  <Area type="monotone" dataKey="corn" stroke="#eab308" fillOpacity={0.3} fill="#eab308" strokeWidth={2} name="Corn" />
                  <Area type="monotone" dataKey="soybeans" stroke="#3b82f6" fillOpacity={0.3} fill="#3b82f6" strokeWidth={2} name="Soybeans" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Expense Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChartIcon size={16} className="text-primary" />
              Expense Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expensePieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {expensePieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Income Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 size={16} className="text-primary" />
              Income by Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={incomePieData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} />
                  <XAxis dataKey="name" stroke="currentColor" opacity={0.5} fontSize={12} />
                  <YAxis stroke="currentColor" opacity={0.5} fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="value" name="Amount" radius={[4, 4, 0, 0]}>
                    {incomePieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue vs Expenses Bar Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Revenue vs Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analyticsData.revenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} />
                <XAxis dataKey="month" stroke="currentColor" opacity={0.5} fontSize={12} />
                <YAxis stroke="currentColor" opacity={0.5} fontSize={12} />
                <Tooltip />
                <Legend />
                <Bar dataKey="income" name="Income" fill="#22c55e" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expenses" name="Expenses" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

