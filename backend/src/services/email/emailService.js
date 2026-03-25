import { EmailDispatcher } from "./emailDispatcher.js";
import { 
    baseTemplate, 
    generateOtpContent, 
    generateWelcomeContent, 
    generateNotificationContent 
} from "./templateEngine.js";

/**
 * High-level Email Service with pre-built templates
 */
export const EmailService = {
    /**
     * Send OTP for verification or reset
     */
    sendOTP: async (email, otp, type = "verification") => {
        const subject = `${otp} is your Zyro ${type === 'verification' ? 'verification' : 'password reset'} code`;
        const html = baseTemplate(generateOtpContent(otp, type), { title: type === 'verification' ? 'Verify' : 'Reset' });
        
        return await EmailDispatcher.dispatch({ 
            to: email, 
            subject, 
            html, 
            text: `Your code is: ${otp}`,
            type: "auth"
        });
    },

    /**
     * Send Welcome Email
     */
    sendWelcome: async (email, fullName) => {
        const firstName = fullName?.split(' ')[0] || 'Member';
        const html = baseTemplate(generateWelcomeContent(firstName), { title: "Welcome" });
        
        return await EmailDispatcher.dispatch({
            to: email,
            subject: `🎉 Welcome to Zyro, ${firstName}!`,
            html,
            type: "onboarding"
        });
    },

    /**
     * Send Dynamic Notification
     */
    sendNotification: async (to, { emoji, title, body, ctaText, ctaUrl }) => {
        const html = baseTemplate(
            generateNotificationContent(emoji, title, body, ctaText, ctaUrl),
            { title: "Notification" }
        );

        return await EmailDispatcher.dispatch({
            to,
            subject: `${emoji || '🔔'} ${title}`,
            html,
            text: body,
            type: "notification"
        });
    }
};
