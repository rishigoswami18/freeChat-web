import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  Clapperboard,
  Download,
  IndianRupee,
  MapPin,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  Store,
  TrendingUp,
  Users,
  Zap,
  Target,
  Globe,
  Heart,
  Star,
} from "lucide-react";

import { getAppStats, getLatestRelease } from "../lib/api";
import { APK_DOWNLOAD_URL, downloadFile } from "../lib/axios";
import Card from "../components/Card";
import Logo from "../components/Logo";
import AdSense from "../components/AdSense";
import LanguageSelector from "../components/LanguageSelector";

const reveal = {
  hidden: { opacity: 0, y: 18 },
  show: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay, duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  }),
};

const suites = [
  {
    title: "Verified Identity",
    eyebrow: "Trust",
    copy: "Real identity, verified badges, and reputation scores make every connection authentic and meaningful.",
    icon: ShieldCheck,
  },
  {
    title: "Creator Economy",
    eyebrow: "Earn",
    copy: "Monetize your skills, content, and influence. From paid chats to referral rewards — everyone can earn.",
    icon: IndianRupee,
  },
  {
    title: "Local Discovery",
    eyebrow: "Connect",
    copy: "Find nearby people, communities, and opportunities. Real utility that global platforms miss.",
    icon: MapPin,
  },
];

const steps = [
  { step: "01", title: "Create your profile", copy: "Sign up with verified identity for a trusted, authentic social experience." },
  { step: "02", title: "Discover & connect", copy: "Find people, communities, and opportunities around you with hyperlocal discovery." },
  { step: "03", title: "Create & earn", copy: "Post content, offer paid services, and monetize your skills and influence." },
  { step: "04", title: "Build reputation", copy: "Grow your trust score, unlock premium features, and become a verified creator." },
];

const badges = ["Made in India 🇮🇳", "Verified Profiles", "UPI Payments", "Hyperlocal Feed", "AI Companion"];

