/**
 * Brevo (Sendinblue) API Integration
 */
export const sendViaBrevo = async ({ to, subject, html, replyTo }) => {
    const apiKey = process.env.BREVO_API_KEY;
    if (!apiKey) throw new Error("BREVO_API_KEY not set");

    const senderEmail = process.env.SMTP_USER || process.env.OWNER_EMAIL || "support@Zyro.in";

    const body = {
        sender: { name: "Zyro", email: senderEmail },
        to: [{ email: to }],
        subject,
        htmlContent: html,
    };

    if (replyTo) {
        body.replyTo = { email: replyTo };
    }

    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
            "api-key": apiKey,
            "Content-Type": "application/json",
            "Accept": "application/json",
        },
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Brevo error: ${errorData.message || response.statusText}`);
    }

    return await response.json();
};
