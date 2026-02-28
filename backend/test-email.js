import nodemailer from "nodemailer";
import "dotenv/config";

const testSMTP = async () => {
    console.log("--- SMTP CONNECTION TEST ---");
    console.log("Host:", process.env.SMTP_HOST);
    console.log("Port:", process.env.SMTP_PORT);
    console.log("User:", process.env.SMTP_USER);
    console.log("Pass length:", process.env.SMTP_PASS?.length);

    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT),
        secure: process.env.SMTP_SECURE === "true",
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });

    try {
        console.log("Attempting to connect to Gmail...");
        await transporter.verify();
        console.log("✅ SUCCESS: Gmail is connected perfectly!");
    } catch (error) {
        console.error("❌ FAILED: Connection error:", error.message);
        if (error.message.includes("Invalid login")) {
            console.log("TIP: Aapka App Password galat hai ya spaces hain.");
        } else if (error.message.includes("ETIMEDOUT")) {
            console.log("TIP: Port 465 block hai, Port 587 use karein.");
        }
    }
};

testSMTP();
