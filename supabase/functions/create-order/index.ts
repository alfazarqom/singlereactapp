import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "npm:@supabase/server";

const SHIPPING_FEE = 52000;
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, x-client-info, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "no-store",
};

async function hmacSha256Hex(key: string, value: string): Promise<string> {
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(key),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", cryptoKey, new TextEncoder().encode(value));
  return Array.from(new Uint8Array(signature), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: corsHeaders });
}

Deno.serve(withSupabase({ auth: "none" }, async (req, ctx) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ success: false, error: "Method not allowed" }, 405);

  const forwardedFor = req.headers.get("x-forwarded-for");
  const clientIp = req.headers.get("cf-connecting-ip") ??
    (forwardedFor ? forwardedFor.split(",")[0].trim() : "unknown");
  const ipDigest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(clientIp));
  const ipHash = Array.from(new Uint8Array(ipDigest), (byte) => byte.toString(16).padStart(2, "0")).join("");

  const { data: withinLimit, error: rateLimitError } = await ctx.supabaseAdmin.rpc(
    "consume_guest_checkout_rate_limit",
    { p_ip_hash: ipHash },
  );
  if (rateLimitError) {
    console.error("Guest checkout rate limit unavailable:", rateLimitError.message);
    return json({ success: false, error: "Checkout is temporarily unavailable." }, 503);
  }
  if (withinLimit !== true) {
    return json({ success: false, error: "Terlalu banyak percobaan checkout. Coba lagi dalam 15 menit." }, 429);
  }

  let createdOrderId: string | null = null;
  try {
    const body = await req.json();
    const { customerName, customerEmail, customerPhone, shippingAddress, items } = body ?? {};
    if (
      typeof customerName !== "string" || customerName.trim().length < 2 ||
      typeof customerEmail !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail.trim()) ||
      typeof customerPhone !== "string" || customerPhone.trim().length < 8 ||
      !shippingAddress || typeof shippingAddress !== "object" || Array.isArray(shippingAddress) ||
      typeof shippingAddress.address !== "string" || shippingAddress.address.trim().length < 8 ||
      !Array.isArray(items) || items.length < 1 || items.length > 30
    ) {
      return json({ success: false, error: "Data checkout tidak valid." }, 400);
    }

    const merchantCode = Deno.env.get("DUITKU_MERCHANT_CODE") ?? "";
    const apiKey = Deno.env.get("DUITKU_API_KEY") ?? "";
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const environment = Deno.env.get("DUITKU_ENV") ?? "";
    if (!merchantCode || !apiKey || !supabaseUrl || !["sandbox", "production"].includes(environment)) {
      console.error("Duitku server configuration is incomplete or invalid.");
      return json({ success: false, error: "Layanan pembayaran belum dikonfigurasi." }, 503);
    }

    const normalizedItems = items.map((item: unknown) => {
      const value = item as Record<string, unknown>;
      return {
        productId: typeof value?.productId === "string" ? value.productId : "",
        quantity: Number(value?.quantity),
        color: typeof value?.color === "string" ? value.color.slice(0, 80) : "",
        size: typeof value?.size === "string" ? value.size.slice(0, 40) : "",
      };
    });
    if (normalizedItems.some((item) =>
      !/^[0-9a-f-]{36}$/i.test(item.productId) ||
      !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 99
    )) {
      return json({ success: false, error: "Produk atau jumlah barang tidak valid." }, 400);
    }

    const merchantOrderId = `ASRI-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;
    const { data: order, error: orderError } = await ctx.supabaseAdmin.rpc("create_guest_order", {
      p_merchant_order_id: merchantOrderId,
      p_customer_name: customerName.trim(),
      p_customer_email: customerEmail.trim().toLowerCase(),
      p_customer_phone: customerPhone.trim(),
      p_shipping_address: shippingAddress,
      p_items: normalizedItems,
    });
    if (orderError || !order) {
      console.error("Server order validation failed:", orderError?.message);
      return json({ success: false, error: "Pesanan tidak dapat dibuat. Periksa stok dan data produk." }, 409);
    }
    createdOrderId = order.order_id;

    const orderItems = order.items as Array<Record<string, unknown>>;
    const subtotal = orderItems.reduce(
      (sum, item) => sum + Number(item.price) * Number(item.quantity),
      0,
    );
    const totalAmount = Number(order.amount);
    const itemDetails = [
      ...orderItems.map((item) => ({
        name: String(item.title).slice(0, 50),
        price: Number(item.price),
        quantity: Number(item.quantity),
      })),
      { name: "Ongkos Kirim", price: SHIPPING_FEE, quantity: 1 },
    ];
    const itemDetailsTotal = itemDetails.reduce((sum, item) => sum + item.price * item.quantity, 0);
    if (
      !Number.isSafeInteger(totalAmount) ||
      !Number.isSafeInteger(subtotal) ||
      itemDetailsTotal !== totalAmount ||
      Number(order.shipping_fee) !== SHIPPING_FEE
    ) {
      console.error("Persisted order total does not reconcile with Duitku item details.");
      return json({ success: false, error: "Total pesanan tidak valid dan perlu pemeriksaan." }, 500);
    }

    const timestamp = Date.now().toString();
    const signature = await hmacSha256Hex(apiKey, `${merchantCode}${timestamp}`);
    const duitkuUrl = environment === "production"
      ? "https://api-prod.duitku.com/api/merchant/createInvoice"
      : "https://api-sandbox.duitku.com/api/merchant/createInvoice";
    const callbackUrl = `${supabaseUrl}/functions/v1/duitku-callback`;
    const returnUrl = Deno.env.get("STOREFRONT_RETURN_URL") ??
      "https://alfazarqom.github.io/singlereactapp/";

    let invoiceResponse: Response;
    try {
      invoiceResponse = await fetch(duitkuUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-duitku-merchantcode": merchantCode,
          "x-duitku-timestamp": timestamp,
          "x-duitku-signature": signature,
        },
        body: JSON.stringify({
          paymentAmount: totalAmount,
          merchantOrderId,
          productDetails: orderItems.map((item) => String(item.title)).join(", ").slice(0, 255),
          email: customerEmail.trim().toLowerCase(),
          phoneNumber: customerPhone.trim(),
          merchantUserInfo: customerName.trim().slice(0, 255),
          customerVaName: customerName.trim().slice(0, 20),
          callbackUrl,
          returnUrl,
          expiryPeriod: 1440,
          itemDetails,
        }),
      });
    } catch (error) {
      // The provider may have accepted the invoice before the connection failed.
      // Keep the order and inventory pending for manual reconciliation; do not release stock.
      console.error("Duitku invoice request outcome is ambiguous:", error instanceof Error ? error.message : "Unknown error");
      return json({
        success: false,
        pendingReconciliation: true,
        merchantOrderId,
        error: "Status pembuatan invoice belum dapat dipastikan. Jangan ulangi checkout; hubungi dukungan dengan nomor pesanan.",
      }, 502);
    }

    const raw = await invoiceResponse.text();
    let invoice: Record<string, unknown>;
    try {
      invoice = JSON.parse(raw);
    } catch {
      invoice = {};
    }

    if (invoiceResponse.status >= 400 && invoiceResponse.status < 500) {
      const { error: releaseError } = await ctx.supabaseAdmin.rpc(
        "release_guest_order_inventory",
        { p_order_id: createdOrderId },
      );
      if (releaseError) {
        console.error("Definitive invoice rejection but inventory release failed:", releaseError.message);
        return json({ success: false, merchantOrderId, error: "Invoice ditolak dan pemulihan stok perlu pemeriksaan." }, 500);
      }
      return json({ success: false, merchantOrderId, error: "Duitku menolak permintaan invoice. Silakan periksa data lalu coba kembali." }, 502);
    }

    if (!invoiceResponse.ok || invoice.statusCode !== "00") {
      // HTTP 5xx, malformed replies, and uncertain provider outcomes retain the
      // pending order/stock so a potentially-created invoice is not orphaned.
      return json({
        success: false,
        pendingReconciliation: true,
        merchantOrderId,
        error: "Respons Duitku belum dapat dipastikan. Jangan ulangi checkout; hubungi dukungan dengan nomor pesanan.",
      }, 502);
    }

    if (
      typeof invoice.reference !== "string" || !invoice.reference ||
      typeof invoice.paymentUrl !== "string" || !invoice.paymentUrl.startsWith("https://")
    ) {
      console.error("Duitku returned success without a usable reference/payment URL.");
      return json({
        success: false,
        pendingReconciliation: true,
        merchantOrderId,
        error: "Invoice mungkin telah dibuat tetapi respons tidak lengkap. Hubungi dukungan dengan nomor pesanan.",
      }, 502);
    }

    const { error: updateError } = await ctx.supabaseAdmin.from("orders").update({
      reference: invoice.reference,
      payment_url: invoice.paymentUrl,
      va_number: typeof invoice.vaNumber === "string" ? invoice.vaNumber : null,
      qr_string: typeof invoice.qrString === "string" ? invoice.qrString : null,
      updated_at: new Date().toISOString(),
    }).eq("id", createdOrderId).eq("status", "PENDING");
    if (updateError) {
      console.error("Invoice created but order update failed:", updateError.message);
      return json({
        success: false,
        pendingReconciliation: true,
        merchantOrderId,
        error: "Invoice dibuat tetapi penyimpanan referensi gagal. Hubungi dukungan dengan nomor pesanan.",
      }, 500);
    }

    return json({
      success: true,
      order: {
        id: createdOrderId,
        merchantOrderId,
        status: "PENDING",
        subtotal,
        shippingFee: SHIPPING_FEE,
        amount: totalAmount,
        paymentUrl: invoice.paymentUrl,
        reference: invoice.reference,
      },
    });
  } catch (error) {
    // A failure after order creation can happen after a provider request was sent.
    // Never restore inventory from this generic catch path.
    console.error("create-order failed:", error instanceof Error ? error.message : "Unknown error");
    return json({
      success: false,
      pendingReconciliation: Boolean(createdOrderId),
      ...(createdOrderId ? { merchantOrderId: createdOrderId } : {}),
      error: "Checkout gagal diproses. Jika nomor pesanan tersedia, jangan ulangi checkout sebelum pemeriksaan.",
    }, 500);
  }
}));
