/**
 * BondBeyond — All Rights Reserved © 2026
 * Powered by freechatweb.in
 */
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import React, { useEffect, useRef } from "react";

import HomePage from "./pages/HomePage.jsx";
import SignUpPage from "./pages/SignUpPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import NotificationsPage from "./pages/NotificationsPage.jsx";
import CallPage from "./pages/CallPage.jsx";
import ChatPage from "./pages/ChatPage.jsx";
import OnboardingPage from "./pages/OnboardingPage.jsx";
import FriendsPage from "./pages/FriendsPage.jsx";
import PostsPage from "./pages/PostsPage.jsx";
import CoupleProfilePage from "./pages/CoupleProfilePage.jsx";
import MembershipPage from "./pages/MembershipPage.jsx";
import GameDashboard from "./pages/GameDashboard.jsx";
import CompatibilityQuiz from "./pages/CompatibilityQuiz.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import SearchPage from "./pages/SearchPage.jsx";
import ReelsPage from "./pages/ReelsPage.jsx";
import InboxPage from "./pages/InboxPage.jsx";
import ContactPage from "./pages/ContactPage.jsx";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage.jsx";
import TermsPage from "./pages/TermsPage.jsx";
import RefundPolicyPage from "./pages/RefundPolicyPage.jsx";
import LandingPage from "./pages/LandingPage.jsx";
import ForgotPasswordPage from "./pages/ForgotPasswordPage.jsx";
import ResetPasswordPage from "./pages/ResetPasswordPage.jsx";
import AboutPage from "./pages/AboutPage.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import UserProfilePage from "./pages/UserProfilePage.jsx";
import GemShopPage from "./pages/GemShopPage.jsx";

import { Toaster } from "react-hot-toast";

import PageLoader from "./components/PageLoader.jsx";
import useAuthUser from "./hooks/useAuthUser.js";
import Layout from "./components/Layout.jsx";
import VideoProvider from "./components/VideoProvider.jsx";
import { ChatProvider } from "./components/ChatProvider.jsx";
import { useThemeStore } from "./store/useThemeStore.js";
import StealthOverlay from "./components/StealthOverlay.jsx";


