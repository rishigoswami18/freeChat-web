import { useThemeStore } from "../store/useThemeStore";
import Logo from "./Logo";

const PageLoader = () => {
  const { theme } = useThemeStore();
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center gap-4"
      data-theme={theme}
    >
      <div className="relative animate-bounce">
        <Logo className="size-16" showText={false} />
      </div>
      <span className="text-xl font-extrabold gradient-text tracking-tight mt-2">
        freeChat
      </span>
    </div>
  );
};
export default PageLoader;