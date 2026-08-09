/**
 * Stripe Webhook Edge Function
 *
 * Verifies incoming Stripe webhook signatures using the raw payload and
 * the `stripe-signature` header, then handles common billing events by
 * persisting subscription state to Supabase `auth.users.user_metadata`.
 *
 * Environment variables:
 *   STRIPE_WEBHOOK_SECRET — the webhook signing secret from the Stripe dashboard
 *   SUPABASE_URL — Supabase project URL (set automatically by Supabase)
 *   SUPABASE_SERVICE_ROLE_KEY — service role key for admin operations
 */

import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, stripe-signature",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// ============================================================
// Plan / Price Mapping
// ============================================================

const PRICE_TO_PLAN: Record<string, { plan: string; cycle: string }> = {
  // Starter
  price_1U19FNJKQYzGcvoMUBPnLKMT: { plan: "starter", cycle: "monthly" },
  price_1U19FNJKQYzGcvoMiu1lmh46: { plan: "starter", cycle: "yearly" },
  // Professional
  price_1U19FOJKQYzGcvoMjMGB0JWb: { plan: "professional", cycle: "monthly" },
  price_1U19FOJKQYzGcvoMXKn710EA: { plan: "professional", cycle: "yearly" },
  // Enterprise
  price_1U19FOJKQYzGcvoMSAiRUDDk: { plan: "enterprise", cycle: "monthly" },
  price_1U19FPJKQYzGcvoMiu0V7MSF: { plan: "enterprise", cycle: "yearly" },
};

function mapPriceToPlan(priceId: string | undefined): string {
  if (!priceId) return "starter";
  return PRICE_TO_PLAN[priceId]?.plan || "starter";
}

function mapPriceToCycle(priceId: string | undefined): string {
  if (!priceId) return "monthly";
  return PRICE_TO_PLAN[priceId]?.cycle || "monthly";
}

// ============================================================
// Supabase Admin Client
// ============================================================

function getSupabaseAdmin() {
  const url = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!url || !serviceRoleKey) {
    console.error(
      "[stripe-webhook] SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not configured"
    );
    return null;
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

// ============================================================
// Subscription Metadata Persistence
// ============================================================

interface SubscriptionMetadata {
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  subscription_status: string;
  subscription_plan: string;
  subscription_current_period_end: string | null;
}

/**
 * Read a user's current subscription metadata from Supabase.
 */
async function readSubscriptionMetadata(
  admin: NonNullable<ReturnType<typeof getSupabaseAdmin>>,
  userId: string
): Promise<SubscriptionMetadata> {
  const { data, error } = await admin.auth.admin.getUserById(userId);
  if (error || !data?.user) {
    console.error(
      "[stripe-webhook] Failed to read user metadata:",
      error?.message
    );
    return {
      stripe_customer_id: null,
      stripe_subscription_id: null,
      subscription_status: "incomplete",
      subscription_plan: "starter",
      subscription_current_period_end: null,
    };
  }

  const md = data.user.user_metadata ?? {};
  return {
    stripe_customer_id: (md.stripe_customer_id as string) || null,
    stripe_subscription_id: (md.stripe_subscription_id as string) || null,
    subscription_status: (md.subscription_status as string) || "incomplete",
    subscription_plan: (md.subscription_plan as string) || "starter",
    subscription_current_period_end:
      (md.subscription_current_period_end as string) || null,
  };
}

/**
 * Persist subscription metadata to Supabase `auth.users.user_metadata`.
 * Preserves any existing metadata fields on the user.
 */
async function writeSubscriptionMetadata(
  admin: NonNullable<ReturnType<typeof getSupabaseAdmin>>,
  userId: string,
  input: Partial<SubscriptionMetadata>
): Promise<boolean> {
  const current = await readSubscriptionMetadata(admin, userId);
  const next: SubscriptionMetadata = {
    ...current,
    ...input,
  };

  // Read the full raw metadata to preserve non-subscription fields
  const { data: userData } = await admin.auth.admin.getUserById(userId);
  const rawMetadata = userData?.user?.user_metadata ?? {};

  const metadata = {
    ...rawMetadata,
    stripe_customer_id: next.stripe_customer_id,
    stripe_subscription_id: next.stripe_subscription_id,
    subscription_status: next.subscription_status,
    subscription_plan: next.subscription_plan,
    subscription_current_period_end: next.subscription_current_period_end,
  };

  const { error } = await admin.auth.admin.updateUserById(userId, {
    user_metadata: metadata,
  });

  if (error) {
    console.error(
      "[stripe-webhook] Failed to write user metadata:",
      error.message
    );
    return false;
  }

  return true;
}

/**
 * Resolve a user by Stripe customer ID or metadata userId.
 */
async function resolveUser(
  admin: NonNullable<ReturnType<typeof getSupabaseAdmin>>,
  customerId: string | undefined,
  metadataUserId: string | undefined
): Promise<string | null> {
  // Prefer metadata userId (set at checkout creation)
  if (metadataUserId) {
    const { data, error } = await admin.auth.admin.getUserById(metadataUserId);
    if (!error && data?.user) return data.user.id;
  }

  // Fall back to looking up by Stripe customer ID in user metadata
  if (customerId) {
    const { data, error } = await admin.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    });
    if (!error && data?.users) {
      for (const user of data.users) {
        const md = user.user_metadata ?? {};
        if (md.stripe_customer_id === customerId) {
          return user.id;
        }
      }
    }
  }

  return null;
}

