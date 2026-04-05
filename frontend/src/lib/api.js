import { axiosInstance } from "./axios";

// ----------------- AUTH -----------------

export const signup = async (signupData) => {
  const response = await axiosInstance.post("/auth/signup", signupData);
  return response.data;
};

export const requestOTP = async (email) => {
  const response = await axiosInstance.post("/auth/request-otp", { email });
  return response.data;
};

export const login = async (loginData) => {
  const response = await axiosInstance.post("/auth/login", loginData);
  return response.data;
};

export const logout = async () => {
  const response = await axiosInstance.post("/auth/logout");
  return response.data;
};

export const googleLogin = async (credential) => {
  const response = await axiosInstance.post("/auth/google", { credential });
  return response.data;
};

export const getAuthUser = async () => {
  try {
    const res = await axiosInstance.get("/auth/me");
    return res.data;
  } catch (error) {
    if (error.response?.status !== 401) {
      console.log("Error in getAuthUser:", error);
    }
    return null;
  }
};

export const completeOnboarding = async (userData) => {
  const response = await axiosInstance.post("/auth/onboarding", userData);
  return response.data;
};

// ----------------- FRIENDS / SOCIAL -----------------

export const getFriends = async () => {
  const response = await axiosInstance.get("/users/friends");
  return response.data;
};

export const getUserFriends = async (userId) => {
  const url = userId ? `/users/${userId}/friends` : "/users/friends";
  const response = await axiosInstance.get(url);
  return response.data;
};

export const getRecommendedUsers = async (q = "") => {
  const queryStr = typeof q === 'string' ? q : "";
  const response = await axiosInstance.get("/users", { params: { q: queryStr } });
  return response.data;
};

export const sendFriendRequest = async (userId) => {
  const response = await axiosInstance.post(`/users/friend-request/${userId}`);
  return response.data;
};

export const acceptFriendRequest = async (requestId) => {
  const response = await axiosInstance.put(`/users/friend-request/${requestId}/accept`);
  return response.data;
};

export const unfriend = async (friendId) => {
  const response = await axiosInstance.delete(`/users/unfriend/${friendId}`);
  return response.data;
};

export const toggleFollow = async (userId) => {
  const response = await axiosInstance.post(`/users/follow/${userId}`);
  return response.data;
};

export const getUserProfile = async (userId) => {
  const response = await axiosInstance.get(`/users/${userId}`);
  return response.data;
};

export const claimDailyReward = async () => {
  const response = await axiosInstance.post("/users/claim-daily-reward");
  return response.data;
};

// ----------------- POSTS -----------------

export const createPost = async (postData) => {
  const response = await axiosInstance.post("/posts", postData);
  return response.data;
};

export const getPosts = async (params) => {
  const response = await axiosInstance.get("/posts", { params });
  return response.data;
};

export const getUserPosts = async (userId, lastId = null, limit = 10) => {
  const response = await axiosInstance.get(`/posts/user/${userId}`, {
    params: { lastId, limit }
  });
  return response.data;
};

export const likePost = async (postId) => {
  const response = await axiosInstance.put(`/posts/${postId}/like`);
  return response.data;
};

export const unlockPost = async (postId) => {
  const response = await axiosInstance.post(`/posts/${postId}/unlock`);
  return response.data;
};

// ----------------- CHAT / STREAM -----------------

export const getStreamToken = async () => {
  const response = await axiosInstance.get("/chat/token");
  return response.data;
};

export const unlockChat = async (recipientId) => {
  const response = await axiosInstance.post(`/chat/unlock/${recipientId}`);
  return response.data;
};

// ----------------- NOTIFICATIONS -----------------

export const getNotifications = async () => {
    const response = await axiosInstance.get("/notifications");
    return response.data;
};

export const markNotificationsAsRead = async () => {
    const response = await axiosInstance.put("/notifications/read");
    return response.data;
};

// ----------------- GEMS / WALLET -----------------

export const getWalletBalance = async () => {
  const response = await axiosInstance.get("/gems/balance");
  return response.data;
};

export const createGemOrder = async (amount, packId) => {
  const response = await axiosInstance.post("/gems/create-order", { amount, packId });
  return response.data;
};

