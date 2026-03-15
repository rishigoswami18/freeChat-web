import { useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";

// Hooks
import useAuthUser from "../hooks/useAuthUser";
import { useMembershipState, useCancelMembership } from "../hooks/useMembership";
import { useRazorpay } from "../hooks/useRazorpay";

// Payment Utils
import { initializePaymentSession } from "../lib/payments/paymentAPI";
import { launchRazorpayCheckout } from "../lib/payments/razorpayClient";

// Logic Utils
import { isFreeTrial, getFreeTrialEnd } from "../lib/premium";

// Components
import MembershipHeader from "../components/membership/MembershipHeader";
import FreeTrialBanner from "../components/membership/FreeTrialBanner";
import ActiveMembershipCard from "../components/membership/ActiveMembershipCard";
import PurchaseMembershipCard from "../components/membership/PurchaseMembershipCard";
import { PREMIUM_FEATURES } from "../components/membership/MembershipFeatures";

const MembershipPage = () => {
    const queryClient = useQueryClient();
    const { authUser } = useAuthUser();
    
    // 1. Data Subscriptions
    const { data: membership, isLoading } = useMembershipState();
    const { mutate: cancel, isPending: isCancelling } = useCancelMembership();
    
    // 2. Local UI State
    const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);
    
    // 3. Razorpay Infrastructure
    const { loadRazorpay } = useRazorpay();

    // 4. Payment Flow Logic
    const handlePayment = async () => {
        if (isPaymentProcessing) return;
        
        setIsPaymentProcessing(true);
        try {
            // Load Razorpay Script
            const scriptLoaded = await loadRazorpay();
            if (!scriptLoaded) {
                throw new Error("Razorpay SDK failed to load. Are you offline?");
            }

            // Initiate Session with Backend
            const { key, order } = await initializePaymentSession();

            // Launch UI
            launchRazorpayCheckout({
                key,
                order,
                authUser,
                onSuccess: () => {
                    toast.success("Payment successful! Welcome to Premium! 🎉");
                    // Sync application state
                    queryClient.invalidateQueries({ queryKey: ["membershipStatus"] });
                    queryClient.invalidateQueries({ queryKey: ["authUser"] });
                    setIsPaymentProcessing(false);
                },
                onError: (errorMsg) => {
                    toast.error(errorMsg);
                    setIsPaymentProcessing(false);
                },
                onCancel: () => {
                    toast.error("Payment cancelled");
                    setIsPaymentProcessing(false);
                }
            });
        } catch (err) {
            console.error("Payment Initiation Failed:", err);
            toast.error(err.message || "Failed to initiate payment session.");
            setIsPaymentProcessing(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center py-20" aria-busy="true">
                <Loader2 className="size-8 animate-spin text-primary" />
            </div>
        );
    }

    const { isMember, memberSince, role } = membership || {};

    return (
        <main className="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto space-y-8 animate-fade-in" aria-label="Membership Management">
            <MembershipHeader />

            {isFreeTrial() && <FreeTrialBanner trialEndDate={getFreeTrialEnd()} />}

            {isMember ? (
                <ActiveMembershipCard 
                    role={role}
                    memberSince={memberSince}
                    onCancel={cancel}
                    isCancelling={isCancelling}
                />
            ) : (
                <PurchaseMembershipCard 
                    features={PREMIUM_FEATURES}
                    onPayment={handlePayment}
                    isProcessing={isPaymentProcessing}
                />
            )}
        </main>
    );
};

export default MembershipPage;
