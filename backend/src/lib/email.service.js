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
