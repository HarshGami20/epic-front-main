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

export interface PublicCoupon {
  id: string;
  code: string;
  description?: string;
  type: "PERCENTAGE" | "FIXED";
  value: number;
  minOrderAmount?: number;
  maxDiscount?: number;
}

export const fetchPublicCoupons = async (): Promise<PublicCoupon[]> => {
  const base = getPublicApiUrl();
  const res = await fetch(`${base}/public/coupons`, {
    cache: "no-store",
  });
  if (!res.ok) return [];
  const json = await res.json();
  return json.data || [];
};
