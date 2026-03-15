import { useState, useCallback } from "react";

export const useRazorpay = () => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const loadRazorpay = useCallback(() => {
        return new Promise((resolve) => {
            if (window.Razorpay) {
                setIsLoaded(true);
                return resolve(true);
            }

            // Prevent multiple script insertions
            const existingScript = document.getElementById("razorpay-checkout");
            if (existingScript) {
                return resolve(true);
            }

            setIsLoading(true);
            const script = document.createElement("script");
            script.id = "razorpay-checkout";
            script.src = "https://checkout.razorpay.com/v1/checkout.js";
            script.async = true;

            script.onload = () => {
                setIsLoaded(true);
                setIsLoading(false);
                resolve(true);
            };

            script.onerror = () => {
                setIsLoading(false);
                resolve(false);
                // Optionally remove the script on error to allow retries
                script.remove();
            };

            document.body.appendChild(script);
        });
    }, []);

    return { loadRazorpay, isLoaded, isLoading };
};
