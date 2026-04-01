import { Loader2 } from "lucide-react";
import { useThemeStore } from "../store/useThemeStore";
import Logo from "./Logo";

const PageLoader = () => {
  const { theme } = useThemeStore();

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center gap-5 bg-[linear-gradient(180deg,#0f172a_0%,#1e293b_100%)] px-6 text-center"
      data-theme={theme}
    >
      <div className="flex size-20 items-center justify-center rounded-[28px] border border-white/10 bg-white/5 shadow-[0_24px_80px_rgba(15,23,42,0.35)] backdrop-blur-xl">
        <Logo className="size-11" showText={false} />
      </div>

      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-sky-300/80">
          Zyro
        </p>
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Loading your social experience
        </h1>
        <p className="max-w-md text-sm leading-6 text-slate-300">
          Connecting to the app and checking your session.
        </p>
      </div>

      <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-200">
        <Loader2 className="size-4 animate-spin" />
        Please wait
      </div>
    </div>
  );
};

export default PageLoader;
