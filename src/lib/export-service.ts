/**
 * Export Service
 *
 * Provides CSV and print-friendly export functionality
 * for farm data (fields, transactions, tasks, etc.)
 */

import { fields, transactions, tasks } from "@/lib/data";
import type { Field, Transaction, Task } from "@/lib/data";

// ============================================================
// Types
// ============================================================

export interface ExportColumn {
  key: string;
  label: string;
}

export interface ExportRow {
  [key: string]: string | number | boolean | null | undefined;
}

// ============================================================
// CSV Export
// ============================================================

/**
 * Convert data to CSV string
 */
function toCsvString(columns: ExportColumn[], data: ExportRow[]): string {
  // Header row
  const header = columns.map((c) => escapeCsvField(c.label)).join(",");

  // Data rows
  const rows = data.map((row) =>
    columns.map((col) => escapeCsvField(formatValue(row[col.key]))).join(",")
  );

  return [header, ...rows].join("\r\n");
}

/**
 * Escape a field value for CSV (handle commas, quotes, newlines)
 */
function escapeCsvField(value: string): string {
  const str = String(value ?? "");
  if (
    str.includes(",") ||
    str.includes('"') ||
    str.includes("\n") ||
    str.includes("\r")
  ) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

/**
 * Format a cell value for display in export
 */
function formatValue(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "number") {
    return value.toLocaleString("en-US");
  }
  return String(value);
}

/**
 * Trigger a CSV file download in the browser
 */
