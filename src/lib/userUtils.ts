import IMAGES from "@/constant/theme";
import { resolvePublicMediaUrl } from "@/lib/imageUtils";

export interface UserProfile {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  role?: string;
  avatar?: string | null;
}

export const USER_UPDATED_EVENT = "epiclance-user-updated";

export function getUserDisplayName(user?: UserProfile | null): string {
  if (!user) return "User";
  const name = [user.firstName, user.lastName].filter(Boolean).join(" ").trim();
  return name || user.email?.split("@")[0] || "User";
}

export function getUserAvatarUrl(user?: UserProfile | null): string {
  const avatar = user?.avatar;
  if (avatar) {
    return resolvePublicMediaUrl(avatar) || IMAGES.ProfilePic.src;
  }
  return IMAGES.ProfilePic.src;
}

export function readStoredUser(): UserProfile | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("user");
  if (!raw) return null;
  try {
    return JSON.parse(raw) as UserProfile;
  } catch {
    return null;
  }
}

export function persistUser(user: UserProfile): void {
  localStorage.setItem("user", JSON.stringify(user));
  window.dispatchEvent(new CustomEvent(USER_UPDATED_EVENT, { detail: user }));
}

export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}
