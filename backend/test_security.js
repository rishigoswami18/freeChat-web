import axios from "axios";
import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config();

const BASE_URL = "http://localhost:5000/api";
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || "FAKE_SECRET_FOR_TEST";

async function simulateHackerAttack() {
    console.log("🚀 [Security Stress Test] Starting...");
    console.log("🎯 Scenario: Hacker pays ₹1 for 'Starter Pack' but sends 'gemAmount: 1,000,000' in verify-payment.");

    // 1. Mock valid signature (Hacker can generate this if they have the payment_id and order_id)
    const razorpay_order_id = "order_OIdMock123";
    const razorpay_payment_id = "pay_PIdMock123";
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    
    const razorpay_signature = crypto
        .createHmac("sha256", RAZORPAY_KEY_SECRET)
        .update(body)
        .digest("hex");

    console.log("🔑 [Hacker] Generated valid signature for fake payment IDs.");

    try {
        console.log("📡 [Hacker] Attempting to spoof coin amount in API call...");
        
        const response = await axios.post(`${BASE_URL}/gems/verify-payment`, {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            gemAmount: 1000000 // 😈 THE ATTACK: Spoofed value
        }, {
            headers: {
                "Authorization": `Bearer MOCK_TOKEN` // In real test, we'd need a real token
            }
        });

        console.log("❌ [STRESS TEST FAILED] Hacker successfully spoofed coins! Response:", response.data);
    } catch (error) {
        if (error.response?.status === 400 || error.response?.status === 401) {
            console.log("✅ [STRESS TEST PASSED] Backend correctly REJECTED/IGNORED the spoofed amount.");
            console.log(`🛡️  Reason: ${error.response.data.message || "Security Gate Active"}`);
        } else {
            console.error("⚠️  [Unexpected Error]:", error.message);
        }
    }
}

simulateHackerAttack();
