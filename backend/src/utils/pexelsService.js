/**
 * Fetches high-quality vertical videos from Pexels to supplement user content.
 * @param {number} perPage - Number of videos to fetch.
 * @returns {Array} - Array of formatted post-like objects.
 */
export const getPexelsVideos = async (perPage = 5, page = 1) => {
  const apiKey = process.env.PEXELS_API_KEY;
  if (!apiKey) {
    console.warn("⚠️ PEXELS_API_KEY is missing in .env. Falling back to empty discovery.");
    return [];
  }

  try {
    const queries = ["lifestyle", "travel", "aesthetic", "nature"];
    const randomQuery = queries[Math.floor(Math.random() * queries.length)];
    
    const url = new URL("https://api.pexels.com/videos/search");
    url.searchParams.append("query", randomQuery);
    url.searchParams.append("per_page", perPage);
    url.searchParams.append("page", page);
    url.searchParams.append("orientation", "portrait");
    url.searchParams.append("size", "medium");

    const response = await fetch(url.toString(), {
      headers: {
        Authorization: apiKey,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log(`✅ Pexels: Fetched ${data.videos?.length || 0} global reels.`);

    return (data.videos || []).map((vid) => {
      // Find a medium quality vertical file
      const videoFile = vid.video_files.find(f => f.quality === "sd" || f.quality === "hd") || vid.video_files[0];
      
      return {
        _id: `pexels-${vid.id}`,
        userId: "600000000000000000000001", // Systematic ID for "Global Feed"
        fullName: "Global Trend",
        profilePic: "https://images.pexels.com/lib/avatars/pexels.png",
        role: "admin",
        isVerified: true,
        content: `Discovering ${randomQuery} vibes...`,
        caption: "Powered by Pexels",
        mediaUrl: videoFile.link,
        mediaType: "video",
        songName: "Pexels Original Audio",
        audioUrl: "",
        likes: [],
        comments: [],
        shareCount: Math.floor(Math.random() * 1000),
        isDiscovery: true, // Flag for frontend if needed
        createdAt: new Date().toISOString()
      };
    });
  } catch (error) {
    console.error("❌ Pexels API Error:", error.message);
    return [];
  }
};
