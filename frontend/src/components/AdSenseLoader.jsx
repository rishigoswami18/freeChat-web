import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ADSENSE_CLIENT = "ca-pub-4421164590159929";

// Pages that have enough publisher content for AdSense
const CONTENT_PAGES = [
    "/",
    "/posts",
    "/friends",
    "/search",
    "/reels",
    "/notifications",
    "/couple",
    "/games",
    "/membership",
    "/inbox",
    "/profile",
];

// Pages where ads should NOT load (auth screens, loading, empty states)
const BLOCKED_PAGES = ["/login", "/signup", "/onboarding", "/call"];

let adsenseLoaded = false;

const AdSenseLoader = () => {
    const location = useLocation();

    useEffect(() => {
        const path = location.pathname;

        // Don't load AdSense on blocked pages
        if (BLOCKED_PAGES.some((p) => path.startsWith(p))) return;

        // Only load on content pages
        const isContentPage = CONTENT_PAGES.some(
            (p) => path === p || (p !== "/" && path.startsWith(p))
        );
        if (!isContentPage && path !== "/") return;

        // Load AdSense script only once
        if (!adsenseLoaded) {
            const script = document.createElement("script");
            script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`;
            script.async = true;
            script.crossOrigin = "anonymous";
            document.head.appendChild(script);
            adsenseLoaded = true;
        }
    }, [location.pathname]);

    return null; // This component renders nothing
};

export default AdSenseLoader;
