import { getPublicApiUrl } from "@/lib/env";

export const createRazorpayOrder = async (orderData: any, token: string) => {
  const base = getPublicApiUrl();
  const res = await fetch(`${base}/orders/razorpay/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify(orderData),
  });

  const json = await res.json();
  if (!res.ok) {
    const msg =
      json.message ||
      json.error ||
      (typeof json.errors === "string" ? json.errors : null) ||
      `Failed to create order (${res.status})`;
    throw new Error(msg);
  }
  return json.data;
};

export const verifyPayment = async (verificationData: any, token: string) => {
  const base = getPublicApiUrl();
  const res = await fetch(`${base}/orders/razorpay/verify`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify(verificationData),
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.message || `Failed to verify payment (${res.status})`);
  }
  return json.data;
};

export const fetchUserOrders = async (token: string, page = 1, limit = 10) => {
  const base = getPublicApiUrl();
  const res = await fetch(`${base}/orders?page=${page}&limit=${limit}`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`,
    },
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.message || `Failed to fetch orders (${res.status})`);
  }
  return {
    orders: json.data ?? [],
    pagination: json.pagination ?? { page: 1, limit: 10, total: 0, pages: 1 },
  };
};

export const fetchOrderById = async (orderId: string, token: string) => {
  const base = getPublicApiUrl();
  const res = await fetch(`${base}/orders/${orderId}`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`,
    },
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.message || `Failed to fetch order details (${res.status})`);
  }
  return json.data;
};
