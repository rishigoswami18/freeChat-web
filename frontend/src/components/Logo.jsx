import { HeartHandshake, Flame } from "lucide-react";
import { Link } from "react-router-dom";

const Logo = ({ className = "size-8", showText = true, fontSize = "text-2xl", streak = 0 }) => {
    return (
        <div className="flex items-center gap-2">
            <Link to="/" className="flex items-center gap-2.5 group">
                <div className="relative flex items-center justify-center">
                    <div className="size-10 rounded-2xl bg-primary flex items-center justify-center relative z-10 shadow-lg shadow-primary/20 group-hover:rotate-12 transition-all duration-500 overflow-hidden">
                        {/* Geometric Z Speed Vector */}
                        <svg viewBox="0 0 24 24" fill="none" className="size-6 text-white" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M4 4h16l-12 16h16" />
                        </svg>
                    </div>
                    <div className="absolute -inset-2 bg-primary/30 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                </div>
                {showText && (
                    <div className="flex flex-col">
                        <span className={`${fontSize} font-black tracking-tight text-base-content leading-none uppercase italic`}>
                            Zyro
                        </span>
                        <div className="flex items-center gap-1.5 mt-1">
                            <span className="text-[7px] font-black uppercase tracking-[0.3em] opacity-30">
                                The Social Edge
                            </span>
                            <div className="h-[1px] w-4 bg-base-content/10" />
                        </div>
                    </div>
                )}
            </Link>
            {streak > 0 && (
                <div className="flex items-center gap-1 px-2 py-0.5 bg-orange-500/10 rounded-lg border border-orange-500/20 text-orange-500 animate-pulse ml-1">
                    <Flame className="size-3.5 fill-current" />
                    <span className="font-bold text-xs">{streak}</span>
                </div>
            )}
        </div>
    );
};

export default Logo;
