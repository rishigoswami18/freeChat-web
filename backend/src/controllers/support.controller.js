import SupportMessage from "../models/SupportMessage.js";
import { sendSupportEmail } from "../lib/email.service.js";

export const submitSupportMessage = async (req, res) => {
    try {
        const { fullName, email, message } = req.body;

        if (!fullName || !email || !message) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const newMessage = new SupportMessage({
            fullName,
            email,
            message,
        });

        await newMessage.save();

        // Send email notification (Fail silently for now to not block the user's success)
        try {
            await sendSupportEmail(fullName, email, message);
        } catch (emailError) {
            console.error("Failed to send support email:", emailError.message);
        }

        res.status(201).json({
            message: "Support message submitted successfully",
            data: newMessage,
        });
    } catch (error) {
        console.error("Error in submitSupportMessage controller:", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};
