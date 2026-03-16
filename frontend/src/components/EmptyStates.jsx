import React from "react";
import { Clock, Bell } from "lucide-react";

export const EmptyArenaState = () => (
    <div className="relative w-full h-80 rounded-[40px] bg-white/5 border border-white/10 flex flex-col items-center justify-center p-10 text-center overflow-hidden">
        {/* Abstract Background Decoration */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-96 bg-indigo-500/10 blur-[100px] rounded-full" />
        
        <div className="relative z-10">
            <div className="size-20 bg-white/5 border border-white/10 rounded-[32px] flex items-center justify-center mx-auto mb-6 transform rotate-6 hover:rotate-0 transition-transform duration-500">
                <Clock className="size-10 text-white/20" />
            </div>
            
            <h3 className="text-3xl font-black italic text-white mb-2 uppercase tracking-tighter">
                Arena Dormant
            </h3>
            <p className="text-white/30 font-bold text-sm max-w-xs mx-auto mb-8 uppercase tracking-widest leading-relaxed">
                The stadium is quiet... for now. Next season schedule arriving soon.
            </p>

            <button className="px-8 h-12 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all group">
                <Bell className="size-4 text-indigo-400 group-hover:animate-bounce" /> Notify Me
            </button>
        </div>
    </div>
);
