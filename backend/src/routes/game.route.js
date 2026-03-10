import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import User from "../models/User.js";
import GameSession from "../models/GameSession.js";
import { calculateAge } from "../utils/dateUtils.js";
import { hasPremiumAccess } from "../utils/freeTrial.js";

const router = express.Router();

router.use(protectRoute);

// Helper middleware to check if user is a premium member
const checkMembership = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);
        if (!hasPremiumAccess(user)) {
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
            },
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
    },
    heart_destiny: {
        title: "Heart of Destiny ✨",
        description: "A premium 3D interactive experience. Spin the heart to reveal your romantic destiny!",
        is3D: true, // Marker for frontend to use the new high-end view
        questions: [
            {
                question: "If we could disappear for 24 hours, where would we go?",
                options: ["Private Island", "Cabin in the Woods", "Luxury Penthouse", "Camping under the stars"],
            },
            {
                question: "What's one thing I do that always makes you blush?",
                options: ["A certain look", "A compliment", "Physical touch", "Just being near me"],
            },
            {
                question: "Task: Stare into each other's eyes for 30 seconds without laughing.",
                options: ["Bond Strengthened ✨", "We failed (but laughed!) 😂"],
            },
            {
                question: "Destiny: What is our 'theme song' as a couple?",
                options: ["Something romantic", "Something high-energy", "Something classic", "Something quirky"],
            }
        ]
    },
    ludo: {
        title: "Ludo Couple Edition 🎲",
        description: "Classic Ludo for couples. Race your pieces home and have fun!",
        isBoardGame: true,
        questions: []
    },
    tic_tac_toe: {
        title: "Tic Tac Toe (Zero Cross) ⚔️",
        description: "A quick match to see who's faster! Strategy vs Luck.",
        isBoardGame: true,
        questions: []
    }
};