// ============================================================
// Stripe Signature Verification (no SDK required)
// ============================================================

/**
 * Verify a Stripe webhook signature using the raw payload and the
 * `stripe-signature` header. Throws on invalid signatures.
 *
 * Stripe signs the payload as: HMAC-SHA256(secret, `${timestamp}.${payload}`)
 * The header format is: t=<timestamp>,v1=<signature>
 */
async function verifyStripeSignature(
  payload: string,
  signatureHeader: string,
  secret: string
): Promise<void> {
  // Parse the signature header: t=timestamp,v1=signature,v1=signature2,...
  const entries = new Map<string, string>();
  for (const item of signatureHeader.split(",")) {
    const [key, ...valueParts] = item.split("=");
    const value = valueParts.join("=");
    if (key && value) {
      // Keep the last value for each key (Stripe may send multiple v1 values)
      entries.set(key, value);
    }
  }

  const timestamp = entries.get("t");
  const signature = entries.get("v1");

  if (!timestamp || !signature) {
    throw new Error("Invalid stripe-signature header: missing t or v1");
  }

  // Reject timestamps outside a 5-minute tolerance window to prevent replay attacks
  const now = Math.floor(Date.now() / 1000);
  const ts = parseInt(timestamp, 10);
  if (isNaN(ts) || Math.abs(now - ts) > 300) {
    throw new Error("Stripe webhook timestamp is outside the tolerance window");
  }

  // Construct the signed payload: `${timestamp}.${payload}`
  const signedPayload = `${timestamp}.${payload}`;

  // Compute HMAC-SHA256 using the webhook secret
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signatureBytes = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(signedPayload)
  );

  // Convert to hex
  const expectedSignature = [...new Uint8Array(signatureBytes)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  // Constant-time comparison to prevent timing attacks
  const expected = encoder.encode(expectedSignature);
  const received = encoder.encode(signature);

  if (expected.length !== received.length) {
    throw new Error("Stripe webhook signature mismatch");
  }

  let diff = 0;
  for (let i = 0; i < expected.length; i++) {
    diff |= expected[i] ^ received[i];
  }

  if (diff !== 0) {
    throw new Error("Stripe webhook signature mismatch");
  }
}

// ============================================================
// Event Handlers
// ============================================================

interface StripeEvent {
  id: string;
  type: string;
  created: number;
  data: {
    object: Record<string, unknown>;
  };
}

/**
 * Handle checkout.session.completed — activate the subscription.
 * The user has completed checkout and paid, so grant immediate access.
 */