export const verifyGemPayment = async (paymentData) => {
  const response = await axiosInstance.post("/gems/verify-payment", paymentData);
  return response.data;
};

// ----------------- ADMIN -----------------

export const getAdminStats = async () => {
  const response = await axiosInstance.get("/admin/stats");
  return response.data;
};

export const updateProfile = async (profileData) => {
  const response = await axiosInstance.put("/users/profile", profileData);
  return response.data;
};

// 🤖 CREATOR AUTOMATION & AI
export const getAIContentStrategy = async () => {
    const response = await axiosInstance.get("/users/ai/content-strategy");
    return response.data;
};

export const updateAutomationSettings = async (settings) => {
    const response = await axiosInstance.put("/users/settings/automation", settings);
    return response.data;
};
export const creatorAirdrop = async (airdropData) => {
    const response = await axiosInstance.post("/users/creator/airdrop", airdropData);
    return response.data;
};

export const getCreatorLeaderboard = async () => {
    const response = await axiosInstance.get("/users/creator/leaderboard");
    return response.data;
};

// Stories
export const viewStory = async (storyId) => {
    const response = await axiosInstance.post(`/stories/view/${storyId}`);
    return response.data;
};
export const likeStory = async (storyId) => {
    const response = await axiosInstance.post(`/stories/like/${storyId}`);
    return response.data;
};
export const commentOnStory = async (storyId, text) => {
    const response = await axiosInstance.post(`/stories/comment/${storyId}`, { text });
    return response.data;
};
export const createStory = async (storyData) => {
    const response = await axiosInstance.post("/stories", storyData);
    return response.data;
};
export const getStories = async () => {
    const response = await axiosInstance.get("/stories");
    return response.data;
};
export const deleteStory = async (storyId) => {
    const response = await axiosInstance.delete(`/stories/${storyId}`);
    return response.data;
};

// Posts (extended)
export const commentOnPost = async (postId, text) => {
    const response = await axiosInstance.post(`/posts/${postId}/comment`, { text });
    return response.data;
};
export const sharePost = async (postId) => {
    const response = await axiosInstance.post(`/posts/${postId}/share`);
    return response.data;
};
export const deletePost = async (postId) => {
    const response = await axiosInstance.delete(`/posts/${postId}`);
    return response.data;
};
export const sendGift = async (postId, amount) => {
    const response = await axiosInstance.post(`/posts/${postId}/gift`, { amount });
    return response.data;
};
export const getPostLikes = async (postId) => {
    const response = await axiosInstance.get(`/posts/${postId}/likes`);
    return response.data;
};
export const getVideoPosts = async (params) => {
    const response = await axiosInstance.get("/posts/reels", { params });
    return response.data;
};
export const getSongs = async () => {
    const response = await axiosInstance.get("/posts/songs");
    return response.data;
};

// Friends (extended)
export const getFriendRequests = async () => {
    const response = await axiosInstance.get("/users/friend-requests");
    return response.data;
};
export const getOutgoingFriendReqs = async () => {
    const response = await axiosInstance.get("/users/outgoing-friend-requests");
    return response.data;
};
export const getOtherUserFriends = async (userId) => {
    const response = await axiosInstance.get(`/users/${userId}/friends`);
    return response.data;
};

// Auth (extended)
export const googleLoginWithAccessToken = async (accessToken) => {
    const response = await axiosInstance.post("/auth/google/token", { accessToken });
    return response.data;
};
export const changePassword = async (data) => {
    const response = await axiosInstance.put("/users/change-password", data);
    return response.data;
};
export const deleteAccount = async () => {
    const response = await axiosInstance.delete("/users/delete-account");
    return response.data;
};

// Wallet (extended)
export const buyVerification = async () => {
    const response = await axiosInstance.put("/users/buy-verification");
    return response.data;
};
export const boostProfile = async () => {
    const response = await axiosInstance.post("/gems/boost-profile");
    return response.data;
};
export const getRazorpayKey = async () => {
    const response = await axiosInstance.get("/gems/razorpay-key");
    return response.data;
};

