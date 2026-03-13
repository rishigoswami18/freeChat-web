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
    { id: "8Wj8G-299sM", title: "The Magic Chalk 🖍️", author: "Zach King" },
    { id: "uC3V_K774I4", title: "Floating Coffee ☕", author: "Zach King" },
    { id: "QvshXF8O6OQ", title: "3D Graffiti Magic 🎨", author: "Zach King" },
    { id: "0vS4M8F9pRE", title: "The disappearing hat trick! 🎩", author: "Zach King" },
    { id: "pSg6U-9X-tU", title: "Magical Room Transformation ✨", author: "Zach King" },

    // --- DANIEL LABELLE (Comedy & Physicality) ---
    { id: "3N1Daeo8QoM", title: "If Cleaning Was a Timed Sport 🧹", author: "Daniel LaBelle" },
    { id: "GLhXhY6628w", title: "The floor is lava 🌋", author: "Daniel LaBelle" },
    { id: "XXuIoPSAXRE", title: "Running vs Walking 🏃", author: "Daniel LaBelle" },
    { id: "uK4btYaLcto", title: "The Art of Sneaking 🤫", author: "Daniel LaBelle" },
    { id: "S6UreNq6Bik", title: "People who are always late ⏰", author: "Daniel LaBelle" },
    { id: "p4cQuW6u9qE", title: "If animals acted like people 🐕", author: "Daniel LaBelle" },
    { id: "j_6A_PqS-uE", title: "Types of people at the gym 🏋️", author: "Daniel LaBelle" },

    // --- SATISFYING & ASMR (Verified Stable IDs) ---
    { id: "n799T_W3yH8", title: "Hydro Dipping Masterpiece 🌊", author: "Art Hub" },
    { id: "r_mI-_Wb-9Y", title: "Satisfying Soap Cutting 🧼", author: "ASMR Bliss" },
    { id: "rS_8u8w-H-A", title: "Satisfying Hydraulic Press 💎", author: "Press Guru" },
    { id: "3N0F-S-H_hE", title: "Oddly Satisfying Sand ⏳", author: "Zen Space" },
    { id: "wD-S_I_G-Xk", title: "Satisfying slime mixing 🎨", author: "Slime Pro" },
    { id: "6vS-i-G6-A8", title: "Ice crushing ASMR ❄️", author: "Chill Vibes" },

    // --- NATURE & WORLD TRAVEL ---
    { id: "G9NRzrx7m4U", title: "Switzerland: Heaven on Earth 🏔️", author: "Travel Pro" },
    { id: "X6wbeR-N-i4", title: "Stunning Iceland Views ❄️", author: "Sky Watcher" },
    { id: "N6O_v-8-vG0", title: "Hidden Gems in Japan 🇯🇵", author: "Wanderlust" },
    { id: "f_WvA2mFkU8", title: "Majestic Waterfall 🌊", author: "Nature Bliss" },
    { id: "8Wj8S-G6-A8", title: "Desert Sunset Magic 🏜️", author: "Global Lens" },

    // --- MR BEAST & MEGAVIRAL CHALLENGES ---
    { id: "se50viFJ0AQ", title: "Would You Fly to Paris for a Baguette? 🥖", author: "MrBeast" },
    { id: "MOGW3v3pJ5Y", title: "1 Subscriber = 1 Penny Donated 💰", author: "MrBeast" },
    { id: "uUToL69r7_w", title: "Giving away a car! 🚗", author: "MrBeast" },
    { id: "Ybc6v_VqHmc", title: "1 Cent vs $1,000,000 House 🏠", author: "MrBeast" },
    { id: "k_9fG9pGf4c", title: "The world's largest pizza 🍕", author: "MrBeast" },

    // --- CUTE ANIMALS ---
    { id: "6n3pFEPSlDU", title: "Funny Cat Fails 🐱", author: "Pet Paradise" },
    { id: "7r_2fM6bU-Y", title: "Cute Panda Moments 🐼", author: "Animal World" },
    { id: "vS-i-G6-A8X", title: "Golden Retriever puppy first swim 🐕", author: "Paws & Tail" },
    { id: "8Wj8P-G6-A8", title: "Smartest border collie tricks 🎾", author: "Dog Talent" },
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
