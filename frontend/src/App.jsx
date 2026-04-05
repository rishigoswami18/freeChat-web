/**
 * FreeChat — All Rights Reserved © 2026
 * India's Premier Professional Social Platform
 */
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import React, { useEffect, Suspense } from "react";

// Only eagerly load pages visible on first paint
import PostsPage from "./pages/PostsPage.jsx";
import LandingPage from "./pages/LandingPage.jsx";
import GoalsPage from "./pages/GoalsPage.jsx";

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
const PrizeVaultPage = React.lazy(() => import("./pages/PrizeVaultPage.jsx"));
const RedeemCashPage = React.lazy(() => import("./pages/RedeemCashPage.jsx"));
const ForgotPasswordPage = React.lazy(() => import("./pages/ForgotPasswordPage.jsx"));
const ResetPasswordPage = React.lazy(() => import("./pages/ResetPasswordPage.jsx"));
const AboutPage = React.lazy(() => import("./pages/AboutPage.jsx"));
const AdminDashboard = React.lazy(() => import("./pages/AdminDashboard.jsx"));
const UserProfilePage = React.lazy(() => import("./pages/UserProfilePage.jsx"));
const GemShopPage = React.lazy(() => import("./pages/GemShopPage.jsx"));
const CommunityPage = React.lazy(() => import("./pages/CommunityPage.jsx"));
const CommunityDetailsPage = React.lazy(() => import("./pages/CommunityDetailsPage.jsx"));
const CreatorCenterPage = React.lazy(() => import("./pages/CreatorCenterPage.jsx"));
const HomePage = React.lazy(() => import("./pages/HomePage.jsx"));
const EarningsWallet = React.lazy(() => import("./pages/EarningsWallet.jsx"));
const ProfessionalHub = React.lazy(() => import("./pages/ProfessionalHub.jsx"));
const KYCVerification = React.lazy(() => import("./pages/KYCVerification.jsx"));
const BusinessInsightsPage = React.lazy(() => import("./pages/AntigravityEnginePage.jsx"));
const AIFaceCallPage = React.lazy(() => import("./pages/AIFaceCallPage.jsx"));
const MiniGamesPage = React.lazy(() => import("./pages/MiniGamesPage.jsx"));
const SettingsPage = React.lazy(() => import("./pages/SettingsPage.jsx"));

// SEO Domination Pages
const FounderPage = React.lazy(() => import("./pages/FounderPage.jsx"));
const AIGirlfriendSEOPage = React.lazy(() => import("./pages/AIGirlfriendSEOPage.jsx"));
const FutureSocialSEOPage = React.lazy(() => import("./pages/FutureSocialSEOPage.jsx"));
const BlogPage = React.lazy(() => import("./pages/BlogPage.jsx"));
const BlogPostPage = React.lazy(() => import("./pages/BlogPostPage.jsx"));

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
import TutorialOverlay from "./components/TutorialOverlay.jsx";


