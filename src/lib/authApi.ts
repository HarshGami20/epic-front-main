import { getPublicApiUrl } from "@/lib/env";
import type { UserProfile } from "@/lib/userUtils";

async function parseJsonResponse(res: Response) {
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.message || `Request failed (${res.status})`);
  }
  return json.data;
}

function authHeaders(token: string, json = true) {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
  };
  if (json) {
    headers["Content-Type"] = "application/json";
  }
  return headers;
}

export const loginUser = async (data: {
  email: string;
  password: string;
}) => {
  const base = getPublicApiUrl();
  const res = await fetch(`${base}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  return parseJsonResponse(res);
};

export const registerUser = async (data: {
  firstName: string;
  lastName?: string;
  email: string;
  phone?: string;
  password: string;
}) => {
  const base = getPublicApiUrl();
  const res = await fetch(`${base}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  return parseJsonResponse(res);
};

export const fetchUserProfile = async (token: string): Promise<UserProfile> => {
  const base = getPublicApiUrl();
  const res = await fetch(`${base}/auth/profile`, {
    method: "GET",
    headers: authHeaders(token, false),
  });

  return parseJsonResponse(res);
};

export const updateUserProfile = async (
  token: string,
  payload: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    avatar?: string | null;
    password?: string;
    currentPassword?: string;
  }
): Promise<UserProfile> => {
  const base = getPublicApiUrl();
  const res = await fetch(`${base}/auth/profile`, {
    method: "PUT",
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });

  return parseJsonResponse(res);
};

export const uploadUserAvatar = async (token: string, file: File): Promise<string> => {
  const base = getPublicApiUrl();
  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", "users");

  const res = await fetch(`${base}/media/upload`, {
    method: "POST",
    headers: authHeaders(token, false),
    body: formData,
  });

  const media = await parseJsonResponse(res);
  return media.url as string;
};
