import React, { memo } from "react";
import Logo from "../Logo";

const FooterBrand = ({ tagline, description }) => {
    return (
        <div className="space-y-4">
            <Logo className="size-8" fontSize="text-xl" />
            <div className="space-y-2">
                {tagline && <p className="text-xs font-bold text-primary uppercase tracking-wider">{tagline}</p>}
                <p className="text-sm opacity-50 max-w-xs leading-relaxed">
                    {description}
                </p>
            </div>
        </div>
    );
};

export default memo(FooterBrand);
