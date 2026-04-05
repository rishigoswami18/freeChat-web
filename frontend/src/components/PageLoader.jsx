import { Loader2 } from "lucide-react";
import Logo from "./Logo";
import { motion } from "framer-motion";

/**
 * PageLoader
 * Professional, minimal loading state for the application.
 * Replaces overdramatic sci-fi animations with a clean, high-trust experience.
 */
const PageLoader = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-white px-6 text-center antialiased">
      
      {/* Centered Minimal Container */}
      <div className="flex flex-col items-center gap-6">
        <motion.div 
          animate={{ 
            opacity: [0.5, 1, 0.5],
            scale: [0.98, 1, 0.98]
          }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="size-16 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center shadow-sm"
        >
          <Logo className="size-8 grayscale opacity-20" showText={false} />
        </motion.div>

        <div className="space-y-1">
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Setting things up
          </h1>
          <p className="text-sm font-medium text-slate-400">
            Please wait while we connect you to your dashboard.
          </p>
        </div>

        {/* Minimal Progress/Spinner */}
        <div className="flex items-center gap-3 px-4 py-2 bg-slate-50 border border-slate-100 rounded-full text-[11px] font-bold text-slate-400 uppercase tracking-wider">
          <Loader2 className="size-3 animate-spin text-slate-300" />
          Connecting
        </div>
      </div>

    </div>
  );
};

export default PageLoader;
