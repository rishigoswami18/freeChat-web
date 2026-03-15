import React, { memo } from "react";
import { Heart } from "lucide-react";

/**
 * FooterBottom
 * Renders copyright info and the "Made with heart" signature.
 */
const FooterBottom = ({ brandName }) => {
    const currentYear = new Date().getFullYear();

    return (
        <div className="pt-6 border-t border-base-300/30 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs opacity-40 font-medium">
                © {currentYear} {brandName}. All rights reserved.
            </p>
            
            <div className="flex items-center gap-1 text-xs opacity-40">
                <span>Designed & developed with</span>
                <Heart className="size-3 text-red-500 fill-current mx-0.5 animate-pulse" />
                <span>for global connections.</span>
            </div>
        </div>
    );
};

export default memo(FooterBottom);
