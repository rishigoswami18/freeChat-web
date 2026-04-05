import express from "express"; // Restarting...
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import helmet from "helmet";
import compression from "compression";
import { rateLimit } from "express-rate-limit";

// Routes
import authRoutes from "./routes/auth.route.js";
import postsRoutes from "./routes/posts.route.js";
import userRoutes from "./routes/user.route.js";
import chatRoutes from "./routes/chat.route.js";
import coupleRoutes from "./routes/couple.route.js";
import membershipRoutes from "./routes/membership.route.js";
import gameRoutes from "./routes/game.route.js";
import storyRoutes from "./routes/story.route.js";
import translationRoutes from "./routes/translation.route.js";
import supportRoutes from "./routes/support.route.js";
import gemRoutes from "./routes/gem.route.js";
import goalRoutes from "./routes/goal.route.js";
import bondRoutes from "./routes/bond.route.js";
import notificationRoutes from "./routes/notification.route.js";
import adminRoutes from "./routes/admin.route.js";
import apkRoutes from "./routes/apk.route.js";
import communityRoutes from "./routes/community.route.js";
import radarRoutes from "./routes/radar.route.js";
import focusRoutes from "./routes/focus.route.js";
import creatorRoutes from "./routes/creator.route.js";
import testRoutes from "./routes/test.routes.js";
import walletRoutes from "./routes/wallet.route.js";

// Middleware
import { errorHandler } from "./middlewares/error.middleware.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

/**
 * PRODUCTION SECURITY & PERFORMANCE
 */
app.use(helmet({
    contentSecurityPolicy: false,
}));
app.use(compression());
app.set("trust proxy", 1);

/**
 * Nginx-Style Performance Headers (Specifically for Render/Edge)
 * Ensures aggressive caching for media & animations.
 */
app.use((req, res, next) => {
    // 1y Cache for Immutable Assets (Images, Icons, Animations)
    if (req.url.match(/\.(jpg|jpeg|png|gif|svg|webp|mp4|webm|woff2)$/)) {
        res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
    }
    // High-performance Proxy Headers
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "SAMEORIGIN");
    next();
});

// Global Rate Limiter
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 2000,
    message: "Too many requests, please try again later."
});
app.use("/api/", globalLimiter);

app.use(
    cors({
        origin: [
            "http://localhost:5173", 
            "http://localhost:5174", 
            "http://127.0.0.1:5173", 
            "http://127.0.0.1:5174", 
            "https://www.freechatweb.in", 
            "https://freechatweb.in"
        ],
        credentials: true,
    })
);

app.use(express.json({ limit: "200mb" }));
app.use(cookieParser());

/**
 * STATIC ASSETS & PUBLIC ROUTES
 */
app.use("/uploads", express.static(path.join(__dirname, "../../uploads")));

/**
 * API ROUTES
 */
app.get("/api/ping", (req, res) => res.json({ pong: true, time: new Date().toISOString() }));
app.get("/api/health", (req, res) => res.status(200).send("OK")); // Render Keep-Alive
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/posts", postsRoutes);
app.use("/api/stories", storyRoutes);
app.use("/api/couple", coupleRoutes);
app.use("/api/membership", membershipRoutes);
app.use("/api/games", gameRoutes);
app.use("/api/translate", translationRoutes);
app.use("/api/support", supportRoutes);
app.use("/api/gems", gemRoutes);
app.use("/api/bond", bondRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/apk", apkRoutes);
app.use("/api/goals", goalRoutes);
app.use("/api/communities", communityRoutes);
app.use("/api/radar", radarRoutes);
app.use("/api/focus", focusRoutes);
app.use("/api/creator", creatorRoutes);
app.use("/api/test", testRoutes);
app.use("/api/wallet", walletRoutes);

import minigameRoutes from "./routes/minigame.route.js";
app.use("/api/minigame", minigameRoutes);

/**
 * FRONTEND HOSTING (Production)
 */
if (process.env.NODE_ENV === "production") {
    const distPath = path.join(__dirname, "../../frontend/dist");
    
    app.use("/assets", express.static(path.join(distPath, "assets"), {
        maxAge: "1y",
        immutable: true,
    }));

    app.use(express.static(distPath, {
        maxAge: "1h",
        setHeaders: (res, filePath) => {
            if (filePath.endsWith(".html")) {
                res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
            }
        },
    }));

    app.get("*", (req, res) => {
        res.sendFile(path.join(distPath, "index.html"));
    });
}

/**
 * ERROR HANDLING
 */
app.use(errorHandler);

export default app;
