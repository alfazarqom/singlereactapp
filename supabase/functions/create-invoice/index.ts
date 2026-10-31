import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

type OrderRow = {
  merchant_order_id: string;
  total_amount: number | string;
  payment_status: string | null;
  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  items: unknown;
  duitku_reference: string | null;
};

const jsonResponse = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

async function hmacSha256Hex(secret: string, message: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(message));
  return Array.from(new Uint8Array(signature), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return jsonResponse({ error: "Method not allowed." }, 405);

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const merchantCode = Deno.env.get("DUITKU_MERCHANT_CODE") || "";
    const apiKey = Deno.env.get("DUITKU_API_KEY") || "";
    const duitkuEnv = Deno.env.get("DUITKU_ENV") || "";

    if (!supabaseUrl || !serviceRoleKey || !merchantCode || !apiKey) {
      console.error("[create-invoice] Required server configuration is missing.");
      return jsonResponse({ error: "Payment service is not configured." }, 503);
    }
    if (duitkuEnv !== "sandbox" && duitkuEnv !== "production") {
      console.error("[create-invoice] DUITKU_ENV must be explicitly set to sandbox or production.");
      return jsonResponse({ error: "Payment environment is not configured." }, 503);
    }

    const body = await req.json();
    const merchantOrderId = typeof body.merchantOrderId === "string" ? body.merchantOrderId.trim() : "";
    const paymentAmount = Number(body.paymentAmount);

    if (!merchantOrderId || !Number.isSafeInteger(paymentAmount) || paymentAmount <= 0) {
      return jsonResponse({ error: "merchantOrderId and a positive integer paymentAmount are required." }, 400);
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("merchant_order_id,total_amount,payment_status,customer_name,customer_email,customer_phone,items,duitku_reference")
      .eq("merchant_order_id", merchantOrderId)
      .maybeSingle();

    if (orderError) {
      console.error("[create-invoice] Order lookup failed:", orderError.message);
      return jsonResponse({ error: "Unable to validate the order." }, 500);
    }
    if (!order) return jsonResponse({ error: "Order not found." }, 404);

    const storedAmount = Number((order as OrderRow).total_amount);
    if (!Number.isSafeInteger(storedAmount) || storedAmount !== paymentAmount) {
      return jsonResponse({ error: "Payment amount does not match the stored order amount." }, 400);
    }
    if ((order as OrderRow).payment_status !== "PENDING") {
      return jsonResponse({ error: "Only pending orders can request an invoice." }, 409);
    }
    if ((order as OrderRow).duitku_reference) {
      return jsonResponse({ error: "An invoice reference already exists for this order." }, 409);
    }

    const origin = req.headers.get("origin");
    if (!origin) return jsonResponse({ error: "Request origin is required." }, 400);
    let returnUrl: string;
    try {
      returnUrl = new URL("/order-success", origin).toString();
    } catch {
      return jsonResponse({ error: "Invalid request origin." }, 400);
    }

    const orderRow = order as OrderRow;
    const itemDetails = Array.isArray(orderRow.items)
      ? orderRow.items.map((entry: any) => {
          const product = entry?.product ?? entry;
          return {
            name: String(product?.name || "Storefront item").slice(0, 50),
            price: Number(product?.price),
            quantity: Number(entry?.quantity ?? 1),
          };
        }).filter((item) =>
          Number.isSafeInteger(item.price) && item.price >= 0 &&
          Number.isSafeInteger(item.quantity) && item.quantity > 0
        )
      : [];

    const itemDetailsTotal = itemDetails.reduce((sum, item) => sum + item.price * item.quantity, 0);
    if (itemDetails.length === 0 || !Number.isSafeInteger(itemDetailsTotal) || itemDetailsTotal !== paymentAmount) {
      return jsonResponse({ error: "Stored order items do not match the requested payment amount." }, 400);
    }

    const timestamp = Date.now().toString();
    const signature = await hmacSha256Hex(apiKey, merchantCode + timestamp);
    const callbackUrl = `${supabaseUrl.replace(/\/$/, "")}/functions/v1/duitku-callback`;
    const payload = {
      paymentAmount,
      merchantOrderId,
      productDetails: `Order ${merchantOrderId}`,
      additionalParam: "",
      merchantUserInfo: "",
      paymentMethod: "",
      customerVaName: (orderRow.customer_name || "Customer").slice(0, 20),
      email: orderRow.customer_email || "customer@example.com",
      phoneNumber: orderRow.customer_phone || "",
      ...(itemDetails.length > 0 ? { itemDetails } : {}),
      callbackUrl,
      returnUrl,
      expiryPeriod: 1440,
    };

    const endpoint = duitkuEnv === "production"
      ? "https://api-prod.duitku.com/api/merchant/createInvoice"
      : "https://api-sandbox.duitku.com/api/merchant/createInvoice";

    const providerResponse = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-duitku-signature": signature,
        "x-duitku-timestamp": timestamp,
        "x-duitku-merchantcode": merchantCode,
      },
      body: JSON.stringify(payload),
    });

    const providerText = await providerResponse.text();
    let providerData: Record<string, any>;
    try {
      providerData = JSON.parse(providerText);
    } catch {
      console.error("[create-invoice] Duitku returned a non-JSON response.");
      return jsonResponse({ error: "Duitku returned an invalid response." }, 502);
    }

    if (!providerResponse.ok || providerData.statusCode !== "00" ||
        typeof providerData.reference !== "string" || !providerData.reference) {
      console.error("[create-invoice] Duitku rejected the invoice request:", {
        httpStatus: providerResponse.status,
        statusCode: providerData.statusCode,
      });
      return jsonResponse({
        error: providerData.statusMessage || "Duitku failed to create the invoice.",
      }, 502);
    }

    const { data: updatedOrder, error: updateError } = await supabase
      .from("orders")
      .update({
        duitku_reference: providerData.reference,
        duitku_payment_url: providerData.paymentUrl || null,
        duitku_va_number: providerData.vaNumber || null,
        updated_at: new Date().toISOString(),
      })
      .eq("merchant_order_id", merchantOrderId)
      .eq("payment_status", "PENDING")
      .is("duitku_reference", null)
      .select("merchant_order_id")
      .maybeSingle();

    if (updateError || !updatedOrder) {
      console.error("[create-invoice] Provider invoice created but order reference could not be persisted.", {
        error: updateError?.message,
        merchantOrderId,
      });
      return jsonResponse({ error: "Invoice was created but could not be safely linked to the order. Contact support." }, 502);
    }

    const { error: logError } = await supabase.from("payment_logs").insert({
      merchant_order_id: merchantOrderId,
      reference: providerData.reference,
      event_type: "INVOICE_CREATED",
      payload: {
        environment: duitkuEnv,
        statusCode: providerData.statusCode,
        statusMessage: providerData.statusMessage || null,
      },
    });
    if (logError) console.error("[create-invoice] Payment audit log insert failed:", logError.message);

    return jsonResponse({
      merchantCode: providerData.merchantCode || merchantCode,
      reference: providerData.reference,
      paymentUrl: providerData.paymentUrl || null,
      vaNumber: providerData.vaNumber || null,
      amount: providerData.amount || String(paymentAmount),
      statusCode: providerData.statusCode,
      statusMessage: providerData.statusMessage || "SUCCESS",
    });
  } catch (error) {
    console.error("[create-invoice] Unexpected error:", error instanceof Error ? error.message : "Unknown error");
    return jsonResponse({ error: "Unable to create the Duitku invoice." }, 500);
  }
});
