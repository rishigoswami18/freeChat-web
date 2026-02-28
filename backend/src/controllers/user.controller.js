import User from "../models/User.js";
import FriendRequest from "../models/FriendRequest.js";
import cloudinary from "../lib/cloudinary.js";
import { upsertStreamUser } from "../lib/stream.js";
import { hasPremiumAccess } from "../utils/freeTrial.js";

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
        { isOnboarded: true },
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

    let recommendedUsers = await User.find(query);
    console.log(`Found ${recommendedUsers.length} users for query: "${q || 'none'}"`);

    // Calculate match scores
    recommendedUsers = recommendedUsers.map(user => {
      const userObj = user.toObject();
      let matchScore = 0;
      let isTandemMatch = false;

      const userNative = (user.nativeLanguage || "").toLowerCase();
      const userLearning = (user.learningLanguage || "").toLowerCase();
      const currentNative = (currentUser.nativeLanguage || "").toLowerCase();
      const currentLearning = (currentUser.learningLanguage || "").toLowerCase();

      // Perfect Match: B speaks L (what A learns) AND B learns N (what A speaks)
      if (userNative === currentLearning && userLearning === currentNative && currentLearning !== "") {
        matchScore = 100;
        isTandemMatch = true;
      }
      // High Match: B speaks L (what A learns)
      else if (userNative === currentLearning && currentLearning !== "") {
        matchScore = 50;
      }
      // Medium Match: B learns N (what A speaks)
      else if (userLearning === currentNative && currentNative !== "") {
        matchScore = 25;
      }

      return { ...userObj, matchScore, isTandemMatch };
    });

    // Sort by matchScore descending, then by newest
    recommendedUsers.sort((a, b) => {
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
      .populate("friends", "fullName profilePic nativeLanguage learningLanguage");

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
    const { fullName, bio, nativeLanguage, learningLanguage, location, profilePic, dateOfBirth, isStealthMode, panicShortcut, isPublic } = req.body;

    const updateData = { fullName, bio, nativeLanguage, learningLanguage, location, isPublic };
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
        folder: "freechat_profiles",
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

    res.status(200).json({ success: true, message: "Verification badge activated! 🎉", user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}
