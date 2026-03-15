import { sendViaBrevo } from "./brevoClient.js";
import { sendViaSMTP } from "./smtpClient.js";

/**
 * Core Email Dispatcher with redundancy and logging
 */
export const EmailDispatcher = {
    /**
     * Attempts to send email through primary provider, falls back to SMTP
     */
    dispatch: async (options) => {
        const { to, subject, type = "general" } = options;
        
        console.log(`[EmailDispatcher] Dispatching "${subject}" to ${to} [Type: ${type}]`);

        // 1. Try Brevo (Primary)
        if (process.env.BREVO_API_KEY) {
            try {
                const res = await sendViaBrevo(options);
                console.log(`[EmailDispatcher] Success: Sent via Brevo (${res.messageId || 'API OK'})`);
                return res;
            } catch (err) {
                console.warn(`[EmailDispatcher] Brevo failed for ${to}: ${err.message}`);
            }
        }

        // 2. Try SMTP (Secondary/Local Fallback)
        if (process.env.SMTP_USER && process.env.SMTP_PASS) {
            try {
                const res = await sendViaSMTP(options);
                console.log(`[EmailDispatcher] Success: Sent via SMTP (${res.messageId})`);
                return res;
            } catch (err) {
                console.warn(`[EmailDispatcher] SMTP failed for ${to}: ${err.message}`);
            }
        }

        throw new Error(`[EmailDispatcher] All providers failed for recipient: ${to}`);
    }
};
