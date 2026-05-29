"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { toast, Toaster } from "sonner";
import CommanBanner from "@/components/CommanBanner";
import IMAGES from "@/constant/theme";
import CommanSidebar from "@/elements/MyAccount/CommanSidebar";
import {
  fetchUserProfile,
  updateUserProfile,
  uploadUserAvatar,
} from "@/lib/authApi";
import {
  getAuthToken,
  getUserAvatarUrl,
  getUserDisplayName,
  persistUser,
  readStoredUser,
  type UserProfile,
} from "@/lib/userUtils";

export default function AccountProfile() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      const token = getAuthToken();
      const stored = readStoredUser();

      if (!token || !stored) {
        router.push("/login?redirect=/account-profile");
        return;
      }

      try {
        const profile = await fetchUserProfile(token);
        setUser(profile);
        setFirstName(profile.firstName || "");
        setLastName(profile.lastName || "");
        setPhone(profile.phone || "");
        persistUser(profile);
      } catch {
        setUser(stored);
        setFirstName(stored.firstName || "");
        setLastName(stored.lastName || "");
        setPhone(stored.phone || "");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [router]);

  const displayAvatar = useMemo(() => {
    if (avatarPreview) return avatarPreview;
    return getUserAvatarUrl(user);
  }, [avatarPreview, user]);

  const fileHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] ?? null;
    setAvatarFile(selected);
    if (selected) {
      setAvatarPreview(URL.createObjectURL(selected));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const token = getAuthToken();
    if (!token || !user) {
      router.push("/login?redirect=/account-profile");
      return;
    }

    if (newPassword || confirmPassword) {
      if (newPassword.length < 6) {
        toast.error("New password must be at least 6 characters.");
        return;
      }
      if (newPassword !== confirmPassword) {
        toast.error("New password and confirmation do not match.");
        return;
      }
      if (!currentPassword) {
        toast.error("Enter your current password to change it.");
        return;
      }
    }

    setSaving(true);
    try {
      let avatarUrl = user.avatar ?? null;

      if (avatarFile) {
        avatarUrl = await uploadUserAvatar(token, avatarFile);
      }

      const updated = await updateUserProfile(token, {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim(),
        avatar: avatarUrl,
        ...(newPassword
          ? { password: newPassword, currentPassword }
          : {}),
      });

      setUser(updated);
      persistUser(updated);
      setAvatarFile(null);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Profile updated successfully.");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to update profile.";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="page-content bg-light py-5">
        <div className="container text-center py-5 text-muted">Loading profile…</div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="page-content bg-light">
      <CommanBanner
        image={IMAGES.BackBg1.src}
        mainText="Profile"
        parentText="Home"
        currentText="Account Profile"
      />
      <div className="content-inner-1">
        <div className="container">
          <div className="row">
            <CommanSidebar />
            <section className="col-xl-9 account-wrapper">
              <div className="account-card">
                <div className="profile-edit d-flex flex-wrap align-items-center gap-4 mb-4">
                  <div className="avatar-upload d-flex align-items-center">
                    <div className="position-relative">
                      <div className="avatar-preview thumb">
                        <div
                          id="imagePreview"
                          style={{
                            backgroundImage: `url(${displayAvatar})`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                          }}
                        />
                      </div>
                      <div className="change-btn thumb-edit d-flex align-items-center flex-wrap">
                        <input
                          type="file"
                          className="form-control d-none"
                          onChange={fileHandler}
                          id="imageUpload"
                          accept=".png,.jpg,.jpeg,.webp"
                        />
                        <label htmlFor="imageUpload" className="btn btn-light ms-0">
                          <i className="fa-solid fa-camera" />
                        </label>
                      </div>
                    </div>
                  </div>
                  <div className="clearfix">
                    <h2 className="title mb-1">{getUserDisplayName(user)}</h2>
                    <span className="text text-primary d-block">{user.email}</span>
                    {user.phone && (
                      <span className="text-muted small d-block mt-1">{user.phone}</span>
                    )}
                  </div>
                </div>

                <form className="row" onSubmit={handleSubmit}>
                  <div className="col-lg-6">
                    <div className="form-group m-b25">
                      <label className="label-title">First Name</label>
                      <input
                        name="firstName"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                        className="form-control"
                        placeholder="First name"
                      />
                    </div>
                  </div>
                  <div className="col-lg-6">
                    <div className="form-group m-b25">
                      <label className="label-title">Last Name</label>
                      <input
                        name="lastName"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="form-control"
                        placeholder="Last name"
                      />
                    </div>
                  </div>
                  <div className="col-lg-6">
                    <div className="form-group m-b25">
                      <label className="label-title">Email address</label>
                      <input
                        type="email"
                        name="email"
                        value={user.email}
                        readOnly
                        className="form-control bg-light"
                      />
                    </div>
                  </div>
                  <div className="col-lg-6">
                    <div className="form-group m-b25">
                      <label className="label-title">Phone</label>
                      <input
                        type="tel"
                        name="phone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="form-control"
                        placeholder="Phone number"
                      />
                    </div>
                  </div>
                  <div className="col-12">
                    <p className="text-muted small mb-3">
                      Leave password fields blank to keep your current password.
                    </p>
                  </div>
                  <div className="col-lg-4">
                    <div className="form-group m-b25">
                      <label className="label-title">Current password</label>
                      <input
                        type="password"
                        name="currentPassword"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="form-control"
                        autoComplete="current-password"
                      />
                    </div>
                  </div>
                  <div className="col-lg-4">
                    <div className="form-group m-b25">
                      <label className="label-title">New password</label>
                      <input
                        type="password"
                        name="newPassword"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="form-control"
                        autoComplete="new-password"
                      />
                    </div>
                  </div>
                  <div className="col-lg-4">
                    <div className="form-group m-b25">
                      <label className="label-title">Confirm new password</label>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="form-control"
                        autoComplete="new-password"
                      />
                    </div>
                  </div>
                  <div className="col-12 d-flex justify-content-end">
                    <button
                      className="btn btn-primary mt-2"
                      type="submit"
                      disabled={saving}
                    >
                      {saving ? "Saving…" : "Update profile"}
                    </button>
                  </div>
                </form>
              </div>
            </section>
          </div>
        </div>
      </div>
      <Toaster position="top-center" richColors closeButton />
    </div>
  );
}
