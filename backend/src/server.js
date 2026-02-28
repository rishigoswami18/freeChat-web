/**
 * BondBeyond — All Rights Reserved © 2026
 * Powered by freechatweb.in
 */
import express from "express";
import "dotenv/config";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import helmet from "helmet";
import compression from "compression";
import { rateLimit } from "express-rate-limit";

import authRoutes from "./routes/auth.route.js";
import postsRoutes from "./routes/posts.route.js";
import userRoutes from "./routes/user.route.js";
import chatRoutes from "./routes/chat.route.js";
import coupleRoutes from "./routes/couple.route.js";
import membershipRoutes from "./routes/membership.route.js";
import gameRoutes from "./routes/game.route.js";
import storyRoutes from "./routes/story.route.js"; // Added import
import translationRoutes from "./routes/translation.route.js";
import supportRoutes from "./routes/support.route.js";
import gemRoutes from "./routes/gem.route.js";
import bondRoutes from "./routes/bond.route.js";
import { seedQuestions } from "./controllers/bond.controller.js";
import { connectDB } from "./lib/db.js";

const app = express();

const PORT = process.env.PORT || 5001;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Security & Performance Middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable CSP for easier integration with CDNs/Stream
}));
app.use(compression()); // Compress all responses

// Rate Limiting
app.set('trust proxy', 1); // Trust Render proxy for correct IP detection

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 2000, // Increased limit for broader API usage
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: "Too many requests, please try again later."
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100, // Relaxed limit (was 20 per hour, now 100 per 15 min)
  message: "Too many login/auth attempts, please try again in a few minutes."
});

app.use("/api/", limiter);
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/signup", authLimiter);

app.use(
  cors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173", "https://www.freechatweb.in", "https://freechatweb.in"],
    credentials: true,
  })
);

app.use(express.json({ limit: "50mb" }));
app.use(cookieParser());

app.use("/api/auth", authRoutes)
app.use("/api/users", userRoutes)
app.use("/api/chat", chatRoutes)
app.use("/api/posts", postsRoutes);
app.use("/api/stories", storyRoutes); // Added usage
app.use("/api/couple", coupleRoutes);
app.use("/api/membership", membershipRoutes);
app.use("/api/games", gameRoutes);
app.use("/api/translate", translationRoutes);
app.use("/api/support", supportRoutes);
app.use("/api/gems", gemRoutes);
app.use("/api/bond", bondRoutes);


if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../../frontend/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../../frontend", "dist", "index.html"));
  });
}

app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
  await connectDB();
  await seedQuestions();
});