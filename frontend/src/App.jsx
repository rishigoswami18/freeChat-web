import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

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

  if (isLoading) return <PageLoader />;

  return (
    <div className="h-screen" data-theme={theme}>
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
                      <Layout showSidebar={false} showFooter={false}>
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
                      <Layout showSidebar={false} showFooter={false}>
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

                {/* Fallback Game Route for multi-segment IDs (e.g. /game/userId/sessionId) */}
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

                {/* Public Support & Legal Pages (Required for Razorpay compliance) */}
                <Route path="/contact" element={<Layout showSidebar={false}><ContactPage /></Layout>} />
                <Route path="/privacy-policy" element={<Layout showSidebar={false}><PrivacyPolicyPage /></Layout>} />
                <Route path="/terms" element={<Layout showSidebar={false}><TermsPage /></Layout>} />
                <Route path="/refund-policy" element={<Layout showSidebar={false}><RefundPolicyPage /></Layout>} />

                {/* Catch-all route to prevent blank screens */}
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