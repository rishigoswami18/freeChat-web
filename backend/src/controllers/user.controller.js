import User from "../models/User.js";
import FriendRequest from "../models/FriendRequest.js";
import cloudinary from "../lib/cloudinary.js";
import { upsertStreamUser, streamClient } from "../lib/stream.js";
import { hasPremiumAccess } from "../utils/freeTrial.js";
import bcrypt from "bcryptjs";
import Post from "../models/Post.js";
import Story from "../models/Story.js";
import GameSession from "../models/GameSession.js";

// backend/src/controllers/user.controller.js
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select("-password");
    console.log("Found users:", users.length); // Check your VS Code terminal
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export async function getRecommendedUsers(req, res) {
  try {
    const currentUserId = req.user.id;
    const currentUser = req.user;
    const { q } = req.query;

    let query = {
      $and: [
        { _id: { $ne: currentUserId } },
        { _id: { $nin: currentUser.friends } },
        { isPublic: true },
      ],
    };

    if (q) {
      console.log(`Searching users with query: "${q}"`);
      query.$and.push({
        $or: [
          { fullName: { $regex: q, $options: "i" } },
          { username: { $regex: q, $options: "i" } }
        ]
      });
    }

    let recommendedUsers = await User.find(query).limit(20); // Limit to top 20 to avoid over-fetching
    console.log(`Found ${recommendedUsers.length} users for query: "${q || 'none'}"`);

    // Calculate match scores
    recommendedUsers = recommendedUsers.map(user => {
      const userObj = user.toObject();
      let matchScore = 10; // Give a base score so everyone shows up
      let isTandemMatch = false;

      const userNative = (user.nativeLanguage || "").toLowerCase();
      const userLearning = (user.learningLanguage || "").toLowerCase();
      const currentNative = (currentUser.nativeLanguage || "").toLowerCase();
      const currentLearning = (currentUser.learningLanguage || "").toLowerCase();

      const isBoosted = user.boostUntil && new Date(user.boostUntil) > new Date();

      // Perfect Match
      if (userNative === currentLearning && userLearning === currentNative && currentLearning !== "") {
        matchScore += 90;
        isTandemMatch = true;
      }
      // High Match
      else if (userNative === currentLearning && currentLearning !== "") {
        matchScore += 40;
      }
      // Medium Match
      else if (userLearning === currentNative && currentNative !== "") {
        matchScore += 20;
      }

      // Proximity score (if they are both in the same location)
      if (user.location && currentUser.location && user.location.toLowerCase() === currentUser.location.toLowerCase()) {
         matchScore += 30;
      }

      return { ...userObj, matchScore, isTandemMatch, isBoosted };
    });

    // Sort: 1. Boosted first, 2. Highest Match score, 3. Newest
    recommendedUsers.sort((a, b) => {
      if (a.isBoosted !== b.isBoosted) return b.isBoosted ? 1 : -1;
      if (b.matchScore !== a.matchScore) return b.matchScore - a.matchScore;
      return b.createdAt - a.createdAt;
    });

    res.status(200).json(recommendedUsers);
  } catch (error) {
    console.error("Error in getRecommendedUsers controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getMyFriends(req, res) {
  try {
    const user = await User.findById(req.user.id)
      .select("friends")
      .populate("friends", "fullName profilePic username nativeLanguage learningLanguage role isVerified");

    res.status(200).json(user.friends);
  } catch (error) {
    console.error("Error in getMyFriends controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function sendFriendRequest(req, res) {
  try {
    const myId = req.user.id;
    const { id: recipientId } = req.params;

    if (myId === recipientId) {
      return res.status(400).json({ message: "You can't send friend request to yourself" });
    }

    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ message: "Recipient not found" });
    }

    if (recipient.friends.includes(myId)) {
      return res.status(400).json({ message: "You are already friends with this user" });
    }

    const existingRequest = await FriendRequest.findOne({
      $or: [
        { sender: myId, recipient: recipientId },
        { sender: recipientId, recipient: myId },
      ],
    });

    if (existingRequest) {
      return res
        .status(400)
        .json({ message: "A friend request already exists between you and this user" });
    }

    const friendRequest = await FriendRequest.create({
      sender: myId,
      recipient: recipientId,
    });

    // Send notification email (fire-and-forget)
    const { sendNotificationEmail } = await import("../lib/email.service.js");
    sendNotificationEmail(recipient.email, {
      emoji: "👋",
      title: "New Friend Request!",
      body: `<strong>${req.user.fullName}</strong> wants to be your friend on BondBeyond! Log in to accept or decline their request.`,
      ctaText: "View Request",
      ctaUrl: `${process.env.CLIENT_URL || "https://www.bondbeyond.in"}/notifications`,
    });

    // Send push notification (fire-and-forget)
    try {
      const { sendPushNotification } = await import("../lib/push.service.js");
      sendPushNotification(recipientId, {
        title: "👋 New Friend Request!",
        body: `${req.user.fullName} wants to be your friend on BondBeyond!`,
        icon: req.user.profilePic,
        data: { url: "/notifications" }
      });
    } catch (pushErr) {
      console.error("[Push] Request notification failed:", pushErr.message);
    }

    res.status(201).json(friendRequest);
  } catch (error) {
    console.error("Error in sendFriendRequest controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function acceptFriendRequest(req, res) {
  try {
    const { id: requestId } = req.params;

    const friendRequest = await FriendRequest.findById(requestId);

    if (!friendRequest) {
      return res.status(404).json({ message: "Friend request not found" });
    }

    if (friendRequest.recipient.toString() !== req.user.id) {
      return res.status(403).json({ message: "You are not authorized to accept this request" });
    }

    friendRequest.status = "accepted";
    await friendRequest.save();

    await User.findByIdAndUpdate(friendRequest.sender, {
      $addToSet: { friends: friendRequest.recipient },
    });

    await User.findByIdAndUpdate(friendRequest.recipient, {
      $addToSet: { friends: friendRequest.sender },
    });

    res.status(200).json({ message: "Friend request accepted" });
  } catch (error) {
    console.log("Error in acceptFriendRequest controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getFriendRequests(req, res) {
  try {
    const incomingReqs = await FriendRequest.find({
      recipient: req.user.id,
      status: "pending",
    }).populate("sender", "fullName profilePic nativeLanguage learningLanguage");

    const acceptedReqs = await FriendRequest.find({
      sender: req.user.id,
      status: "accepted",
    }).populate("recipient", "fullName profilePic");

    res.status(200).json({ incomingReqs, acceptedReqs });
  } catch (error) {
    console.log("Error in getPendingFriendRequests controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getOutgoingFriendReqs(req, res) {
  try {
    const outgoingReqs = await FriendRequest.find({
      sender: req.user.id,
      status: "pending",
    }).populate("recipient", "fullName profilePic nativeLanguage learningLanguage");

    res.status(200).json(outgoingReqs);
  } catch (error) {
    console.log("Error in getOutgoingFriendReqs controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}


export async function updateProfile(req, res) {
  try {
    const userId = req.user._id;
    const { fullName, bio, nativeLanguage, learningLanguage, location, profilePic, dateOfBirth, isStealthMode, panicShortcut, isPublic, aiPartnerName, aiFriendName } = req.body;
    const updateData = { fullName, bio, nativeLanguage, learningLanguage, location, isPublic, aiPartnerName, aiFriendName };
    const isPremium = hasPremiumAccess(req.user);

    if (isStealthMode !== undefined) {
      // Only error if trying to turn it ON while not premium
      if (!isPremium && isStealthMode === true) {
        return res.status(403).json({ message: "Stealth Mode is a premium feature. Please upgrade to use it." });
      }
      updateData.isStealthMode = isStealthMode;
    }

    if (panicShortcut) {
      // Only error if trying to set a CUSTOM shortcut (not "Escape") while not premium
      if (!isPremium && panicShortcut !== "Escape") {
        return res.status(403).json({ message: "Custom Panic Shortcuts are a premium feature." });
      }
      updateData.panicShortcut = panicShortcut;
    }

    if (dateOfBirth) {
      updateData.dateOfBirth = new Date(dateOfBirth);
    }

    if (profilePic && profilePic.startsWith("data:image")) {
      // Upload new profile pic to Cloudinary
      const uploadResponse = await cloudinary.uploader.upload(profilePic, {
        folder: "bondbeyond_profiles",
      });
      updateData.profilePic = uploadResponse.secure_url;
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true }).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Sync with Stream
    try {
      await upsertStreamUser({
        id: updatedUser._id.toString(),
        name: updatedUser.fullName,
        image: updatedUser.profilePic || "",
        role: updatedUser.role, // Sync role
        isVerified: updatedUser.isVerified // Sync verification
      });
    } catch (error) {
      console.log("Error syncing Stream user during profile update:", error.message);
    }

    res.status(200).json({ success: true, user: updatedUser });
  } catch (error) {
    console.error("Error in updateProfile controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function unfriend(req, res) {
  try {
    const myId = req.user._id;
    const { id: friendId } = req.params;

    // Remove from both sides
    await User.findByIdAndUpdate(myId, { $pull: { friends: friendId } });
    await User.findByIdAndUpdate(friendId, { $pull: { friends: myId } });

    // Remove any friend request documents between them (Cleanup)
    await FriendRequest.deleteMany({
      $or: [
        { sender: myId, recipient: friendId },
        { sender: friendId, recipient: myId },
      ],
    });

    res.status(200).json({ success: true, message: "Unfriended successfully" });
  } catch (error) {
    console.error("Error in unfriend controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function buyVerification(req, res) {
  try {
    const user = await User.findById(req.user._id);
    if (user.isVerified) return res.status(400).json({ message: "You are already verified" });

    const COST = 1000;
    if (user.gems < COST) return res.status(400).json({ message: "You need 1000 gems for verification" });

    user.gems -= COST;
    user.isVerified = true;
    await user.save();

    // Sync with Stream
    try {
      await upsertStreamUser({
        id: user._id.toString(),
        name: user.fullName,
        image: user.profilePic || "",
        role: user.role,
        isVerified: true
      });
    } catch (e) { }

    res.status(200).json({ success: true, message: "Verification badge activated! 🎉", user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export async function getUserProfile(req, res) {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select("-password").lean();
    if (!user) return res.status(404).json({ message: "User not found" });

    // Calculate friend count
    const friendCount = user.friends?.length || 0;

    res.status(200).json({ ...user, friendCount });
  } catch (error) {
    console.error("Error in getUserProfile controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getUserFriends(req, res) {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) return res.status(404).json({ message: "User not found" });

    // Check if profile is public or if the requester is the user themselves or a friend
    const isPublic = user.isPublic;
    const isSelf = req.user.id === id;
    const isFriend = user.friends.includes(req.user.id);

    if (!isPublic && !isSelf && !isFriend) {
      return res.status(403).json({ message: "This profile is private" });
    }

    const populatedUser = await User.findById(id)
      .select("friends")
      .populate("friends", "fullName profilePic username nativeLanguage learningLanguage role isVerified");

    res.status(200).json(populatedUser.friends);
  } catch (error) {
    console.error("Error in getUserFriends controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function changePassword(req, res) {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: "Incorrect current password" });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export async function deleteAccount(req, res) {
  try {
    const userId = req.user._id;

    // 1. Delete from Stream
    try {
      if (streamClient) {
        await streamClient.deleteUser(String(userId), { delete_conversation_interactions: true });
      } else {
        console.warn("Stream client not initialized, skipping user deletion");
      }
    } catch (e) {
      console.error("Stream user deletion failed:", e.message);
    }

    // 2. Delete Posts and Stories
    await Post.deleteMany({ userId });
    await Story.deleteMany({ userId });

    // 3. Cleanup Friend Requests
    await FriendRequest.deleteMany({
      $or: [{ sender: userId }, { recipient: userId }]
    });

    // 4. Remove from Friends lists of others
    await User.updateMany(
      { friends: userId },
      { $pull: { friends: userId } }
    );

    // 5. Cleanup Couple status and partner reference
    await User.updateMany(
      { partnerId: userId },
      {
        $set: {
          partnerId: null,
          coupleStatus: "none",
          coupleStreak: 0,
          coupleRequestSenderId: null
        }
      }
    );

    // 6. Delete Game Sessions where user was a participant
    await GameSession.deleteMany({
      participants: userId
    });

    // 7. Delete User document
    await User.findByIdAndDelete(userId);

    res.json({ success: true, message: "Account deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export async function claimDailyReward(req, res) {
  try {
    const user = await User.findById(req.user._id);
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    if (user.lastRewardClaimDate) {
      const lastClaimStr = new Date(user.lastRewardClaimDate).toISOString().split('T')[0];

      if (todayStr === lastClaimStr) {
        return res.status(400).json({ message: "You have already claimed your reward for today! ✨" });
      }
    }

    // Reward calculation: Base 10 + (Streak * 2)
    const rewardGems = 10 + (user.streak * 2);
    user.gems = (user.gems || 0) + rewardGems;
    user.lastRewardClaimDate = now;

    await user.save();

    res.status(200).json({
      success: true,
      message: `Congratulations! You received ${rewardGems} Gems! 💎`,
      gems: user.gems,
      rewardGems
    });
  } catch (error) {
    console.error("Error in claimDailyReward:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
