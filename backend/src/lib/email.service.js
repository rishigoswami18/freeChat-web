import nodemailer from "nodemailer";

/**
 * Send an email notification for a support message
 */
export const sendSupportEmail = async (fullName, email, message) => {
    try {
        // Create a transporter using SMTP
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT),
            secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });

        const mailOptions = {
            from: `"freeChat Support" <${process.env.SMTP_USER}>`,
            to: process.env.OWNER_EMAIL || process.env.SMTP_USER, // Send to owner
            subject: `New Support Message from ${fullName}`,
            text: `You have a new support message:\n\nName: ${fullName}\nEmail: ${email}\nMessage: ${message}`,
            html: `
                <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                    <h2 style="color: #6366f1;">New Support Message</h2>
                    <p><strong>Name:</strong> ${fullName}</p>
                    <p><strong>Email:</strong> ${email}</p>
                    <hr />
                    <p><strong>Message:</strong></p>
                    <div style="background: #f4f4f4; padding: 15px; border-radius: 5px;">
                        ${message}
                    </div>
                </div>
            `,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log("Email sent: %s", info.messageId);
        return info;
    } catch (error) {
        console.error("Error sending email:", error);
        throw error;
    }
};
/**
 * Send an OTP email for account verification
 */
export const sendOTPEmail = async (email, otp) => {
    try {
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT),
            secure: process.env.SMTP_SECURE === "true",
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
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
