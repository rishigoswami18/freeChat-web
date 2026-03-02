import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ADSENSE_CLIENT = "ca-pub-4421164590159929";

// Pages that have enough textual content for AdSense bots to analyze
const CONTENT_PAGES = [
    "/",
    "/about",
    "/privacy-policy",
    "/terms",
    "/refund-policy",
    "/contact",
];

// Pages to strictly block (Auth, Logic, Transient screens)
const BLOCKED_PAGES = ["/login", "/signup", "/onboarding", "/call", "/reset-password", "/forgot-password", "/game/"];

let adsenseLoaded = false;

const AdSenseLoader = () => {
    const location = useLocation();

    useEffect(() => {
        const path = location.pathname;

        // 1. Check if definitely blocked
        const isBlocked = BLOCKED_PAGES.some((p) => path.startsWith(p));
        if (isBlocked) return;

        // 2. Check if it's a content page
        const isContentPage = CONTENT_PAGES.some(
            (p) => path === p || (p !== "/" && path.startsWith(p))
        );

        if (!isContentPage) return;

        // Load AdSense script only once and only on valid pages
        if (!adsenseLoaded) {
            const script = document.createElement("script");
            script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`;
            script.async = true;
            script.crossOrigin = "anonymous";
            document.head.appendChild(script);
            adsenseLoaded = true;
        }
    }, [location.pathname]);

    return null;
};

export default AdSenseLoader;
