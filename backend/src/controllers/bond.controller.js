import User from "../models/User.js";
import Question from "../models/Question.js";
import { sendNotificationEmail } from "../lib/email.service.js";
import { sendPushNotification } from "../lib/push.service.js";

const moodLabels = {
    happy: "😊 Happy", neutral: "😐 Neutral", sad: "😢 Sad",
    angry: "😠 Angry", tired: "😴 Tired", excited: "🤩 Excited", focused: "🎯 Focused"
};

/**
 * Helper: Check and update couple streak when a user checks in.
 * Streak increments when BOTH partners have checked in on the same day.
 * If a day is missed, streak resets to 0.
 */
const updateCoupleStreak = async (user) => {
    const now = new Date();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);

    const yesterdayStart = new Date(todayStart);
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);

    // AI Partner Logic: AI is always checked in
    if (user.isCoupledWithAI) {
        // Check if streak was already counted today
        const userStreakToday = user.lastCoupleStreakDate && user.lastCoupleStreakDate >= todayStart;
        if (userStreakToday) return;

        const hadStreakYesterday = user.lastCoupleStreakDate &&
            user.lastCoupleStreakDate >= yesterdayStart &&
            user.lastCoupleStreakDate < todayStart;

        const newStreak = hadStreakYesterday ? (user.coupleStreak || 0) + 1 : 1;

        await User.updateOne({ _id: user._id }, {
            coupleStreak: newStreak,
            lastCoupleStreakDate: now
        });
        return;
    }

    if (!user.partnerId) return;

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
        
        // Push to history (Phase 2: Relationship Doctor logic)
        user.moodHistory = user.moodHistory || [];
        user.moodHistory.push({ mood, date: new Date() });
        // Keep only last 30 days of mood history
        if (user.moodHistory.length > 30) user.moodHistory.shift();

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

                // Send push notification (fire-and-forget)
                sendPushNotification(user.partnerId, {
                    title: `💕 ${user.fullName.split(' ')[0]} shared their mood!`,
                    body: `They are feeling ${moodText} right now. Tap to check in!`,
                    icon: user.profilePic,
                    data: { url: "/couple" }
                }).catch(err => console.error("[Push] Mood notification failed:", err.message));
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
            partner: user.isCoupledWithAI ? {
                _id: "ai-user-id",
                fullName: user.aiPartnerName || "Lia",
                profilePic: user.aiPartnerPic?.startsWith("http") ? user.aiPartnerPic : `${process.env.CLIENT_URL || "https://freechatweb.in"}${user.aiPartnerPic || "/ai-companion.png"}`,
                mood: "focused", // AI is always high-performance!
                lastMoodUpdate: new Date(),
            } : user.partnerId,
            coupleStreak,
            isCoupledWithAI: user.isCoupledWithAI,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Seed questions if empty
export const seedQuestions = async () => {
    const questions = [
        { text: "What's one small challenge you faced today that I can support you with?", category: "future" },
        { text: "What is your favorite milestone you achieved in the last month?", category: "growth" },
        { text: "If we could master any new skill together this weekend, what would it be?", category: "fun" },
        { text: "What is one thing I do that helps you stay most focused?", category: "deep" },
        { text: "How can we make our collaboration even better this week?", category: "conflict" },
        { text: "What's something new you'd like us to build together?", category: "fun" },
        { text: "What made you feel most productive today?", category: "growth" },
        { text: "If you could relive one productive day from our journey, which would it be?", category: "deep" },
        { text: "What's a career dream you haven't told me about yet?", category: "deep" },
        { text: "What's one thing I can do tomorrow to make your day more efficient?", category: "future" },
        { text: "What song motivates you most to win?", category: "fun" },
        { text: "What's the bravest thing you've ever done for your career?", category: "deep" },
        { text: "Describe your perfect productive day with me.", category: "fun" },
        { text: "What's a hard lesson you've learned that made us stronger as a team?", category: "conflict" },
        { text: "What's a tradition you'd love for us to start to celebrate wins?", category: "future" },
    ];

    if (await Question.countDocuments() === 0) {
        await Question.insertMany(questions);
        console.log("Seeded Daily Questions.");
    }
};