function downloadCsv(csv: string, filename: string): void {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;bom" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export data as CSV and trigger download
 */
export function exportToCsv(
  columns: ExportColumn[],
  data: ExportRow[],
  filename: string
): void {
  const csv = toCsvString(columns, data);
  downloadCsv(csv, filename);
  console.log("Exported " + data.length + " rows to " + filename + ".csv");
}

// ============================================================
// Print / PDF Export
// ============================================================

/**
 * Escape HTML special characters
 */
function escapeHtml(str: string): string {
  const a = String.fromCharCode(38);
  return str
    .replace(new RegExp(a, "g"), a + "amp;")
    .replace(/</g, a + "lt;")
    .replace(/>/g, a + "gt;")
    .replace(/"/g, a + "quot;")
    .replace(/'/g, a + "#039;");
}

/**
 * Open a print-friendly view of the data
 */
export function printReport(
  title: string,
  columns: ExportColumn[],
  data: ExportRow[],
  summary?: { label: string; value: string }[]
): void {
  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    console.error("Could not open print window");
    return;
  }

  const styles = [
    "<style>",
    "* { margin: 0; padding: 0; box-sizing: border-box; }",
    "body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1a1a2e; padding: 40px; -webkit-print-color-adjust: exact; print-color-adjust: exact; }",
    "h1 { font-size: 24px; margin-bottom: 8px; }",
    ".subtitle { color: #666; margin-bottom: 24px; font-size: 14px; }",
    ".summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 16px; margin-bottom: 32px; }",
    ".summary-card { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 16px; text-align: center; }",
    ".summary-card .value { font-size: 22px; font-weight: bold; color: #16a34a; }",
    ".summary-card .label { font-size: 12px; color: #666; margin-top: 4px; }",
    "table { width: 100%; border-collapse: collapse; margin-top: 16px; }",
    "th { background: #f4f4f5; text-align: left; padding: 10px 12px; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; color: #71717a; border-bottom: 2px solid #e4e4e7; }",
    "td { padding: 10px 12px; font-size: 13px; border-bottom: 1px solid #e4e4e7; }",
    "tr:last-child td { border-bottom: none; }",
    ".footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #e4e4e7; font-size: 11px; color: #a1a1aa; text-align: center; }",
    "@media print { body { padding: 20px; } button { display: none; } }",
    "</style>",
  ].join("\n");

  const summaryHtml = summary
    ? [
        '<div class="summary">',
        ...summary.map(
          (s) =>
            '<div class="summary-card"><div class="value">' +
            escapeHtml(s.value) +
            '</div><div class="label">' +
            escapeHtml(s.label) +
            "</div></div>"
        ),
        "</div>",
      ].join("\n")
    : "";

  const headerRow = columns
    .map((c) => "<th>" + escapeHtml(c.label) + "</th>")
    .join("");

  const dataRows = data
    .map(
      (row) =>
        "<tr>" +
        columns
          .map((col) => "<td>" + escapeHtml(formatValue(row[col.key])) + "</td>")
          .join("") +
        "</tr>"
    )
    .join("");

  const dateStr = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const html = [
    "<!DOCTYPE html>",
    "<html>",
    "<head><title>" + escapeHtml(title) + "</title>" + styles + "</head>",
    "<body>",
    '<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:16px;">',
    "<div><h1>" + escapeHtml(title) + '</h1><p class="subtitle">AgroVision Report \u00b7 Generated ' + dateStr + "</p></div>",
    '<button onclick="window.print()" style="padding:8px 20px;background:#16a34a;color:white;border:none;border-radius:8px;cursor:pointer;font-size:14px;">Print / Save PDF</button>',
    "</div>",
    summaryHtml,
    "<table><thead><tr>" + headerRow + "</tr></thead><tbody>" + dataRows + "</tbody></table>",
    '<div class="footer">AgroVision \u00b7 Digital Twin of Your Farm \u00b7 Report generated ' + dateStr + "</div>",
    "<script>setTimeout(function() { window.print(); }, 500);</script>",
    "</body>",
    "</html>",
  ].join("\n");

  printWindow.document.write(html);
  printWindow.document.close();
}

// ============================================================
// Pre-built Exporters for Common Data Types
// ============================================================

/**
 * Export fields data to CSV
 */
export function exportFieldsToCsv() {
  const columns: ExportColumn[] = [
    { key: "name", label: "Field Name" },
    { key: "cropType", label: "Crop Type" },
    { key: "area", label: "Area (ha)" },
    { key: "health", label: "Health (%)" },
    { key: "moisture", label: "Moisture (%)" },
    { key: "nitrogen", label: "Nitrogen (%)" },
    { key: "growthStage", label: "Growth Stage" },
    { key: "expectedYield", label: "Expected Yield (kg)" },
    { key: "lastIrrigation", label: "Last Irrigation" },
    { key: "lastFertilization", label: "Last Fertilization" },
  ];

  const data: ExportRow[] = fields.map((f: Field) => ({
    name: f.name,
    cropType: f.cropType,
    area: f.area,
    health: f.health,
    moisture: f.moisture,
    nitrogen: f.nitrogen,
    growthStage: f.growthStage,
    expectedYield: f.expectedYield,
    lastIrrigation: f.lastIrrigation,
    lastFertilization: f.lastFertilization,
  }));

  exportToCsv(columns, data, "fields-export-" + new Date().toISOString().split("T")[0]);
}

/**
 * Print fields report
 */
export function printFieldsReport() {
  const columns: ExportColumn[] = [
    { key: "name", label: "Field Name" },
    { key: "cropType", label: "Crop Type" },
    { key: "area", label: "Area (ha)" },
    { key: "health", label: "Health (%)" },
    { key: "growthStage", label: "Growth Stage" },
  ];

  const data: ExportRow[] = fields.map((f: Field) => ({
    name: f.name,
    cropType: f.cropType,
    area: f.area,
    health: f.health,
    growthStage: f.growthStage,
  }));

  const totalArea = fields.reduce((a, f) => a + f.area, 0);
  const avgHealth = Math.round(
    fields.reduce((a, f) => a + f.health, 0) / fields.length
  );

  printReport("Fields Report", columns, data, [
    { label: "Total Fields", value: String(fields.length) },
    { label: "Total Area", value: totalArea + " ha" },
    { label: "Avg Health", value: avgHealth + "%" },
  ]);
}

/**
 * Export transactions to CSV
 */
export function exportTransactionsToCsv(transactionList?: Transaction[]) {
  const items = transactionList || transactions;

  const columns: ExportColumn[] = [
    { key: "date", label: "Date" },
    { key: "type", label: "Type" },
    { key: "category", label: "Category" },
    { key: "description", label: "Description" },
    { key: "amount", label: "Amount ($)" },
    { key: "status", label: "Status" },
  ];

  const data: ExportRow[] = items.map((t: Transaction) => ({
    date: t.date,
    type: t.type,
    category: t.category,
    description: t.description,
    amount: t.amount,
    status: t.status,
  }));

  exportToCsv(columns, data, "transactions-export-" + new Date().toISOString().split("T")[0]);
}

/**
 * Print financial report
 */
export function printFinancialReport() {
  const incomeTransactions = transactions.filter(
    (t) => t.type === "income" && t.status === "completed"
  );
  const expenseTransactions = transactions.filter(
    (t) => t.type === "expense" && t.status === "completed"
  );
  const totalRevenue = incomeTransactions.reduce((a, t) => a + t.amount, 0);
  const totalExpenses = expenseTransactions.reduce((a, t) => a + t.amount, 0);
  const profit = totalRevenue - totalExpenses;

  const columns: ExportColumn[] = [
    { key: "date", label: "Date" },
    { key: "type", label: "Type" },
    { key: "category", label: "Category" },
    { key: "description", label: "Description" },
    { key: "amount", label: "Amount ($)" },
    { key: "status", label: "Status" },
  ];

  const data: ExportRow[] = transactions.map((t: Transaction) => ({
    date: t.date,
    type: t.type,
    category: t.category,
    description: t.description,
    amount: t.amount,
    status: t.status,
  }));

  printReport("Financial Report", columns, data, [
    { label: "Total Revenue", value: "$" + totalRevenue.toLocaleString() },
    { label: "Total Expenses", value: "$" + totalExpenses.toLocaleString() },
    { label: "Net Profit", value: "$" + profit.toLocaleString() },
    { label: "Margin", value: ((profit / totalRevenue) * 100).toFixed(1) + "%" },
  ]);
}

/**
 * Export analytics data (transactions + yield predictions) to CSV
 */
export function exportAnalyticsCSV(
  transactionList: Transaction[],
  analytics: { yieldPrediction: { year: string; wheat: number; corn: number; soybeans: number }[] }
) {
  const incomeTransactions = transactionList.filter(
    (t) => t.type === "income" && t.status === "completed"
  );
  const expenseTransactions = transactionList.filter(
    (t) => t.type === "expense" && t.status === "completed"
  );
  const totalRevenue = incomeTransactions.reduce((a, t) => a + t.amount, 0);
  const totalExpenses = expenseTransactions.reduce((a, t) => a + t.amount, 0);
  const profit = totalRevenue - totalExpenses;

  const txColumns: ExportColumn[] = [
    { key: "date", label: "Date" },
    { key: "type", label: "Type" },
    { key: "category", label: "Category" },
    { key: "description", label: "Description" },
    { key: "amount", label: "Amount ($)" },
    { key: "status", label: "Status" },
  ];

  const txData: ExportRow[] = transactionList.map((t: Transaction) => ({
    date: t.date,
    type: t.type,
    category: t.category,
    description: t.description,
    amount: t.amount,
    status: t.status,
  }));

  const yieldColumns: ExportColumn[] = [
    { key: "year", label: "Year" },
    { key: "wheat", label: "Wheat (bu/acre)" },
    { key: "corn", label: "Corn (bu/acre)" },
    { key: "soybeans", label: "Soybeans (bu/acre)" },
  ];

  const yieldData: ExportRow[] = analytics.yieldPrediction.map((y) => ({
    year: y.year,
    wheat: y.wheat,
    corn: y.corn,
    soybeans: y.soybeans,
  }));

  const header = "=== AgroVision Analytics Report ===";
  const summary = "\r\nRevenue,$" + totalRevenue.toLocaleString() + "\r\nExpenses,$" + totalExpenses.toLocaleString() + "\r\nProfit,$" + profit.toLocaleString() + "\r\nMargin," + ((profit / totalRevenue) * 100).toFixed(1) + "%";
  const txCsv = toCsvString(txColumns, txData);
  const yieldCsv = toCsvString(yieldColumns, yieldData);
  const fullCsv = header + "\r\n\r\nSUMMARY" + summary + "\r\n\r\nTRANSACTIONS\r\n" + txCsv + "\r\n\r\nYIELD PREDICTIONS\r\n" + yieldCsv;

  downloadCsv(fullCsv, "analytics-export-" + new Date().toISOString().split("T")[0]);
  console.log("Analytics CSV exported");
}

/**
 * Export tasks to CSV
 */
export function exportTasksToCsv(taskList?: Task[]) {
  const items = taskList || tasks;

  const columns: ExportColumn[] = [
    { key: "title", label: "Task" },
    { key: "type", label: "Type" },
    { key: "priority", label: "Priority" },
    { key: "status", label: "Status" },
    { key: "assignedTo", label: "Assigned To" },
    { key: "field", label: "Field" },
    { key: "dueDate", label: "Due Date" },
    { key: "createdAt", label: "Created" },
  ];

  const data: ExportRow[] = items.map((t: Task) => ({
    title: t.title,
    type: t.type,
    priority: t.priority,
    status: t.status,
    assignedTo: t.assignedTo,
    field: t.field || "",
    dueDate: t.dueDate,
    createdAt: t.createdAt,
  }));

  exportToCsv(columns, data, "tasks-export-" + new Date().toISOString().split("T")[0]);
}

