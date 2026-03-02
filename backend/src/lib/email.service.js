import nodemailer from "nodemailer";
import dns from "dns";

// CRITICAL FIX: Render free tier doesn't support IPv6.
dns.setDefaultResultOrder("ipv4first");

// Custom DNS lookup that FORCES IPv4 (family: 4)
function ipv4Lookup(hostname, options, callback) {
    if (typeof options === "function") {
        callback = options;
        options = {};
    }
    return dns.lookup(hostname, { ...options, family: 4 }, callback);
}

/**
 * Create a nodemailer transporter that ONLY uses IPv4
 */
function createIPv4Transport(port, secure) {
    return nodemailer.createTransport({
        host: process.env.SMTP_HOST || "smtp.gmail.com",
        port: port,
        secure: secure,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
        tls: {
            rejectUnauthorized: false,
            servername: process.env.SMTP_HOST || "smtp.gmail.com"
        },
        // FORCE IPv4 at socket level
        dnsLookup: ipv4Lookup,
        connectionTimeout: 10000,
        socketTimeout: 15000,
    });
}

/**
 * Send an email notification for a support message
 */
export const sendSupportEmail = async (fullName, email, message) => {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        throw new Error("SMTP_USER or SMTP_PASS missing in env");
    }

    const recipientEmail = process.env.OWNER_EMAIL || process.env.SMTP_USER;
    const mailOptions = {
        from: `"freeChat Support" <${process.env.SMTP_USER}>`,
        to: recipientEmail,
        replyTo: email,
        subject: `New Support Message from ${fullName}`,
        text: `Name: ${fullName}\nEmail: ${email}\nMessage: ${message}`,
        html: `<div style="font-family:Arial;"><h2 style="color:#6366f1;">New Support Message</h2><p><b>Name:</b> ${fullName}</p><p><b>Email:</b> ${email}</p><hr/><p>${message}</p></div>`
    };

    // Try Port 465 (SSL) with IPv4
    try {
        console.log("[Email] Trying Port 465 (SSL) with forced IPv4...");
        const transporter = createIPv4Transport(465, true);
        const info = await transporter.sendMail(mailOptions);
        console.log("✅ Email sent via 465:", info.messageId);
        return info;
    } catch (err465) {
        console.warn("Port 465 failed:", err465.message);
    }

    // Try Port 587 (STARTTLS) with IPv4
    try {
        console.log("[Email] Trying Port 587 (STARTTLS) with forced IPv4...");
        const transporter = createIPv4Transport(587, false);
        const info = await transporter.sendMail(mailOptions);
        console.log("✅ Email sent via 587:", info.messageId);
        return info;
    } catch (err587) {
        console.warn("Port 587 failed:", err587.message);
    }

    // Last resort: Manually resolve IPv4 and connect by IP
    try {
        console.log("[Email] Last resort: manually resolving IPv4...");
        const addresses = await dns.promises.resolve4("smtp.gmail.com");
        const ipv4Host = addresses[0];
        console.log("[Email] Resolved smtp.gmail.com to IPv4:", ipv4Host);

        const transporter = nodemailer.createTransport({
            host: ipv4Host,
            port: 465,
            secure: true,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
            tls: {
                rejectUnauthorized: false,
                servername: "smtp.gmail.com"
            },
            connectionTimeout: 15000,
            socketTimeout: 20000,
        });
        const info = await transporter.sendMail(mailOptions);
        console.log("✅ Email sent via direct IPv4:", info.messageId);
        return info;
    } catch (finalErr) {
        console.error("❌ ALL email methods failed:", finalErr.message);
        throw finalErr;
    }
};

/**
 * Send an OTP email for account verification
 */
export const sendOTPEmail = async (email, otp) => {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        throw new Error("SMTP_USER or SMTP_PASS missing");
    }

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

    // Try multiple methods
    try {
        const transporter = createIPv4Transport(465, true);
        return await transporter.sendMail(mailOptions);
    } catch (e1) {
        try {
            const transporter = createIPv4Transport(587, false);
            return await transporter.sendMail(mailOptions);
        } catch (e2) {
            const addresses = await dns.promises.resolve4("smtp.gmail.com");
            const transporter = nodemailer.createTransport({
                host: addresses[0], port: 465, secure: true,
                auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
                tls: { rejectUnauthorized: false, servername: "smtp.gmail.com" },
            });
            return await transporter.sendMail(mailOptions);
        }
    }
};

/**
 * Send an OTP email for password reset
 */
export const sendResetPasswordEmail = async (email, otp) => {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        throw new Error("SMTP_USER or SMTP_PASS missing");
    }

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

    // Try multiple methods
    try {
        const transporter = createIPv4Transport(465, true);
        return await transporter.sendMail(mailOptions);
    } catch (e1) {
        try {
            const transporter = createIPv4Transport(587, false);
            return await transporter.sendMail(mailOptions);
        } catch (e2) {
            const addresses = await dns.promises.resolve4("smtp.gmail.com");
            const transporter = nodemailer.createTransport({
                host: addresses[0], port: 465, secure: true,
                auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
                tls: { rejectUnauthorized: false, servername: "smtp.gmail.com" },
            });
            return await transporter.sendMail(mailOptions);
        }
    }
};
