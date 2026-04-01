import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { getLatestRelease, getAppStats } from "../lib/api";
import { APK_DOWNLOAD_URL, downloadFile } from "../lib/axios";
import {
  ArrowUpRight,
  Clapperboard,
  MessageSquareText,
  PlayCircle,
  ShieldCheck,
  Sparkles,
  Users,
  Video,
} from "lucide-react";

import Logo from "../components/Logo";
import AdSense from "../components/AdSense";
import HeroSection from "../components/landing/HeroSection";
import StatsSection from "../components/landing/StatsSection";
import FooterSection from "../components/landing/FooterSection";
import FeaturesSection from "../components/landing/FeaturesSection";
import WhySection from "../components/landing/WhySection";
import InsightsSection from "../components/landing/InsightsSection";
import DownloadSection from "../components/landing/DownloadSection";
import PricingSection from "../components/landing/PricingSection";
import CTASection from "../components/landing/CTASection";

const platformSignals = [
  {
    title: "Creator-first feed",
    copy: "A premium home feed that balances short-form discovery, posts, communities, and direct conversation.",
    icon: PlayCircle,
  },
  {
    title: "Video-native experience",
    copy: "Built to feel closer to modern social video products, with reels, stories, live energy, and media-forward UI.",
    icon: Video,
  },
  {
    title: "Professional trust layer",
    copy: "Verified identities, polished surfaces, and cleaner information hierarchy make the product feel investment-ready.",
    icon: ShieldCheck,
  },
];

const experienceCards = [
  {
    title: "Instagram-style social polish",
    copy: "Stories, creator profiles, immersive feed cards, and fast private messaging.",
    icon: Sparkles,
  },
  {
    title: "YouTube-inspired media gravity",
    copy: "Video surfaces, watch-next style navigation, and creator-focused discovery modules.",
    icon: Clapperboard,
  },
  {
    title: "Community and network growth",
    copy: "Followers, communities, smart recommendations, and pathways from content into connection.",
    icon: Users,
  },
  {
    title: "Conversation that converts",
    copy: "Comments, inbox, and creator tools arranged to keep users engaged across multiple content loops.",
    icon: MessageSquareText,
  },
];

