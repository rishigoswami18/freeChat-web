import { ShipWheel } from "lucide-react";
import { useThemeStore } from "../store/useThemeStore";

const PageLoader = () => {
  const { theme } = useThemeStore();
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center gap-4"
      data-theme={theme}
    >
      <div className="relative">
        <ShipWheel className="size-12 text-primary animate-spin" style={{ animationDuration: '2s' }} />
        <div className="absolute -inset-4 bg-primary/10 rounded-full blur-xl animate-pulse" />
      </div>
      <span className="text-lg font-bold gradient-text tracking-tight">
        freeChat
      </span>
    </div>
  );
};
export default PageLoader;