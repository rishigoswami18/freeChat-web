import { Crown, ExternalLink, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import AdSense from "./AdSense";

const ReelAd = ({ isActive }) => {
    return (
        <div className="relative h-full w-full bg-gradient-to-br from-neutral-900 via-base-300 to-neutral-900 flex flex-col items-center justify-center p-8 overflow-hidden">
            {/* Animated Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                <div className="absolute top-1/4 left-1/4 size-64 bg-primary rounded-full blur-[100px] animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 size-64 bg-secondary rounded-full blur-[100px] animate-pulse delay-700" />
            </div>

            {/* Google AdSense Integration */}
            <div className="z-10 w-full flex flex-col items-center gap-6">
                <div className="w-full max-w-sm rounded-3xl overflow-hidden bg-white/5 backdrop-blur-xl border border-white/10 p-2">
                    <div className="badge badge-primary font-bold tracking-widest uppercase py-3 mb-2 ml-2">Sponsored Ad</div>
                    <div className="min-h-[250px] w-full flex items-center justify-center">
                        <AdSense
                            slot="3852157121" // Default or placeholder slot for vertical/square display ads
                            style={{ display: 'inline-block', width: '300px', height: '250px' }}
                            format=""
                            responsive="false"
                        />
                    </div>
                </div>

                {/* Internal Fallback/Premium Content below the real ad */}
                <div className="z-10 text-center space-y-4 max-w-sm px-4">
                    <div className="space-y-2">
                        <h2 className="text-2xl font-black text-white leading-tight">
                            Enjoying <span className="text-primary italic">freeChat?</span>
                        </h2>
                        <p className="text-white/60 text-sm leading-relaxed">
                            Upgrade to Premium to remove all ads and support our platform!
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-3 pt-2">
                        <Link
                            to="/membership"
                            className="btn btn-primary btn-sm rounded-xl gap-2 shadow-[0_0_20px_rgba(var(--p),0.3)] hover:scale-105 transition-transform"
                        >
                            <Sparkles className="size-4" />
                            Go Ad-Free
                        </Link>
                    </div>
                </div>
            </div>

            {/* Bottom Progress Bar (Simulating a Reel) */}
            <div className="absolute bottom-0 left-0 w-full h-1 bg-white/10">
                <div
                    className={`h-full bg-primary transition-all duration-[8000ms] linear ${isActive ? 'w-full' : 'w-0'}`}
                />
            </div>
        </div>
    );
};

export default ReelAd;
