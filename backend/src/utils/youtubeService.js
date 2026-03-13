/**
 * CURATED YOUTUBE SHORTS POOL (~50 IDs)
 * Categorized by creator and theme for maximum variety and 100% embeddability.
 */
const CURATED_SHORTS = [
    // --- ZACH KING (Magic & Illusions) ---
    { id: "-lXITbp95TE", title: "Jurassic Park but with Dogs 🦖🐶", author: "Zach King" },
    { id: "CQ4lDyuq1EI", title: "Bike thief caught on camera! 🚲", author: "Zach King" },
    { id: "NPaaJxmgVLk", title: "Comic Book Battle 👊", author: "Zach King" },
    { id: "svJlZpJ-_Hc", title: "Iced coffee rocks! ☕", author: "Zach King" },
    { id: "prN0uUvivjg", title: "You think this text can stop me? 📝", author: "Zach King" },
    { id: "U2UIaDp5GYk", title: "Magical Room Transformation ✨", author: "Zach King" },
    { id: "iDYb40cDhKA", title: "Infinite Mirror Prank 🪞", author: "Zach King" },
    { id: "lIzsHq-h3Bs", title: "Gravity is just a suggestion ☁️", author: "Zach King" },
    { id: "xcxThQKBeIQ", title: "Painting the town red... literally 🎨", author: "Zach King" },
    { id: "_YHo3LQFHDw", title: "Supermarket Magic 🛒", author: "Zach King" },

    // --- DANIEL LABELLE (Physical Comedy) ---
    { id: "3N1Daeo8QoM", title: "If Cleaning Was a Timed Sport 🧹", author: "Daniel LaBelle" },
    { id: "GLhXhY6628w", title: "When you have to go but the floor is lava 🌋", author: "Daniel LaBelle" },
    { id: "XXuIoPSAXRE", title: "Running vs Walking 🏃", author: "Daniel LaBelle" },
    { id: "uWORWN6pUwo", title: "Types of Walkers 🚶", author: "Daniel LaBelle" },
    { id: "c7CH4XlWlBk", title: "Getting ready in 30 seconds ⏳", author: "Daniel LaBelle" },
    { id: "YhsAa2v63v4", title: "Aggressive vs Passive actions 😡", author: "Daniel LaBelle" },
    { id: "5gf46HGIAcE", title: "Monday Morning Energy ☕", author: "Daniel LaBelle" },
    { id: "R6uddhU2XZQ", title: "If animals did sports 🦁", author: "Daniel LaBelle" },
    { id: "uK4btYaLcto", title: "The Art of Sneaking 🤫", author: "Daniel LaBelle" },
    { id: "68PhQCEj1tc", title: "Fast Forward Life ⏩", author: "Daniel LaBelle" },

    // --- NATURE & SCENIC (Relaxation) ---
    { id: "G9NRzrx7m4U", title: "Switzerland: Heaven on Earth 🏔️", author: "Travel Pro" },
    { id: "8Dq-56hD3Fo", title: "Mountain River Landscapes 🌊", author: "Wanderlust" },
    { id: "xQknAlRnaM4", title: "Nature View: Summer Rain 🌧️", author: "Nature Hub" },
    { id: "oHdecbMrcbI", title: "Scenic Austria Relaxation 🇦🇹", author: "Travel Bliss" },
    { id: "6v2L2UGZJAM", title: "Planet Earth: Amazing Nature 🌿", author: "Nature Bliss" },
    
    // --- MR BEAST (Philanthropy & Challenges) ---
    { id: "k_9fG9pGf4c", title: "1 Subscriber = 1 Penny for Charity 💰", author: "MrBeast" },
    { id: "uUToL69r7_w", title: "Giving away a car! 🚗", author: "MrBeast" },
];

/**
 * Fetches high-quality YouTube Shorts with OFFSET support to prevent repetition.
 * @param {number} count - Number of videos to return.
 * @param {number} page - The current discovery page for offset.
 * @returns {Array} - Array of formatted post-like objects.
 */
export const getYouTubeShorts = (count = 5, page = 0) => {
    const total = CURATED_SHORTS.length;
    
    // A larger skip factor ensures that even if page is 1, 2, 3... we see different sets.
    // We use a prime number or a number that doesn't divide 'total' easily.
    const skipFactor = 7; 
    const startingOffset = (page * skipFactor) % total;
    
    let selected = [];
    for (let i = 0; i < count; i++) {
        const index = (startingOffset + i) % total;
        selected.push(CURATED_SHORTS[index]);
    }
    
    return selected.map((vid, i) => {
        return {
            // Stable, unique ID that doesn't change on re-render but is unique per request
            _id: `yt-${vid.id}-${page}-${i}`, 
            userId: "600000000000000000000002",
            fullName: vid.author,
            profilePic: `https://ui-avatars.com/api/?name=${vid.author.replace(/\s+/g, '+')}&background=random`,
            role: "admin",
            isVerified: true,
            content: vid.title,
            caption: vid.title,
            // Optimized embed URL with minimal distractions
            mediaUrl: `https://www.youtube.com/embed/${vid.id}?autoplay=0&controls=0&rel=0&iv_load_policy=3&modestbranding=1&enablejsapi=1`,
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
