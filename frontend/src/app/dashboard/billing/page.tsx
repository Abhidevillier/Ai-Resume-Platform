"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Crown, CreditCard, CheckCircle2, Clock, XCircle, Loader2, ArrowRight, AlertTriangle } from "lucide-react";
import apiClient from "@/lib/apiClient";
import { useAuth } from "@/hooks/useAuth";
import { usePayment } from "@/hooks/usePayment";
import { cn } from "@/lib/utils";

interface Payment {
  _id: string;
  plan: string;
  amount: number;
  currency: string;
  status: "created" | "paid" | "failed" | "refunded";
  planValidUntil: string | null;
  createdAt: string;
  razorpayOrderId: string;
}

const STATUS_CONFIG = {
  paid:     { label: "Paid",    color: "text-green-600 bg-green-50",  icon: CheckCircle2 },
  created:  { label: "Pending", color: "text-yellow-600 bg-yellow-50",icon: Clock },
  failed:   { label: "Failed",  color: "text-red-600 bg-red-50",      icon: XCircle },
  refunded: { label: "Refunded",color: "text-slate-600 bg-slate-100", icon: XCircle },
};

const PLAN_LABELS: Record<string, string> = {
  pro_monthly: "Pro Monthly",
  pro_annual:  "Pro Annual",
};

export default function BillingPage() {
  const { user } = useAuth();
  const { initiatePayment, isLoading } = usePayment();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await apiClient.get<{ success: boolean; data: { payments: Payment[] } }>(
          "/payment/history"
        );
        setPayments(data.data.payments);
      } catch { /* empty history is fine */ }
      finally { setIsFetching(false); }
    };
    fetch();
  }, []);

  const isPro = user?.plan === "pro";
  const expiresAt = user?.planExpiresAt ? new Date(user.planExpiresAt) : null;
  const now = new Date();
  const isExpired = expiresAt ? expiresAt < now : false;
  const daysUntilExpiry = expiresAt && !isExpired
    ? Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    : null;
  const isExpiringSoon = daysUntilExpiry !== null && daysUntilExpiry <= 7;

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      <div>
        <h1 className="section-title flex items-center gap-2">
          <CreditCard className="w-6 h-6 text-primary-600" /> Billing & Plan
        </h1>
        <p className="section-subtitle">Manage your subscription and view payment history.</p>
      </div>

      {/* Expiry warning */}
      {isExpiringSoon && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200">
          <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-800">
              Your Pro plan expires in {daysUntilExpiry} day{daysUntilExpiry === 1 ? "" : "s"}
            </p>
            <p className="text-xs text-amber-600 mt-0.5">Renew now to keep your AI features and unlimited resumes.</p>
          </div>
          <button onClick={() => initiatePayment("pro_monthly")} disabled={isLoading} className="btn-primary shrink-0 text-sm gap-1.5">
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
            Renew
          </button>
        </div>
      )}

      {/* Current plan card */}
      <div className={cn(
        "card border-2",
        isPro && !isExpired ? "border-primary-200 bg-gradient-to-br from-primary-50 to-violet-50" : "border-slate-200"
      )}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Crown className={cn("w-5 h-5", isPro && !isExpired ? "text-primary-600" : "text-slate-400")} />
              <span className="font-bold text-lg text-slate-900 capitalize">
                {isPro && !isExpired ? "Pro Plan" : "Free Plan"}
              </span>
              {isPro && !isExpired && (
                <span className="badge-pro text-xs px-2 py-0.5">Active</span>
              )}
              {isExpired && isPro && (
                <span className="badge bg-red-100 text-red-600 text-xs px-2 py-0.5">Expired</span>
              )}
            </div>

            {isPro && expiresAt && (
              <p className={cn("text-sm", isExpired ? "text-red-500" : "text-slate-500")}>
                {isExpired
                  ? `Expired on ${expiresAt.toLocaleDateString()}`
                  : `Renews on ${expiresAt.toLocaleDateString()}`}
              </p>
            )}
            {!isPro && (
              <p className="text-sm text-slate-500">Upgrade to unlock AI features & unlimited resumes.</p>
            )}
          </div>

          {(!isPro || isExpired) && (
            <Link href="/pricing" className="btn-primary gap-2 shrink-0">
              <Crown className="w-4 h-4" />
              {isExpired ? "Renew Pro" : "Upgrade to Pro"}
            </Link>
          )}
        </div>

        {/* Plan features summary */}
        <div className="mt-5 pt-5 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
          {[
            { label: "Resumes",      value: isPro && !isExpired ? "Unlimited" : "1" },
            { label: "ATS Checker",  value: "Included" },
            { label: "AI Features",  value: isPro && !isExpired ? "Included" : "Pro only" },
            { label: "PDF Export",   value: "Included" },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-slate-400 text-xs">{label}</p>
              <p className={cn("font-medium mt-0.5", value === "Pro only" ? "text-slate-400" : "text-slate-800")}>{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Quick upgrade options */}
      {(!isPro || isExpired) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { id: "pro_monthly" as const, label: "Pro Monthly", price: "₹499/month", desc: "Billed monthly" },
            { id: "pro_annual"  as const, label: "Pro Annual",  price: "₹3,999/year", desc: "Save ₹1,989/year" },
          ].map((plan) => (
            <div key={plan.id} className="card flex items-center justify-between gap-4">
              <div>
                <p className="font-semibold text-slate-800">{plan.label}</p>
                <p className="text-sm text-primary-600 font-medium">{plan.price}</p>
                <p className="text-xs text-slate-400">{plan.desc}</p>
              </div>
              <button
                onClick={() => initiatePayment(plan.id)}
                disabled={isLoading}
                className="btn-primary gap-1.5 shrink-0"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                Buy
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Payment history */}
      <div>
        <h2 className="font-semibold text-slate-900 mb-3">Payment History</h2>
        {isFetching ? (
          <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-slate-300" /></div>
        ) : payments.length === 0 ? (
          <div className="card border-dashed border-slate-200 text-center py-10 text-slate-400">
            <CreditCard className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No payment history yet.</p>
          </div>
        ) : (
          <div className="card p-0 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Plan</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Amount</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payments.map((p) => {
                  const cfg = STATUS_CONFIG[p.status] || STATUS_CONFIG.created;
                  const Icon = cfg.icon;
                  return (
                    <tr key={p._id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-slate-800">
                        {PLAN_LABELS[p.plan] || p.plan}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        ₹{(p.amount / 100).toLocaleString("en-IN")}
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn("badge gap-1 text-xs", cfg.color)}>
                          <Icon className="w-3 h-3" />
                          {cfg.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-400">
                        {new Date(p.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
