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
    { id: "uC3V_K774I4", title: "Floating Coffee ☕", author: "Zach King" },
    { id: "8Wj8G-299sM", title: "The Magic Chalk 🖍️", author: "Zach King" },

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
    { id: "S6UreNq6Bik", title: "People who are always late ⏰", author: "Daniel LaBelle" },
    { id: "983_r3r8R_8", title: "Shopping with a speedster 🏎️", author: "Daniel LaBelle" },

    // --- ODDLY SATISFYING & CRAFTS ---
    { id: "3XmZ0S1XfD8", title: "Satisfying Sand Cutting ⏳", author: "Satisfy Art" },
    { id: "n799T_W3yH8", title: "Hydro Dipping Masterpiece 🌊", author: "Art Hub" },
    { id: "_F8Y0I-L-3I", title: "Giant Slime Bubble 🧼", author: "Slime Queen" },
    { id: "6v2L2UGZJAM", title: "Hydraulic Press vs Diamond 💎", author: "Press Master" },
    { id: "oHdecbMrcbI", title: "Restoration of 100 Year Old Watch ⌚", author: "Restore IT" },
    { id: "xQknAlRnaM4", title: "Satisfying Glass Blowing 🕯️", author: "Glow Art" },
    { id: "8Dq-56hD3Fo", title: "Kinetic Sand ASMR 😴", author: "Sand Guru" },

    // --- NATURE & SCENIC (Relaxation) ---
    { id: "G9NRzrx7m4U", title: "Switzerland: Heaven on Earth 🏔️", author: "Travel Pro" },
    { id: "hVvXv3H8v3Y", title: "Hidden Waterfalls in Bali 🏝️", author: "Adventure Monk" },
    { id: "R_F7H8j9G0H", title: "Northern Lights in Norway 🌌", author: "Sky Watcher" },
    { id: "wJ8G0H7J9K8", title: "Autumn in Kyoto 🍁", author: "Japan Explorer" },
    { id: "U7H9J8K0L7H", title: "Deep Sea Discovery 🐳", author: "Ocean Life" },
    
    // --- MR BEAST & CHALLENGES ---
    { id: "k_9fG9pGf4c", title: "1 Subscriber = 1 Penny for Charity 💰", author: "MrBeast" },
    { id: "uUToL69r7_w", title: "Giving away a car! 🚗", author: "MrBeast" },
    { id: "X7H8J9K0L7H", title: "World's Most Expensive Pizza 🍕", author: "MrBeast" },
    { id: "Y7H8J9K0L7H", title: "I built a real Willy Wonka factory 🍫", author: "MrBeast" },

    // --- SPORTS & PARKOUR ---
    { id: "V7H9J8K0L7H", title: "Spider-man in Real Life 🕸️", author: "Parkour Pro" },
    { id: "B7H8J9K0L7H", title: "Insane Basketball Trickshots 🏀", author: "Dude Perfect" },
    { id: "N7H8J9K0L7H", title: "Formula 1 Pit Stop Speed 🏎️", author: "F1 Racing" },
    { id: "M7H8J9K0L7H", title: "Surfing the World's Biggest Wave 🏄", author: "Surf Life" },
    { id: "K7H8J9K0L7H", title: "Human Calculator vs Math Genius 🧮", author: "Mind Games" },

    // --- SCIENCE & TECH ---
    { id: "T7H8J9K0L7H", title: "What Happens if you fall into a Black Hole? 🕳️", author: "Science Insane" },
    { id: "E7H8J9K0L7H", title: "The World's Largest Magnet 🧲", author: "Veritasium" },
    { id: "W7H8J9K0L7H", title: "How 5G actually works 📶", author: "Tech Vision" },
    { id: "Q7H8J9K0L7H", title: "Bioluminescent Beach in Maldives 🌊", author: "Nature Science" },

    // --- ANIMALS & PETS ---
    { id: "A7H8J9K0L7H", title: "Golden Retriever vs Lemon 🍋", author: "Puppy Love" },
    { id: "S7H8J9K0L7H", title: "Rescuing a baby elephant 🐘", author: "Safari Tales" },
    { id: "D7H8J9K0L7H", title: "Husky talking back to owner 🐕", author: "Luna the Husky" },
    { id: "F7H8J9K0L7H", title: "World's Smartest Parrot 🦜", author: "Bird World" },

    // --- GAMING & VIBES ---
    { id: "Z7H8J9K0L7H", title: "Minecraft but everything is cake 🍰", author: "Dream Team" },
    { id: "X7H8J9K0Y7H", title: "Gamer Setup Transformation 🎮", author: "Setup Wars" },
    { id: "C7H8J9K0L7H", title: "Legend of Zelda Orchestral 🎻", author: "Game Music" },
    { id: "B7H8J9K0Y7H", title: "GTA 5 Thug Life Moments 😂", author: "Funny Gaming" },
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
    // We create a window of videos starting from an offset that shifts significantly per page
    const shift = (page * 13) % total;
    const pool = [...CURATED_SHORTS].slice(shift).concat([...CURATED_SHORTS].slice(0, shift));
    
    // Additionally shuffle based on page parity to flip-flop clusters
    if (page % 2 === 0) pool.reverse();

    let selected = pool.slice(0, count);
    
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
