/**
 * Duitku POP browser integration.
 *
 * Invoice creation is performed by the server-side Supabase Edge Function.
 * Browser callbacks are informational only; payment status is authoritative
 * only after the verified HTTP callback updates the order on the backend.
 */
import { supabase } from "./supabaseClient";

declare global {
  interface Window {
    checkout?: {
      process: (
        reference: string,
        options: {
          defaultLanguage?: "id" | "en";
          successEvent?: (result: any) => void;
          pendingEvent?: (result: any) => void;
          errorEvent?: (result: any) => void;
          closeEvent?: (result: any) => void;
        }
      ) => void;
    };
  }
}

export interface DuitkuItemDetail {
  name: string;
  price: number;
  quantity: number;
}

export interface CreateInvoiceRequest {
  merchantOrderId: string;
  paymentAmount: number;
  productDetails: string;
  email: string;
  phoneNumber: string;
  customerName: string;
  itemDetails?: DuitkuItemDetail[];
  paymentMethod?: string;
  callbackUrl?: string;
  returnUrl?: string;
}

export interface DuitkuInvoiceResponse {
  merchantCode?: string;
  reference: string;
  paymentUrl?: string;
  vaNumber?: string;
  amount?: string;
  statusCode: string;
  statusMessage?: string;
}

/** Load the official Duitku POP JavaScript SDK. */
export async function loadDuitkuScript(isProduction = false): Promise<void> {
  if (typeof window === "undefined") {
    throw new Error("Duitku POP hanya dapat dijalankan di browser.");
  }

  const scriptId = "duitku-pop-script";
  const scriptUrl = isProduction
    ? "https://app-prod.duitku.com/lib/js/duitku.js"
    : "https://app-sandbox.duitku.com/lib/js/duitku.js";
  const existingScript = document.getElementById(scriptId) as HTMLScriptElement | null;

  if (existingScript && window.checkout?.process) return;

  if (existingScript) existingScript.remove();

  await new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.id = scriptId;
    script.src = scriptUrl;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      script.remove();
      reject(new Error("Gagal memuat Duitku POP. Periksa koneksi dan konfigurasi CSP."));
    };
    document.head.appendChild(script);
  });

  if (!window.checkout || typeof window.checkout.process !== "function") {
    throw new Error("SDK Duitku POP termuat tetapi checkout.process tidak tersedia.");
  }
}

/**
 * Create a real Duitku invoice through the repository's Edge Function.
 * Any transport/provider error is surfaced; no mock reference is generated.
 */
export async function createDuitkuInvoice(
  request: CreateInvoiceRequest
): Promise<DuitkuInvoiceResponse> {
  const { data, error } = await supabase.functions.invoke("create-invoice", {
    body: request,
  });

  if (error) {
    console.error("[Duitku] Invoice Edge Function failed:", error);
    throw new Error("Gagal membuat invoice Duitku. Silakan coba kembali.");
  }

  if (!data || data.statusCode !== "00" || typeof data.reference !== "string" || !data.reference) {
    throw new Error(data?.statusMessage || "Duitku tidak mengembalikan invoice yang valid.");
  }

  return data as DuitkuInvoiceResponse;
}

/**
 * Open the real POP modal. Success/pending/error/close events are UI signals,
 * not payment confirmation. The backend callback remains authoritative.
 */
export async function processDuitkuPayment(
  reference: string,
  callbacks: {
    onSuccess?: (result: any) => void;
    onPending?: (result: any) => void;
    onError?: (result: any) => void;
    onClose?: (result: any) => void;
  }
): Promise<void> {
  if (!reference) throw new Error("Referensi pembayaran Duitku tidak tersedia.");

  await loadDuitkuScript(false);

  if (!window.checkout?.process) {
    throw new Error("Duitku POP tidak tersedia. Pembayaran tidak dapat dilanjutkan.");
  }

  window.checkout.process(reference, {
    defaultLanguage: "id",
    successEvent: (result: any) => {
      console.info("[Duitku POP] Browser success event received; awaiting server verification.");
      callbacks.onSuccess?.(result);
    },
    pendingEvent: (result: any) => callbacks.onPending?.(result),
    errorEvent: (result: any) => callbacks.onError?.(result),
    closeEvent: (result: any) => callbacks.onClose?.(result),
  });
}
