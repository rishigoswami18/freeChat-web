/**
 * BondBeyond — Backend API Gateway
 * Optimized for Production Scale
 */
import http from "http";
import app from "./app.js";
import validateEnv from "./config/env.js";
import { connectDB } from "./lib/db.js";
import { seedQuestions } from "./controllers/bond.controller.js";
import { startWorkers } from "./workers/workerManager.js";
import iplRewardEngine from "./services/iplRewardEngine.js";
import liveScoreService from "./services/LiveScoreService.js";
import matchAutomationSystem from "./services/MatchAutomationSystem.js";

/**
 * Server Bootstrap
 */
const bootstrap = async () => {
    try {
        // 1. Validate Environment
        validateEnv();

        const PORT = process.env.PORT || 5001;

        // 2. Connect to Database
        await connectDB();
        console.log("✅ [Server] Database connection secured.");

        // 3. Initialize Domain Seeders
        await seedQuestions();

        // 4. Start Background Job Infrastructure
        startWorkers();

        // 5. Create HTTP Server for Socket.io
        const server = http.createServer(app);

        // 6. Initialize Real-time Engines
        iplRewardEngine.init(server);
        liveScoreService.start();
        matchAutomationSystem.init();

        // 7. Start Listening
        server.listen(PORT, () => {
            console.log(`🚀 [Server] BondBeyond API Gateway running on port ${PORT}`);
            console.log(`📡 [Real-time] IPL Reward Engine Primed.`);
        });

    } catch (error) {
        console.error("❌ [Server] Fatal error during bootstrap:", error.message);
        process.exit(1);
    }
};

// Global termination handling
process.on("unhandledRejection", (err) => {
    console.error("⛔ [Server] Unhandled Rejection:", err.message);
    // In production, we might want to shut down gracefully
});

bootstrap();