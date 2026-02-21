import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import User from "../models/User.js";
import GameSession from "../models/GameSession.js";
import { calculateAge } from "../utils/dateUtils.js";

const router = express.Router();

router.use(protectRoute);

// Helper middleware to check if user is a premium member
const checkMembership = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);
        if (user.role !== "admin" && !user.isMember) {
            return res.status(403).json({ message: "Premium membership required to play games" });
        }
        next();
    } catch (error) {
        next(error);
    }
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
    },
    long_distance_bucket_list: {
        title: "Long Distance Bucket List ✈️",
        description: "Plan your future together! What will you do when you're finally in the same city?",
        questions: [
            {
                question: "What's the first thing you want to do when you meet at the airport?",
                options: ["A long hug", "Go for a romantic dinner", "Take a selfie together", "Just hold hands"],
            },
            {
                question: "Which of these virtual dates sounds best for our next weekend?",
                options: ["Watch a movie synced up", "Cook the same meal while on video", "Play an online game together", "Just talk for hours"],
            },
            {
                question: "If we could teleport to each other for just one hour, what would we do?",
                options: ["Have a quick coffee date", "Take a walk in a local park", "Cuddle on the couch", "Go to our favorite restaurant"],
            },
            {
                question: "What's the #1 city on your list for our first real vacation together?",
                options: ["Paris", "Bali", "Reykjavik", "New York", "Santorini"],
            }
        ]
    },
    fantasy_quest_mature: {
        title: "Fantasy Scenarios 💋",
        description: "Explore your shared fantasies and desires in a safe, fun way.",
        isAdult: true,
        questions: [
            {
                question: "What's a setting you've always found surprisingly romantic (or spicy)?",
                options: ["A rainy cabin", "A luxury hotel", "A secluded beach", "A cozy fireplace", "Under the stars"],
            },
            {
                question: "Which of these sounds most fun for a lazy morning together?",
                options: ["Breakfast in bed", "Shower together", "Sleeping in late", "Morning walk", "Cuddling"],
            },
            {
                question: "Reaction: Your partner surprises you with a spicy outfit. What's your move?",
                options: ["Take lots of photos", "Cancel all plans", "Give them a huge kiss", "Blush and smile", "Compliment them non-stop"],
            }
        ]
    },
    never_have_i_ever_naughty: {
        title: "Never Have I Ever: Naughty 🔞",
        description: "The classic game, but with a spicy couple's twist!",
        isAdult: true,
        questions: [
            {
                question: "Never have I ever... sent a spicy photo to my partner.",
                options: ["I have ✅", "Never ❌"],
            },
            {
                question: "Never have I ever... had a crush on a fictional character.",
                options: ["I have ✅", "Never ❌"],
            },
            {
                question: "Never have I ever... thought about my partner during a boring meeting.",
                options: ["I have ✅", "Never ❌"],
            },
            {
                question: "Never have I ever... wanted to roleplay as someone else.",
                options: ["I have ✅", "Never ❌"],
            }
        ]
    },
    spicy_truth_or_dare: {
        title: "Spicy Truth or Dare 🔞",
        description: "Turn up the heat with some semi-spicy questions and dares!",
        isAdult: true,
        questions: [
            {
                question: "Truth: What is your favorite thing about your partner's body?",
                options: ["Their eyes", "Their smile", "Their back", "Their hands", "Everything!"],
            },
            {
                question: "Dare: Give your partner a 2-minute massage on a spot of their choice.",
                options: ["Done ✓", "Not now"],
            },
            {
                question: "Truth: Where is the most adventurous place you've ever thought about having a date?",
                options: ["A rooftop", "A beach at night", "A hidden park", "A balcony", "Cinema"],
            },
            {
                question: "Dare: Whisper something sweet (or spicy) into your partner's ear for 10 seconds.",
                options: ["Done ✓", "Too shy"],
            }
        ]
    }
};

// Get available games
router.get("/templates", checkMembership, async (req, res) => {
    try {
        const me = await User.findById(req.user._id);
        const partner = await User.findById(me.partnerId);

        const myAge = calculateAge(me.dateOfBirth);
        const partnerAge = partner ? calculateAge(partner.dateOfBirth) : 0;

        const isBothAdult = myAge >= 18 && partnerAge >= 18;

        const filteredTemplates = {};
        Object.entries(QUIZ_TEMPLATES).forEach(([key, template]) => {
            if (template.isAdult && !isBothAdult) return;
            filteredTemplates[key] = template;
        });

        res.json(filteredTemplates);
    } catch (err) {
        console.error("Error fetching templates:", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
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
