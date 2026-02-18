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

export const getRecommendedUsers = async () => {
  const response = await axiosInstance.get("/users");
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

// ----------------- CHAT / STREAM -----------------

export const getStreamToken = async () => {
  const response = await axiosInstance.get("/chat/token");
  return response.data;
};
