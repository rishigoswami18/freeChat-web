import nodemailer from "nodemailer";
import dns from "dns";

dns.setDefaultResultOrder("ipv4first");

/**
 * Send email via Brevo HTTP API (port 443 - NEVER blocked by any cloud provider)
 */
async function sendViaBrevo(to, replyTo, subject, htmlContent) {
    const apiKey = process.env.BREVO_API_KEY;
    if (!apiKey) throw new Error("BREVO_API_KEY not set");

    const senderEmail = process.env.SMTP_USER || process.env.OWNER_EMAIL;

    const body = {
        sender: { name: "freeChat Support", email: senderEmail },
        to: [{ email: to }],
        subject: subject,
        htmlContent: htmlContent,
    };

    if (replyTo) {
        body.replyTo = { email: replyTo };
    }

    console.log("[Email] Sending via Brevo HTTP API...");

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
        throw new Error(`Brevo API error [${response.status}]: ${errorData.message || response.statusText}`);
    }

    const data = await response.json();
    console.log("✅ Email sent via Brevo:", data.messageId);
    return { messageId: data.messageId };
}

/**
 * Send email via SMTP (works on localhost, may fail on cloud providers)
 */
async function sendViaSMTP(from, to, replyTo, subject, text, html) {
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
        tls: { rejectUnauthorized: false },
        connectionTimeout: 8000,
        socketTimeout: 10000,
    });

    const info = await transporter.sendMail({ from, to, replyTo, subject, text, html });
    console.log("✅ Email sent via SMTP:", info.messageId);
    return info;
}

/**
 * Smart email sender - tries Brevo first (HTTP), falls back to SMTP
 */
async function sendEmail(to, replyTo, subject, text, html) {
    // Method 1: Brevo HTTP API (works EVERYWHERE - port 443)
    if (process.env.BREVO_API_KEY) {
        try {
            return await sendViaBrevo(to, replyTo, subject, html);
        } catch (err) {
            console.warn("[Email] Brevo failed:", err.message);
        }
    }

    // Method 2: SMTP fallback (works on localhost)
    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
        try {
            const from = `"freeChat" <${process.env.SMTP_USER}>`;
            return await sendViaSMTP(from, to, replyTo, subject, text, html);
        } catch (err) {
            console.warn("[Email] SMTP failed:", err.message);
        }
    }

    throw new Error("All email methods failed. Set BREVO_API_KEY or SMTP credentials.");
}

// ===================== PUBLIC FUNCTIONS =====================

/**
 * Send support email notification
 */
export const sendSupportEmail = async (fullName, email, message) => {
    const to = process.env.OWNER_EMAIL || process.env.SMTP_USER;
    if (!to) throw new Error("No recipient email configured");

    return await sendEmail(
        to,
        email,
        `New Support Message from ${fullName}`,
        `Name: ${fullName}\nEmail: ${email}\nMessage: ${message}`,
        `<div style="font-family:Arial,sans-serif;line-height:1.6;color:#333;">
            <h2 style="color:#6366f1;">New Support Message</h2>
            <p><strong>Name:</strong> ${fullName}</p>
            <p><strong>Email:</strong> ${email}</p>
            <hr/>
            <p><strong>Message:</strong></p>
            <div style="background:#f4f4f4;padding:15px;border-radius:5px;">${message}</div>
        </div>`
    );
};

/**
 * Send OTP email for verification
 */
export const sendOTPEmail = async (email, otp) => {
    return await sendEmail(
        email,
        undefined,
        `${otp} is your freeChat verification code`,
        `Your verification code is: ${otp}`,
        `<div style="font-family:'Segoe UI',Tahoma,sans-serif;max-width:600px;margin:0 auto;padding:20px;border:1px solid #e0e0e0;border-radius:10px;background:#fff;">
            <div style="text-align:center;margin-bottom:20px;"><h1 style="color:#6366f1;margin:0;font-style:italic;">freeChat</h1></div>
            <div style="padding:20px;border-top:2px solid #6366f1;">
                <h2 style="color:#333;margin-top:0;">Verify your email</h2>
                <p style="color:#666;">Thank you for joining freeChat! Use the following code:</p>
                <div style="margin:30px 0;text-align:center;">
                    <span style="display:inline-block;padding:10px 30px;background:#f3f4f6;color:#6366f1;font-size:32px;font-weight:bold;letter-spacing:5px;border-radius:8px;border:1px dashed #6366f1;">${otp}</span>
                </div>
                <p style="color:#999;font-size:14px;">This code expires in 10 minutes.</p>
            </div>
            <div style="text-align:center;margin-top:20px;padding-top:20px;border-top:1px solid #eee;">
                <p style="color:#aaa;font-size:12px;">© 2026 freeChat. All rights reserved.</p>
            </div>
        </div>`
    );
};

/**
 * Send password reset OTP email
 */
export const sendResetPasswordEmail = async (email, otp) => {
    return await sendEmail(
        email,
        undefined,
        `${otp} is your freeChat password reset code`,
        `Your password reset code is: ${otp}`,
        `<div style="font-family:'Segoe UI',Tahoma,sans-serif;max-width:600px;margin:0 auto;padding:20px;border:1px solid #e0e0e0;border-radius:10px;background:#fff;">
            <div style="text-align:center;margin-bottom:20px;"><h1 style="color:#6366f1;margin:0;font-style:italic;">freeChat</h1></div>
            <div style="padding:20px;border-top:2px solid #6366f1;">
                <h2 style="color:#333;margin-top:0;">Reset your password</h2>
                <p style="color:#666;">Use the following code to reset your password:</p>
                <div style="margin:30px 0;text-align:center;">
                    <span style="display:inline-block;padding:10px 30px;background:#f3f4f6;color:#6366f1;font-size:32px;font-weight:bold;letter-spacing:5px;border-radius:8px;border:1px dashed #6366f1;">${otp}</span>
                </div>
                <p style="color:#999;font-size:14px;">This code expires in 10 minutes.</p>
            </div>
            <div style="text-align:center;margin-top:20px;padding-top:20px;border-top:1px solid #eee;">
                <p style="color:#aaa;font-size:12px;">© 2026 freeChat. All rights reserved.</p>
            </div>
        </div>`
    );
};

