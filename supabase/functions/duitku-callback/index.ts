import { withSupabase } from "npm:@supabase/server";

async function generateHmacSha256(key: string, data: string): Promise<string> {
  const encoder = new TextEncoder();
  const cryptoKey = await crypto.subtle.importKey("raw", encoder.encode(key),
    { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const signature = await crypto.subtle.sign("HMAC", cryptoKey, encoder.encode(data));
  return Array.from(new Uint8Array(signature)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function generateMd5(data: string): Promise<string> {
  const digest = await crypto.subtle.digest("MD5", new TextEncoder().encode(data));
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

Deno.serve(withSupabase({ auth: "none" }, async (req, ctx) => {
  if (req.method === "OPTIONS") return new Response("ok", {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
    },
  });
  if (req.method !== "POST") return new Response("Method Not Allowed", { status: 405 });

  try {
    const merchantCodeConfig = Deno.env.get("DUITKU_MERCHANT_CODE") || "";
    const apiKey = Deno.env.get("DUITKU_API_KEY") || "";
    if (!merchantCodeConfig || !apiKey) {
      console.error("Duitku callback credentials are not configured.");
      return new Response("Service Unavailable", { status: 503 });
    }

    let payload: Record<string, string> = {};
    const contentType = req.headers.get("content-type") || "";
    if (contentType.includes("application/x-www-form-urlencoded")) {
      const formData = await req.formData();
      formData.forEach((value, key) => { payload[key] = value.toString(); });
    } else {
      payload = await req.json();
    }

    const {
      merchantCode, amount, merchantOrderId, signature, resultCode,
      reference, additionalParam, paymentCode,
    } = payload;

    if (!merchantOrderId || !amount || !signature) {
      return new Response("Bad Request: Missing required parameters", { status: 400 });
    }
    if (merchantCode && merchantCode !== merchantCodeConfig) {
      return new Response("Invalid Merchant", { status: 400 });
    }

    const rawToSignSha256 = `${merchantCodeConfig}${merchantOrderId}${amount}`;
    const calculatedSha256 = await generateHmacSha256(apiKey, rawToSignSha256);
    let calculatedMd5 = "";
    try {
      calculatedMd5 = await generateMd5(`${merchantCodeConfig}${amount}${merchantOrderId}${apiKey}`);
    } catch {
      // SHA-256 remains the primary supported signature check.
    }

    const isSignatureValid =
      signature.toLowerCase() === calculatedSha256.toLowerCase() ||
      (calculatedMd5 !== "" && signature.toLowerCase() === calculatedMd5.toLowerCase());

    if (!isSignatureValid) {
      console.warn("Duitku callback signature validation failed.");
      return new Response("Invalid Signature", { status: 400 });
    }

    const { data: existingOrder, error: lookupError } = await ctx.supabaseAdmin
      .from("orders")
      .select("id,total_amount,status")
      .eq("merchant_order_id", merchantOrderId)
      .maybeSingle();
    if (lookupError || !existingOrder) {
      console.error("Callback order lookup failed:", lookupError?.message);
      return new Response("Order Not Found", { status: 404 });
    }
    if (Math.round(Number(existingOrder.total_amount)) !== Math.round(Number(amount))) {
      console.warn("Duitku callback amount does not match stored order total.");
      return new Response("Invalid Amount", { status: 400 });
    }
    if (existingOrder.status === "SUCCESS") {
      return new Response("SUCCESS", { status: 200, headers: { "Content-Type": "text/plain" } });
    }

    const isSuccess = resultCode === "00";
    if (!isSuccess) {
      const { error: releaseError } = await ctx.supabaseAdmin.rpc("release_guest_order_inventory", {
        p_order_id: existingOrder.id,
      });
      if (releaseError) {
        console.error("Failed to release inventory for failed payment:", releaseError.message);
        return new Response("Inventory Update Error", { status: 500 });
      }
    }
    const updateData: Record<string, unknown> = {
      status: isSuccess ? "SUCCESS" : "FAILED",
      result_code: resultCode,
      reference: reference || null,
      payment_method: paymentCode || null,
      additional_param: additionalParam || null,
      updated_at: new Date().toISOString(),
    };
    if (isSuccess) updateData.paid_at = new Date().toISOString();

    const { error } = await ctx.supabaseAdmin.from("orders")
      .update(updateData).eq("merchant_order_id", merchantOrderId);

    if (error) {
      console.error("Failed to update order status:", error.message);
      return new Response("Database Error", { status: 500 });
    }

    return new Response("SUCCESS", {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    });
  } catch (err: any) {
    console.error("Duitku callback webhook error:", err?.message || "Unknown error");
    return new Response("Internal Server Error", { status: 500 });
  }
}));
