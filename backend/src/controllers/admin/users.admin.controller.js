import mongoose from "mongoose";
import FraudFlag from "../../models/FraudFlag.js";
import Post from "../../models/Post.js";
import TransactionHistory from "../../models/TransactionHistory.js";
import User from "../../models/User.js";
import UserWallet from "../../models/UserWallet.js";
import WithdrawalRequest from "../../models/WithdrawalRequest.js";
import AuditLog from "../../models/AuditLog.js";
import { createAuditLog } from "../../services/admin/adminAudit.service.js";

const ALLOWED_ACCOUNT_STATUSES = [
  "active",
  "limited",
  "suspended",
  "banned",
  "payout_hold",
  "under_review",
];

const ALLOWED_VERIFICATION_STATUSES = [
  "unverified",
  "pending",
  "verified",
  "rejected",
];

const parsePagination = (page, limit) => {
  const pageNumber = Math.max(parseInt(page, 10) || 1, 1);
  const limitNumber = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);

  return {
    pageNumber,
    limitNumber,
    skip: (pageNumber - 1) * limitNumber,
  };
};

const buildRiskFilter = (risk) => {
  if (!risk) return null;
  if (risk === "high") return { $gte: 70 };
  if (risk === "medium") return { $gte: 30, $lt: 70 };
  if (risk === "low") return { $lt: 30 };

  const numericRisk = Number(risk);
  if (Number.isFinite(numericRisk)) {
    return { $gte: numericRisk };
  }

  return null;
};

const buildUserFilter = ({ q, status, verification, risk }) => {
  const filter = {};

  if (q?.trim()) {
    const regex = new RegExp(q.trim(), "i");
    filter.$or = [
      { fullName: regex },
      { email: regex },
      { username: regex },
      { phone: regex },
      { referralCode: regex },
    ];
  }

  if (status) {
    filter.accountStatus = status;
  }

  if (verification) {
    if (verification === "verified") {
      filter.$or = [
        ...(filter.$or || []),
        { verificationStatus: "verified" },
        { isVerified: true },
      ];
    } else {
      filter.verificationStatus = verification;
    }
  }

  const riskFilter = buildRiskFilter(risk);
  if (riskFilter) {
    filter.riskScore = riskFilter;
  }

  return filter;
};

const serializeUser = (user) => ({
  _id: user._id,
  fullName: user.fullName,
  email: user.email,
  phone: user.phone || "",
  username: user.username || "",
  profilePic: user.profilePic || "",
  role: user.role,
  isBanned: user.isBanned,
  accountStatus: user.accountStatus || "active",
  banReason: user.banReason || "",
  verificationStatus: user.verificationStatus || (user.isVerified ? "verified" : "unverified"),
  verificationLevel: user.verificationLevel || 0,
  trustScore: user.trustScore || 0,
  riskScore: user.riskScore || 0,
  restrictedFeatures: user.restrictedFeatures || [],
  earnings: user.earnings || 0,
  wallet: user.wallet
    ? {
        id: user.wallet._id,
        totalBalance: user.wallet.totalBalance || 0,
        winnings: user.wallet.winnings || 0,
        bonusBalance: user.wallet.bonusBalance || 0,
        frozenBalance: user.wallet.frozenBalance || 0,
        availablePaise: user.wallet.availablePaise || 0,
        pendingPaise: user.wallet.pendingPaise || 0,
        lockedPaise: user.wallet.lockedPaise || 0,
      }
    : null,
  createdAt: user.createdAt,
  lastLoginDate: user.lastLoginDate,
  lastSeenAt: user.lastSeenAt,
});

export const getAdminUsersList = async (req, res) => {
  try {
    const { q = "", status = "", verification = "", risk = "", page = 1, limit = 20 } = req.query;
    const { pageNumber, limitNumber, skip } = parsePagination(page, limit);
    const filter = buildUserFilter({ q, status, verification, risk });

    const [users, total] = await Promise.all([
      User.find(filter)
        .select("-password")
        .populate("wallet")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNumber)
        .lean(),
      User.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: {
        items: users.map(serializeUser),
      },
      meta: {
        page: pageNumber,
        limit: limitNumber,
        total,
      },
    });
  } catch (error) {
    console.error("Error fetching admin users list:", error);
    res.status(500).json({
      success: false,
      error: {
        code: "ADMIN_USERS_LIST_FAILED",
        message: "Failed to fetch admin users list",
      },
    });
  }
};

