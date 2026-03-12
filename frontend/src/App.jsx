/**
 * BondBeyond — All Rights Reserved © 2026
 * Powered by freechatweb.in
 */
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import React, { useEffect, Suspense } from "react";

// Only eagerly load pages visible on first paint
import PostsPage from "./pages/PostsPage.jsx";
import LandingPage from "./pages/LandingPage.jsx";

// Lazy load everything else — downloaded only when navigated to
const SignUpPage = React.lazy(() => import("./pages/SignUpPage.jsx"));
const LoginPage = React.lazy(() => import("./pages/LoginPage.jsx"));
const NotificationsPage = React.lazy(() => import("./pages/NotificationsPage.jsx"));
const CallPage = React.lazy(() => import("./pages/CallPage.jsx"));
const ChatPage = React.lazy(() => import("./pages/ChatPage.jsx"));
const OnboardingPage = React.lazy(() => import("./pages/OnboardingPage.jsx"));
const FriendsPage = React.lazy(() => import("./pages/FriendsPage.jsx"));
const CoupleProfilePage = React.lazy(() => import("./pages/CoupleProfilePage.jsx"));
const MembershipPage = React.lazy(() => import("./pages/MembershipPage.jsx"));
const GameDashboard = React.lazy(() => import("./pages/GameDashboard.jsx"));
const CompatibilityQuiz = React.lazy(() => import("./pages/CompatibilityQuiz.jsx"));
const ProfilePage = React.lazy(() => import("./pages/ProfilePage.jsx"));
const SearchPage = React.lazy(() => import("./pages/SearchPage.jsx"));
const ReelsPage = React.lazy(() => import("./pages/ReelsPage.jsx"));
const InboxPage = React.lazy(() => import("./pages/InboxPage.jsx"));
const ContactPage = React.lazy(() => import("./pages/ContactPage.jsx"));
const PrivacyPolicyPage = React.lazy(() => import("./pages/PrivacyPolicyPage.jsx"));
const TermsPage = React.lazy(() => import("./pages/TermsPage.jsx"));
const RefundPolicyPage = React.lazy(() => import("./pages/RefundPolicyPage.jsx"));
const ForgotPasswordPage = React.lazy(() => import("./pages/ForgotPasswordPage.jsx"));
const ResetPasswordPage = React.lazy(() => import("./pages/ResetPasswordPage.jsx"));
const AboutPage = React.lazy(() => import("./pages/AboutPage.jsx"));
const AdminDashboard = React.lazy(() => import("./pages/AdminDashboard.jsx"));
const UserProfilePage = React.lazy(() => import("./pages/UserProfilePage.jsx"));
const GemShopPage = React.lazy(() => import("./pages/GemShopPage.jsx"));
const HomePage = React.lazy(() => import("./pages/HomePage.jsx"));

import { Toaster } from "react-hot-toast";

import PageLoader from "./components/PageLoader.jsx";
import useAuthUser from "./hooks/useAuthUser.js";
import Layout from "./components/Layout.jsx";
import VideoProvider from "./components/VideoProvider.jsx";
import { ChatProvider } from "./components/ChatProvider.jsx";
import { useThemeStore } from "./store/useThemeStore.js";
import StealthOverlay from "./components/StealthOverlay.jsx";
import GoogleOneTap from "./components/GoogleOneTap.jsx";
import GemDrop from "./components/GemDrop.jsx";


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
    // 1. Handle Google OAuth Redirect (Bridge for popups)
    const hash = window.location.hash;
    if (hash && (hash.includes("access_token") || hash.includes("id_token") || hash.includes("credential"))) {
      const params = new URLSearchParams(hash.substring(1));
      const accessToken = params.get("access_token");
      const idToken = params.get("id_token");
      const credential = params.get("credential");

      const token = accessToken || idToken;

      if (window.opener) {
        // Send to opener window
        window.opener.postMessage(
          { 
            type: "GOOGLE_OAUTH_TOKEN", 
            token: token, 
            credential: credential 
          }, 
          window.location.origin
        );
        
        // Fallback for polling
        if (token) localStorage.setItem("google_auth_token", token);
        if (credential) localStorage.setItem("google_auth_credential", credential);
        
        // Close self
        setTimeout(() => window.close(), 500);
      }
    }

    // 2. Setup Global Android Bridge Listener (Once on mount)
    window.receiveAndroidToken = async (token) => {
      console.log("[FCM] Bridge: Received token from Android:", token);
      if (!token) return;

      localStorage.setItem("android_fcm_token", token);

      // Show a subtle toast to founder/admin to confirm bridge works (Debug only)
      if (authRef.current.isAuthenticated && authRef.current.authUser?.role === 'admin') {
        const { toast } = await import("react-hot-toast");
        toast.success("Android FCM Bridge Connected! 📱", { id: 'fcm-bridge' });
      }

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

    // 3. Periodic Sync Check (for cases where token arrived before login)
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

    // Daily Reward Reminder Toast (Addictive nudge)
    if (isAuthenticated && authUser) {
      const todayStr = new Date().toISOString().split('T')[0];
      const lastClaimDate = authUser.lastRewardClaimDate ? new Date(authUser.lastRewardClaimDate) : null;
      const lastClaimStr = lastClaimDate ? lastClaimDate.toISOString().split('T')[0] : null;

      const hasClaimedToday = lastClaimStr === todayStr;

      if (!hasClaimedToday) {
        import("react-hot-toast").then(({ toast }) => {
          toast("💎 Your Daily Gem Drop is ready! Claim it in the sidebar.", {
            icon: '🎁',
            duration: 5000,
            id: 'daily-reward-nudge'
          });
        });
      }
    }
  }, [isAuthenticated, authUser]);

  if (isLoading) return <PageLoader />;

  return (
    <div className="min-h-screen" data-theme={theme}>
      <StealthOverlay>

        <ChatProvider>
          <VideoProvider>
            {!isAuthenticated && <GoogleOneTap />}
            {isAuthenticated && <GemDrop />}
            <Suspense fallback={<PageLoader />}>
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
            </Suspense>

            <Toaster />
          </VideoProvider>
        </ChatProvider>
      </StealthOverlay>
    </div>
  );
};
export default App;