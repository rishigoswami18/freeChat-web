import Community from "../models/Community.js";
import Post from "../models/Post.js";
import cloudinary from "../lib/cloudinary.js";

// Create a new community
export const createCommunity = async (req, res) => {
  try {
    const { name, description, icon, banner, isPrivate } = req.body;
    const userId = req.user._id;

    if (!name) return res.status(400).json({ message: "Community name is required" });

    // Handle image uploads
    let iconUrl = "";
    let bannerUrl = "";

    if (icon && icon.startsWith("data:image")) {
      const uploadResponse = await cloudinary.uploader.upload(icon, { folder: "communities" });
      iconUrl = uploadResponse.secure_url;
    }

    if (banner && banner.startsWith("data:image")) {
      const uploadResponse = await cloudinary.uploader.upload(banner, { folder: "communities" });
      bannerUrl = uploadResponse.secure_url;
    }

    const newCommunity = await Community.create({
      name,
      description,
      icon: iconUrl,
      banner: bannerUrl,
      creatorId: userId,
      members: [userId], // Creator is essentially the first member
      isPrivate: isPrivate || false,
    });

    res.status(201).json({ success: true, community: newCommunity });
  } catch (error) {
    console.error("Error creating community:", error);
    if (error.code === 11000) return res.status(400).json({ message: "Community name already exists" });
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get all communities (discover page)
export const getAllCommunities = async (req, res) => {
  try {
    const communities = await Community.find()
      .populate("creatorId", "fullName profilePic")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, communities });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get single community details
export const getCommunityDetails = async (req, res) => {
  try {
    const community = await Community.findById(req.params.id)
      .populate("creatorId", "fullName profilePic")
      .populate("members", "fullName profilePic username isVerified");

    if (!community) return res.status(404).json({ message: "Community not found" });

    res.status(200).json({ success: true, community });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Join or Leave community
export const toggleJoinCommunity = async (req, res) => {
  try {
    const community = await Community.findById(req.params.id);
    if (!community) return res.status(404).json({ message: "Community not found" });

    const userId = req.user._id;
    const isMember = community.members.includes(userId);

    if (isMember) {
      if (community.creatorId.toString() === userId.toString()) {
        return res.status(400).json({ message: "Creator cannot leave the community. Delete it instead." });
      }
      // Leave
      await Community.findByIdAndUpdate(community._id, { $pull: { members: userId } });
      res.status(200).json({ success: true, message: "Left community", joined: false });
    } else {
      // Join
      await Community.findByIdAndUpdate(community._id, { $addToSet: { members: userId } });
      res.status(200).json({ success: true, message: "Joined community 🎉", joined: true });
    }
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get posts for a specific community
export const getCommunityPosts = async (req, res) => {
  try {
    const posts = await Post.find({ communityId: req.params.id })
      .populate("userId", "fullName profilePic username isVerified role")
      .populate("comments.userId", "fullName profilePic isVerified")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, posts });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Create a post in a community (simplified version of the main post creation)
export const createCommunityPost = async (req, res) => {
  try {
    const { content, mediaUrl, mediaType } = req.body;
    const communityId = req.params.id;

    const community = await Community.findById(communityId);
    if (!community) return res.status(404).json({ message: "Community not found" });

    // Optional: check if member
    if (community.isPrivate && !community.members.includes(req.user._id)) {
      return res.status(403).json({ message: "You must join this private community to post" });
    }

    const newPost = await Post.create({
      userId: req.user._id,
      fullName: req.user.fullName,
      profilePic: req.user.profilePic,
      role: req.user.role,
      isVerified: req.user.isVerified,
      content,
      mediaUrl,
      mediaType,
      communityId
    });

    const populatedPost = await Post.findById(newPost._id)
       .populate("userId", "fullName profilePic username isVerified role");

    res.status(201).json({ success: true, post: populatedPost });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};
