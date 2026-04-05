import AppRelease from "../../models/AppRelease.js";
import FraudFlag from "../../models/FraudFlag.js";
import Post from "../../models/Post.js";
import TransactionHistory from "../../models/TransactionHistory.js";
import User from "../../models/User.js";
import WithdrawalRequest from "../../models/WithdrawalRequest.js";

const DAY_IN_MS = 24 * 60 * 60 * 1000;

const normalizeTransaction = (txn) => ({
  id: txn._id,
  type: txn.type || "UNKNOWN",
  amount: txn.amount || 0,
  status: txn.status || "SUCCESS",
  description: txn.description || "",
  referenceId: txn.referenceId || "",
  user: txn.userId
    ? {
        id: txn.userId._id || txn.userId,
        fullName: txn.userId.fullName || "",
        email: txn.userId.email || "",
      }
    : null,
  createdAt: txn.createdAt,
});

export const getAdminOverview = async (req, res) => {
  try {
    const now = Date.now();
    const last24h = new Date(now - DAY_IN_MS);
    const last30d = new Date(now - 30 * DAY_IN_MS);

    const [
      totalUsers,
      totalPosts,
      verifiedUsers,
      dailyActiveUsers,
      monthlyActiveUsers,
      pendingWithdrawalDocs,
      purchaseRevenue,
      purchaseRevenue30d,
      topCreators,
      recentTransactions,
      openFraudFlags,
      reportedContent,
      appDownloadTotals,
    ] = await Promise.all([
      User.countDocuments(),
      Post.countDocuments(),
      User.countDocuments({
        $or: [{ isVerified: true }, { verificationStatus: "verified" }],
      }),
      User.countDocuments({ lastLoginDate: { $gte: last24h } }),
      User.countDocuments({ lastLoginDate: { $gte: last30d } }),
      WithdrawalRequest.find({ status: "pending" })
        .populate("userId", "fullName email")
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),
      TransactionHistory.aggregate([
        { $match: { type: "PURCHASE", status: "SUCCESS" } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      TransactionHistory.aggregate([
        {
          $match: {
            type: "PURCHASE",
            status: "SUCCESS",
            createdAt: { $gte: last30d },
          },
        },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      User.find({})
        .select("fullName username profilePic earnings isVerified verificationStatus")
        .sort({ earnings: -1, createdAt: -1 })
        .limit(5)
        .lean(),
      TransactionHistory.find({})
        .populate("userId", "fullName email")
        .sort({ createdAt: -1 })
        .limit(8)
        .lean(),
      FraudFlag.countDocuments({ status: { $in: ["open", "reviewing"] } }),
      Post.countDocuments({
        $or: [
          { reportCount: { $gt: 0 } },
          { moderationStatus: { $in: ["under_review", "flagged"] } },
        ],
      }),
      AppRelease.aggregate([
        { $group: { _id: null, totalDownloads: { $sum: "$downloadCount" } } },
      ]),
    ]);

    const pendingWithdrawalAmount = pendingWithdrawalDocs.reduce(
      (sum, request) => sum + (request.amount || 0),
      0
    );

    res.status(200).json({
      success: true,
      data: {
        totals: {
          users: totalUsers,
          posts: totalPosts,
          verifiedUsers,
        },
        activeUsers: {
          daily: dailyActiveUsers,
          monthly: monthlyActiveUsers,
        },
        money: {
          totalRevenue: purchaseRevenue[0]?.total || 0,
          revenueLast30Days: purchaseRevenue30d[0]?.total || 0,
          pendingWithdrawalAmount,
          pendingWithdrawalCount: pendingWithdrawalDocs.length,
        },
        operations: {
          openFraudFlags,
          reportedContent,
          totalAppDownloads: appDownloadTotals[0]?.totalDownloads || 0,
        },
        topCreators: topCreators.map((user) => ({
          id: user._id,
          fullName: user.fullName,
          username: user.username,
          profilePic: user.profilePic,
          earnings: user.earnings || 0,
          isVerified: user.isVerified || user.verificationStatus === "verified",
        })),
        recentTransactions: recentTransactions.map(normalizeTransaction),
        pendingWithdrawals: pendingWithdrawalDocs.map((request) => ({
          id: request._id,
          amount: request.amount || 0,
          status: request.status,
          user: request.userId
            ? {
                id: request.userId._id || request.userId,
                fullName: request.userId.fullName || "",
                email: request.userId.email || "",
              }
            : null,
          createdAt: request.createdAt,
        })),
      },
    });
  } catch (error) {
    console.error("Error fetching admin overview:", error);
    res.status(500).json({
      success: false,
      error: {
        code: "ADMIN_OVERVIEW_FAILED",
        message: "Failed to load admin overview",
      },
    });
  }
};

export const getAdminLiveTicker = async (req, res) => {
  try {
    const [transactions, withdrawals] = await Promise.all([
      TransactionHistory.find({})
        .populate("userId", "fullName email")
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),
      WithdrawalRequest.find({})
        .populate("userId", "fullName email")
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),
    ]);

    const tickerItems = [
      ...transactions.map((txn) => ({
        id: `txn-${txn._id}`,
        type: "transaction",
        label: txn.type || "UNKNOWN",
        amount: txn.amount || 0,
        status: txn.status || "SUCCESS",
        user: txn.userId
          ? {
              id: txn.userId._id || txn.userId,
              fullName: txn.userId.fullName || "",
              email: txn.userId.email || "",
            }
          : null,
        createdAt: txn.createdAt,
      })),
      ...withdrawals.map((request) => ({
        id: `withdrawal-${request._id}`,
        type: "withdrawal",
        label: "WITHDRAWAL_REQUEST",
        amount: request.amount || 0,
        status: request.status || "pending",
        user: request.userId
          ? {
              id: request.userId._id || request.userId,
              fullName: request.userId.fullName || "",
              email: request.userId.email || "",
            }
          : null,
        createdAt: request.createdAt,
      })),
    ]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 20);

    res.status(200).json({
      success: true,
      data: tickerItems,
    });
  } catch (error) {
    console.error("Error fetching admin live ticker:", error);
    res.status(500).json({
      success: false,
      error: {
        code: "ADMIN_TICKER_FAILED",
        message: "Failed to load live admin ticker",
      },
    });
  }
};
