import React from "react";
import { useTranslation } from "react-i18next";
import { Globe } from "lucide-react";

const languages = [
    { code: "en", label: "English", flag: "🇬🇧" },
    { code: "hi", label: "हिंदी", flag: "🇮🇳" },
    { code: "es", label: "Español", flag: "🇪🇸" },
    { code: "fr", label: "Français", flag: "🇫🇷" },
];

const LanguageSelector = ({ align = "end", size = "btn-sm" }) => {
    const { i18n } = useTranslation();

    return (
        <div className={`dropdown dropdown-${align}`}>
            <div tabIndex={0} role="button" className={`btn btn-ghost btn-circle ${size} hover:bg-base-300/60 transition-colors group`}>
                <div className="relative">
                    <Globe className="size-[18px] text-base-content/60 group-hover:text-primary transition-colors" />
                    <span className="absolute -top-1 -right-1 text-[8px] font-black uppercase text-primary/40 leading-none">
                        {i18n.language?.split("-")[0].toUpperCase()}
                    </span>
                </div>
            </div>
            <ul tabIndex={0} className="dropdown-content z-[50] menu p-2 shadow-xl bg-base-200 rounded-2xl w-48 mt-2 border border-base-300/50 backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="px-3 py-2 mb-1 border-b border-base-300/50">
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Choose Locale</p>
                </div>
                {languages.map((lang) => (
                    <li key={lang.code}>
                        <button
                            onClick={() => {
                                i18n.changeLanguage(lang.code);
                                localStorage.setItem("i18nextLng", lang.code);
                                document.activeElement.blur(); // Close dropdown
                            }}
                            className={`flex items-center gap-3 py-2.5 rounded-xl hover:bg-primary/10 hover:text-primary transition-all duration-200 ${i18n.language === lang.code ? "bg-primary/20 text-primary font-bold shadow-inner" : ""
                                }`}
                        >
                            <span className="text-lg leading-none">{lang.flag}</span>
                            <span className="text-sm tracking-tight">{lang.label}</span>
                            {i18n.language === lang.code && (
                                <div className="ml-auto size-1.5 rounded-full bg-primary" />
                            )}
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default LanguageSelector;