async function handleCheckoutCompleted(
  admin: NonNullable<ReturnType<typeof getSupabaseAdmin>>,
  event: StripeEvent
) {
  const session = event.data.object as {
    id?: string;
    customer?: string;
    subscription?: string;
    client_reference_id?: string;
    metadata?: Record<string, string>;
    amount_total?: number;
    currency?: string;
  };

  const customerId = session.customer;
  const subscriptionId = session.subscription;
  const userId = session.metadata?.userId || session.client_reference_id;

  console.log(
    `[stripe-webhook] checkout.session.completed → session=${session.id} customer=${customerId} subscription=${subscriptionId}`
  );

  // Resolve the user
  const resolvedUserId = await resolveUser(admin, customerId, userId);
  if (!resolvedUserId) {
    console.error(
      `[stripe-webhook] No user found for checkout session ${session.id}`
    );
    return {
      received: true,
      type: event.type,
      sessionId: session.id,
      customerId,
      subscriptionId,
      error: "No user found",
    };
  }

  // Determine plan from metadata (set at checkout creation)
  const planId = session.metadata?.planId || "professional";
  const billingCycle = session.metadata?.billingCycle || "monthly";

  // Persist subscription metadata — the user has paid, so grant active access.
  // (If a trial was configured, the customer.subscription.created/updated
  // events will sync the status to "trialing" and later "active".)
  const ok = await writeSubscriptionMetadata(admin, resolvedUserId, {
    stripe_customer_id: customerId || null,
    stripe_subscription_id: subscriptionId || null,
    subscription_status: "active",
    subscription_plan: planId,
  });

  if (!ok) {
    return {
      received: true,
      type: event.type,
      sessionId: session.id,
      customerId,
      subscriptionId,
      error: "Failed to persist subscription metadata",
    };
  }

  console.log(
    `[stripe-webhook] checkout.session.completed → user ${resolvedUserId} subscribed (${planId}, ${billingCycle})`
  );

  return {
    received: true,
    type: event.type,
    sessionId: session.id,
    customerId,
    subscriptionId,
    userId: resolvedUserId,
  };
}

/**
 * Handle payment_intent.succeeded — record the payment.
 */
async function handlePaymentIntentSucceeded(
  admin: NonNullable<ReturnType<typeof getSupabaseAdmin>>,
  event: StripeEvent
) {
  const paymentIntent = event.data.object as {
    id?: string;
    customer?: string;
    amount?: number;
    currency?: string;
    status?: string;
    metadata?: Record<string, string>;
    payment_method?: string;
  };

  const customerId = paymentIntent.customer;
  const userId = paymentIntent.metadata?.userId;

  console.log(
    `[stripe-webhook] payment_intent.succeeded → intent=${paymentIntent.id} customer=${customerId} amount=${paymentIntent.amount} ${paymentIntent.currency}`
  );

  // Resolve the user
  const resolvedUserId = await resolveUser(admin, customerId, userId);
  if (!resolvedUserId) {
    console.error(
      `[stripe-webhook] No user found for payment intent ${paymentIntent.id}`
    );
    return {
      received: true,
      type: event.type,
      paymentIntentId: paymentIntent.id,
      customerId,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      error: "No user found",
    };
  }

  // Ensure the customer ID is stored on the user
  if (customerId) {
    await writeSubscriptionMetadata(admin, resolvedUserId, {
      stripe_customer_id: customerId,
    });
  }

  console.log(
    `[stripe-webhook] payment_intent.succeeded → user ${resolvedUserId} paid ${paymentIntent.amount} ${paymentIntent.currency}`
  );

  return {
    received: true,
    type: event.type,
    paymentIntentId: paymentIntent.id,
    customerId,
    amount: paymentIntent.amount,
    currency: paymentIntent.currency,
    userId: resolvedUserId,
  };
}

/**
 * Handle invoice.paid — activate the subscription and record the payment.
 */
