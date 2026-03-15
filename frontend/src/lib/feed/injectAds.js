/**
 * Utility to inject ads into a video feed array at fixed intervals.
 * Handles stable key generation and supports premium bypass.
 */
export const injectAds = (reels, { interval = 4, isPremium = false } = {}) => {
    if (!reels || reels.length === 0) return [];
    if (isPremium) return reels.map((reel, idx) => ({ ...reel, dataIndex: idx, isAd: false }));

    const result = [];
    let reelCount = 0;

    reels.forEach((reel) => {
        result.push({ 
            ...reel, 
            dataIndex: result.length,
            isAd: false 
        });
        reelCount++;

        if (reelCount % interval === 0) {
            result.push({
                _id: `ad-slot-${reel._id}`,
                dataIndex: result.length,
                isAd: true,
                postId: reel._id // Reference for tracking
            });
        }
    });

    return result;
};
