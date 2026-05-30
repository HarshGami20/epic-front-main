import { getRazorpayKeyId } from "@/lib/env";

declare global {
  interface Window {
    Razorpay: new (options: RazorpayMagicOptions) => RazorpayInstance;
  }
}

export interface RazorpaySuccessResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export interface RazorpayPrediscount {
  label: string;
  value: string;
  gift_card_applied?: boolean;
}

export interface RazorpayMagicOptions {
  key: string;
  one_click_checkout: boolean;
  name: string;
  order_id: string;
  show_coupons?: boolean;
  handler: (response: RazorpaySuccessResponse) => void | Promise<void>;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
    coupon_code?: string;
    prediscount?: RazorpayPrediscount[];
  };
  image?: string;
  theme?: {
    color?: string;
  };
  modal?: {
    ondismiss?: () => void;
  };
}

export interface RazorpayInstance {
  open: () => void;
  on: (event: string, handler: (response: { error: { description: string } }) => void) => void;
}

const MAGIC_CHECKOUT_SCRIPT_URL = "https://checkout.razorpay.com/v1/magic-checkout.js";

let scriptPromise: Promise<void> | null = null;

export function formatRazorpayContact(phone: string): string {
  const digits = String(phone || "").replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("91") && digits.length >= 12) {
    return `+${digits}`;
  }
  if (digits.length === 10) {
    return `+91${digits}`;
  }
  return `+${digits}`;
}

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
    script.src = MAGIC_CHECKOUT_SCRIPT_URL;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Razorpay Magic Checkout SDK"));
    document.body.appendChild(script);
  });

  return scriptPromise;
}

export interface OpenRazorpayCheckoutParams {
  razorpayOrder: { id: string; amount: number; currency: string };
  /** Must match the key used to create the Razorpay order on the server. */
  keyId?: string;
  orderNumber: string;
  customer: { name: string; email: string; phone: string };
  logoUrl?: string;
  appliedCoupon?: { code: string; discountAmount: number } | null;
  onSuccess: (response: RazorpaySuccessResponse) => void | Promise<void>;
  onDismiss?: () => void;
  onFailure?: (message: string) => void;
}

export async function openRazorpayCheckout({
  razorpayOrder,
  keyId,
  customer,
  logoUrl,
  appliedCoupon,
  onSuccess,
  onDismiss,
  onFailure,
}: OpenRazorpayCheckoutParams): Promise<void> {
  await loadRazorpayScript();

  const key = keyId?.trim() || getRazorpayKeyId();
  if (!key) {
    throw new Error("Razorpay key is not configured. Set NEXT_PUBLIC_RAZORPAY_KEY_ID.");
  }

  const envKey = getRazorpayKeyId();
  if (keyId && envKey && keyId !== envKey) {
    console.warn(
      "[Razorpay] Using server keyId for checkout (differs from NEXT_PUBLIC_RAZORPAY_KEY_ID). Update startupkit .env so both match."
    );
  }

  const prefill: RazorpayMagicOptions["prefill"] = {
    name: customer.name,
    email: customer.email,
    contact: formatRazorpayContact(customer.phone),
  };

  if (appliedCoupon?.code) {
    prefill.coupon_code = appliedCoupon.code;
    if (appliedCoupon.discountAmount > 0) {
      prefill.prediscount = [
        {
          label: appliedCoupon.code,
          value: `₹ ${appliedCoupon.discountAmount.toFixed(2)}`,
        },
      ];
    }
  }

  const options: RazorpayMagicOptions = {
    key,
    one_click_checkout: true,
    name: "Epiclance",
    order_id: razorpayOrder.id,
    show_coupons: true,
    image: logoUrl,
    handler: onSuccess,
    prefill,
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
