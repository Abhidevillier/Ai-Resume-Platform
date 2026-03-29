import { useCallback, useState } from "react";
import toast from "react-hot-toast";
import apiClient from "@/lib/apiClient";
import { loadRazorpayScript } from "@/lib/razorpay";
import { useAuthStore } from "@/store/authStore";
import { useAuth } from "./useAuth";
import { PlanId } from "@/types";

interface OrderResponse {
  orderId: string;
  amount: number;
  currency: string;
  keyId: string;
  planLabel: string;
}

export const usePayment = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { updateUser } = useAuthStore();

  const initiatePayment = useCallback(
    async (planId: PlanId) => {
      setIsLoading(true);

      try {
        // 1. Load Razorpay checkout script
        const scriptLoaded = await loadRazorpayScript();
        if (!scriptLoaded) {
          toast.error("Failed to load payment gateway. Check your internet connection.");
          return;
        }

        // 2. Create order on backend
        const { data } = await apiClient.post<{ success: boolean; data: OrderResponse }>(
          "/payment/create-order",
          { planId }
        );
        const { orderId, amount, currency, keyId, planLabel } = data.data;

        // 3. Open Razorpay checkout modal
        await new Promise<void>((resolve, reject) => {
          const rzp = new window.Razorpay({
            key: keyId,
            amount,
            currency,
            name: "Resumiq",
            description: `${planLabel} Plan`,
            order_id: orderId,
            prefill: {
              name: user?.name,
              email: user?.email,
            },
            theme: { color: "#4f46e5" },
            handler: async (response) => {
              // 4. Verify payment on backend
              try {
                await apiClient.post("/payment/verify", {
                  razorpayOrderId: response.razorpay_order_id,
                  razorpayPaymentId: response.razorpay_payment_id,
                  razorpaySignature: response.razorpay_signature,
                  planId,
                });

                // 5. Update local user state so UI reflects Pro immediately
                const expiresAt = new Date();
                expiresAt.setDate(expiresAt.getDate() + (planId === "pro_annual" ? 365 : 30));
                updateUser({ plan: "pro", planExpiresAt: expiresAt.toISOString() });

                toast.success("🎉 Welcome to Pro! All features are now unlocked.", { duration: 5000 });
                resolve();
              } catch (err) {
                reject(err);
              }
            },
            modal: {
              ondismiss: () => {
                toast("Payment cancelled.", { icon: "ℹ️" });
                resolve(); // not an error — user dismissed
              },
            },
          });

          rzp.open();
        });
      } catch (error: unknown) {
        const msg =
          (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          "Payment failed. Please try again.";
        toast.error(msg);
      } finally {
        setIsLoading(false);
      }
    },
    [user, updateUser]
  );

  return { initiatePayment, isLoading };
};