const LandingPage = () => {
  const { t } = useTranslation();
  const [latestApk, setLatestApk] = useState(null);
  const [totalDownloads, setTotalDownloads] = useState("1K+");

  useEffect(() => {
    document.title = "FreeChat — India's Social Platform for Creators & Communities";
  }, []);

  const handleDownload = useCallback(
    (event) => {
      event.preventDefault();
      const filename = latestApk?.versionName
        ? `FreeChat_v${latestApk.versionName.replace(/\./g, "_")}.apk`
        : "FreeChat_app.apk";
      downloadFile(`${APK_DOWNLOAD_URL}/latest`, filename);
    },
    [latestApk]
  );

  useEffect(() => {
    let isMounted = true;
    const fetchLandingData = async () => {
      try {
        const [apkData, statsData] = await Promise.all([getLatestRelease(), getAppStats()]);
        if (!isMounted) return;
        setLatestApk(apkData);
        if (statsData?.totalDownloads > 0) {
          setTotalDownloads(`${statsData.totalDownloads}+`);
        }
      } catch (error) {
        console.error("Failed to fetch landing page stats:", error);
      }
    };
    fetchLandingData();
    return () => { isMounted = false; };
  }, []);

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 selection:bg-indigo-500/20 selection:text-indigo-200">
      {/* Background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(99,102,241,0.08),_transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_rgba(168,85,247,0.04),_transparent_50%)]" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/5 bg-[#020617]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1280px] items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Logo fontSize="text-2xl" />

          <nav className="hidden items-center gap-8 text-xs font-semibold uppercase tracking-wider text-white/30 md:flex">
            <a href="#features" className="transition hover:text-white">Features</a>
            <a href="#how" className="transition hover:text-white">How it works</a>
            <a href="#download" className="transition hover:text-white">Download</a>
          </nav>

          <div className="flex items-center gap-3">
            <LanguageSelector size="btn-md" />
            <Link to="/login" className="inline-flex min-h-[44px] items-center justify-center rounded-2xl border border-white/10 px-5 text-xs font-semibold text-white/60 transition hover:border-white/20 hover:text-white">
              {t('login')}
            </Link>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.99 }}>
              <Link to="/signup" className="inline-flex min-h-[44px] items-center justify-center rounded-2xl bg-indigo-500 px-6 text-xs font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:bg-indigo-400">
                {t('get_started')}
              </Link>
            </motion.div>
          </div>
        </div>
      </header>

      <main className="relative z-10">
        {/* Hero */}
        <section id="features" className="mx-auto max-w-[1280px] px-4 pb-16 pt-16 sm:px-6 lg:px-8 lg:pb-28 lg:pt-24">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_490px] lg:items-center">
            <div>
              <motion.div custom={0} variants={reveal} initial="hidden" animate="show" className="inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-4 py-2 text-[10px] font-semibold uppercase tracking-wider text-indigo-400">
                <Star className="size-3.5 fill-current" /> {t('featured')}
              </motion.div>

              <motion.h1 custom={0.08} variants={reveal} initial="hidden" animate="show" className="mt-8 max-w-4xl text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl lg:leading-[1.1]">
                {t('hero_title')}
              </motion.h1>

              <motion.p custom={0.14} variants={reveal} initial="hidden" animate="show" className="mt-6 max-w-xl text-base leading-relaxed text-white/40 font-medium">
                {t('hero_desc')}
              </motion.p>

              <motion.div custom={0.2} variants={reveal} initial="hidden" animate="show" className="mt-8 flex flex-wrap gap-3">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.99 }}>
                  <Link to="/signup" className="inline-flex min-h-[52px] items-center gap-2.5 rounded-2xl bg-indigo-500 px-7 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:bg-indigo-400">
                    {t('create_account')}
                    <ArrowRight className="size-4" />
                  </Link>
                </motion.div>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.99 }} onClick={handleDownload} className="inline-flex min-h-[52px] items-center gap-2.5 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md px-7 text-sm font-semibold text-white/80 transition hover:border-white/20 hover:bg-white/10">
                  <Download className="size-4" />
                  {latestApk?.versionName ? `Download v${latestApk.versionName}` : t('download_apk')}
                </motion.button>
              </motion.div>

              <motion.div custom={0.26} variants={reveal} initial="hidden" animate="show" className="mt-8 flex flex-wrap gap-2">
                {badges.map((badge) => (
                  <span key={badge} className="rounded-full border border-white/5 bg-white/[0.03] px-3.5 py-2 text-xs font-medium text-white/50">
                    {badge}
                  </span>
                ))}
              </motion.div>
            </div>

            {/* Product Preview Card */}
            <motion.div custom={0.12} variants={reveal} initial="hidden" animate="show" className="relative">
              <div className="absolute inset-0 rounded-3xl bg-indigo-500/5 blur-3xl" />
              <div className="relative overflow-hidden rounded-3xl border border-white/5 bg-white/[0.02] p-5 shadow-2xl">
                <div className="rounded-2xl border border-white/5 bg-[#0f172a]/80 p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-indigo-400">Live Dashboard</p>
                      <h2 className="mt-2 text-xl font-bold tracking-tight text-white">Your earning overview</h2>
                    </div>
                    <div className="flex items-center gap-2 rounded-full border border-white/5 bg-white/[0.03] px-3 py-2 text-xs font-medium text-white/50">
                      <TrendingUp className="size-3.5 text-emerald-400" />
                      real-time
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-4">
                      <p className="text-[10px] font-medium uppercase text-white/30 tracking-wider">Total Earned</p>
                      <p className="mt-2 text-2xl font-bold text-white">₹18.4K</p>
                      <p className="mt-1 text-[10px] text-emerald-400 font-medium">↑ 23% this month</p>
                    </div>
                    <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-4">
                      <p className="text-[10px] font-medium uppercase text-white/30 tracking-wider">Trust Score</p>
                      <p className="mt-2 text-2xl font-bold text-white">94</p>
                      <p className="mt-1 text-[10px] text-indigo-400 font-medium">Verified Creator</p>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-4">
                      <div className="flex items-center gap-2 text-indigo-400 mb-3">
                        <MapPin className="size-3.5" />
                        <span className="text-[10px] font-semibold uppercase tracking-wider">{t('desi_arena')}</span>
                      </div>
                      <div className="space-y-2">
                        <div className="rounded-xl bg-white/[0.03] border border-white/5 px-3 py-2.5 text-xs text-white/50">Nearby services & opportunities</div>
                        <div className="rounded-xl bg-white/[0.03] border border-white/5 px-3 py-2.5 text-xs text-white/50">Local jobs, deals & contacts</div>
                      </div>
                    </div>
                    <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-4">
                      <div className="flex items-center gap-2 text-amber-400 mb-3">
                        <Store className="size-3.5" />
                        <span className="text-[10px] font-semibold uppercase tracking-wider">Marketplace</span>
                      </div>
                      <p className="text-xs text-white/50 leading-relaxed">Sell courses, services, and products directly inside the app.</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Stats Strip */}
        <section className="border-y border-white/5 bg-white/[0.01]">
          <div className="mx-auto grid max-w-[1280px] gap-3 px-4 py-6 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
            {[
              { label: "Downloads", value: totalDownloads, desc: "Growing community across India" },
              { label: "Platform", value: "Web + Mobile", desc: "Available everywhere, anytime" },
              { label: "Core Value", value: "Trust + Earn", desc: "Verified identity meets creator economy" },
              { label: "Built For", value: "India First", desc: "Local trust, UPI payments, hyperlocal" },
            ].map((stat) => (
              <div key={stat.label} className="rounded-2xl border border-white/5 bg-white/[0.02] p-5">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-white/30">{stat.label}</p>
                <p className="mt-2 text-xl font-bold tracking-tight text-white">{stat.value}</p>
                <p className="mt-1 text-xs text-white/30 font-medium">{stat.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section id="how" className="mx-auto max-w-[1280px] px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="max-w-2xl mb-12">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-indigo-400">Platform Features</span>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              {t('everything_free')}
            </h2>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            {suites.map((item, index) => {
              const Icon = item.icon;
              return (
                <Card key={item.title} title={item.title} index={index} className="h-full">
                  <div className="mb-4 flex size-11 items-center justify-center rounded-2xl bg-indigo-500/10 border border-indigo-500/15 text-indigo-400">
                    <Icon className="size-5" />
                  </div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-indigo-400 mb-2">{item.eyebrow}</p>
                  <p className="text-sm leading-relaxed text-white/40">{item.copy}</p>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Why FreeChat */}
        <section className="mx-auto max-w-[1280px] px-4 pb-16 sm:px-6 lg:px-8 lg:pb-24">
          <div className="grid gap-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
            <div className="rounded-3xl border border-white/5 bg-white/[0.02] p-6 sm:p-8">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-indigo-400">{t('what_is')}</span>
              <h2 className="mt-3 text-2xl font-bold tracking-tight text-white">{t('packed_features')}</h2>
              <p className="mt-4 text-sm leading-relaxed text-white/40">
                {t('hero_desc')}
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl border border-white/5 bg-gradient-to-b from-indigo-500/8 to-transparent p-6">
                <div className="flex items-center gap-2 text-indigo-400 mb-4">
                  <BadgeCheck className="size-4" />
                  <span className="text-[10px] font-semibold uppercase tracking-wider">Verified Network</span>
                </div>
                <p className="text-lg font-bold text-white mb-2">Real identity as a feature</p>
                <p className="text-sm text-white/40 leading-relaxed">Trust badges and reputation create stronger, more meaningful connections.</p>
              </div>
              <div className="rounded-3xl border border-white/5 bg-white/[0.02] p-6">
                <div className="flex items-center gap-2 text-amber-400 mb-4">
                  <Clapperboard className="size-4" />
                  <span className="text-[10px] font-semibold uppercase tracking-wider">Creator Tools</span>
                </div>
                <p className="text-lg font-bold text-white mb-2">Everyone can be a creator</p>
                <p className="text-sm text-white/40 leading-relaxed">Posts, paid chats, services, and referrals — monetize from day one.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Ad */}
        <section className="border-y border-white/5 bg-white/[0.01] py-10">
          <div className="mx-auto max-w-4xl px-4 sm:px-6">
            <div className="overflow-hidden rounded-2xl border border-dashed border-white/10 bg-[#0f172a]/50 p-4">
              <AdSense slot="5614946399" format="horizontal" responsive="true" />
            </div>
          </div>
        </section>

        {/* Journey / How It Works */}
        <section className="mx-auto max-w-[1280px] px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="grid gap-10 lg:grid-cols-[0.86fr_minmax(0,1.14fr)] lg:items-start">
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-indigo-400">How It Works</span>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                From sign-up to earning — a clear journey for every user.
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-white/40">
                FreeChat's user journey is designed to deliver value at every step — attract, engage, monetize, and retain.
              </p>
            </div>

            <div className="relative space-y-3">
              <div className="absolute bottom-6 left-7 top-6 hidden w-px bg-gradient-to-b from-indigo-500/40 via-white/5 to-transparent sm:block" />
              {steps.map((item, index) => (
                <motion.div key={item.step} initial={{ opacity: 0, x: 16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, amount: 0.25 }} transition={{ delay: index * 0.08, duration: 0.35 }} className="relative flex gap-5 rounded-2xl border border-white/5 bg-white/[0.02] p-5">
                  <div className="relative z-10 flex size-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-500/10 border border-indigo-500/15 text-sm font-bold text-indigo-400">
                    {item.step}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">{item.title}</h3>
                    <p className="mt-1 text-sm text-white/40 leading-relaxed">{item.copy}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section id="download" className="mx-auto max-w-[1280px] px-4 pb-20 sm:px-6 lg:px-8">
          <div className="overflow-hidden rounded-3xl border border-white/5 bg-gradient-to-br from-indigo-500/10 via-transparent to-violet-500/5 p-6 shadow-2xl sm:p-10">
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-center">
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-indigo-400">{t('get_started')}</span>
                <h2 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                  {t('free_forever')}
                </h2>
                <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/40">
                  Verified identity, local discovery, creator tools, and built-in earning — everything you need in one platform.
                </p>

                <div className="mt-8 flex flex-wrap gap-3">
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.99 }}>
                    <Link to="/signup" className="inline-flex min-h-[48px] items-center gap-2 rounded-2xl bg-indigo-500 px-6 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:bg-indigo-400">
                      {t('create_account')} <ArrowRight className="size-4" />
                    </Link>
                  </motion.div>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.99 }} onClick={handleDownload} className="inline-flex min-h-[48px] items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-6 text-sm font-semibold text-white/80 transition hover:border-white/20 hover:bg-white/10">
                    <Download className="size-4" />
                    {t('download_apk')}
                  </motion.button>
                </div>
              </div>

              <div className="grid gap-3">
                <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-4">
                  <p className="text-[10px] font-medium uppercase text-white/30 tracking-wider">Available On</p>
                  <p className="mt-2 text-base font-bold text-white">Web + Android</p>
                </div>
                <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-4">
                  <p className="text-[10px] font-medium uppercase text-white/30 tracking-wider">Core Promise</p>
                  <p className="mt-2 text-base font-bold text-white">Trust, Community & Earning for Everyone</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-white/5 bg-[#020617]">
          <div className="mx-auto grid max-w-[1280px] gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[minmax(0,1.2fr)_repeat(3,minmax(0,1fr))] lg:px-8">
            <div>
              <Logo fontSize="text-2xl" />
              <p className="mt-5 max-w-sm text-sm leading-relaxed text-white/30">
                India's social platform for verified people, communities, creator economy, and hyperlocal discovery.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                <span className="rounded-full border border-white/5 bg-white/[0.02] px-3 py-1.5 text-xs text-white/30">Verified Identity</span>
                <span className="rounded-full border border-white/5 bg-white/[0.02] px-3 py-1.5 text-xs text-white/30">Local Trust</span>
                <span className="rounded-full border border-white/5 bg-white/[0.02] px-3 py-1.5 text-xs text-white/30">Creator Economy</span>
              </div>
            </div>

            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-indigo-400">Product</p>
              <div className="mt-5 space-y-3 text-sm text-white/30">
                <a href="#features" className="block transition hover:text-white">Features</a>
                <a href="#how" className="block transition hover:text-white">How It Works</a>
                <a href="#download" className="block transition hover:text-white">Download App</a>
              </div>
            </div>

            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-indigo-400">Company</p>
              <div className="mt-5 space-y-3 text-sm text-white/30">
                <Link to="/about" className="block transition hover:text-white">About</Link>
                <Link to="/founder" className="block transition hover:text-white">Founder</Link>
                <Link to="/contact" className="block transition hover:text-white">Contact</Link>
                <Link to="/blog" className="block transition hover:text-white">Blog</Link>
              </div>
            </div>

            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-indigo-400">Legal</p>
              <div className="mt-5 space-y-3 text-sm text-white/30">
                <Link to="/privacy-policy" className="block transition hover:text-white">Privacy Policy</Link>
                <Link to="/terms" className="block transition hover:text-white">Terms of Service</Link>
                <Link to="/refund-policy" className="block transition hover:text-white">Refund Policy</Link>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={handleDownload}
                  className="inline-flex min-h-[40px] items-center gap-2 rounded-xl border border-white/5 bg-white/[0.02] px-4 py-2 text-sm font-medium text-white/50 transition hover:text-white hover:bg-white/[0.04]"
                >
                  <Download className="size-3.5" />
                  Download App
                </motion.button>
              </div>
            </div>
          </div>

          <div className="border-t border-white/5">
            <div className="mx-auto flex max-w-[1280px] flex-col gap-2 px-4 py-5 text-xs text-white/20 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
              <p>© 2026 FreeChat. Built with ❤️ in India.</p>
              <p>India's Social Platform for Creators & Communities</p>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default LandingPage;