// Get available games
router.get("/templates", checkMembership, async (req, res) => {
    try {
        const me = await User.findById(req.user._id);
        const myAge = calculateAge(me.dateOfBirth);
        let isBothAdult = false;

        if (me.isCoupledWithAI) {
            isBothAdult = true; // AI partner is always adult-friendly
        } else {
            const partner = await User.findById(me.partnerId);
            const partnerAge = partner ? calculateAge(partner.dateOfBirth) : 0;
            isBothAdult = myAge >= 18 && partnerAge >= 18;
        }

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

        if (!me.isCoupledWithAI && (!me.partnerId || me.coupleStatus !== "coupled")) {
            return res.status(400).json({ message: "You need to be in a couple (real or AI) to play games" });
        }

        const partnerId = me.isCoupledWithAI ? "ai-user-id" : me.partnerId;
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

        let state = {};
        if (gameType === "ludo") {
            state = {
                currentPlayer: req.user._id.toString(),
                dice: 1,
                rolled: false,
                pieces: {
                    [req.user._id.toString()]: [-1, -1, -1, -1], // -1 means in base
                    [partnerId.toString()]: [-1, -1, -1, -1]
                },
                lastRoll: 0,
                turnCount: 0
            };
        } else if (gameType === "tic_tac_toe") {
            state = {
                currentPlayer: req.user._id.toString(),
                board: Array(9).fill(null),
                symbols: {
                    [req.user._id.toString()]: "X",
                    [partnerId.toString()]: "O"
                },
                turnCount: 0
            };
        }

        const newSession = await GameSession.create({
            participants: [req.user._id, partnerId],
            gameType,
            questions: template.questions,
            answers: new Map(),
            status: "pending",
            state
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

// Get completed sessions (History)
router.get("/history", checkMembership, async (req, res) => {
    try {
        const sessions = await GameSession.find({
            participants: req.user._id,
            status: "completed"
        }).populate("participants", "fullName profilePic")
            .sort({ updatedAt: -1 })
            .limit(10);

        res.json(sessions);
    } catch (err) {
        console.error("Error fetching game history:", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// Submit answers
router.post("/submit", checkMembership, async (req, res) => {
    try {
        const { sessionId, quizAnswers } = req.body;
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

        // --- AI Auto-Answering Logic ---
        if (session.participants.includes("ai-user-id")) {
            const aiAnswers = quizAnswers.map(ua => {
                // AI mostly matches (70%) to feel "compatible"
                const shouldMatch = Math.random() < 0.7;
                const template = QUIZ_TEMPLATES[session.gameType];
                const question = template.questions[ua.questionIndex];

                let answer = ua.answer;
                if (!shouldMatch) {
                    const otherOptions = question.options.filter(o => o !== ua.answer);
                    answer = otherOptions[Math.floor(Math.random() * otherOptions.length)];
                }

                return { questionIndex: ua.questionIndex, answer };
            });
            session.answers.set("ai-user-id", aiAnswers);
        }

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

            // Award Badges
            try {
                const badgeName = "Quiz Master";
                await User.updateMany(
                    { _id: { $in: session.participants } },
                    { $addToSet: { badges: badgeName } }
                );
            } catch (badgeError) {
                console.error("Error awarding badges:", badgeError);
            }
        }

        await session.save();
        res.json({ success: true, session });
    } catch (err) {
        console.error("Error submitting answers:", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// Ludo Game Actions
router.post("/ludo/action/:id", async (req, res) => {
    try {
        const { action, pieceIndex } = req.body; // action: 'roll' or 'move'
        const session = await GameSession.findById(req.params.id);

        if (!session || session.gameType !== "ludo") {
            return res.status(404).json({ message: "Ludo session not found" });
        }

        const myId = req.user._id.toString();
        const state = session.state;

        if (state.currentPlayer !== myId) {
            return res.status(403).json({ message: "Not your turn!" });
        }

        if (action === "roll") {
            if (state.rolled) return res.status(400).json({ message: "Already rolled" });

            const roll = Math.floor(Math.random() * 6) + 1;
            state.dice = roll;
            state.rolled = true;

            // Check if any moves are possible
            const myPieces = state.pieces[myId];
            const canMove = myPieces.some(pos => {
                if (pos === -1) return roll === 6; // Need 6 to get out
                if (pos >= 57) return false; // Already finished
                if (pos + roll > 57) return false; // Must be exact
                return true;
            });

            if (!canMove) {
                // Switch turn if no moves possible
                state.rolled = false;
                state.currentPlayer = session.participants.find(p => p.toString() !== myId).toString();
                state.turnCount++;
            }
        } else if (action === "move") {
            if (!state.rolled) return res.status(400).json({ message: "Roll first" });

            const myPieces = state.pieces[myId];
            let pos = myPieces[pieceIndex];
            const roll = state.dice;

            if (pos === -1) {
                if (roll !== 6) return res.status(400).json({ message: "Need a 6 to start" });
                myPieces[pieceIndex] = 0; // Start position
            } else {
                if (pos + roll > 57) return res.status(400).json({ message: "Can't move that far" });
                myPieces[pieceIndex] += roll;
            }

            // Simple kick logic (if not in safe zone/base/finish)
            // Let's implement full Ludo logic later if needed, starting with basic racing.

            // Winning check
            if (myPieces.every(p => p === 57)) {
                session.status = "completed";
                session.score = 100;
            }

            // Turn management
            if (roll !== 6) {
                state.currentPlayer = session.participants.find(p => p.toString() !== myId).toString();
            }
            state.rolled = false;
            state.turnCount++;
        }

        if (state.currentPlayer === "ai-user-id" && session.status !== "completed") {
            let turnOver = false;
            while (!turnOver && state.currentPlayer === "ai-user-id" && session.status !== "completed") {
                const roll = Math.floor(Math.random() * 6) + 1;
                state.dice = roll;
                state.rolled = true;

                const aiPieces = state.pieces["ai-user-id"];
                const possibleMoves = aiPieces.map((pos, idx) => {
                    if (pos === -1 && roll === 6) return idx;
                    if (pos >= 0 && pos + roll <= 57) return idx;
                    return null;
                }).filter(v => v !== null);

                if (possibleMoves.length > 0) {
                    const pieceIndex = possibleMoves.reduce((best, curr) => {
                        const posBest = aiPieces[best];
                        const posCurr = aiPieces[curr];
                        if (posCurr >= 0 && (posBest === -1 || posCurr > posBest)) return curr;
                        return best;
                    }, possibleMoves[0]);

                    if (aiPieces[pieceIndex] === -1) {
                        aiPieces[pieceIndex] = 0;
                    } else {
                        aiPieces[pieceIndex] += roll;
                    }

                    if (aiPieces.every(p => p === 57)) {
                        session.status = "completed";
                        session.score = 100;
                        turnOver = true;
                    }

                    if (roll !== 6) {
                        state.currentPlayer = myId;
                        turnOver = true;
                    }
                    state.rolled = false;
                    state.turnCount++;
                } else {
                    state.currentPlayer = myId;
                    state.rolled = false;
                    state.turnCount++;
                    turnOver = true;
                }
            }
        }

        session.markModified("state");
        await session.save();
        res.json({ success: true, session });
    } catch (err) {
        console.error("Ludo action error:", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// Tic-Tac-Toe Game Actions
router.post("/ttt/action/:id", async (req, res) => {
    try {
        const { index } = req.body;
        const session = await GameSession.findById(req.params.id);

        if (!session || session.gameType !== "tic_tac_toe") {
            return res.status(404).json({ message: "Tic-Tac-Toe session not found" });
        }

        const myId = req.user._id.toString();
        const state = session.state;

        if (state.currentPlayer !== myId) {
            return res.status(403).json({ message: "Not your turn!" });
        }

        if (state.board[index] !== null) {
            return res.status(400).json({ message: "Cell already taken" });
        }

        // Make move
        state.board[index] = state.symbols[myId];
        state.turnCount++;

        // Win check
        const winningCombos = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // cols
            [0, 4, 8], [2, 4, 6]           // diags
        ];

        let winner = null;
        for (const [a, b, c] of winningCombos) {
            if (state.board[a] && state.board[a] === state.board[b] && state.board[a] === state.board[c]) {
                winner = state.board[a];
                break;
            }
        }

        if (winner) {
            session.status = "completed";
            session.score = 100;
        } else if (state.turnCount === 9) {
            session.status = "completed";
            session.score = 50; // Draw
        } else {
            // Switch turn
            const nextPlayer = session.participants.find(p => p.toString() !== myId).toString();
            state.currentPlayer = nextPlayer;

            // --- AI Turn Logic ---
            if (nextPlayer === "ai-user-id") {
                const emptyIndices = state.board.map((v, i) => v === null ? i : null).filter(v => v !== null);
                if (emptyIndices.length > 0) {
                    const aiMove = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
                    state.board[aiMove] = state.symbols["ai-user-id"];
                    state.turnCount++;

                    // Re-check for AI win
                    let aiWinner = false;
                    const winningCombos = [
                        [0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]
                    ];
                    for (const [a, b, c] of winningCombos) {
                        if (state.board[a] && state.board[a] === state.board[b] && state.board[a] === state.board[c]) {
                            aiWinner = true;
                            break;
                        }
                    }

                    if (aiWinner) {
                        session.status = "completed";
                        session.score = 100;
                    } else if (state.turnCount === 9) {
                        session.status = "completed";
                        session.score = 50;
                    } else {
                        state.currentPlayer = myId; // Switch back to user
                    }
                }
            }
        }

        session.markModified("state");
        await session.save();
        res.json({ success: true, session });
    } catch (err) {
        console.error("TTT action error:", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

export default router;
