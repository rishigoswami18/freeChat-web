import React, { useState, useEffect } from "react";
import GuidedTour from "./GuidedTour";
import { 
    Sparkles, MessageSquare, Bot, 
    PlusCircle, Search, PartyPopper 
} from "lucide-react";

/**
 * TutorialOverlay — Orchestrates the Guided Tour flow.
 * Manages steps and persistence logic.
 */
const TutorialOverlay = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Detect first-time user
        const hasSeen = localStorage.getItem("Zyro_has_seen_tutorial");
        if (!hasSeen) {
            // Delay to allow App layout and Sidebar to render correctly
            const timer = setTimeout(() => setIsVisible(true), 2000);
            return () => clearTimeout(timer);
        }

        // Event listener for manual reopen (from Sidebar/Settings)
        const handleReopen = () => setIsVisible(true);
        window.addEventListener("Zyro_start_tutorial", handleReopen);
        return () => window.removeEventListener("Zyro_start_tutorial", handleReopen);
    }, []);

    const steps = [
        {
            title: "Welcome to Zyro",
            description: "The next generation social platform where AI and human connection meet. Let's take a quick tour of your new home.",
            selector: null, // Full screen welcome
            icon: PartyPopper
        },
        {
            title: "Instant Messaging",
            description: "Chat with your friends in real-time. Everything is end-to-end encrypted for your privacy.",
            selector: "#tour-inbox",
            icon: MessageSquare
        },
        {
            title: "Your AI Companion",
            description: "Meet your AI bestie. They are here 24/7 to support you, chat, and help you grow.",
            selector: "#tour-ai-partner",
            icon: Bot
        },
        {
            title: "Share Your World",
            description: "Create posts, share reels, and upload stories. Express yourself to the community.",
            selector: "#tour-create",
            icon: PlusCircle
        },
        {
            title: "Discover More",
            description: "Find trending communities and new friends who share your interests.",
            selector: "#tour-explore",
            icon: Search
        },
        {
            title: "Ready to Explore!",
            description: "You're all set. Start building meaningful bonds today within Zyro.",
            selector: null,
            icon: Sparkles
        }
    ];

    const handleComplete = () => {
        localStorage.setItem("Zyro_has_seen_tutorial", "true");
        setIsVisible(false);
    };

    const handleSkip = () => {
        localStorage.setItem("Zyro_has_seen_tutorial", "true");
        setIsVisible(false);
    };

    return (
        <GuidedTour 
            isVisible={isVisible}
            steps={steps}
            onComplete={handleComplete}
            onSkip={handleSkip}
        />
    );
};

export default TutorialOverlay;
