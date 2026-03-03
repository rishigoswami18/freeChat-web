import dotenv from 'dotenv';
import path from 'path';
import fetch from 'node-fetch'; // If fetch is not global in this node version

dotenv.config({ path: path.resolve('c:/Users/Lenovo/CHAT_APPLICATION/backend/.env') });

const BREVO_API_KEY = process.env.BREVO_API_KEY;
const SENDER_EMAIL = process.env.SMTP_USER || process.env.OWNER_EMAIL;

async function testBrevo() {
    console.log("Testing Brevo with Sender:", SENDER_EMAIL);
    const body = {
        sender: { name: "freeChat Test", email: SENDER_EMAIL },
        to: [{ email: "freechatweb00@gmail.com" }], // Send to self
        subject: "Test Diagnostic",
        htmlContent: "<h1>Testing email connectivity</h1>",
    };

    try {
        const response = await fetch("https://api.brevo.com/v3/smtp/email", {
            method: "POST",
            headers: {
                "api-key": BREVO_API_KEY.trim(),
                "Content-Type": "application/json",
                "Accept": "application/json",
            },
            body: JSON.stringify(body),
        });

        const data = await response.json();
        console.log("Status:", response.status);
        console.log("Response:", JSON.stringify(data, null, 2));
    } catch (err) {
        console.error("Fetch Error:", err);
    }
}

testBrevo();
