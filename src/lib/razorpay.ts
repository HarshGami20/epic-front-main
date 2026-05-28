import { getRazorpayKeyId } from "@/lib/env";

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

export interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  image?: string;
  handler: (response: RazorpaySuccessResponse) => void | Promise<void>;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  theme?: {
    color?: string;
  };
  modal?: {
    ondismiss?: () => void;
  };
}

export interface RazorpaySuccessResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export interface RazorpayInstance {
  open: () => void;
  on: (event: string, handler: (response: { error: { description: string } }) => void) => void;
}

const RAZORPAY_SCRIPT_URL = "https://checkout.razorpay.com/v1/checkout.js";

let scriptPromise: Promise<void> | null = null;

export function loadRazorpayScript(): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Razorpay can only be loaded in the browser"));
  }

  if (window.Razorpay) {
    return Promise.resolve();
  }

  if (scriptPromise) {
    return scriptPromise;
  }

  scriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = RAZORPAY_SCRIPT_URL;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Razorpay SDK"));
    document.body.appendChild(script);
  });

  return scriptPromise;
}

export interface OpenRazorpayCheckoutParams {
  razorpayOrder: { id: string; amount: number; currency: string };
  orderNumber: string;
  customer: { name: string; email: string; phone: string };
  logoUrl?: string;
  onSuccess: (response: RazorpaySuccessResponse) => void | Promise<void>;
  onDismiss?: () => void;
  onFailure?: (message: string) => void;
}

export async function openRazorpayCheckout({
  razorpayOrder,
  orderNumber,
  customer,
  logoUrl,
  onSuccess,
  onDismiss,
  onFailure,
}: OpenRazorpayCheckoutParams): Promise<void> {
  await loadRazorpayScript();

  const key = getRazorpayKeyId();
  if (!key) {
    throw new Error("Razorpay key is not configured. Set NEXT_PUBLIC_RAZORPAY_KEY_ID.");
  }

  const options: RazorpayOptions = {
    key,
    amount: razorpayOrder.amount,
    currency: razorpayOrder.currency,
    name: "Epiclance",
    description: `Secure checkout Order #${orderNumber}`,
    order_id: razorpayOrder.id,
    image: logoUrl,
    handler: onSuccess,
    prefill: {
      name: customer.name,
      email: customer.email,
      contact: customer.phone,
    },
    theme: { color: "#2563EB" },
    modal: {
      ondismiss: onDismiss,
    },
  };

  const rzp = new window.Razorpay(options);
  rzp.on("payment.failed", (response) => {
    onFailure?.(response.error.description || "Payment failed");
  });
  rzp.open();
}
