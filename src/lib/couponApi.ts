import { getPublicApiUrl } from "@/lib/env";

export interface CouponValidationResult {
  coupon: {
    id: string;
    code: string;
    type: "PERCENTAGE" | "FIXED";
    value: number;
    description?: string;
  };
  subtotal: number;
  discount: number;
  discountedSubtotal: number;
}

export const validateCoupon = async (code: string, subtotal: number): Promise<CouponValidationResult> => {
  const base = getPublicApiUrl();
  const res = await fetch(`${base}/coupons/validate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code, subtotal }),
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.message || "Invalid coupon code");
  }
  return json.data;
};