const App = () => {
  const { isLoading, authUser } = useAuthUser();
  const { theme } = useThemeStore();
  const location = useLocation();

  const isAuthenticated = Boolean(authUser);
  const isOnboarded = authUser?.isOnboarded;

  useEffect(() => {
    const isScrollLockedPage = location.pathname.startsWith("/chat/") || location.pathname.startsWith("/reels");
    if (isScrollLockedPage) {
      document.body.classList.add("is-chat-active");
    } else {
      document.body.classList.remove("is-chat-active");
    }
  }, [location.pathname]);

  // Use a ref to always have the latest auth state inside the bridge callback
  const authRef = React.useRef({ isAuthenticated, isOnboarded });
  useEffect(() => {
    authRef.current = { isAuthenticated, isOnboarded };
  }, [isAuthenticated, isOnboarded]);

  useEffect(() => {
    // 1. Setup Global Android Bridge Listener (Once on mount)
    window.receiveAndroidToken = async (token) => {
      console.log("[FCM] Bridge: Received token from Android:", token);
      if (!token) return;

      localStorage.setItem("android_fcm_token", token);

      // If user is already logged in, sync now
      if (authRef.current.isAuthenticated && authRef.current.isOnboarded) {
        try {
          const { saveFcmToken } = await import("./lib/api");
          await saveFcmToken(token);
          console.log("[FCM] Bridge: Token synced to backend successfully");
        } catch (err) {
          console.error("[FCM] Bridge: Failed to sync token to backend:", err);
        }
      }
    };

    // 2. Periodic Sync Check (for cases where token arrived before login)
    if (isAuthenticated && isOnboarded) {
      const syncStoredToken = async () => {
        const storedToken = localStorage.getItem("android_fcm_token");
        if (storedToken) {
          try {
            const { saveFcmToken } = await import("./lib/api");
            await saveFcmToken(storedToken);
            console.log("[FCM] Auto-sync: Stored token sent to backend");
          } catch (err) {
            console.error("[FCM] Auto-sync failed:", err);
          }
        }

        // Also setup standard web messaging for desktop/browsers
        try {
          const { requestNotificationPermission } = await import("./lib/firebase");
          await requestNotificationPermission();
        } catch (err) {
          console.error("[FCM] Web permission check failed:", err);
        }
      };

      syncStoredToken();
    }
  }, [isAuthenticated, isOnboarded]);

  if (isLoading) return <PageLoader />;

  return (
    <div className="min-h-screen" data-theme={theme}>
      <StealthOverlay>

        <ChatProvider>
          <VideoProvider>
            <AnimatePresence mode="wait">
              <Routes location={location} key={location.pathname}>
                <Route
                  path="/"
                  element={
                    isAuthenticated && isOnboarded ? (
                      <Layout showSidebar={true}>
                        <PostsPage />
                      </Layout>
                    ) : isAuthenticated ? (
                      <Navigate to="/onboarding" />
                    ) : (
                      <LandingPage />
                    )
                  }
                />
                <Route
                  path="/friends"
                  element={
                    isAuthenticated && isOnboarded ? (
                      <Layout showSidebar={true}>
                        <FriendsPage />
                      </Layout>
                    ) : (
                      <Navigate to={!isAuthenticated ? "/login" : "/onboarding"} />
                    )
                  }
                />
                <Route
                  path="/signup"
                  element={
                    !isAuthenticated ? (
                      <SignUpPage />
                    ) : (
                      <Navigate to={isOnboarded ? "/" : "/onboarding"} />
                    )
                  }
                />
                <Route
                  path="/login"
                  element={
                    !isAuthenticated ? (
                      <LoginPage />
                    ) : (
                      <Navigate to={isOnboarded ? "/" : "/onboarding"} />
                    )
                  }
                />
                <Route
                  path="/forgot-password"
                  element={!isAuthenticated ? <ForgotPasswordPage /> : <Navigate to="/" />}
                />
                <Route
                  path="/reset-password"
                  element={!isAuthenticated ? <ResetPasswordPage /> : <Navigate to="/" />}
                />
                <Route
                  path="/notifications"
                  element={
                    isAuthenticated && isOnboarded ? (
                      <Layout showSidebar={true}>
                        <NotificationsPage />
                      </Layout>
                    ) : (
                      <Navigate to={!isAuthenticated ? "/login" : "/onboarding"} />
                    )
                  }
                />
                <Route
                  path="/posts"
                  element={
                    isAuthenticated && isOnboarded ? (
                      <Layout showSidebar={true}>
                        <PostsPage />
                      </Layout>
                    ) : (
                      <Navigate to={!isAuthenticated ? "/login" : "/onboarding"} />
                    )
                  }
                />
                <Route
                  path="/search"
                  element={
                    isAuthenticated && isOnboarded ? (
                      <Layout showSidebar={true}>
                        <SearchPage />
                      </Layout>
                    ) : (
                      <Navigate to={!isAuthenticated ? "/login" : "/onboarding"} />
                    )
                  }
                />
                <Route
                  path="/inbox"
                  element={
                    isAuthenticated && isOnboarded ? (
                      <Layout showSidebar={true}>
                        <InboxPage />
                      </Layout>
                    ) : (
                      <Navigate to={!isAuthenticated ? "/login" : "/onboarding"} />
                    )
                  }
                />
                <Route
                  path="/call/:id"
                  element={
                    isAuthenticated && isOnboarded ? (
                      <CallPage />
                    ) : (
                      <Navigate to={!isAuthenticated ? "/login" : "/onboarding"} />
                    )
                  }
                />

                <Route
                  path="/chat/:id"
                  element={
                    isAuthenticated && isOnboarded ? (
                      <Layout showSidebar={false} showFooter={false} showNavbar={false}>
                        <ChatPage />
                      </Layout>
                    ) : (
                      <Navigate to={!isAuthenticated ? "/login" : "/onboarding"} />
                    )
                  }
                />
                <Route
                  path="/reels"
                  element={
                    isAuthenticated && isOnboarded ? (
                      <Layout showSidebar={false} showFooter={false} showNavbar={false}>
                        <ReelsPage />
                      </Layout>
                    ) : (
                      <Navigate to={!isAuthenticated ? "/login" : "/onboarding"} />
                    )
                  }
                />

                <Route
                  path="/onboarding"
                  element={
                    isAuthenticated ? (
                      !isOnboarded ? (
                        <OnboardingPage />
                      ) : (
                        <Navigate to="/" />
                      )
                    ) : (
                      <Navigate to="/login" />
                    )
                  }
                />

                <Route
                  path="/couple"
                  element={
                    isAuthenticated && isOnboarded ? (
                      <Layout showSidebar={true}>
                        <CoupleProfilePage />
                      </Layout>
                    ) : (
                      <Navigate to={!isAuthenticated ? "/login" : "/onboarding"} />
                    )
                  }
                />

                <Route
                  path="/profile"
                  element={
                    isAuthenticated && isOnboarded ? (
                      <Layout showSidebar={true}>
                        <ProfilePage />
                      </Layout>
                    ) : (
                      <Navigate to={!isAuthenticated ? "/login" : "/onboarding"} />
                    )
                  }
                />

                <Route
                  path="/user/:userId"
                  element={
                    isAuthenticated && isOnboarded ? (
                      <Layout showSidebar={true}>
                        <UserProfilePage />
                      </Layout>
                    ) : (
                      <Navigate to={!isAuthenticated ? "/login" : "/onboarding"} />
                    )
                  }
                />

                <Route
                  path="/membership"
                  element={
                    isAuthenticated && isOnboarded ? (
                      <Layout showSidebar={true}>
                        <MembershipPage />
                      </Layout>
                    ) : (
                      <Navigate to={!isAuthenticated ? "/login" : "/onboarding"} />
                    )
                  }
                />

                <Route
                  path="/games"
                  element={
                    isAuthenticated && isOnboarded ? (
                      <Layout showSidebar={true}>
                        <GameDashboard />
                      </Layout>
                    ) : (
                      <Navigate to={!isAuthenticated ? "/login" : "/onboarding"} />
                    )
                  }
                />

                <Route
                  path="/gem-shop"
                  element={
                    isAuthenticated && isOnboarded ? (
                      <Layout showSidebar={true}>
                        <GemShopPage />
                      </Layout>
                    ) : (
                      <Navigate to={!isAuthenticated ? "/login" : "/onboarding"} />
                    )
                  }
                />

                <Route
                  path="/game/:sessionId"
                  element={
                    isAuthenticated && isOnboarded ? (
                      <Layout showSidebar={true}>
                        <CompatibilityQuiz />
                      </Layout>
                    ) : (
                      <Navigate to={!isAuthenticated ? "/login" : "/onboarding"} />
                    )
                  }
                />

                <Route
                  path="/game/:param1/:sessionId"
                  element={
                    isAuthenticated && isOnboarded ? (
                      <Layout showSidebar={true}>
                        <CompatibilityQuiz />
                      </Layout>
                    ) : (
                      <Navigate to={!isAuthenticated ? "/login" : "/onboarding"} />
                    )
                  }
                />

                <Route path="/about" element={<Layout showSidebar={false}><AboutPage /></Layout>} />
                <Route path="/contact" element={<Layout showSidebar={false}><ContactPage /></Layout>} />
                <Route path="/privacy-policy" element={<Layout showSidebar={false}><PrivacyPolicyPage /></Layout>} />
                <Route path="/terms" element={<Layout showSidebar={false}><TermsPage /></Layout>} />
                <Route path="/refund-policy" element={<Layout showSidebar={false}><RefundPolicyPage /></Layout>} />

                <Route
                  path="/admin"
                  element={
                    isAuthenticated && authUser?.role === "admin" ? (
                      <Layout showSidebar={true}>
                        <AdminDashboard />
                      </Layout>
                    ) : (
                      <Navigate to="/" />
                    )
                  }
                />

                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </AnimatePresence>

            <Toaster />
          </VideoProvider>
        </ChatProvider>
      </StealthOverlay>
    </div>
  );
};
export default App;