// Communities
export const getCommunities = async () => {
    const response = await axiosInstance.get("/communities");
    return response.data;
};
export const createCommunity = async (data) => {
    const response = await axiosInstance.post("/communities", data);
    return response.data;
};
export const toggleJoinCommunity = async (communityId) => {
    const response = await axiosInstance.post(`/communities/${communityId}/join`);
    return response.data;
};
export const getCommunityDetails = async (communityId) => {
    const response = await axiosInstance.get(`/communities/${communityId}`);
    return response.data;
};
export const getCommunityPosts = async (communityId) => {
    const response = await axiosInstance.get(`/communities/${communityId}/posts`);
    return response.data;
};
export const createCommunityPost = async (communityId, data) => {
    const response = await axiosInstance.post(`/communities/${communityId}/posts`, data);
    return response.data;
};

// Membership
export const getMembershipStatus = async () => {
    const response = await axiosInstance.get("/membership/status");
    return response.data;
};
export const cancelMembership = async () => {
    const response = await axiosInstance.post("/membership/cancel");
    return response.data;
};

// Games
export const startGame = async (data) => {
    const response = await axiosInstance.post("/games/start", data);
    return response.data;
};
export const getGameSession = async (sessionId) => {
    const response = await axiosInstance.get(`/games/session/${sessionId}`);
    return response.data;
};
export const submitGameAnswers = async (sessionId, answers) => {
    const response = await axiosInstance.post(`/games/session/${sessionId}/submit`, { answers });
    return response.data;
};
export const getGameTemplates = async () => {
    const response = await axiosInstance.get("/games/templates");
    return response.data;
};
export const getActiveGameSessions = async () => {
    const response = await axiosInstance.get("/games/sessions/active");
    return response.data;
};
export const getGameHistory = async () => {
    const response = await axiosInstance.get("/games/history");
    return response.data;
};
export const ludoAction = async (data) => {
    const response = await axiosInstance.post("/games/ludo/action", data);
    return response.data;
};
export const tttAction = async (data) => {
    const response = await axiosInstance.post("/games/ttt/action", data);
    return response.data;
};
export const triggerAiTurn = async (data) => {
    const response = await axiosInstance.post("/games/ai-turn", data);
    return response.data;
};

// Couple
export const getCoupleStatus = async () => {
    const response = await axiosInstance.get("/couple/status");
    return response.data;
};
export const sendCoupleRequest = async (partnerId) => {
    const response = await axiosInstance.post(`/couple/request/${partnerId}`);
    return response.data;
};
export const acceptCoupleRequest = async (requestId) => {
    const response = await axiosInstance.put(`/couple/accept/${requestId}`);
    return response.data;
};
export const unlinkCouple = async () => {
    const response = await axiosInstance.delete("/couple/unlink");
    return response.data;
};
export const updateRomanticNote = async (data) => {
    const response = await axiosInstance.put("/couple/note", data);
    return response.data;
};
export const getDailyInsight = async () => {
    try {
        const response = await axiosInstance.get("/couple/insight");
        return response.data;
    } catch (err) {
        return { coupleStreak: 0, partner: null };
    }
};
export const updateMood = async (data) => {
    try {
        const response = await axiosInstance.put("/couple/mood", data);
        return response.data;
    } catch (err) {
        return { user: { mood: data?.mood || "neutral", coupleStreak: 0 } };
    }
};
export const linkAI = async (data) => {
    const response = await axiosInstance.post("/couple/link-ai", data);
    return response.data;
};
export const notifyCall = async (data) => {
    const response = await axiosInstance.post("/chat/notify-call", data);
    return response.data;
};
export const notifyMessage = async (data) => {
    const response = await axiosInstance.post("/chat/notify-message", data);
    return response.data;
};

// AI
export const linkFriendAI = async (friendId) => {
    const response = await axiosInstance.post(`/chat/link-ai/${friendId}`);
    return response.data;
};

// FCM
export const saveFcmToken = async (token) => {
    const response = await axiosInstance.put("/users/fcm-token", { token });
    return response.data;
};

