import { memo } from "react";
import { BadgeCheck, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

/**
 * Main wrapper for the feed content ensuring consistent max-width and layout behavior across device sizes.
 */
const FeedLayout = memo(({ children, authUser }) => {
  return (
    <main className="px-0 sm:px-2 py-4 sm:py-6 lg:py-8 max-w-[630px] mx-auto w-full min-h-screen" role="main">
      {children}
      
      {/* Verification Promotion injected within the feed flow */}
      {!authUser?.isVerified && authUser?.role !== "admin" && (
        <section className="w-full sm:max-w-[470px] mx-auto mt-6 mb-10 px-0 sm:px-0">
          <div className="card bg-gradient-to-br from-amber-500/20 via-primary/5 to-base-200 border-2 border-amber-500/20 shadow-xl overflow-hidden rounded-[32px] group relative focus-within:ring-4 focus-within:ring-amber-500/20">
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-20 transition-opacity" aria-hidden="true">
              <BadgeCheck className="size-24 text-amber-500" />
            </div>
            
            <div className="card-body p-6 flex-row items-center gap-5 relative z-10">
              <div className="size-16 rounded-[24px] bg-amber-500/10 flex items-center justify-center shrink-0 border border-amber-500/20 shadow-inner">
                <BadgeCheck className="size-8 text-amber-500 animate-pulse" aria-hidden="true" />
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="bg-amber-500/20 text-amber-600 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border border-amber-500/20">Premium Boost</span>
                </div>
                <h3 className="text-xl font-black italic uppercase tracking-tighter text-amber-600 leading-none">Get Verified</h3>
                <p className="text-xs opacity-60 font-medium mt-1">Unlock trust & exclusive profile features! ✨</p>
              </div>

              <Link 
                to="/membership" 
                className="hidden sm:flex size-10 rounded-full bg-amber-500 text-white items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-lg shadow-amber-500/30 ring-4 ring-amber-500/10"
                aria-label="Learn about verification membership"
              >
                <ArrowRight className="size-5" />
              </Link>
            </div>
            
            {/* Clickable area for mobile users */}
            <Link to="/membership" className="absolute inset-0 sm:hidden" aria-label="Go to Membership page" />
          </div>
        </section>
      )}
    </main>
  );
});

FeedLayout.displayName = "FeedLayout";

export default FeedLayout;
