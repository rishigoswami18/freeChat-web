import { HeartHandshake, Flame } from "lucide-react";
import { Link } from "react-router-dom";

const Logo = ({ className = "size-8", showText = true, fontSize = "text-2xl", streak = 0 }) => {
    return (
        <div className="flex items-center gap-2">
            <Link to="/" className="flex items-center gap-2.5 group">
                <div className="relative">
                    <HeartHandshake className={`${className} text-primary group-hover:scale-110 transition-transform duration-300`} />
                    <div className="absolute -inset-2 bg-primary/20 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                {showText && (
                    <div className="flex flex-col">
                        <span className={`${fontSize} font-extrabold tracking-tight gradient-text leading-none`}>
                            BondBeyond
                        </span>
                        <span className="text-[8px] font-black uppercase tracking-[0.2em] opacity-40 ml-0.5 mt-0.5">
                            Powered by freechatweb.in
                        </span>
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