// App / Admin
export const getAppStats = async () => {
    const response = await axiosInstance.get("/admin/app-stats");
    return response.data;
};
// Goal Hub
export const createGoal = async (data) => {
    const res = await axiosInstance.post("/goals", data);
    return res.data;
};
export const getUserGoals = async () => {
    const res = await axiosInstance.get("/goals/user");
    return res.data;
};
// APK & Admin Node
export const getLatestRelease = async () => {
    const res = await axiosInstance.get("/apk/latest");
    return res.data;
};
export const getAppStatsAdmin = async () => {
    const res = await axiosInstance.get("/apk/stats");
    return res.data;
};

// --- START: Admin Export Block (Audited & Finalized) ---
export const getAdminUsers = async (q = "") => {
    const res = await axiosInstance.get(`/admin/users?q=${q}`);
    return res.data;
};
export const getAdminPosts = async () => {
    const res = await axiosInstance.get("/admin/posts");
    return res.data;
};
export const deleteUserAdmin = async (id) => {
    const res = await axiosInstance.delete(`/admin/users/${id}`);
    return res.data;
};
export const toggleUserRole = async (id) => {
    const res = await axiosInstance.put(`/admin/users/${id}/role`);
    return res.data;
};
export const broadcastNotification = async (data) => {
    const res = await axiosInstance.post("/admin/broadcast-notification", data);
    return res.data;
};
export const broadcastEmail = async (subject, message) => {
    const res = await axiosInstance.post("/admin/broadcast-email", { subject, message });
    return res.data;
};
export const clearAdminInbox = async () => {
    const res = await axiosInstance.post("/admin/clear-inbox");
    return res.data;
};
export const getFirebaseNonUsers = async () => {
    const res = await axiosInstance.get("/admin/firebase-users");
    return res.data;
};
export const sendInvites = async (emails, subject, message) => {
    const res = await axiosInstance.post("/admin/invite", { emails, subject, message });
    return res.data;
};
export const sweepPendingActions = async () => {
    const res = await axiosInstance.post("/admin/sweep");
    return res.data;
};
export const getAdminSupportMessages = async () => {
    const res = await axiosInstance.get("/admin/support");
    return res.data;
};
export const deleteSupportMessage = async (id) => {
    const res = await axiosInstance.delete(`/admin/support/${id}`);
    return res.data;
};
export const sendEmailToUser = async (data) => {
    const res = await axiosInstance.post("/admin/send-email", data);
    return res.data;
};
export const sendNotificationToUser = async (data) => {
    const res = await axiosInstance.post("/admin/send-notification", data);
    return res.data;
};
export const getAllReleases = async () => {
    const res = await axiosInstance.get("/apk/all");
    return res.data;
};
export const createRelease = async (formData) => {
    const res = await axiosInstance.post("/apk", formData, { headers: { "Content-Type": "multipart/form-data" } });
    return res.data;
};
export const updateRelease = async (id, data) => {
    const res = await axiosInstance.put(`/apk/${id}`, data);
    return res.data;
};
export const deleteRelease = async (id) => {
    const res = await axiosInstance.delete(`/apk/${id}`);
    return res.data;
};
export const getAdminMatches = async () => {
    const res = await axiosInstance.get("/admin/matches");
    return res.data;
};
export const createMatch = async (data) => {
    const res = await axiosInstance.post("/admin/matches", data);
    return res.data;
};
export const updateMatchStatusAdmin = async (id, data) => {
    const res = await axiosInstance.patch(`/admin/matches/${id}`, data);
    return res.data;
};
export const resolveMatchBall = async (matchId, outcome, ballId) => {
    const res = await axiosInstance.post(`/admin/matches/${matchId}/resolve`, { outcome, ballId });
    return res.data;
};
export const getWithdrawalRequests = async () => {
    const res = await axiosInstance.get("/admin/withdrawals");
    return res.data;
};
export const processWithdrawal = async (data) => {
    const res = await axiosInstance.post("/admin/withdrawals/process", data);
    return res.data;
};
export const getFinancialStats = async () => {
    const res = await axiosInstance.get("/admin/bond-stats");
    return res.data;
};
// --- END: Admin Export Block ---
