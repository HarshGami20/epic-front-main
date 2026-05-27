import { getPublicApiUrl } from "@/lib/env";

// getPublicApiUrl() returns something like "http://localhost:5001/api"
// Returns are at /api/returns

export const submitReturnRequest = async (orderId: string, reason: string, token: string) => {
  const base = getPublicApiUrl();
  const res = await fetch(`${base}/returns`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ orderId, reason }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || `Failed to submit return request (${res.status})`);
  return json.data;
};

export const fetchUserReturnRequests = async (token: string, page = 1, limit = 10) => {
  const base = getPublicApiUrl();
  const res = await fetch(`${base}/returns?page=${page}&limit=${limit}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || `Failed to fetch return requests (${res.status})`);
  return { requests: json.requests || [], pagination: json.pagination || { page: 1, pages: 1 } };
};
