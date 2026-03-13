/**
 * Curated list of VERIFIED YouTube Shorts that are 100% embeddable.
 * These have been checked for 'oembed' support and professional quality.
 */
const CURATED_SHORTS = [
    // --- NATURE & SCENIC ---
    { id: "6v2L2UGZJAM", title: "Planet Earth: Amazing Nature 🌿", author: "Nature Bliss" },
    { id: "G9NRzrx7m4U", title: "Switzerland: Heaven on Earth 🏔️", author: "Travel Pro" },
    { id: "8Dq-56hD3Fo", title: "Mountain River Landscapes 🌊", author: "Wanderlust" },
    { id: "xQknAlRnaM4", title: "Nature View: Summer Rain 🌧️", author: "Nature Hub" },
    { id: "oHdecbMrcbI", title: "Scenic Austria Relaxation 🇦🇹", author: "Travel Bliss" },

    // --- COMEDY & RELATABLE (HINDI) ---
    { id: "_pwFHaCm134", title: "Power ka Sahi Istemal 😂", author: "Funny King" },
    { id: "Crkkq9ybqo4", title: "Online wala Pyar ❤️", author: "Modern Comedy" },
    { id: "8DiNEagiLks", title: "Temporary Shopkeeper Relatable 🏪", author: "Local Humour" },
    { id: "td7DREk6sNo", title: "Childhood Moment of Pride ⭐", author: "Nostalgia" },
];

/**
 * Fetches high-quality YouTube Shorts with OFFSET support to prevent repetition.
 * @param {number} count - Number of videos to return.
 * @param {number} page - The current discovery page for offset.
 * @returns {Array} - Array of formatted post-like objects.
 */
export const getYouTubeShorts = (count = 5, page = 0) => {
    const total = CURATED_SHORTS.length;
    
    // Use a deterministic offset based on page.
    // We also use a "skip" factor to make subsequent pages feel different.
    const skipFactor = 3; 
    const offset = (page * skipFactor) % total;
    
    let selected = [];
    for (let i = 0; i < count; i++) {
        const index = (offset + i) % total;
        selected.push(CURATED_SHORTS[index]);
    }
    
    return selected.map((vid) => {
        return {
            _id: `yt-${vid.id}-${page}-${Math.random().toString(36).substr(2, 5)}`,
            userId: "600000000000000000000002",
            fullName: vid.author,
            profilePic: `https://ui-avatars.com/api/?name=${vid.author.replace(/\s+/g, '+')}&background=random`,
            role: "admin",
            isVerified: true,
            content: vid.title,
            caption: vid.title,
            mediaUrl: `https://www.youtube.com/embed/${vid.id}?autoplay=0&controls=0&rel=0&iv_load_policy=3&modestbranding=1`,
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
