import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getPaymentRecordById } from "@/lib/billing/subscription-service";
import { getUserById } from "@/lib/user-service";
import { PLANS } from "@/lib/billing/plans";

/**
 * GET /api/billing/invoices/[id]/download
 *
 * Download an invoice as a PDF.
 *
 * In a production setup this would stream the real Stripe-hosted invoice PDF.
 * For development, we generate a simple PDF-style document so the download
 * flow works end-to-end without a real Stripe invoice.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();

    if (!supabase) {
      return NextResponse.json({ error: "Supabase is not configured" }, { status: 500 });
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const record = await getPaymentRecordById(id);

    if (!record || record.userId !== user.id) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    const userRecord = await getUserById(user.id);
    const planName = PLANS[record.description?.includes("professional")
      ? "professional"
      : record.description?.includes("enterprise")
      ? "enterprise"
      : "starter"]?.name || "Starter";

    const amount = (record.amount / 100).toFixed(2);
    const currency = (record.currency || "usd").toUpperCase();
    const date = record.paidAt
      ? new Date(record.paidAt).toLocaleDateString()
      : new Date().toLocaleDateString();
    const invoiceNumber = `INV-${record.providerPaymentId.replace(/^in_/, "").slice(0, 8).toUpperCase()}`;

    // Simple text-based PDF-like document (valid as a downloadable file)
    const pdfContent = `AGROVISION
Digital Twin of Your Farm
========================================

INVOICE
========================================
Invoice Number: ${invoiceNumber}
Date: ${date}
Customer: ${userRecord?.name || user.email}
Email: ${user.email}

Description:
${record.description}
  Plan: ${planName}
  Billing: ${record.billingCycle || "monthly"}

Total: ${currency} ${amount}
Status: PAID

========================================
Thank you for choosing AgroVision!
`;

    return new NextResponse(pdfContent, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${invoiceNumber}.pdf"`,
        "Content-Length": Buffer.byteLength(pdfContent).toString(),
      },
    });
  } catch (error) {
    console.error("Failed to download invoice:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to download invoice" },
      { status: 500 }
    );
  }
}
