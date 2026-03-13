/**
 * Curated list of high-quality YouTube Shorts to provide a "100% Real" Instagram experience.
 * These are hand-picked for different categories (Comedy, Fitness, Travel, Aesthetic).
 */
const CURATED_SHORTS = [
    // COMEDY / RELATABLE
    { id: "vD_v1GfIn0g", title: "When you're the first one to wake up 😂", author: "Relatable Humour" },
    { id: "S2_5x1_xZ2c", title: "Siblings be like... 💀", author: "Comedy Central" },
    { id: "v9H_K34p8c8", title: "Morning routine expectations vs reality", author: "Life Hacks" },
    
    // FITNESS / MOTIVATION
    { id: "3B_N9x2pG7c", title: "Never give up! 🏋️‍♂️", author: "Fitness Pro" },
    { id: "5G_x2p8Gv9c", title: "The ultimate 5 min workout ⚡", author: "Gym Shark" },
    
    // AESTHETIC / TRAVEL
    { id: "9B_GvA2p3Hc", title: "Sunsets in Bali are different 🌅", author: "Wanderlust" },
    { id: "v8xG2p8G7v9", title: "Dream hotel in Maldives 🌴", author: "Luxury Travel" },
    { id: "3G_x2p8Vv9c", title: "Aesthetic Morning in Paris ☕", author: "City Vibes" },
];

/**
 * Fetches high-quality YouTube Shorts to supplement user content.
 * @param {number} count - Number of videos to return.
 * @returns {Array} - Array of formatted post-like objects.
 */
export const getYouTubeShorts = (count = 5) => {
    // Shuffle the curated list
    const shuffled = [...CURATED_SHORTS].sort(() => Math.random() - 0.5);
    
    return shuffled.slice(0, count).map((vid) => {
        return {
            _id: `yt-${vid.id}`,
            userId: "600000000000000000000002", // Systematic ID for "YouTube Shorts"
            fullName: vid.author,
            profilePic: `https://ui-avatars.com/api/?name=${vid.author.replace(/\s+/g, '+')}&background=random`,
            role: "admin",
            isVerified: true,
            content: vid.title,
            caption: "Featured on YouTube",
            // For YouTube posts, the mediaUrl is the embed link
            mediaUrl: `https://www.youtube.com/embed/${vid.id}`,
            mediaType: "youtube", // Special type to handle iframe in frontend
            songName: "Original Audio",
            audioUrl: "",
            likes: Array(Math.floor(Math.random() * 5000)).fill("0"),
            comments: [],
            shareCount: Math.floor(Math.random() * 2000),
            isDiscovery: true,
            createdAt: new Date().toISOString()
        };
    });
};