export const getAdminUserDetails = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: {
          code: "INVALID_USER_ID",
          message: "Invalid user id",
        },
      });
    }

    const [user, recentTransactions, recentWithdrawals, flags, postCount, auditTrail] =
      await Promise.all([
        User.findById(id).select("-password").populate("wallet").lean(),
        TransactionHistory.find({ userId: id })
          .sort({ createdAt: -1 })
          .limit(10)
          .lean(),
        WithdrawalRequest.find({ userId: id })
          .sort({ createdAt: -1 })
          .limit(10)
          .lean(),
        FraudFlag.find({ userId: id }).sort({ createdAt: -1 }).limit(10).lean(),
        Post.countDocuments({ userId: id }),
        AuditLog.find({
          $or: [{ targetId: id }, { resourceId: id }],
        })
          .sort({ createdAt: -1 })
          .limit(10)
          .lean(),
      ]);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          code: "USER_NOT_FOUND",
          message: "User not found",
        },
      });
    }

    res.status(200).json({
      success: true,
      data: {
        user: serializeUser(user),
        metrics: {
          postCount,
          transactionCount: recentTransactions.length,
          withdrawalCount: recentWithdrawals.length,
          openFlagCount: flags.filter((flag) =>
            ["open", "reviewing"].includes(flag.status)
          ).length,
        },
        recentTransactions,
        recentWithdrawals,
        flags,
        auditTrail,
      },
    });
  } catch (error) {
    console.error("Error fetching admin user details:", error);
    res.status(500).json({
      success: false,
      error: {
        code: "ADMIN_USER_DETAILS_FAILED",
        message: "Failed to fetch admin user details",
      },
    });
  }
};

export const updateAdminUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reason, restrictedFeatures = [] } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: {
          code: "INVALID_USER_ID",
          message: "Invalid user id",
        },
      });
    }

    if (!ALLOWED_ACCOUNT_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        error: {
          code: "INVALID_ACCOUNT_STATUS",
          message: "Invalid account status",
        },
      });
    }

    if (!reason?.trim()) {
      return res.status(400).json({
        success: false,
        error: {
          code: "STATUS_REASON_REQUIRED",
          message: "Reason is required for status changes",
        },
      });
    }

    if (id === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        error: {
          code: "SELF_STATUS_CHANGE_BLOCKED",
          message: "You cannot change your own admin account status",
        },
      });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          code: "USER_NOT_FOUND",
          message: "User not found",
        },
      });
    }

    const before = {
      accountStatus: user.accountStatus || "active",
      isBanned: user.isBanned,
      banReason: user.banReason || "",
      restrictedFeatures: user.restrictedFeatures || [],
    };

    user.accountStatus = status;
    user.banReason = reason.trim();

    if (Array.isArray(restrictedFeatures)) {
      user.restrictedFeatures = restrictedFeatures;
    }

    if (status === "banned") {
      user.isBanned = true;
    } else if (status === "active") {
      user.isBanned = false;
      user.banReason = "";
      user.restrictedFeatures = [];
    }

    await user.save();

    const after = {
      accountStatus: user.accountStatus,
      isBanned: user.isBanned,
      banReason: user.banReason,
      restrictedFeatures: user.restrictedFeatures,
    };

    await createAuditLog(req, {
      action: "USER_STATUS_UPDATED",
      resourceType: "User",
      resourceId: user._id,
      targetModel: "User",
      targetId: user._id,
      reason: reason.trim(),
      before,
      after,
      severity: ["banned", "suspended"].includes(status) ? "warning" : "info",
      details: {
        status,
        restrictedFeatures: user.restrictedFeatures,
      },
    });

    res.status(200).json({
      success: true,
      data: {
        userId: user._id,
        status: user.accountStatus,
        restrictedFeatures: user.restrictedFeatures,
      },
    });
  } catch (error) {
    console.error("Error updating admin user status:", error);
    res.status(500).json({
      success: false,
      error: {
        code: "ADMIN_USER_STATUS_FAILED",
        message: "Failed to update user status",
      },
    });
  }
};

