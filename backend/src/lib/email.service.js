import { EmailService } from "../services/email/emailService.js";
import { EmailDispatcher } from "../services/email/emailDispatcher.js";
import { baseTemplate } from "../services/email/templateEngine.js";

/**
 * LEGACY WRAPPER: Routes all legacy calls through the new modular engine.
 * Ensures zero-breaking changes for existing controllers.
 */

export const sendOTPEmail = async (email, otp) => {
    return await EmailService.sendOTP(email, otp, "verification");
};

export const sendResetPasswordEmail = async (email, otp) => {
    return await EmailService.sendOTP(email, otp, "reset");
};

export const sendWelcomeEmail = async (email, fullName) => {
    return await EmailService.sendWelcome(email, fullName);
};

export const sendNotificationEmail = async (to, options) => {
    return await EmailService.sendNotification(to, options);
};

export const sendSupportEmail = async (fullName, email, message) => {
    const to = process.env.OWNER_EMAIL || process.env.SMTP_USER;
    const body = `
        <h2 style="color:#6366f1;">New Support Message</h2>
        <p><strong>Name:</strong> ${fullName}</p>
        <p><strong>Email:</strong> ${email}</p>
        <hr/>
        <div style="background:#f4f4f4;padding:15px;border-radius:5px;">${message}</div>
    `;

    return await EmailDispatcher.dispatch({
        to,
        replyTo: email,
        subject: `New Support Message from ${fullName}`,
        html: baseTemplate(body, { title: "Support" }),
        text: message,
        type: "support"
    });
};

export const sendBroadcastEmail = async (email, subject, message) => {
    const body = `
        <h2 style="color:#333;margin-top:0;">Special Announcement</h2>
        <div style="color:#444;line-height:1.6;font-size:16px;">
            ${message.replace(/\n/g, '<br/>')}
        </div>
    `;

    return await EmailDispatcher.dispatch({
        to: email,
        subject,
        html: baseTemplate(body, { title: "Broadcast" }),
        text: message,
        type: "broadcast"
    });
};

// Also support legacy sendInviteEmail
export const sendInviteEmail = async (email, customSubject, customMessage) => {
    const appUrl = process.env.CLIENT_URL || "https://Zyro.in";
    const body = `
        <h2 style="color:#1f2937;margin:0 0 16px 0;font-size:24px;font-weight:800;">Hey there! 👋</h2>
        <p style="color:#4b5563;line-height:1.8;font-size:16px;">${customMessage || "You've been personally invited to join Zyro!"}</p>
        <div style="text-align:center;margin:32px 0;">
            <a href="${appUrl}" style="display:inline-block;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#ffffff;text-decoration:none;padding:16px 48px;border-radius:50px;font-size:18px;font-weight:800;">Join Now →</a>
        </div>
    `;

    return await EmailDispatcher.dispatch({
        to: email,
        subject: customSubject || "You're Invited to Zyro",
        html: baseTemplate(body, { title: "Invitation" }),
        type: "invite"
    });
};
