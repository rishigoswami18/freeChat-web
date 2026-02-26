import { axiosInstance } from "./axios";

// ----------------- AUTH -----------------

export const signup = async (signupData) => {
  const response = await axiosInstance.post("/auth/signup", signupData);
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
    console.log("Error in getAuthUser:", error);
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

export const getUserFriends = async () => {
  const response = await axiosInstance.get("/users/friends");
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

// ----------------- POSTS -----------------

export const createPost = async (postData) => {
  const response = await axiosInstance.post("/posts", postData);
  return response.data;
};

export const getPosts = async (userId, friendIds = []) => {
  const response = await axiosInstance.get("/posts", {
    params: {
      userId,
      friends: friendIds.join(","),
    },
  });
  return response.data;
};

export const likePost = async (postId) => {
  const response = await axiosInstance.put(`/posts/${postId}/like`);
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

export const getUserPosts = async (userId) => {
  const response = await axiosInstance.get(`/posts/user/${userId}`);
  return response.data;
};

export const getVideoPosts = async () => {
  const response = await axiosInstance.get("/posts/videos");
  return response.data;
};

// ----------------- CHAT / STREAM -----------------

export const getStreamToken = async () => {
  const response = await axiosInstance.get("/chat/token");
  return response.data;
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

// ----------------- STORIES -----------------

export const getStories = async () => {
  const response = await axiosInstance.get("/stories");
  return response.data;
};

export const createStory = async (storyData) => {
  const response = await axiosInstance.post("/stories", storyData);
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

export const submitGameAnswers = async (sessionId, quizAnswers) => {
  const response = await axiosInstance.post("/games/submit", { sessionId, quizAnswers });
  return response.data;
};

export const updateProfile = async (profileData) => {
  const response = await axiosInstance.put("/users/profile", profileData);
  return response.data;
};
