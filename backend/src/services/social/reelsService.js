import mongoose from "mongoose";
import Post from "../../models/Post.js";
import { getYouTubeShorts } from "../../utils/youtubeService.js";
import { getPexelsVideos } from "../../utils/pexelsService.js";
import { MusicService } from "../music/musicService.js";

/**
 * Reels Discovery Service
 * Manages the high-performance mixing of local, external, and sponsored content.
 */
export const ReelsService = {
    /**
     * Get a paginated and mixed discovery feed.
     */
    getDiscoveryFeed: async ({ limit = 8, lastId, isPremium = false }) => {
        const limitNum = parseInt(limit, 10);
        const isDiscoveryRequest = lastId?.toString().startsWith("discovery-");
        
        let discoveryPage = 0;
        if (isDiscoveryRequest) {
            discoveryPage = parseInt(lastId.split("-")[1]) || 0;
        }

        // 1. Priority: Local Content (if not in discovery mode)
        let posts = [];
        if (!isDiscoveryRequest) {
            posts = await ReelsService._fetchLocalReels(limitNum, lastId);
        }

        const hasMoreLocal = posts.length > limitNum;
        let finalPosts = hasMoreLocal ? posts.slice(0, limitNum) : posts;
        let nextCursor = hasMoreLocal ? finalPosts[finalPosts.length - 1]._id : null;

        // 2. Secondary: Advanced Discovery Mixing (YouTube + Pexels + Random Sampling)
        if (finalPosts.length < limitNum || isDiscoveryRequest) {
            const needed = limitNum - finalPosts.length;
            const externalContent = await ReelsService._fetchExternalDiscovery(needed, discoveryPage);
            
            finalPosts = [...finalPosts, ...externalContent];
            nextCursor = `discovery-${discoveryPage + 1}`;
        }

        // 3. Post-Processing: Ad Injection for non-premium
        if (!isPremium) {
            finalPosts = await ReelsService._injectAds(finalPosts);
        }

        return {
            posts: finalPosts,
            nextCursor,
            hasMore: true
        };
    },

    /**
     * Internal: Fetch local video posts with author metadata
     */
    _fetchLocalReels: async (limit, lastId) => {
        const query = { mediaType: "video", isAd: false, communityId: null };
        if (lastId && mongoose.Types.ObjectId.isValid(lastId)) {
            query._id = { $lt: new mongoose.Types.ObjectId(lastId) };
        }

        return await Post.aggregate([
            { $match: query },
            {
                $lookup: {
                    from: "users",
                    localField: "userId",
                    foreignField: "_id",
                    as: "auth",
                }
            },
            { $unwind: "$auth" },
            {
                $addFields: {
                    fullName: "$auth.fullName",
                    profilePic: "$auth.profilePic",
                    isVerified: "$auth.isVerified"
                }
            },
            { $sort: { _id: -1 } },
            { $limit: limit + 1 },
            { $project: { auth: 0 } }
        ]);
    },

    /**
     * Internal: Mix YouTube with Pexels (Music Enhanced)
     */
    _fetchExternalDiscovery: async (limit, page) => {
        const ytCount = Math.floor(limit / 2) || 2;
        const pexCount = limit - ytCount;

        const [yt, pex] = await Promise.all([
            getYouTubeShorts(ytCount, page),
            getPexelsVideos(pexCount, page + 1)
        ]);

        // Enrich Pexels with Trending Music
        const trending = await MusicService.getTrending(20);
        const enrichedPex = pex.map((p, i) => {
            const song = trending[i % trending.length];
            return {
                ...p,
                songId: song?._id,
                songName: song ? `${song.title} - ${song.artist}` : "Original Audio",
                audioUrl: song?.audioUrl
            };
        });

        const mixed = [...yt, ...enrichedPex];
        return mixed.sort(() => Math.random() - 0.5);
    },

    /**
     * Internal: Ad strategy for reels
     */
    _injectAds: async (posts) => {
        const ads = await Post.find({ isAd: true }).limit(5).lean();
        if (ads.length === 0) return posts;

        const results = [];
        posts.forEach((post, i) => {
            results.push(post);
            if ((i + 1) % 4 === 0) {
                results.push(ads[Math.floor(Math.random() * ads.length)]);
            }
        });
        return results;
    }
};
