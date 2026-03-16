import FocusSession from "../models/FocusSession.js";

/**
 * Focus Controller — High-Performance Productivity Endpoints
 * Optimized for Redis-first read patterns (conceptual in this implementation).
 */
export const startFocusSession = async (req, res) => {
  try {
    const { goal, durationMinutes = 25 } = req.body;
    const userId = req.user.id;

    // 1. Close any hanging sessions
    await FocusSession.updateMany(
      { userId, status: 'active' },
      { $set: { status: 'interrupted', endTime: new Date() } }
    );

    // 2. Create new specialized session
    const session = await FocusSession.create({
      userId,
      goal,
      durationMinutes,
      status: 'active',
      startTime: new Date()
    });

    // Strategy: In a real 10M user prod, we would now push a key to Redis:
    // redis.setex(`focus:session:${userId}`, durationMinutes * 60, session._id)

    res.status(201).json(session);
  } catch (error) {
    res.status(500).json({ message: "Productivity OS kernel panic.", error: error.message });
  }
};

export const getFocusStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const activeSession = await FocusSession.findOne({ userId, status: 'active' });

    if (!activeSession) {
      return res.status(200).json({ isActive: false });
    }

    res.status(200).json({
      isActive: true,
      goal: activeSession.goal,
      startTime: activeSession.startTime,
      durationMinutes: activeSession.durationMinutes,
      blocksAvoided: activeSession.blocksAvoided,
      xpEarned: activeSession.xpEarned
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to query neural state." });
  }
};

export const endFocusSession = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // In prod: redis.del(`focus:session:${userId}`)

    const session = await FocusSession.findOneAndUpdate(
      { userId, status: 'active' },
      { 
        $set: { 
          status: 'completed', 
          endTime: new Date(),
          productivityScore: 95, // AI Calculated mockup
          xpEarned: 500 
        } 
      },
      { new: true }
    );

    if (!session) return res.status(404).json({ message: "No active session found." });

    res.status(200).json(session);
  } catch (error) {
    res.status(500).json({ message: "Shield disengagement failure." });
  }
};
