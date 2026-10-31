import { withSupabase } from "npm:@supabase/server";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

async function hmacSha256Hex(key: string, value: string): Promise<string> {
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(key),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    cryptoKey,
    new TextEncoder().encode(value),
  );
  return Array.from(
    new Uint8Array(signature),
    (byte) => byte.toString(16).padStart(2, "0"),
  ).join("");
}

function safeEqual(left: string, right: string): boolean {
  if (left.length !== right.length) return false;
  let mismatch = 0;
  for (let index = 0; index < left.length; index += 1) {
    mismatch |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return mismatch === 0;
}

async function sha256Hex(value: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function textResponse(body: string, status = 200): Response {
  return new Response(body, {
    status,
    headers: { ...corsHeaders, "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
  });
}

Deno.serve(withSupabase({ auth: "none" }, async (req, ctx) => {
  if (req.method === "OPTIONS") return new Response("ok", { status: 200, headers: corsHeaders });
  if (req.method !== "POST") return textResponse("Method Not Allowed", 405);

  try {
    const contentType = (req.headers.get("content-type") ?? "").toLowerCase();
    if (!contentType.startsWith("application/x-www-form-urlencoded")) {
      return textResponse("Unsupported Media Type", 415);
    }

    const merchantCodeConfig = Deno.env.get("DUITKU_MERCHANT_CODE") ?? "";
    const apiKey = Deno.env.get("DUITKU_API_KEY") ?? "";
    if (!merchantCodeConfig || !apiKey) {
      console.error("Duitku callback credentials are not configured.");
      return textResponse("Service Unavailable", 503);
    }

    const form = await req.formData();
    const payload: Record<string, string> = {};
    for (const [key, value] of form.entries()) {
      if (typeof value !== "string" || Object.hasOwn(payload, key)) {
        return textResponse("Invalid callback form", 400);
      }
      payload[key] = value;
    }

    const merchantCode = payload.merchantCode ?? "";
    const amount = payload.amount ?? "";
    const merchantOrderId = payload.merchantOrderId ?? "";
    const signature = (payload.signature ?? "").toLowerCase();
    const resultCode = payload.resultCode ?? "";
    const reference = payload.reference ?? "";
    const paymentCode = payload.paymentCode ?? "";
    const additionalParam = payload.additionalParam ?? "";

    if (
      merchantCode !== merchantCodeConfig ||
      !/^[1-9][0-9]*$/.test(amount) ||
      !merchantOrderId ||
      merchantOrderId.length > 50 ||
      !/^[0-9a-f]{64}$/.test(signature) ||
      !reference ||
      !["00", "01"].includes(resultCode)
    ) {
      return textResponse("Bad Request: Invalid required parameters", 400);
    }

    const expectedSignature = await hmacSha256Hex(
      apiKey,
      `${merchantCode}${amount}${merchantOrderId}`,
    );
    if (!safeEqual(signature, expectedSignature)) {
      console.warn("Duitku callback signature validation failed.");
      return textResponse("Invalid Signature", 400);
    }

    const eventKey = await sha256Hex([
      merchantCode,
      merchantOrderId,
      amount,
      reference,
      resultCode,
    ].join("|"));

    const { data: outcome, error } = await ctx.supabaseAdmin.rpc("apply_duitku_callback", {
      p_event_key: eventKey,
      p_merchant_order_id: merchantOrderId,
      p_amount: Number(amount),
      p_reference: reference,
      p_result_code: resultCode,
      p_payment_code: paymentCode || null,
      p_additional_param: additionalParam || null,
    });

    if (error) {
      console.error("Atomic Duitku callback processing failed:", error.message);
      return textResponse("Callback Processing Error", 500);
    }

    if (outcome === "PAYMENT_REVIEW") {
      console.error("Verified late payment requires manual order and inventory review.");
    }

    return textResponse("SUCCESS", 200);
  } catch (error) {
    console.error("Duitku callback error:", error instanceof Error ? error.message : "Unknown error");
    return textResponse("Internal Server Error", 500);
  }
}));
