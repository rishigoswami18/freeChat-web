import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import User from "../models/User.js";
import GameSession from "../models/GameSession.js";

const router = express.Router();

router.use(protectRoute);

// Helper middleware to check if user is a premium member
const checkMembership = async (req, res, next) => {
    const user = await User.findById(req.user._id);
    if (user.role !== "admin" && !user.isMember) {
        return res.status(403).json({ message: "Premium membership required to play games" });
    }
    next();
};

const QUIZ_TEMPLATES = {
    compatibility_quiz: {
        title: "Compatibility Quiz",
        description: "How well do you know your partner?",
        questions: [
            {
                question: "What is your partner's favorite color?",
                options: ["Red", "Blue", "Green", "Yellow", "Pink", "Black"],
            },
            {
                question: "Where is your partner's dream vacation spot?",
                options: ["Paris", "Tokyo", "Maldives", "New York", "Switzerland"],
            },
            {
                question: "What is your partner's favorite food?",
                options: ["Pizza", "Sushi", "Burger", "Pasta", "Indian Cuisine"],
            },
            {
                question: "Which season does your partner love most?",
                options: ["Spring", "Summer", "Autumn", "Winter"],
            },
            {
                question: "What is your partner's favorite hobby?",
                options: ["Reading", "Gaming", "Cooking", "Traveling", "Sports"],
            }
        ]
    },
    role_play: {
        title: "Role Play: Romantic Scenarios",
        description: "React to romantic scenarios together and see how your styles match!",
        questions: [
            {
                question: "Scenario: You're lost in a beautiful foreign city at night. What do you do?",
                options: [
                    "Check maps and find the way back quickly.",
                    "Embrace the adventure and explore the surroundings.",
                    "Find a cozy café and ask for directions while enjoying a drink.",
                    "Call a taxi and head straight to the hotel."
                ],
            },
            {
                question: "Scenario: You have a free weekend and no plans. How do you spend it?",
                options: [
                    "A quiet weekend at home with movies and takeout.",
                    "A spontaneous road trip to a nearby town.",
                    "A packed weekend visiting museums and art galleries.",
                    "Inviting friends over for a big dinner party."
                ],
            },
            {
                question: "Scenario: Your partner is having a stressful week. What's your go-to way to help?",
                options: [
                    "Prepare their favorite meal and a relaxing bath.",
                    "Give them space and handle all house chores.",
                    "Plan a fun surprise to take their mind off things.",
                    "Sit down and let them vent for as long as they need."
                ],
            },
            {
                question: "Scenario: You win a luxury cruise for two. What's the best part?",
                options: [
                    "Dressing up for fancy dinners and shows.",
                    "Exploring exotic ports of call together.",
                    "Relaxing by the pool with endless cocktails.",
                    "Waking up to the sound of the ocean every day."
                ],
            }
        ]
    }
};

// Get available games
router.get("/templates", checkMembership, (req, res) => {
    res.json(QUIZ_TEMPLATES);
});

// Start a new game session
router.post("/start", checkMembership, async (req, res) => {
    try {
        const { gameType } = req.body;
        const me = await User.findById(req.user._id);

        if (!me.partnerId || me.coupleStatus !== "coupled") {
            return res.status(400).json({ message: "You need to be in a couple to play games" });
        }

        const partnerId = me.partnerId;
        const template = QUIZ_TEMPLATES[gameType];

        if (!template) {
            return res.status(400).json({ message: "Invalid game type" });
        }

        // Check if there's already an active (pending) session for this couple and game type
        const existingSession = await GameSession.findOne({
            participants: { $all: [req.user._id, partnerId] },
            gameType,
            status: "pending"
        });

        if (existingSession) {
            return res.json({ success: true, session: existingSession });
        }

        const newSession = await GameSession.create({
            participants: [req.user._id, partnerId],
            gameType,
            questions: template.questions,
            answers: new Map(),
            status: "pending"
        });

        res.status(201).json({ success: true, session: newSession });
    } catch (err) {
        console.error("Error starting game:", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// Get session details
router.get("/session/:id", checkMembership, async (req, res) => {
    try {
        const session = await GameSession.findById(req.params.id)
            .populate("participants", "fullName profilePic");

        if (!session) {
            return res.status(404).json({ message: "Session not found" });
        }

        if (!session.participants.some(p => p._id.toString() === req.user._id.toString())) {
            return res.status(403).json({ message: "Access denied" });
        }

        res.json(session);
    } catch (err) {
        console.error("Error fetching session:", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// Get active sessions for current user
router.get("/active", checkMembership, async (req, res) => {
    try {
        const sessions = await GameSession.find({
            participants: req.user._id,
            status: "pending"
        }).populate("participants", "fullName profilePic");

        res.json(sessions);
    } catch (err) {
        console.error("Error fetching sessions:", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// Submit answers
router.post("/submit", checkMembership, async (req, res) => {
    try {
        const { sessionId, quizAnswers } = req.body; // quizAnswers: [{ questionIndex: 0, answer: "Red" }, ...]
        const session = await GameSession.findById(sessionId);

        if (!session) {
            return res.status(404).json({ message: "Session not found" });
        }

        if (!session.participants.some(p => p.toString() === req.user._id.toString())) {
            return res.status(403).json({ message: "Access denied" });
        }

        if (session.status === "completed") {
            return res.status(400).json({ message: "Game already completed" });
        }

        // Set answers for the current user
        session.answers.set(req.user._id.toString(), quizAnswers);

        // Mark as modified if it's a Map
        session.markModified("answers");

        // Check if all participants have answered
        if (session.answers.size === session.participants.length) {
            session.status = "completed";

            // Calculate score (how many answers match)
            let matches = 0;
            const userIds = Array.from(session.answers.keys());
            const user1Answers = session.answers.get(userIds[0]);
            const user2Answers = session.answers.get(userIds[1]);

            user1Answers.forEach((ans1, idx) => {
                const ans2 = user2Answers.find(a => a.questionIndex === ans1.questionIndex);
                if (ans2 && ans1.answer === ans2.answer) {
                    matches++;
                }
            });

            session.score = Math.round((matches / session.questions.length) * 100);
        }

        await session.save();

        res.json({ success: true, session });
    } catch (err) {
        console.error("Error submitting answers:", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

export default router;
