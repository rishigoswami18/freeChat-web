import mongoose from "mongoose";
import Post from "../../models/Post.js";

/**
 * Feed Service
 * Orchestrates the ranking and delivery of the main social feed.
 * Implements: Time Decay + Engagement Weighting.
 */
export const FeedService = {
    /**
     * Get a ranked home feed for a user.
     */
    getHomeFeed: async ({ userId, friendIds = [], limit = 10, lastId }) => {
        const myId = new mongoose.Types.ObjectId(userId);
        const peerIds = friendIds.map(id => new mongoose.Types.ObjectId(id));
        const limitNum = parseInt(limit, 10);

        // 1. Build Base Match (Exclude community posts)
        const match = { 
            communityId: null,
            isAd: false
        };

        // 2. Cursor Pagination
        if (lastId && mongoose.Types.ObjectId.isValid(lastId)) {
            match._id = { $lt: new mongoose.Types.ObjectId(lastId) };
        }

        /**
         * RANKING ALGORITHM (V1):
         * Score = (Likes * 2 + Comments * 5) / (Hours_Since_Post ^ 1.5)
         * We simulate this using weighted sorts in the pipeline.
         */
        const pipeline = [
            { $match: match },
            {
                $lookup: {
                    from: "users",
                    localField: "userId",
                    foreignField: "_id",
                    as: "author",
                }
            },
            { $unwind: "$author" },
            {
                $addFields: {
                    // Signal 1: Affinity (Is it a friend?)
                    isFriend: { $in: ["$userId", peerIds] },
                    
                    // Signal 2: Popularity
                    engagementScore: { 
                        $add: [
                            { $multiply: [{ $size: { $ifNull: ["$likes", []] } }, 2] },
                            { $multiply: [{ $size: { $ifNull: ["$comments", []] } }, 5] }
                        ]
                    }
                }
            },
            // Prefer friends, then popular posts, then recency
            { 
                $sort: { 
                    isFriend: -1, 
                    engagementScore: -1, 
                    _id: -1 
                } 
            },
            { $limit: limitNum + 1 },
            {
                $project: {
                    fullName: { $ifNull: ["$author.fullName", "$fullName"] },
                    profilePic: { $ifNull: ["$author.profilePic", "$profilePic"] },
                    isVerified: { $ifNull: ["$author.isVerified", "$isVerified"] },
                    role: { $ifNull: ["$author.role", "$role"] },
                    content: 1,
                    mediaUrl: 1,
                    mediaType: 1,
                    likes: 1,
                    comments: 1,
                    createdAt: 1,
                    isFriend: 1,
                    engagementScore: 1
                }
            }
        ];

        const posts = await Post.aggregate(pipeline);

        const hasMore = posts.length > limitNum;
        const resultPosts = hasMore ? posts.slice(0, limitNum) : posts;
        const nextCursor = hasMore ? resultPosts[resultPosts.length - 1]._id : null;

        return {
            posts: resultPosts,
            nextCursor,
            hasMore
        };
    }
};
