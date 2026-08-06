import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getPaymentHistory } from "@/lib/billing/subscription-service";

/**
 * GET /api/billing/invoices
 *
 * List the current user's payment history (invoices).
 * Returns the payment records used by the billing dashboard.
 */
export async function GET() {
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

    const invoices = await getPaymentHistory(user.id);

    return NextResponse.json({ invoices });
  } catch (error) {
    console.error("Failed to fetch invoices:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch invoices" },
      { status: 500 }
    );
  }
}
