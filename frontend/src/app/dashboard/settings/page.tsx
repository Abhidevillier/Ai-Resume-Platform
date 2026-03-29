"use client";

import { useState, useEffect } from "react";
import {
  User, Lock, Bell, Trash2, Save, Eye, EyeOff,
  Crown, AlertTriangle, CheckCircle2, Loader2,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { cn, AVATAR_COLORS, getAvatarStyle } from "@/lib/utils";

type Tab = "profile" | "security" | "notifications" | "account";

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "profile",       label: "Profile",       icon: User },
  { id: "security",      label: "Security",       icon: Lock },
  { id: "notifications", label: "Notifications",  icon: Bell },
  { id: "account",       label: "Account",        icon: Trash2 },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("profile");

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold font-display text-slate-900">Settings</h1>
        <p className="text-slate-500 text-sm mt-1">Manage your account preferences and security.</p>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
              activeTab === id
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            )}
          >
            <Icon className="w-4 h-4" />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {/* Tab panels */}
      <div className="card">
        {activeTab === "profile"       && <ProfileTab />}
        {activeTab === "security"      && <SecurityTab />}
        {activeTab === "notifications" && <NotificationsTab />}
        {activeTab === "account"       && <AccountTab />}
      </div>
    </div>
  );
}

// ── Profile Tab ───────────────────────────────────────────────────────────────

