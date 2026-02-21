import { Crown, ExternalLink, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const ReelAd = ({ isActive }) => {
    return (
        <div className="relative h-full w-full bg-gradient-to-br from-neutral-900 via-base-300 to-neutral-900 flex flex-col items-center justify-center p-8 overflow-hidden">
            {/* Animated Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                <div className="absolute top-1/4 left-1/4 size-64 bg-primary rounded-full blur-[100px] animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 size-64 bg-secondary rounded-full blur-[100px] animate-pulse delay-700" />
            </div>

            {/* Ad Content */}
            <div className="z-10 text-center space-y-8 max-w-sm">
                <div className="inline-flex items-center justify-center size-20 bg-primary/20 rounded-3xl mb-4 ring-8 ring-primary/5">
                    <Crown className="size-10 text-primary" />
                </div>

                <div className="space-y-4">
                    <div className="badge badge-primary font-bold tracking-widest uppercase py-3">Sponsored</div>
                    <h2 className="text-4xl font-black text-white leading-tight">
                        Go Ad-Free with <span className="text-primary italic">freeChat</span> Premium
                    </h2>
                    <p className="text-white/60 text-lg leading-relaxed">
                        Enjoy an uninterrupted experience, exclusive themes, and unlock all premium features.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-4 pt-6">
                    <Link
                        to="/membership"
                        className="btn btn-primary btn-lg rounded-2xl gap-3 shadow-[0_0_20px_rgba(var(--p),0.3)] hover:scale-105 transition-transform"
                    >
                        <Sparkles className="size-5" />
                        Upgrade Now
                    </Link>
                    <button className="btn btn-ghost shadow-none bg-white/5 hover:bg-white/10 rounded-2xl gap-2">
                        Learn More
                        <ExternalLink className="size-4 opacity-50" />
                    </button>
                </div>
            </div>

            {/* Bottom Progress Bar (Simulating a Reel) */}
            <div className="absolute bottom-0 left-0 w-full h-1 bg-white/10">
                <div
                    className={`h-full bg-primary transition-all duration-[5000ms] linear ${isActive ? 'w-full' : 'w-0'}`}
                />
            </div>
        </div>
    );
};

export default ReelAd;
