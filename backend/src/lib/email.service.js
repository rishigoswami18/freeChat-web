import nodemailer from "nodemailer";
import dns from "dns";

// CRITICAL FIX: Render free tier doesn't support IPv6 outbound connections.
// Gmail SMTP resolves to IPv6 by default, causing ENETUNREACH error.
// Force Node.js to prefer IPv4 addresses when resolving DNS.
dns.setDefaultResultOrder("ipv4first");

/**
 * Send an email notification for a support message
 */
export const sendSupportEmail = async (fullName, email, message) => {
    // 1. Primary Configuration (Port 465 - SSL)
    const config465 = {
        host: process.env.SMTP_HOST || "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
        tls: { rejectUnauthorized: false }
    };

    // 2. Fallback Configuration (Port 587 - STARTTLS)
    const config587 = {
        host: process.env.SMTP_HOST || "smtp.gmail.com",
        port: 587,
        secure: false, // TLS
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
        tls: { rejectUnauthorized: false }
    };

    async function attemptSend(config, label) {
        console.log(`[Email] Attempting via ${label}...`);
        const transporter = nodemailer.createTransport(config);
        const recipientEmail = process.env.OWNER_EMAIL || process.env.SMTP_USER;

        const mailOptions = {
            from: `"freeChat Support" <${process.env.SMTP_USER}>`,
            to: recipientEmail,
            replyTo: email,
            subject: `New Support Message from ${fullName}`,
            text: `Name: ${fullName}\nEmail: ${email}\nMessage: ${message}`,
            html: `<p><strong>Name:</strong> ${fullName}</p><p><strong>Email:</strong> ${email}</p><hr/><p>${message}</p>`
        };

        return await transporter.sendMail(mailOptions);
    }

    try {
        if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
            throw new Error("SMTP_USER or SMTP_PASS missing in env");
        }
        // Try 465 first
        const info = await attemptSend(config465, "Port 465 (SSL)");
        console.log("Email sent successfully via 465:", info.messageId);
        return info;
    } catch (error) {
        console.warn("Port 465 failed, trying Port 587 fallback...", error.message);
        try {
            const info = await attemptSend(config587, "Port 587 (STARTTLS)");
            console.log("Email sent successfully via 587:", info.messageId);
            return info;
        } catch (fallbackError) {
            console.error("All email attempts failed.");
            console.error("Primary Error:", error.message);
            console.error("Fallback Error:", fallbackError.message);
            throw fallbackError;
        }
    }
};

/**
 * Send an OTP email for account verification
 */
export const sendOTPEmail = async (email, otp) => {
    try {
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || "smtp.gmail.com",
            port: 465,
            secure: true,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
            tls: {
                rejectUnauthorized: false
            }
        });

        const mailOptions = {
            from: `"freeChat Verification" <${process.env.SMTP_USER}>`,
            to: email,
            subject: `${otp} is your freeChat verification code`,
            html: `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px; background-color: #ffffff;">
                    <div style="text-align: center; margin-bottom: 20px;">
                        <h1 style="color: #6366f1; margin: 0; font-style: italic;">freeChat</h1>
                    </div>
                    <div style="padding: 20px; border-top: 2px solid #6366f1;">
                        <h2 style="color: #333; margin-top: 0;">Verify your email</h2>
                        <p style="color: #666; font-size: 16px;">Hello,</p>
                        <p style="color: #666; font-size: 16px;">Thank you for joining freeChat! Please use the following verification code to complete your registration:</p>
                        <div style="margin: 30px 0; text-align: center;">
                            <span style="display: inline-block; padding: 10px 30px; background-color: #f3f4f6; color: #6366f1; font-size: 32px; font-weight: bold; letter-spacing: 5px; border-radius: 8px; border: 1px dashed #6366f1;">
                                ${otp}
                            </span>
                        </div>
                        <p style="color: #999; font-size: 14px;">This code will expire in 10 minutes. If you didn't request this code, you can safely ignore this email.</p>
                    </div>
                    <div style="text-align: center; margin-top: 20px; padding-top: 20px; border-top: 1px solid #eeeeee;">
                        <p style="color: #aaa; font-size: 12px;">© 2026 freeChat. All rights reserved.</p>
                    </div>
                </div>
            `,
        };

        const info = await transporter.sendMail(mailOptions);
        return info;
    } catch (error) {
        console.error("Error sending OTP email:", error);
        throw error;
    }
};

/**
 * Send an OTP email for password reset
 */
export const sendResetPasswordEmail = async (email, otp) => {
    try {
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || "smtp.gmail.com",
            port: 465,
            secure: true,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
            tls: {
                rejectUnauthorized: false
            }
        });

        const mailOptions = {
            from: `"freeChat Security" <${process.env.SMTP_USER}>`,
            to: email,
            subject: `${otp} is your freeChat password reset code`,
            html: `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px; background-color: #ffffff;">
                    <div style="text-align: center; margin-bottom: 20px;">
                        <h1 style="color: #6366f1; margin: 0; font-style: italic;">freeChat</h1>
                    </div>
                    <div style="padding: 20px; border-top: 2px solid #6366f1;">
                        <h2 style="color: #333; margin-top: 0;">Reset your password</h2>
                        <p style="color: #666; font-size: 16px;">Hello,</p>
                        <p style="color: #666; font-size: 16px;">We received a request to reset your password. Use the following code to proceed with the password reset:</p>
                        <div style="margin: 30px 0; text-align: center;">
                            <span style="display: inline-block; padding: 10px 30px; background-color: #f3f4f6; color: #6366f1; font-size: 32px; font-weight: bold; letter-spacing: 5px; border-radius: 8px; border: 1px dashed #6366f1;">
                                ${otp}
                            </span>
                        </div>
                        <p style="color: #999; font-size: 14px;">This code will expire in 10 minutes. If you didn't request a password reset, you can safely ignore this email and your password will remain unchanged.</p>
                    </div>
                    <div style="text-align: center; margin-top: 20px; padding-top: 20px; border-top: 1px solid #eeeeee;">
                        <p style="color: #aaa; font-size: 12px;">© 2026 freeChat. All rights reserved.</p>
                    </div>
                </div>
            `,
        };

        const info = await transporter.sendMail(mailOptions);
        return info;
    } catch (error) {
        console.error("Error sending reset password email:", error);
        throw error;
    }
};