export const updateAdminUserVerification = async (req, res) => {
  try {
    const { id } = req.params;
    const { verificationStatus, verificationLevel = 0, reason } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: {
          code: "INVALID_USER_ID",
          message: "Invalid user id",
        },
      });
    }

    if (!ALLOWED_VERIFICATION_STATUSES.includes(verificationStatus)) {
      return res.status(400).json({
        success: false,
        error: {
          code: "INVALID_VERIFICATION_STATUS",
          message: "Invalid verification status",
        },
      });
    }

    if (!reason?.trim()) {
      return res.status(400).json({
        success: false,
        error: {
          code: "VERIFICATION_REASON_REQUIRED",
          message: "Reason is required for verification changes",
        },
      });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          code: "USER_NOT_FOUND",
          message: "User not found",
        },
      });
    }

    const before = {
      verificationStatus: user.verificationStatus || "unverified",
      verificationLevel: user.verificationLevel || 0,
      isVerified: user.isVerified || false,
    };

    user.verificationStatus = verificationStatus;
    user.verificationLevel = Math.max(Number(verificationLevel) || 0, 0);
    user.isVerified = verificationStatus === "verified";

    await user.save();

    const after = {
      verificationStatus: user.verificationStatus,
      verificationLevel: user.verificationLevel,
      isVerified: user.isVerified,
    };

    await createAuditLog(req, {
      action: "USER_VERIFICATION_UPDATED",
      resourceType: "User",
      resourceId: user._id,
      targetModel: "User",
      targetId: user._id,
      reason: reason.trim(),
      before,
      after,
      severity: verificationStatus === "rejected" ? "warning" : "info",
      details: {
        verificationStatus,
        verificationLevel: user.verificationLevel,
      },
    });

    res.status(200).json({
      success: true,
      data: {
        userId: user._id,
        verificationStatus: user.verificationStatus,
        verificationLevel: user.verificationLevel,
      },
    });
  } catch (error) {
    console.error("Error updating admin user verification:", error);
    res.status(500).json({
      success: false,
      error: {
        code: "ADMIN_USER_VERIFICATION_FAILED",
        message: "Failed to update user verification",
      },
    });
  }
};

export const getAdminUserEarnings = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: {
          code: "INVALID_USER_ID",
          message: "Invalid user id",
        },
      });
    }

    const objectId = new mongoose.Types.ObjectId(id);

    const [user, wallet, transactionSummary, recentTransactions] = await Promise.all([
      User.findById(id).select("fullName email username earnings").lean(),
      UserWallet.findOne({ userId: id }).lean(),
      TransactionHistory.aggregate([
        { $match: { userId: objectId } },
        {
          $group: {
            _id: null,
            transactionCount: { $sum: 1 },
            totalCredits: {
              $sum: {
                $cond: [{ $gt: ["$amount", 0] }, "$amount", 0],
              },
            },
            totalDebits: {
              $sum: {
                $cond: [{ $lt: ["$amount", 0] }, "$amount", 0],
              },
            },
            netVolume: { $sum: "$amount" },
          },
        },
      ]),
      TransactionHistory.find({ userId: id }).sort({ createdAt: -1 }).limit(10).lean(),
    ]);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          code: "USER_NOT_FOUND",
          message: "User not found",
        },
      });
    }

    res.status(200).json({
      success: true,
      data: {
        user,
        wallet,
        recordedEarnings: user.earnings || 0,
        summary: transactionSummary[0] || {
          transactionCount: 0,
          totalCredits: 0,
          totalDebits: 0,
          netVolume: 0,
        },
        recentTransactions,
      },
    });
  } catch (error) {
    console.error("Error fetching admin user earnings:", error);
    res.status(500).json({
      success: false,
      error: {
        code: "ADMIN_USER_EARNINGS_FAILED",
        message: "Failed to fetch user earnings",
      },
    });
  }
};

export const getAdminUserFlags = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: {
          code: "INVALID_USER_ID",
          message: "Invalid user id",
        },
      });
    }

    const flags = await FraudFlag.find({ userId: id })
      .populate("reviewedBy", "fullName email")
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      data: {
        items: flags,
      },
    });
  } catch (error) {
    console.error("Error fetching admin user flags:", error);
    res.status(500).json({
      success: false,
      error: {
        code: "ADMIN_USER_FLAGS_FAILED",
        message: "Failed to fetch user flags",
      },
    });
  }
};