function ProfileTab() {
  const { user, updateProfile, isLoading } = useAuth();
  const [name, setName] = useState(user?.name ?? "");
  const [selectedColor, setSelectedColor] = useState<string>(
    user?.avatar && /^#[0-9a-fA-F]{6}$/.test(user.avatar)
      ? user.avatar
      : AVATAR_COLORS[0].hex
  );

  useEffect(() => {
    if (user?.name) setName(user.name);
    if (user?.avatar && /^#[0-9a-fA-F]{6}$/.test(user.avatar)) {
      setSelectedColor(user.avatar);
    }
  }, [user]);

  const handleSave = async () => {
    await updateProfile({ name: name.trim(), avatar: selectedColor });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-900 font-display">Profile Information</h2>
        <p className="text-sm text-slate-500 mt-0.5">Update your display name and avatar color.</p>
      </div>

      {/* Avatar preview */}
      <div className="flex items-center gap-5">
        <div
          className="w-20 h-20 rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-md transition-all duration-300"
          style={getAvatarStyle(selectedColor)}
        >
          {name.charAt(0).toUpperCase() || "?"}
        </div>
        <div>
          <p className="text-sm font-medium text-slate-700 mb-2">Avatar Color</p>
          <div className="flex gap-2">
            {AVATAR_COLORS.map((c) => (
              <button
                key={c.hex}
                title={c.label}
                onClick={() => setSelectedColor(c.hex)}
                className={cn(
                  "w-8 h-8 rounded-lg transition-all duration-150 border-2",
                  selectedColor === c.hex
                    ? "border-slate-900 scale-110 shadow-md"
                    : "border-transparent hover:scale-105"
                )}
                style={{ background: c.hex }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="input w-full"
          placeholder="Your name"
          maxLength={100}
        />
      </div>

      {/* Email (read-only) */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Email Address</label>
        <input
          type="email"
          value={user?.email ?? ""}
          readOnly
          className="input w-full bg-slate-50 text-slate-400 cursor-not-allowed"
        />
        <p className="text-xs text-slate-400 mt-1">Email cannot be changed.</p>
      </div>

      <button
        onClick={handleSave}
        disabled={isLoading || !name.trim()}
        className="btn-primary gap-2"
      >
        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        Save Changes
      </button>
    </div>
  );
}

// ── Security Tab ──────────────────────────────────────────────────────────────

function SecurityTab() {
  const { changePassword, isLoading } = useAuth();
  const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew]         = useState(false);
  const [errors, setErrors]           = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.currentPassword) e.currentPassword = "Required";
    if (!form.newPassword)     e.newPassword = "Required";
    else if (form.newPassword.length < 8) e.newPassword = "Minimum 8 characters";
    else if (!/[A-Z]/.test(form.newPassword)) e.newPassword = "Must contain an uppercase letter";
    else if (!/[0-9]/.test(form.newPassword)) e.newPassword = "Must contain a number";
    if (form.newPassword !== form.confirmPassword) e.confirmPassword = "Passwords do not match";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    try {
      await changePassword({ currentPassword: form.currentPassword, newPassword: form.newPassword });
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setErrors({});
    } catch {
      // error already toasted in hook
    }
  };

  const field = (
    key: keyof typeof form,
    label: string,
    show: boolean,
    toggle: () => void
  ) => (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          value={form[key]}
          onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
          className={cn("input w-full pr-10", errors[key] && "border-red-300 focus:border-red-400 focus:ring-red-100")}
          placeholder="••••••••"
        />
        <button
          type="button"
          onClick={toggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
        >
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
      {errors[key] && <p className="text-xs text-red-500 mt-1">{errors[key]}</p>}
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-900 font-display">Change Password</h2>
        <p className="text-sm text-slate-500 mt-0.5">Use a strong password with uppercase letters and numbers.</p>
      </div>

      {field("currentPassword", "Current Password", showCurrent, () => setShowCurrent((v) => !v))}
      {field("newPassword",     "New Password",     showNew,     () => setShowNew((v) => !v))}

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Confirm New Password</label>
        <input
          type="password"
          value={form.confirmPassword}
          onChange={(e) => setForm((f) => ({ ...f, confirmPassword: e.target.value }))}
          className={cn("input w-full", errors.confirmPassword && "border-red-300 focus:border-red-400 focus:ring-red-100")}
          placeholder="••••••••"
        />
        {errors.confirmPassword && <p className="text-xs text-red-500 mt-1">{errors.confirmPassword}</p>}
      </div>

      <button onClick={handleSubmit} disabled={isLoading} className="btn-primary gap-2">
        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
        Update Password
      </button>
    </div>
  );
}

// ── Notifications Tab ─────────────────────────────────────────────────────────

const NOTIFICATION_PREFS_KEY = "resumiq_notification_prefs";

interface NotifPrefs {
  productUpdates: boolean;
  proTips: boolean;
  security: boolean;
}

const DEFAULT_PREFS: NotifPrefs = { productUpdates: true, proTips: true, security: true };

function NotificationsTab() {
  const [prefs, setPrefs] = useState<NotifPrefs>(DEFAULT_PREFS);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(NOTIFICATION_PREFS_KEY);
      if (stored) setPrefs(JSON.parse(stored));
    } catch { /* ignore */ }
  }, []);

  const toggle = (key: keyof NotifPrefs) =>
    setPrefs((p) => ({ ...p, [key]: !p[key] }));

  const save = () => {
    localStorage.setItem(NOTIFICATION_PREFS_KEY, JSON.stringify(prefs));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const items: { key: keyof NotifPrefs; label: string; desc: string }[] = [
    { key: "productUpdates", label: "Product Updates",  desc: "New features, improvements, and announcements." },
    { key: "proTips",        label: "Pro Tips",         desc: "Weekly resume and job search tips from our team." },
    { key: "security",       label: "Security Alerts",  desc: "Login activity and account security notifications." },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-900 font-display">Notification Preferences</h2>
        <p className="text-sm text-slate-500 mt-0.5">Choose what emails you&apos;d like to receive.</p>
      </div>

      <div className="space-y-4">
        {items.map(({ key, label, desc }) => (
          <div key={key} className="flex items-start justify-between gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
            <div>
              <p className="text-sm font-medium text-slate-800">{label}</p>
              <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
            </div>
            <button
              onClick={() => toggle(key)}
              className={cn(
                "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200",
                prefs[key] ? "bg-violet-600" : "bg-slate-300"
              )}
            >
              <span
                className={cn(
                  "inline-block h-5 w-5 rounded-full bg-white shadow transform transition-transform duration-200",
                  prefs[key] ? "translate-x-5" : "translate-x-0"
                )}
              />
            </button>
          </div>
        ))}
      </div>

      <button onClick={save} className="btn-primary gap-2">
        {saved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
        {saved ? "Saved!" : "Save Preferences"}
      </button>
    </div>
  );
}

// ── Account Tab ───────────────────────────────────────────────────────────────

function AccountTab() {
  const { user, deleteAccount } = useAuth();
  const isPro = user?.plan === "pro";
  const [confirmText, setConfirmText] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (confirmText !== "DELETE") return;
    setIsDeleting(true);
    try {
      await deleteAccount();
    } catch {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-900 font-display">Account Details</h2>
        <p className="text-sm text-slate-500 mt-0.5">View your account status and manage your subscription.</p>
      </div>

      {/* Account info cards */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
          <p className="text-xs text-slate-400 font-medium uppercase tracking-wide mb-1">Current Plan</p>
          <div className="flex items-center gap-2">
            {isPro && <Crown className="w-4 h-4 text-violet-500" />}
            <span className="text-base font-bold text-slate-900 capitalize">{user?.plan}</span>
          </div>
          {isPro && user?.planExpiresAt && (
            <p className="text-xs text-slate-400 mt-1">
              Renews {new Date(user.planExpiresAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
            </p>
          )}
        </div>
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
          <p className="text-xs text-slate-400 font-medium uppercase tracking-wide mb-1">Member Since</p>
          <p className="text-base font-bold text-slate-900">
            {user?.createdAt
              ? new Date(user.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
              : "—"}
          </p>
        </div>
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
          <p className="text-xs text-slate-400 font-medium uppercase tracking-wide mb-1">Resumes Created</p>
          <p className="text-base font-bold text-slate-900">{user?.resumeCount ?? 0}</p>
        </div>
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
          <p className="text-xs text-slate-400 font-medium uppercase tracking-wide mb-1">Account Email</p>
          <p className="text-sm font-semibold text-slate-900 truncate">{user?.email}</p>
        </div>
      </div>

      {/* Danger zone */}
      <div className="border border-red-100 rounded-xl p-5 bg-red-50/50">
        <div className="flex items-start gap-3 mb-4">
          <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-red-700">Delete Account</h3>
            <p className="text-sm text-red-500 mt-0.5">
              Permanently delete your account and all associated resumes. This action cannot be undone.
            </p>
          </div>
        </div>

        {!showConfirm ? (
          <button
            onClick={() => setShowConfirm(true)}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-red-600 border border-red-200 hover:bg-red-100 transition-colors"
          >
            Delete My Account
          </button>
        ) : (
          <div className="space-y-3">
            <p className="text-sm font-medium text-red-700">
              Type <span className="font-mono font-bold">DELETE</span> to confirm:
            </p>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              className="input border-red-200 focus:border-red-400 focus:ring-red-100 w-full sm:w-64"
              placeholder="Type DELETE"
            />
            <div className="flex gap-3">
              <button
                onClick={handleDelete}
                disabled={confirmText !== "DELETE" || isDeleting}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-red-600 hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {isDeleting && <Loader2 className="w-4 h-4 animate-spin" />}
                Confirm Delete
              </button>
              <button
                onClick={() => { setShowConfirm(false); setConfirmText(""); }}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 border border-slate-200 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