const App = () => {
  const { isLoading, authUser } = useAuthUser();
  const { theme, initTheme } = useThemeStore();
  const location = useLocation();

  useEffect(() => {
    initTheme();
  }, [initTheme]);

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

  // 1. Google OAuth Bridge (Handle popups/callbacks immediately)
  useEffect(() => {
    const hash = window.location.hash;
    const search = window.location.search;

    // Check both hash (implicit flow) and search (auth code flow fallbacks)
    if (hash && (hash.includes("access_token") || hash.includes("id_token") || hash.includes("credential") || hash.includes("code"))) {
      const params = new URLSearchParams(hash.substring(1));
      const accessToken = params.get("access_token");
      const idToken = params.get("id_token");
      const credential = params.get("credential");
      const code = params.get("code");

      const token = accessToken || idToken || code;

      if (token || credential) {
        // 1. Try messaging the opener
        if (window.opener) {
          window.opener.postMessage(
            {
              type: "GOOGLE_OAUTH_TOKEN",
              token: token,
              credential: credential
            },
            "*" // Safer wildcard to ensure delivery across subdomains
          );
        }

        // 2. Fallback for polling (Sync via localStorage)
        if (token) localStorage.setItem("google_auth_token", token);
        if (credential) localStorage.setItem("google_auth_credential", credential);

        // 3. Auto-close if we are in a popup
        if (window.opener || window.name === "google-auth") {
          setTimeout(() => window.close(), 400);
        }
      }
    }
  }, []); // Run ONLY once on mount

  useEffect(() => {
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
                        <Layout showSidebar={true} isFluid={true}>
                          <HomePage />
                        </Layout>
                      ) : isAuthenticated ? (
                        <Navigate to="/onboarding" />
                      ) : (
                        <LandingPage />
                      )
                    }
                  />
                  <Route
                    path="/feed"
                    element={
                      isAuthenticated && isOnboarded ? (
                        <Layout showSidebar={true} isFluid={true}>
                          <PostsPage />
                        </Layout>
                      ) : (
                        <Navigate to={!isAuthenticated ? "/login" : "/onboarding"} />
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
                    path="/settings"
                    element={
                      isAuthenticated && isOnboarded ? (
                        <Layout showSidebar={true}>
                          <SettingsPage />
                        </Layout>
                      ) : (
                        <Navigate to={!isAuthenticated ? "/login" : "/onboarding"} />
                      )
                    }
                  />
                  <Route
                    path="/creator-center"
                    element={
                      isAuthenticated && isOnboarded ? (
                        <Layout showSidebar={true} isFluid={true}>
                          <CreatorCenterPage />
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
                        <Layout showSidebar={true} isFluid={true}>
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
                        <Layout showSidebar={true} showRightSidebar={false} showFooter={false} showNavbar={false} isFluid={true}>
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
                        <Layout showSidebar={false} showFooter={false} showNavbar={false} isFluid={true}>
                          <CallPage />
                        </Layout>
                      ) : (
                        <Navigate to={!isAuthenticated ? "/login" : "/onboarding"} />
                      )
                    }
                  />

                  <Route
                    path="/ai-face-call/:id"
                    element={
                      isAuthenticated && isOnboarded ? (
                        <Layout showSidebar={false} showFooter={false} showNavbar={false} isFluid={true}>
                          <AIFaceCallPage />
                        </Layout>
                      ) : (
                        <Navigate to={!isAuthenticated ? "/login" : "/onboarding"} />
                      )
                    }
                  />


                  <Route
                    path="/chat/:id"

                    element={
                      isAuthenticated && isOnboarded ? (
                        <Layout showSidebar={true} showRightSidebar={false} showFooter={false} showNavbar={false} isFluid={true}>
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
                        <Layout showSidebar={false} showFooter={false} showNavbar={false} isFluid={true}>
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

                  {/* Couple feature re-enabled */}

                  <Route
                    path="/communities"
                    element={
                      isAuthenticated && isOnboarded ? (
                        <Layout showSidebar={true}>
                          <CommunityPage />
                        </Layout>
                      ) : (
                        <Navigate to={!isAuthenticated ? "/login" : "/onboarding"} />
                      )
                    }
                  />

                  <Route
                    path="/community/:id"
                    element={
                      isAuthenticated && isOnboarded ? (
                        <Layout showSidebar={true}>
                          <CommunityDetailsPage />
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
                        <Layout showSidebar={true} showRightSidebar={false}>
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
                        <Layout showSidebar={true} showRightSidebar={false}>
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
                    path="/wallet"
                    element={
                      isAuthenticated && isOnboarded ? (
                        <Layout showSidebar={true} isFluid={true} hideSidebarOnMobile={true}>
                          <EarningsWallet />
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
                  <Route path="/goals" element={authUser ? <GoalsPage /> : <Navigate to="/login" />} />
                  <Route path="/privacy-policy" element={<Layout showSidebar={false}><PrivacyPolicyPage /></Layout>} />
                  <Route path="/terms" element={<Layout showSidebar={false}><TermsPage /></Layout>} />
                  <Route path="/refund-policy" element={<Layout showSidebar={false}><RefundPolicyPage /></Layout>} />
                  <Route path="/prize-vault" element={<Layout showSidebar={true} isFluid={true}><PrizeVaultPage /></Layout>} />
                  <Route path="/redeem-cash" element={<Layout showSidebar={true} isFluid={true}><RedeemCashPage /></Layout>} />
                  <Route path="/mini-games" element={<Layout showSidebar={true} isFluid={true}><MiniGamesPage /></Layout>} />

                  {/* SEO SEO DOMINATION ROUTES */}
                  <Route path="/founder" element={<Layout showSidebar={false}><FounderPage /></Layout>} />
                  <Route path="/creator" element={<Layout showSidebar={false}><FounderPage /></Layout>} />
                  <Route path="/about-hriskesh-giri" element={<Layout showSidebar={false}><FounderPage /></Layout>} />
                  <Route path="/hriskesh-giri-ai-developer" element={<Layout showSidebar={false}><FounderPage /></Layout>} />

                  {/* Relationship SEO re-enabled */}
                  <Route path="/soul-bond" element={<Layout showSidebar={false}><AIGirlfriendSEOPage /></Layout>} />
                  <Route path="/ai-girlfriend" element={<Layout showSidebar={false}><AIGirlfriendSEOPage /></Layout>} />
                  <Route path="/virtual-partner" element={<Layout showSidebar={false}><AIGirlfriendSEOPage /></Layout>} />
                  <Route path="/best-ai-girlfriend-app" element={<Layout showSidebar={false}><AIGirlfriendSEOPage /></Layout>} />

                  <Route path="/future-of-social-media" element={<Layout showSidebar={false}><FutureSocialSEOPage /></Layout>} />
                  <Route path="/next-gen-social-platform" element={<Layout showSidebar={false}><FutureSocialSEOPage /></Layout>} />

                  <Route path="/blog" element={<Layout showSidebar={false}><BlogPage /></Layout>} />
                  <Route path="/blog/:slug" element={<Layout showSidebar={false}><BlogPostPage /></Layout>} />

                  <Route
                    path="/creator-center"
                    element={
                      isAuthenticated && isOnboarded ? (
                        <Layout showSidebar={true} isFluid={true}>
                          <CreatorCenterPage />
                        </Layout>
                      ) : (
                        <Navigate to={!isAuthenticated ? "/login" : "/onboarding"} />
                      )
                    }
                  />

                  <Route
                    path="/professional-hub"
                    element={
                      isAuthenticated && isOnboarded ? (
                        <Layout showSidebar={true} isFluid={true}>
                          <ProfessionalHub />
                        </Layout>
                      ) : (
                        <Navigate to={!isAuthenticated ? "/login" : "/onboarding"} />
                      )
                    }
                  />
                  <Route path="/business-hub" element={<Navigate to="/professional-hub" replace />} />
                  <Route path="/career-assistant" element={<Navigate to="/professional-hub" replace />} />

                  <Route
                    path="/kyc"
                    element={
                      isAuthenticated && isOnboarded ? (
                        <Layout showSidebar={true} isFluid={true}>
                          <KYCVerification />
                        </Layout>
                      ) : (
                        <Navigate to={!isAuthenticated ? "/login" : "/onboarding"} />
                      )
                    }
                  />

                  <Route
                    path="/business-insights"
                    element={
                      isAuthenticated && isOnboarded ? (
                        <Layout showSidebar={true} isFluid={true}>
                          <BusinessInsightsPage />
                        </Layout>
                      ) : (
                        <Navigate to={!isAuthenticated ? "/login" : "/onboarding"} />
                      )
                    }
                  />

                  <Route
                    path="/admin"
                    element={
                      isAuthenticated && authUser?.role === "admin" ? (
                        <Layout showSidebar={true} showRightSidebar={false} isFluid={true}>
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

            {isAuthenticated && <TutorialOverlay />}
            <Toaster />
          </VideoProvider>
        </ChatProvider>
      </StealthOverlay>
    </div>
  );
};
export default App;
