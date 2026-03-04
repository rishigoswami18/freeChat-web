import User from "../models/User.js";
import Question from "../models/Question.js";
import { sendNotificationEmail } from "../lib/email.service.js";

const moodLabels = {
    happy: "😊 Happy", neutral: "😐 Neutral", sad: "😢 Sad",
    angry: "😠 Angry", tired: "😴 Tired", excited: "🤩 Excited", romantic: "😍 Romantic"
};

/**
 * Helper: Check and update couple streak when a user checks in.
 * Streak increments when BOTH partners have checked in on the same day.
 * If a day is missed, streak resets to 0.
 */
const updateCoupleStreak = async (user) => {
    if (!user.partnerId || user.coupleStatus !== "coupled") return;

    const now = new Date();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);

    const yesterdayStart = new Date(todayStart);
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);

    // Check if partner also checked in today
    const partner = await User.findById(user.partnerId);
    if (!partner) return;

    const partnerCheckedInToday = partner.lastMoodUpdate && partner.lastMoodUpdate >= todayStart;
    const userCheckedInToday = user.lastMoodUpdate && user.lastMoodUpdate >= todayStart;

    // Both checked in today — update streak
    if (partnerCheckedInToday && userCheckedInToday) {
        // Check if streak was already counted today
        const userStreakToday = user.lastCoupleStreakDate && user.lastCoupleStreakDate >= todayStart;
        if (userStreakToday) return; // Already counted today

        // Check if yesterday's streak was active (for continuation)
        const hadStreakYesterday = user.lastCoupleStreakDate &&
            user.lastCoupleStreakDate >= yesterdayStart &&
            user.lastCoupleStreakDate < todayStart;

        const newStreak = hadStreakYesterday ? (user.coupleStreak || 0) + 1 : 1;

        // Update both users
        await User.updateOne({ _id: user._id }, {
            coupleStreak: newStreak,
            lastCoupleStreakDate: now
        });
        await User.updateOne({ _id: partner._id }, {
            coupleStreak: newStreak,
            lastCoupleStreakDate: now
        });
    }
};

// Update user mood (Daily Check-in)
export const updateMood = async (req, res) => {
    try {
        const { mood } = req.body;
        const user = await User.findById(req.user._id);

        user.mood = mood;
        user.lastMoodUpdate = new Date();
        await user.save();

        // Update couple streak after mood update
        await updateCoupleStreak(user);

        // Notify partner about mood (fire-and-forget)
        if (user.partnerId && user.coupleStatus === "coupled") {
            const partner = await User.findById(user.partnerId).select("email fullName");
            if (partner?.email) {
                const moodText = moodLabels[mood] || mood;
                sendNotificationEmail(partner.email, {
                    emoji: "💕",
                    title: `${user.fullName.split(' ')[0]} shared their mood!`,
                    body: `Your partner is feeling <strong>${moodText}</strong> right now. Check in and share your mood too to keep your streak going! 🔥`,
                    ctaText: "Share Your Mood",
                    ctaUrl: `${process.env.CLIENT_URL || "https://freechatweb.in"}/couple`,
                });
            }
        }

        // Re-fetch updated user to get latest streak
        const updatedUser = await User.findById(req.user._id);

        res.status(200).json({ success: true, user: updatedUser });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get the daily question and status of both partners
export const getDailyInsight = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate("partnerId", "fullName profilePic mood lastMoodUpdate coupleStreak lastCoupleStreakDate");

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

        // Check if streak is still alive (not broken by missing yesterday)
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const yesterdayStart = new Date(todayStart);
        yesterdayStart.setDate(yesterdayStart.getDate() - 1);

        let coupleStreak = user.coupleStreak || 0;
        // If the last streak date was before yesterday, streak is broken
        if (user.lastCoupleStreakDate && user.lastCoupleStreakDate < yesterdayStart) {
            coupleStreak = 0;
            // Reset in DB silently
            await User.updateOne({ _id: user._id }, { coupleStreak: 0 });
        }

        res.status(200).json({
            question,
            myMood: user.mood,
            partner: user.partnerId,
            coupleStreak,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Seed questions if empty
export const seedQuestions = async () => {
    const questions = [
        { text: "What's one small challenge you faced today that I can support you with?", category: "future" },
        { text: "What is your favorite memory of us from the last month?", category: "love" },
        { text: "If we could escape to anywhere for a weekend, where would we go?", category: "fun" },
        { text: "What is one thing I do that makes you feel most loved?", category: "deep" },
        { text: "How can we make our communication even better this week?", category: "conflict" },
        { text: "What's something new you'd like us to try together?", category: "fun" },
        { text: "What made you smile today?", category: "love" },
        { text: "If you could relive one day from our relationship, which would it be?", category: "deep" },
        { text: "What's a dream you haven't told me about yet?", category: "deep" },
        { text: "What's one thing I can do tomorrow to make your day better?", category: "future" },
        { text: "What song reminds you most of us?", category: "fun" },
        { text: "What's the bravest thing you've ever done for love?", category: "deep" },
        { text: "Describe your perfect lazy Sunday with me.", category: "fun" },
        { text: "What's something you've forgiven me for that made us stronger?", category: "conflict" },
        { text: "What's a tradition you'd love for us to start?", category: "future" },
    ];

    if (await Question.countDocuments() === 0) {
        await Question.insertMany(questions);
        console.log("Seeded Daily Questions.");
    }
};
