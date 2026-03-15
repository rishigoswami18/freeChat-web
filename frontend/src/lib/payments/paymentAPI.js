import { getRazorpayKey, createMembershipOrder, verifyMembershipPayment } from "../api";

export const initializePaymentSession = async () => {
    try {
        // 1. Get Razorpay key
        const { key } = await getRazorpayKey();
        if (!key) throw new Error("Platform configuration error: Missing Gateway Key.");

        // 2. Create order on backend
        const { order } = await createMembershipOrder();
        if (!order || !order.id) throw new Error("Failed to generate secure checkout session.");

        return { key, order };
    } catch (error) {
        console.error("Checkout Initialization Error:", error);
        throw error;
    }
};

export const processPaymentVerification = async (paymentResponse) => {
    try {
        await verifyMembershipPayment({
            razorpay_order_id: paymentResponse.razorpay_order_id,
            razorpay_payment_id: paymentResponse.razorpay_payment_id,
            razorpay_signature: paymentResponse.razorpay_signature,
        });
        return true;
    } catch (error) {
        console.error("Payment Verification Error:", error);
        throw error;
    }
};
