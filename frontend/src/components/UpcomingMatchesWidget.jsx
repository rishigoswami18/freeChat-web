import React from "react";
import { ChevronRight } from "lucide-react";
import { DateTime } from "luxon";

const UpcomingMatchesWidget = ({ matches, isLoading }) => {
    if (isLoading) return <div className="h-64 bg-white/5 animate-pulse rounded-[40px]" />;
    if (!matches?.length) return null;

    return (
        <div className="bg-white/5 border border-white/5 rounded-[2.5rem] md:rounded-[40px] p-6 md:p-8 space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-black italic tracking-tight text-white">UPCOMING ARENAS</h3>
                <span className="px-3 py-1 bg-white/5 rounded-full text-[10px] font-bold text-white/40 uppercase tracking-widest">Season Schedule</span>
            </div>
            
            <div className="space-y-4">
                {matches.map((match) => {
                    const istTime = DateTime.fromISO(match.startTime || new Date(match.startTime).toISOString()).setZone('Asia/Kolkata');
                    const formattedDate = istTime.toFormat('dd MMM');
                    const formattedTime = istTime.toFormat('hh:mm a');

                    return (
                        <div key={match._id} className="group p-5 bg-white/5 hover:bg-white/10 border border-white/5 rounded-3xl flex items-center justify-between transition-all cursor-pointer">
                            <div className="flex items-center gap-4">
                                <div className="size-12 rounded-2xl bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 flex items-center justify-center font-black text-xs text-indigo-400">
                                    VS
                                </div>
                                <div>
                                    <h4 className="font-black italic text-sm text-white">{match.matchName}</h4>
                                    <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                                        {formattedDate} • {formattedTime} IST • {match.venue || "TBA"}
                                    </p>
                                </div>
                            </div>
                            <ChevronRight className="size-5 text-white/10 group-hover:text-white/40 group-hover:translate-x-1 transition-all" />
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default UpcomingMatchesWidget;
