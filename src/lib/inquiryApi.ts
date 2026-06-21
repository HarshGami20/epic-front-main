import { getPublicApiUrl } from "@/lib/env";

export interface InquiryPayload {
  name: string;
  email?: string;
  mobile?: string;
  message: string;
  from: string;
}

export async function submitInquiry(data: InquiryPayload): Promise<unknown> {
  const base = getPublicApiUrl();
  const res = await fetch(`${base}/inquiries`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg =
      (json as { error?: string; message?: string }).error ||
      (json as { message?: string }).message ||
      "Failed to submit inquiry";
    throw new Error(msg);
  }
  return json;
}