const LandingPage = () => {
  const [latestApk, setLatestApk] = useState(null);
  const [totalDownloads, setTotalDownloads] = useState("1K+");

  const handleDownload = useCallback(
    (e) => {
      e.preventDefault();
      const filename = latestApk?.versionName
        ? `Zyro_v${latestApk.versionName.replace(/\./g, "_")}.apk`
        : "Zyro_app.apk";
      downloadFile(`${APK_DOWNLOAD_URL}/latest`, filename);
    },
    [latestApk]
  );

  useEffect(() => {
    let isMounted = true;

    const fetchApk = async () => {
      try {
        const [apkData, statsData] = await Promise.all([getLatestRelease(), getAppStats()]);
        if (isMounted) {
          setLatestApk(apkData);
          if (statsData.totalDownloads > 0) {
            setTotalDownloads(`${statsData.totalDownloads}+`);
          }
        }
      } catch (err) {
        console.error("Failed to fetch apk stats:", err);
      }
    };

    fetchApk();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#f5f7fb] text-slate-900">
      <title>Zyro | Professional Social Media for Creators, Video, and Community</title>
      <meta
        name="description"
        content="Zyro is a professional social media platform with creator tools, stories, reels, messaging, and community growth inspired by the best parts of Instagram and YouTube."
      />
      <meta
        name="keywords"
        content="professional social media app, creator platform, reels app, community app, video social platform, Zyro"
      />
      <meta property="og:title" content="Zyro | Professional Social Media for Creators" />
      <meta
        property="og:description"
        content="A premium creator-focused social app with stories, short video, communities, messaging, and modern feed design."
      />
      <meta property="og:type" content="website" />
      <meta name="twitter:card" content="summary_large_image" />

      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          name: "Zyro",
          operatingSystem: "Android, iOS, Web",
          applicationCategory: "SocialNetworkingApplication",
          contentRating: "Everyone",
          author: {
            "@type": "Organization",
            name: "Zyro Social",
          },
          offers: {
            "@type": "Offer",
            price: "0",
            priceCurrency: "INR",
          },
        })}
      </script>

      <nav className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1280px] items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Logo className="size-8" fontSize="text-2xl" />
          <div className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex">
            <a href="#platform" className="hover:text-slate-900">
              Platform
            </a>
            <a href="#experience" className="hover:text-slate-900">
              Experience
            </a>
            <a href="#download" className="hover:text-slate-900">
              Download
            </a>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="btn btn-ghost rounded-full px-5 text-slate-700 hover:bg-slate-100">
              Login
            </Link>
            <Link to="/signup" className="btn rounded-full border-0 bg-slate-950 px-5 text-white hover:bg-slate-800">
              Get started
            </Link>
          </div>
        </div>
      </nav>

      <section className="relative overflow-hidden border-b border-slate-200 bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.18),_transparent_28%),radial-gradient(circle_at_80%_20%,_rgba(244,63,94,0.14),_transparent_26%),linear-gradient(180deg,#ffffff_0%,#f5f7fb_100%)]">
        <div className="mx-auto grid max-w-[1280px] gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[minmax(0,1.1fr)_420px] lg:px-8 lg:py-20">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-sky-700">
              <Sparkles className="size-3.5" />
              Professional social media app
            </div>
            <h1 className="mt-6 max-w-3xl text-4xl font-black tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
              Build a social platform that feels like Instagram and YouTube, but sharper and more professional.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
              Zyro combines creator feeds, stories, reels, messaging, discovery, and community growth into a polished experience designed for modern audiences and serious product presentation.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/signup"
                className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Launch your profile
                <ArrowUpRight className="size-4" />
              </Link>
              <button
                onClick={handleDownload}
                className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition hover:border-slate-400"
              >
                Download app
                <PlayCircle className="size-4" />
              </button>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {platformSignals.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="rounded-[28px] border border-white/70 bg-white/80 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.06)] backdrop-blur-sm">
                    <div className="flex size-11 items-center justify-center rounded-2xl bg-slate-950 text-white">
                      <Icon className="size-5" />
                    </div>
                    <h2 className="mt-4 text-lg font-bold text-slate-950">{item.title}</h2>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{item.copy}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-[36px] border border-white/70 bg-slate-950 p-6 text-white shadow-[0_32px_100px_rgba(15,23,42,0.28)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/50">Product snapshot</p>
                <h2 className="mt-2 text-2xl font-bold">Creator-grade app shell</h2>
              </div>
              <div className="rounded-2xl bg-white/10 p-3">
                <Video className="size-5" />
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <div className="rounded-[28px] border border-white/10 bg-white/5 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/50">Feed system</p>
                <p className="mt-3 text-3xl font-black">Stories + Posts + Reels</p>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  A single polished entry point for browsing, posting, and moving into richer creator interactions.
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-[28px] border border-white/10 bg-white/5 p-5">
                  <p className="text-sm font-semibold text-white">Watch next navigation</p>
                  <p className="mt-2 text-xs leading-5 text-slate-300">Video-forward discovery inspired by familiar creator platforms.</p>
                </div>
                <div className="rounded-[28px] border border-white/10 bg-white/5 p-5">
                  <p className="text-sm font-semibold text-white">Premium surfaces</p>
                  <p className="mt-2 text-xs leading-5 text-slate-300">Clear hierarchy, stronger branding, and investor-friendly presentation.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="bg-transparent">
        <HeroSection handleDownload={handleDownload} />
        <StatsSection totalDownloads={totalDownloads} />
      </div>

      <section id="experience" className="mx-auto max-w-[1280px] px-4 py-16 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Experience design</p>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
            A more professional social product, not just a chat app with posts added on.
          </h2>
          <p className="mt-4 text-base leading-8 text-slate-600">
            The updated direction emphasizes media hierarchy, creator discovery, audience actions, and trust signals so the app feels cohesive, modern, and launch-ready.
          </p>
        </div>

        <div className="mt-10 grid gap-5 lg:grid-cols-2">
          {experienceCards.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.06)]">
                <div className="flex size-12 items-center justify-center rounded-2xl bg-slate-950 text-white">
                  <Icon className="size-5" />
                </div>
                <h3 className="mt-5 text-2xl font-bold text-slate-950">{item.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">{item.copy}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section id="platform" className="border-y border-slate-200 bg-white/70 py-12">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
          <div className="mb-4 flex items-center justify-center gap-2 opacity-50">
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Sponsored Information</span>
          </div>
          <div className="overflow-hidden rounded-[32px] border border-dashed border-slate-300 bg-slate-50 p-4">
            <AdSense slot="5614946399" format="horizontal" responsive="true" />
          </div>
        </div>
      </section>

      <InsightsSection />
      <FeaturesSection />
      <WhySection />

      <section className="mx-auto max-w-[1280px] px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded-[36px] bg-slate-950 px-6 py-8 text-white sm:px-8">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/50">Positioning</p>
              <h2 className="mt-3 text-3xl font-black tracking-tight">The product now reads as a creator-led social media platform.</h2>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300">
                Better structure, stronger feed presentation, and video-inspired discovery patterns help the app feel closer to category leaders while preserving your current feature set.
              </p>
            </div>
            <Link
              to="/signup"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
            >
              Create account
              <ArrowUpRight className="size-4" />
            </Link>
          </div>
        </div>
      </section>

      <div id="download">
        <DownloadSection latestApk={latestApk} handleDownload={handleDownload} />
      </div>
      <PricingSection />
      <CTASection />
      <FooterSection handleDownload={handleDownload} />
    </div>
  );
};

export default LandingPage;
