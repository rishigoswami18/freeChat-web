import User from "../models/User.js";
import Question from "../models/Question.js";

// Update user mood (Daily Check-in)
export const updateMood = async (req, res) => {
    try {
        const { mood } = req.body;
        const user = await User.findById(req.user._id);

        user.mood = mood;
        user.lastMoodUpdate = new Date();
        await user.save();

        res.status(200).json({ success: true, user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get the daily question and status of both partners
export const getDailyInsight = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate("partnerId", "fullName profilePic mood lastMoodUpdate");

        // Find question for today (or a random fallback)
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let question = await Question.findOne({ activeDate: today });
        if (!question) {
            // Pick a random one if no specific one for today
            const count = await Question.countDocuments();
            if (count > 0) {
                const random = Math.floor(Math.random() * count);
                question = await Question.findOne().skip(random);
            } else {
                question = { text: "What is one thing you appreciate about your partner today?" };
            }
        }

        res.status(200).json({
            question,
            myMood: user.mood,
            partner: user.partnerId,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Seed questions if empty
export const seedQuestions = async () => {
    const questions = [
        { text: "What’s one small challenge you faced today that I can support you with?", category: "future" },
        { text: "What is your favorite memory of us from the last month?", category: "love" },
        { text: "If we could escape to anywhere for a weekend, where would we go?", category: "fun" },
        { text: "What is one thing I do that makes you feel most loved?", category: "deep" },
        { text: "How can we make our communication even better this week?", category: "conflict" }
    ];

    if (await Question.countDocuments() === 0) {
        await Question.insertMany(questions);
        console.log("Seeded Daily Questions.");
    }
};
