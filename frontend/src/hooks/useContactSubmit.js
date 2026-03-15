import { useMutation } from "@tanstack/react-query";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

/**
 * Custom hook to abstract the contact submission logic from the UI.
 * Handles the API call, success/error toasts, and sanitization before sending.
 */
export const useContactSubmit = (onSuccessCallback) => {
    return useMutation({
        mutationFn: async (formData) => {
            // Basic sanitization: Trim inputs before submission
            const sanitizedData = {
                fullName: formData.fullName.trim(),
                email: formData.email.trim().toLowerCase(),
                message: formData.message.trim(),
            };

            // Basic validation
            if (!sanitizedData.fullName || !sanitizedData.email || !sanitizedData.message) {
                throw new Error("All fields are required.");
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(sanitizedData.email)) {
                throw new Error("Invalid email format.");
            }

            const response = await axiosInstance.post("/support", sanitizedData);
            return response.data;
        },
        onSuccess: () => {
            toast.success("Message sent! We'll get back to you soon.");
            if (typeof onSuccessCallback === "function") {
                onSuccessCallback();
            }
        },
        onError: (error) => {
            console.error("Error submitting contact form:", error);
            const errorMessage = error.response?.data?.message || error.message || "Something went wrong. Please try again.";
            toast.error(errorMessage);
        },
    });
};
