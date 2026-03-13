/**
 * Curated list of high-quality REAL YouTube Shorts to provide a "100% Real" Instagram experience.
 * These are hand-picked from trending categories to ensure original audio and professional content.
 */
const CURATED_SHORTS = [
    // NATURE & TRAVEL (Cinematic/Relaxing)
    { id: "xQknAlRnaM4", title: "Nature view | Summer rain (4K) 🌧️", author: "Nature Hub" },
    { id: "G9NRzrx7m4U", title: "Switzerland 4K | Beautiful scenery 🏔️", author: "Travel Pro" },
    { id: "8Dq-56hD3Fo", title: "Mountain river landscapes 🌊", author: "Wanderlust" },
    { id: "RM485oUuOhg", title: "Switzerland: Land of Pure Nature 🇨🇭", author: "Swiss Vibe" },
    
    // COMEDY & RELATABLE (Indian/Global)
    { id: "_pwFHaCm134", title: "Power ka sahi istemaal 😂", author: "Funny Relatable" },
    { id: "Crkkq9ybqo4", title: "Online wala pyar ❤️", author: "Modern Comedy" },
    { id: "8DiNEagiLks", title: "When you are temporary shopkeeper 🏪", author: "Store Diaries" },
    { id: "td7DREk6sNo", title: "That childhood moment of pride ⭐", author: "Nostalgia" },
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
            mediaUrl: `https://www.youtube.com/embed/${vid.id}`,
            mediaType: "youtube",
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
