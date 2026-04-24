import { getPublicApiUrl } from "@/lib/env";

export const loginUser = async (data: any) => {
  const base = getPublicApiUrl();
  const res = await fetch(`${base}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.message || `Login failed (${res.status})`);
  }
  return json.data;
};

export const registerUser = async (data: any) => {
  const base = getPublicApiUrl();
  const res = await fetch(`${base}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.message || `Registration failed (${res.status})`);
  }
  return json.data;
};
