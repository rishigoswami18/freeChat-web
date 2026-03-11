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

export const googleLoginWithAccessToken = async (accessToken) => {
  const response = await axiosInstance.post("/auth/google-token", { accessToken });
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

// ----------------- FRIENDS -----------------

export const getFriends = async () => {
  const response = await axiosInstance.get("/users/friends");
  return response.data;
};

export const getUserFriends = async (userId) => {
  const url = userId ? `/users/${userId}/friends` : "/users/friends";
  const response = await axiosInstance.get(url);
  return response.data;
};

export const getRecommendedUsers = async (query = "") => {
  const response = await axiosInstance.get("/users", { params: { q: query } });
  return response.data;
};

export const getOutgoingFriendReqs = async () => {
  const response = await axiosInstance.get("/users/outgoing-friend-requests");
  return response.data;
};

export const sendFriendRequest = async (userId) => {
  const response = await axiosInstance.post(`/users/friend-request/${userId}`);
  return response.data;
};

export const getFriendRequests = async () => {
  const response = await axiosInstance.get("/users/friend-requests");
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

export const getUserProfile = async (userId) => {
  const response = await axiosInstance.get(`/users/${userId}`);
  return response.data;
};

export const getOtherUserFriends = async (userId) => {
  const response = await axiosInstance.get(`/users/${userId}/friends`);
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

export const getPosts = async (userId, friendIds = [], lastId = null, limit = 10) => {
  const response = await axiosInstance.get("/posts", {
    params: {
      userId,
      friends: friendIds.join(","),
      lastId,
      limit
    },
  });
  return response.data;
};

export const likePost = async (postId) => {
  const response = await axiosInstance.put(`/posts/${postId}/like`);
  return response.data;
};

export const getPostLikes = async (postId) => {
  const response = await axiosInstance.get(`/posts/${postId}/likes`);
  return response.data;
};

export const commentOnPost = async (postId, text) => {
  const response = await axiosInstance.post(`/posts/${postId}/comment`, { text });
  return response.data;
};

export const sharePost = async (postId) => {
  const response = await axiosInstance.put(`/posts/${postId}/share`);
  return response.data;
};

export const deletePost = async (postId) => {
  const response = await axiosInstance.delete(`/posts/${postId}`);
  return response.data;
};

export const getUserPosts = async (userId, lastId = null, limit = 10) => {
  const response = await axiosInstance.get(`/posts/user/${userId}`, {
    params: { lastId, limit }
  });
  return response.data;
};

export const getVideoPosts = async (lastId = null, limit = 10) => {
  const response = await axiosInstance.get("/posts/videos", {
    params: { lastId, limit }
  });
  return response.data;
};

export const getSongs = async () => {
  const response = await axiosInstance.get("/posts/songs");
  return response.data;
};

export const addSong = async (songData) => {
  const response = await axiosInstance.post("/posts/songs", songData);
  return response.data;
};

// ----------------- CHAT / STREAM -----------------

export const getStreamToken = async () => {
  try {
    const response = await axiosInstance.get("/chat/token");
    console.log("✅ getStreamToken success:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ getStreamToken failed! Details:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      config: error.config?.url
    });
    throw error;
  }
};

export const translateText = async (text, targetLang) => {
  const response = await axiosInstance.post("/translate", { text, targetLang });
  return response.data;
};

// ----------------- COUPLE -----------------

export const getCoupleStatus = async () => {
  const response = await axiosInstance.get("/couple/status");
  return response.data;
};

export const sendCoupleRequest = async (userId) => {
  const response = await axiosInstance.post(`/couple/request/${userId}`);
  return response.data;
};

export const acceptCoupleRequest = async (userId) => {
  const response = await axiosInstance.put(`/couple/accept/${userId}`);
  return response.data;
};

export const unlinkCouple = async () => {
  const response = await axiosInstance.delete("/couple/unlink");
  return response.data;
};

export const updateRomanticNote = async (note) => {
  const response = await axiosInstance.put("/couple/note", { note });
  return response.data;
};

// ----------------- STORIES -----------------

export const getStories = async () => {
  const response = await axiosInstance.get("/stories");
  return response.data;
};

export const createStory = async (storyData) => {
  const response = await axiosInstance.post("/stories", storyData);
  return response.data;
};

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

export const deleteStory = async (storyId) => {
  const response = await axiosInstance.delete(`/stories/${storyId}`);
  return response.data;
};

export const notifyMessage = async (recipientId, text) => {
  const response = await axiosInstance.post("/chat/notify-message", { recipientId, text });
  return response.data;
};

export const notifyCall = async (recipientId, callId, callType = "video") => {
  const response = await axiosInstance.post("/chat/notify-call", { recipientId, callId, callType });
  return response.data;
};

// ----------------- MEMBERSHIP -----------------

export const getMembershipStatus = async () => {
  const response = await axiosInstance.get("/membership/status");
  return response.data;
};

export const getRazorpayKey = async () => {
  const response = await axiosInstance.get("/membership/key");
  return response.data;
};

export const createMembershipOrder = async () => {
  const response = await axiosInstance.post("/membership/create-order");
  return response.data;
};

export const verifyMembershipPayment = async (paymentData) => {
  const response = await axiosInstance.post("/membership/verify-payment", paymentData);
  return response.data;
};

export const cancelMembership = async () => {
  const response = await axiosInstance.post("/membership/cancel");
  return response.data;
};
// ----------------- GAMES -----------------

export const getGameTemplates = async () => {
  const response = await axiosInstance.get("/games/templates");
  return response.data;
};

export const startGame = async (gameType) => {
  const response = await axiosInstance.post("/games/start", { gameType });
  return response.data;
};

export const getGameSession = async (sessionId) => {
  const response = await axiosInstance.get(`/games/session/${sessionId}`);
  return response.data;
};

export const getActiveGameSessions = async () => {
  const response = await axiosInstance.get("/games/active");
  return response.data;
};

export const getGameHistory = async () => {
  const response = await axiosInstance.get("/games/history");
  return response.data;
};

export const submitGameAnswers = async (sessionId, quizAnswers) => {
  const response = await axiosInstance.post("/games/submit", { sessionId, quizAnswers });
  return response.data;
};

export const ludoAction = async (sessionId, action, pieceIndex) => {
  const response = await axiosInstance.post(`/games/ludo/action/${sessionId}`, { action, pieceIndex });
  return response.data;
};

export const tttAction = async (sessionId, index) => {
  const response = await axiosInstance.post(`/games/ttt/action/${sessionId}`, { index });
  return response.data;
};

export const triggerAiTurn = async (sessionId) => {
  const response = await axiosInstance.post(`/games/ai-turn/${sessionId}`);
  return response.data;
};

export const updateProfile = async (profileData) => {
  const response = await axiosInstance.put("/users/profile", profileData);
  return response.data;
};

export const changePassword = async (currentPassword, newPassword) => {
  const response = await axiosInstance.put("/users/change-password", { currentPassword, newPassword });
  return response.data;
};

export const deleteAccount = async () => {
  const response = await axiosInstance.delete("/users/delete-account");
  return response.data;
};

export const buyVerification = async () => {
  const response = await axiosInstance.put("/users/buy-verification");
  return response.data;
};

export const saveFcmToken = async (token) => {
  const response = await axiosInstance.put("/users/fcm-token", { token });
  return response.data;
};

// ----------------- GEMS / MONETIZATION -----------------

export const getWalletBalance = async () => {
  const response = await axiosInstance.get("/gems/balance");
  return response.data;
};

export const sendGift = async (creatorId, giftAmount, giftName) => {
  const response = await axiosInstance.post("/gems/send", { creatorId, giftAmount, giftName });
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


// ----------------- BONDBEYOND / RELATIONSHIP -----------------

export const getDailyInsight = async () => {
  const response = await axiosInstance.get("/bond/insight");
  return response.data;
};

export const updateMood = async (mood) => {
  const response = await axiosInstance.put("/bond/mood", { mood });
  return response.data;
};

// ----------------- ADMIN -----------------

export const getAdminStats = async () => {
  const response = await axiosInstance.get("/admin/stats");
  return response.data;
};

export const getAdminUsers = async (query = "") => {
  const response = await axiosInstance.get("/admin/users", { params: { q: query } });
  return response.data;
};

export const getAdminPosts = async () => {
  const response = await axiosInstance.get("/admin/posts");
  return response.data;
};

export const deleteUserAdmin = async (userId) => {
  const response = await axiosInstance.delete(`/admin/users/${userId}`);
  return response.data;
};

export const toggleUserRole = async (userId) => {
  const response = await axiosInstance.put(`/admin/users/${userId}/role`);
  return response.data;
};

export const broadcastNotification = async (message) => {
  const response = await axiosInstance.post("/notifications/broadcast", { message });
  return response.data;
};

export const clearAdminInbox = async () => {
  const response = await axiosInstance.post("/notifications/clear-chats");
  return response.data;
};
export const broadcastEmail = async (subject, message) => {
  const response = await axiosInstance.post("/admin/broadcast-email", { subject, message });
  return response.data;
};

export const sweepPendingActions = async () => {
  const response = await axiosInstance.post("/notifications/sweep-pending");
  return response.data;
};

export const sendEmailToUser = async (userId, subject, body) => {
  const response = await axiosInstance.post("/admin/send-email", { userId, subject, body });
  return response.data;
};

export const sendNotificationToUser = async (userId, title, body) => {
  const response = await axiosInstance.post("/admin/send-notification", { userId, title, body });
  return response.data;
};

// ----------------- INVITE SYSTEM -----------------

export const getFirebaseNonUsers = async () => {
  const response = await axiosInstance.get("/admin/firebase-users");
  return response.data;
};


export const sendInvites = async (emails, subject, message) => {
  const response = await axiosInstance.post("/admin/invite", { emails, subject, message });
  return response.data;
};

export const getAdminSupportMessages = async () => {
  const response = await axiosInstance.get("/admin/support");
  return response.data;
};

export const deleteSupportMessage = async (messageId) => {
  const response = await axiosInstance.delete(`/admin/support/${messageId}`);
  return response.data;
};

// ----------------- APK MANAGEMENT -----------------

export const getLatestRelease = async () => {
  const response = await axiosInstance.get("/apk/latest");
  return response.data;
};

export const getAllReleases = async () => {
  const response = await axiosInstance.get("/apk/all");
  return response.data;
};

export const createRelease = async (releaseData) => {
  const response = await axiosInstance.post("/apk", releaseData);
  return response.data;
};

export const updateRelease = async (releaseId, releaseData) => {
  const response = await axiosInstance.put(`/apk/${releaseId}`, releaseData);
  return response.data;
};

export const deleteRelease = async (releaseId) => {
  const response = await axiosInstance.delete(`/apk/${releaseId}`);
  return response.data;
};
export const boostProfile = async () => {
  const response = await axiosInstance.post("/gems/boost");
  return response.data;
};

// Link with AI
export const linkAI = async (partnerName) => {
  const res = await axiosInstance.post("/couple/link-ai", { partnerName });
  return res.data;
};

// Link with AI Best Friend
export const linkFriendAI = async (friendName) => {
  const res = await axiosInstance.post("/users/link-friend-ai", { friendName });
  return res.data;
};