/**
 * Send a broadcast email to users
 */
export const sendBroadcastEmail = async (email, subject, message) => {
    return await sendEmail(
        email,
        undefined, // replyTo
        subject,
        message,
        `<div style="font-family:'Segoe UI',Tahoma,sans-serif;max-width:600px;margin:0 auto;padding:20px;border:1px solid #e0e0e0;border-radius:10px;background:#fff;">
            <div style="text-align:center;margin-bottom:20px;"><h1 style="color:#6366f1;margin:0;font-style:italic;">freeChat</h1></div>
            <div style="padding:20px;border-top:2px solid #6366f1;">
                <h2 style="color:#333;margin-top:0;">Special Announcement</h2>
                <div style="color:#444;line-height:1.6;font-size:16px;">
                    ${message.replace(/\n/g, '<br/>')}
                </div>
            </div>
            <div style="text-align:center;margin-top:20px;padding-top:20px;border-top:1px solid #eee;">
                <p style="color:#aaa;font-size:12px;">You received this because you are a registered member of freeChat.</p>
                <p style="color:#aaa;font-size:12px;">© 2026 freeChat. All rights reserved.</p>
            </div>
        </div>`
    );
};

/**
 * Send invitation email to a non-registered Firebase user
 */
export const sendInviteEmail = async (email, customSubject, customMessage) => {
    const appUrl = process.env.CLIENT_URL || "https://freechatweb.in";

    const subject = customSubject || "🎉 You're Invited to freeChat — Connect, Share, and Bond!";
    const bodyContent = customMessage
        ? customMessage.replace(/\n/g, '<br/>')
        : `Someone special wants you on <strong style="color:#6366f1;">freeChat</strong> — the next-gen social platform where you can chat, share stories, post reels, play couple games, and so much more!`;

    return await sendEmail(
        email,
        undefined,
        subject,
        `You've been personally invited to join freeChat! Visit ${appUrl} to get started.`,
        `<div style="font-family:'Segoe UI',Tahoma,sans-serif;max-width:600px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e5e7eb;">
            <!-- Header -->
            <div style="background:linear-gradient(135deg,#6366f1 0%,#8b5cf6 50%,#a855f7 100%);padding:40px 30px;text-align:center;">
                <h1 style="color:#ffffff;margin:0;font-size:36px;font-style:italic;font-weight:900;letter-spacing:-1px;">freeChat</h1>
                <p style="color:rgba(255,255,255,0.8);margin:8px 0 0 0;font-size:13px;text-transform:uppercase;letter-spacing:3px;font-weight:600;">You're Invited</p>
            </div>

            <!-- Body -->
            <div style="padding:40px 30px;">
                <h2 style="color:#1f2937;margin:0 0 16px 0;font-size:24px;font-weight:800;">Hey there! 👋</h2>
                <div style="color:#4b5563;line-height:1.8;font-size:16px;margin:0 0 24px 0;">
                    ${bodyContent}
                </div>

                <div style="background:#f8fafc;border-radius:12px;padding:24px;margin:24px 0;border:1px solid #e5e7eb;">
                    <p style="margin:0 0 12px 0;font-size:14px;font-weight:700;color:#374151;text-transform:uppercase;letter-spacing:1px;">What you'll get:</p>
                    <table style="width:100%;border-collapse:collapse;">
                        <tr><td style="padding:6px 0;font-size:15px;color:#4b5563;">💬 Real-time chat with friends</td></tr>
                        <tr><td style="padding:6px 0;font-size:15px;color:#4b5563;">📸 Share stories & posts</td></tr>
                        <tr><td style="padding:6px 0;font-size:15px;color:#4b5563;">🎬 Watch & create reels</td></tr>
                        <tr><td style="padding:6px 0;font-size:15px;color:#4b5563;">🎮 Play couple games</td></tr>
                        <tr><td style="padding:6px 0;font-size:15px;color:#4b5563;">💎 Earn gems & rewards</td></tr>
                        <tr><td style="padding:6px 0;font-size:15px;color:#4b5563;">🌐 Multi-language translation</td></tr>
                    </table>
                </div>

                <!-- CTA Button -->
                <div style="text-align:center;margin:32px 0;">
                    <a href="${appUrl}" style="display:inline-block;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#ffffff;text-decoration:none;padding:16px 48px;border-radius:50px;font-size:18px;font-weight:800;text-transform:uppercase;letter-spacing:1px;box-shadow:0 4px 15px rgba(99,102,241,0.4);">
                        Join freeChat Now →
                    </a>
                </div>

                <p style="color:#9ca3af;font-size:13px;text-align:center;margin:24px 0 0 0;line-height:1.6;">
                    It's completely free to join. Sign up with your email or Google account in seconds!
                </p>
            </div>

            <!-- Footer -->
            <div style="background:#f9fafb;padding:20px 30px;text-align:center;border-top:1px solid #e5e7eb;">
                <p style="color:#9ca3af;font-size:11px;margin:0;">This invitation was sent from freeChat. If you didn't expect this, you can safely ignore it.</p>
                <p style="color:#d1d5db;font-size:11px;margin:8px 0 0 0;">© 2026 freeChat. All rights reserved.</p>
            </div>
        </div>`
    );
};

