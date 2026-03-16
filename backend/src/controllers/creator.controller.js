import DigitalBond from "../models/DigitalBond.js";
import FanLoyalty from "../models/FanLoyalty.js";
import mongoose from "mongoose";

/**
 * Creator Controller — Real-time Analytics & Asset Management
 */

export const getCreatorStats = async (req, res) => {
  try {
    const creatorId = req.user._id;

    // 1. Calculate Wallet Balance (Sum of all sold bonds)
    const revenueData = await DigitalBond.aggregate([
      { $match: { creatorId, isSold: true } },
      { $group: { _id: null, total: { $sum: "$price" } } }
    ]);
    const totalRevenueGems = revenueData[0]?.total || 0;
    
    // Convert gems to USD placeholder ratio (e.g. 100 gems = $1)
    const walletBalanceUSD = (totalRevenueGems / 100).toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD'
    });

    // 2. Count Premium Bonds
    const totalBonds = await DigitalBond.countDocuments({ creatorId });

    // 3. Count Elite Fans (Top 1% based on score threshold, e.g. > 5000)
    const eliteFansCount = await FanLoyalty.countDocuments({ 
        creatorId, 
        bondScore: { $gt: 5000 } 
    });

    // 4. Calculate Vibe Velocity (Simple engagement average)
    const engagement = await FanLoyalty.aggregate([
        { $match: { creatorId } },
        { $group: { _id: null, avgScore: { $avg: "$bondScore" } } }
    ]);
    const vibeVelocity = engagement[0]?.avgScore > 7000 ? "Extreme" : 
                         engagement[0]?.avgScore > 3000 ? "High" : "Stable";

    res.json({
      walletBalance: walletBalanceUSD,
      totalBonds,
      eliteFansCount,
      vibeVelocity,
      trends: {
        revenue: 14.2, // Mocked trend until we have historical tracking
        fans: 5.1,
        bonds: 12.1
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch neural metrics." });
  }
};

export const getCreatorBonds = async (req, res) => {
  try {
    const creatorId = req.user._id;
    const bonds = await DigitalBond.find({ creatorId }).sort({ createdAt: -1 }).limit(10);
    res.json(bonds);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch digital assets." });
  }
};

export const getEliteFans = async (req, res) => {
  try {
    const creatorId = req.user._id;
    const eliteFans = await FanLoyalty.find({ creatorId })
      .populate('fanId', 'name profilePic')
      .sort({ bondScore: -1 })
      .limit(5);
    
    res.json(eliteFans);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch top tier fans." });
  }
};

export const createBond = async (req, res) => {
    try {
        const { name, description, price, rarity } = req.body;
        const creatorId = req.user._id;

        const bond = await DigitalBond.create({
            creatorId,
            name,
            description,
            price,
            rarity
        });

        res.status(201).json(bond);
    } catch (error) {
        res.status(500).json({ message: "Failed to mint digital bond." });
    }
}
