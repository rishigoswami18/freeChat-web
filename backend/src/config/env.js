import "dotenv/config";

/**
 * Environment Variable Validation
 * Ensures the server doesn't start with missing critical configuration.
 */

const requiredEnv = [
    "PORT",
    "MONGO_URI",
    "JWT_SECRET_KEY",
    "STREAM_API_KEY",
    "STREAM_API_SECRET",
    "FIREBASE_SERVICE_ACCOUNT_JSON"
];

const validateEnv = () => {
    const missing = requiredEnv.filter(key => !process.env[key]);
    
    if (missing.length > 0) {
        console.error("❌ [Config] Missing critical environment variables:", missing.join(", "));
        console.error("The server will now exit to prevent unstable behavior.");
        process.exit(1);
    }

    console.log("✅ [Config] Environment variables validated.");
};

export default validateEnv;
