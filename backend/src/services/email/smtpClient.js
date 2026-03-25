import nodemailer from "nodemailer";

/**
 * SMTP Client with local/fallback configuration
 */
export const sendViaSMTP = async ({ to, subject, text, html, replyTo }) => {
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (!user || !pass) throw new Error("SMTP credentials not set");

    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: { user, pass },
        tls: { rejectUnauthorized: false },
        connectionTimeout: 8000,
        socketTimeout: 10000,
    });

    const from = `"Zyro" <${user}>`;
    return await transporter.sendMail({ from, to, replyTo, subject, text, html });
};
