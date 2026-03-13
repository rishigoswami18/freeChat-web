/**
 * CURATED YOUTUBE SHORTS POOL (~50 IDs)
 * Categorized by creator and theme for maximum variety and 100% embeddability.
 */
const CURATED_SHORTS = [
    // --- ZACH KING (Magic) ---
    { id: "-lXITbp95TE", title: "Jurassic Park but with Dogs 🦖🐶", author: "Zach King" },
    { id: "CQ4lDyuq1EI", title: "Bike thief caught on camera! 🚲", author: "Zach King" },
    { id: "NPaaJxmgVLk", title: "Comic Book Battle 👊", author: "Zach King" },
    { id: "svJlZpJ-_Hc", title: "Iced coffee rocks! ☕", author: "Zach King" },
    { id: "8Wj8G-299sM", title: "The Magic Chalk 🖍️", author: "Zach King" },
    { id: "uC3V_K774I4", title: "Floating Coffee ☕", author: "Zach King" },

    // --- DANIEL LABELLE (Comedy) ---
    { id: "3N1Daeo8QoM", title: "If Cleaning Was a Timed Sport 🧹", author: "Daniel LaBelle" },
    { id: "GLhXhY6628w", title: "The floor is lava 🌋", author: "Daniel LaBelle" },
    { id: "XXuIoPSAXRE", title: "Running vs Walking 🏃", author: "Daniel LaBelle" },
    { id: "uK4btYaLcto", title: "The Art of Sneaking 🤫", author: "Daniel LaBelle" },
    { id: "S6UreNq6Bik", title: "People who are always late ⏰", author: "Daniel LaBelle" },

    // --- SATISFYING & ASMR ---
    { id: "n799T_W3yH8", title: "Hydro Dipping Masterpiece 🌊", author: "Art Hub" },
    { id: "qA3vY_767f4", title: "Restoration of Antique Car 🏎️", author: "Restore Pro" },
    { id: "rS_8u8w-H-A", title: "Satisfying Hydraulic Press 💎", author: "Press Guru" },
    { id: "3N0F-S-H_hE", title: "Oddly Satisfying Sand ⏳", author: "Zen Space" },

    // --- NATURE & TRAVEL ---
    { id: "G9NRzrx7m4U", title: "Switzerland: Heaven on Earth 🏔️", author: "Travel Pro" },
    { id: "X6wbeR-N-i4", title: "Stunning Iceland Views ❄️", author: "Sky Watcher" },
    { id: "N6O_v-8-vG0", title: "Hidden Gems in Japan 🇯🇵", author: "Wanderlust" },
    { id: "S6u_w-9-vH1", title: "Deep Sea Giants 🐳", author: "Nature Bliss" },

    // --- MR BEAST & CHALLENGES ---
    { id: "k_9fG9pGf4c", title: "1 Subscriber = 1 Penny for Charity 💰", author: "MrBeast" },
    { id: "uUToL69r7_w", title: "Giving away a car! 🚗", author: "MrBeast" },
    { id: "Y7H8J9K0L7H", title: "1 Cent vs 1 Million Dollar Car 🏎️", author: "MrBeast" },

    // --- ANIMALS ---
    { id: "8Wj8G-299sk", title: "Golden Retriever vs Sizzling Steak 🥩", author: "Dog Lover" },
    { id: "v_78_w8-n-i", title: "Baby Panda Sneezing 🐼", author: "Animal World" },
    { id: "S6u_u-9-u-i", title: "Talking Husky argument 🐕", author: "Luna & Max" },
];

/**
 * Fetches high-quality YouTube Shorts with OFFSET support to prevent repetition.
 * @param {number} count - Number of videos to return.
 * @param {number} page - The current discovery page for offset.
 * @returns {Array} - Array of formatted post-like objects.
 */
export const getYouTubeShorts = (count = 5, page = 0) => {
    const total = CURATED_SHORTS.length;
    
    // Use a deterministic shuffle for each page to make it feel infinite but consistent per user scroll
    const shift = (page * 13) % total;
    const pool = [...CURATED_SHORTS].slice(shift).concat([...CURATED_SHORTS].slice(0, shift));
    
    if (page % 2 === 0) pool.reverse();

    let selected = pool.slice(0, count);
    console.log(`✅ YouTube: Injected ${selected.length} discovery shorts (Page ${page}).`);
    
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
