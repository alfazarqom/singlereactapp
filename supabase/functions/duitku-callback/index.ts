import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const textResponse = (body: string, status = 200) =>
  new Response(body, { status, headers: { "Content-Type": "text/plain; charset=utf-8" } });

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

function constantTimeEqual(left: string, right: string): boolean {
  if (left.length !== right.length) return false;
  let difference = 0;
  for (let index = 0; index < left.length; index++) {
    difference |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return difference === 0;
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return textResponse("Method Not Allowed", 405);

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const merchantCode = Deno.env.get("DUITKU_MERCHANT_CODE") || "";
    const apiKey = Deno.env.get("DUITKU_API_KEY") || "";

    if (!supabaseUrl || !serviceRoleKey || !merchantCode || !apiKey) {
      console.error("[duitku-callback] Required server configuration is missing.");
      return textResponse("Service Unavailable", 503);
    }

    const contentType = req.headers.get("content-type") || "";
    if (!contentType.toLowerCase().includes("application/x-www-form-urlencoded")) {
      return textResponse("Unsupported Media Type", 415);
    }

    const form = new URLSearchParams(await req.text());
    const params = Object.fromEntries(form.entries());
    const callbackMerchantCode = params.merchantCode || "";
    const amountText = params.amount || "";
    const merchantOrderId = params.merchantOrderId || "";
    const reference = params.reference || "";
    const resultCode = params.resultCode || "";
    const receivedSignature = (params.signature || "").toLowerCase();

    if (!callbackMerchantCode || !amountText || !merchantOrderId || !reference ||
        !resultCode || !receivedSignature) {
      return textResponse("Bad Request: Missing callback parameters", 400);
    }
    if (callbackMerchantCode !== merchantCode) return textResponse("Invalid merchant code", 400);
    if (resultCode !== "00" && resultCode !== "01") return textResponse("Unsupported result code", 400);

    const amount = Number(amountText);
    if (!Number.isSafeInteger(amount) || amount <= 0) return textResponse("Invalid amount", 400);

    const expectedSignature = await hmacSha256Hex(apiKey, callbackMerchantCode + amountText + merchantOrderId);
    if (!constantTimeEqual(receivedSignature, expectedSignature)) {
      console.warn("[duitku-callback] Signature verification failed.");
      return textResponse("Bad Signature", 400);
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data: order, error: lookupError } = await supabase
      .from("orders")
      .select("merchant_order_id,total_amount,payment_status,duitku_reference")
      .eq("merchant_order_id", merchantOrderId)
      .maybeSingle();

    if (lookupError) {
      console.error("[duitku-callback] Order lookup failed:", lookupError.message);
      return textResponse("Unable to validate order", 500);
    }
    if (!order) return textResponse("Unknown order", 404);
    if (Number(order.total_amount) !== amount) return textResponse("Amount mismatch", 400);
    if (order.duitku_reference !== reference) return textResponse("Reference mismatch", 400);

    const targetStatus = resultCode === "00" ? "PAID" : "FAILED";
    if (order.payment_status !== "PENDING" && order.payment_status !== targetStatus) {
      return textResponse("Invalid payment state transition", 409);
    }

    if (order.payment_status === "PENDING") {
      const { data: updatedOrder, error: updateError } = await supabase
        .from("orders")
        .update({
          payment_status: targetStatus,
          payment_method: params.paymentCode || "DUITKU_POP",
          updated_at: new Date().toISOString(),
        })
        .eq("merchant_order_id", merchantOrderId)
        .eq("payment_status", "PENDING")
        .eq("duitku_reference", reference)
        .eq("total_amount", amount)
        .select("merchant_order_id")
        .maybeSingle();

      if (updateError) {
        console.error("[duitku-callback] Order status update failed:", updateError.message);
        return textResponse("Unable to update order", 500);
      }

      if (!updatedOrder) {
        const { data: latestOrder, error: latestError } = await supabase
          .from("orders")
          .select("payment_status,duitku_reference,total_amount")
          .eq("merchant_order_id", merchantOrderId)
          .maybeSingle();
        if (latestError || !latestOrder ||
            latestOrder.payment_status !== targetStatus ||
            latestOrder.duitku_reference !== reference ||
            Number(latestOrder.total_amount) !== amount) {
          return textResponse("Order state changed; callback will be retried", 409);
        }
      }
    }

    const { error: logError } = await supabase.from("payment_logs").insert({
      merchant_order_id: merchantOrderId,
      reference,
      event_type: "CALLBACK_VERIFIED",
      payload: {
        resultCode,
        paymentStatus: targetStatus,
        paymentCode: params.paymentCode || null,
        processedAt: new Date().toISOString(),
      },
    });

    if (logError && logError.code !== "23505") {
      console.error("[duitku-callback] Callback audit log insert failed:", logError.message);
      return textResponse("Callback processing incomplete", 500);
    }

    return textResponse("SUCCESS", 200);
  } catch (error) {
    console.error("[duitku-callback] Unexpected error:", error instanceof Error ? error.message : "Unknown error");
    return textResponse("Internal Server Error", 500);
  }
});