async function handleInvoicePaid(
  admin: NonNullable<ReturnType<typeof getSupabaseAdmin>>,
  event: StripeEvent
) {
  const invoice = event.data.object as {
    id?: string;
    customer?: string;
    subscription?: string;
    amount_paid?: number;
    amount_due?: number;
    currency?: string;
    status?: string;
    hosted_invoice_url?: string;
    invoice_pdf?: string;
    lines?: {
      data?: { price?: { id?: string }; description?: string }[];
    };
    created?: number;
  };

  const customerId = invoice.customer;
  const subscriptionId = invoice.subscription;

  console.log(
    `[stripe-webhook] invoice.paid → invoice=${invoice.id} customer=${customerId} amount=${invoice.amount_paid} ${invoice.currency}`
  );

  // Resolve the user
  const resolvedUserId = await resolveUser(admin, customerId, undefined);
  if (!resolvedUserId) {
    console.error(
      `[stripe-webhook] No user found for invoice ${invoice.id}`
    );
    return {
      received: true,
      type: event.type,
      invoiceId: invoice.id,
      customerId,
      subscriptionId,
      amountPaid: invoice.amount_paid,
      currency: invoice.currency,
      error: "No user found",
    };
  }

  // Determine plan from the invoice line item price
  const priceId = invoice.lines?.data?.[0]?.price?.id;
  const planId = mapPriceToPlan(priceId);
  const billingCycle = mapPriceToCycle(priceId);

  // Persist subscription metadata — invoice paid means the subscription is active
  const ok = await writeSubscriptionMetadata(admin, resolvedUserId, {
    stripe_customer_id: customerId || null,
    stripe_subscription_id: subscriptionId || null,
    subscription_status: "active",
    subscription_plan: planId,
    subscription_current_period_end: invoice.created
      ? new Date(invoice.created * 1000).toISOString()
      : null,
  });

  if (!ok) {
    return {
      received: true,
      type: event.type,
      invoiceId: invoice.id,
      customerId,
      subscriptionId,
      amountPaid: invoice.amount_paid,
      currency: invoice.currency,
      error: "Failed to persist subscription metadata",
    };
  }

  console.log(
    `[stripe-webhook] invoice.paid → user ${resolvedUserId} active (${planId}, ${billingCycle})`
  );

  return {
    received: true,
    type: event.type,
    invoiceId: invoice.id,
    customerId,
    subscriptionId,
    amountPaid: invoice.amount_paid,
    currency: invoice.currency,
    userId: resolvedUserId,
  };
}

// ============================================================
// Main Handler
// ============================================================

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  // Only accept POST
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    // Read the raw body — must be the exact bytes Stripe signed
    const payload = await req.text();

    // Get the signature header
    const signature = req.headers.get("stripe-signature");
    if (!signature) {
      return new Response(
        JSON.stringify({ error: "Missing stripe-signature header" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Read the webhook secret from the environment
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    if (!webhookSecret) {
      console.error("[stripe-webhook] STRIPE_WEBHOOK_SECRET is not configured");
      return new Response(
        JSON.stringify({ error: "Webhook secret is not configured" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Verify the signature — throws on invalid signatures
    await verifyStripeSignature(payload, signature, webhookSecret);

    // Parse the event JSON
    const event = JSON.parse(payload) as StripeEvent;

    // Get the Supabase admin client for persisting subscription state
    const admin = getSupabaseAdmin();
    if (!admin) {
      return new Response(
        JSON.stringify({
          error: "Supabase admin client is not configured",
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Handle the event
    let result: Record<string, unknown>;
    switch (event.type) {
      case "checkout.session.completed":
        result = await handleCheckoutCompleted(admin, event);
        break;
      case "payment_intent.succeeded":
        result = await handlePaymentIntentSucceeded(admin, event);
        break;
      case "invoice.paid":
        result = await handleInvoicePaid(admin, event);
        break;
      default:
        // Acknowledge unhandled events so Stripe doesn't retry
        console.log(`[stripe-webhook] Unhandled event type: ${event.type}`);
        result = { received: true, type: event.type };
    }

    // Return 200 to acknowledge receipt
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    // Signature verification failed or invalid JSON
    console.error("[stripe-webhook] Error:", error);
    return new Response(
      JSON.stringify({
        error:
          error instanceof Error ? error.message : "Webhook processing failed",
      }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});