import { processPaymentVerification } from "./paymentAPI";

/**
 * Initializes and mounts the Razorpay checkout modal widget safely on the client window.
 * Decoupled from React to ensure pure JS execution isolated from Virtual DOM updates.
 */
export const launchRazorpayCheckout = ({
    key,
    order,
    authUser,
    onSuccess,
    onError,
    onCancel
}) => {
    if (!window.Razorpay) {
        return onError("Payment gateway not loaded. Please refresh the page and try again.");
    }

    const options = {
        key,
        amount: order.amount,
        currency: order.currency,
        name: "Zyro Premium",
        description: "Monthly Premium Membership — ₹49/month",
        order_id: order.id,
        handler: async (response) => {
            try {
                // Perform secure signature verifications
                await processPaymentVerification(response);
                onSuccess(response);
            } catch (err) {
                onError("Payment verification failed. Your money is safe and will be refunded if deducted. Please contact support.");
            }
        },
        prefill: {
            name: authUser?.fullName || "",
            email: authUser?.email || "",
        },
        theme: {
            color: "#6366f1",
        },
        modal: {
            ondismiss: onCancel,
        },
        retry: {
            enabled: false // Disable default retry to handle custom error UI mapping directly
        }
    };

    const rzp = new window.Razorpay(options);

    rzp.on("payment.failed", (response) => {
        let msg = response.error.description || "Unknown error occurred.";
        if (msg.toLowerCase().includes("merchant")) {
            msg = "Platform configuration issue. Please contact support.";
        }
        onError(`Payment declined: ${msg}`);
        // Log secure details to your error catching platform silently here
        console.error("[Razorpay Error]", response.error);
    });

    rzp.open();
};
