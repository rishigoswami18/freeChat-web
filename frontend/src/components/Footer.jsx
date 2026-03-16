import React, { memo, useMemo } from "react";
import { FOOTER_SECTIONS } from "../config/footerLinks";
import { SOCIAL_LINKS } from "../config/socialLinks";
import FooterBrand from "./footer/FooterBrand";
import FooterSection from "./footer/FooterSection";
import FooterSocial from "./footer/FooterSocial";
import FooterBottom from "./footer/FooterBottom";

/**
 * Footer Component — Production-grade Scalable UI System.
 * Rebuilt as a configuration-driven responsive layout with accessibility guards.
 * Optimized grid to prevent empty space on large screens.
 */
const Footer = () => {
    // Memoize static configuration to prevent unnecessary prop re-evaluation
    const sections = useMemo(() => FOOTER_SECTIONS, []);
    const socials = useMemo(() => SOCIAL_LINKS, []);

    return (
        <footer 
            className="bg-base-200/80 border-t border-base-300/50 py-12 px-6 sm:px-12 mt-auto font-outfit relative z-10"
            role="contentinfo"
        >
            <div className="w-full mx-auto">
                {/* 
                  Grid Strategy:
                  - Mobile: 1 col
                  - Tablet: 2 cols
                  - Desktop: 6 cols (Brand=2, Sections=3, Social=1)
                  This ensures a full row without empty "right space".
                */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-y-12 gap-x-8 mb-12">
                    
                    {/* Brand Identity & Description (Takes 2 units) */}
                    <div className="col-span-1 sm:col-span-2 lg:col-span-2">
                        <FooterBrand 
                            tagline="India's Largest Fan Engagement Ecosystem"
                            description="BondBeyond is a cutting-edge Sports-Tech platform redefining the fan experience through the Antigravity Engine. We transform passive viewing into an active, data-driven analytical journey."
                        />
                    </div>

                    {/* Dynamic Navigation Sections (3 separate columns) */}
                    {sections.map((section, idx) => (
                        <div key={idx} className="col-span-1">
                            <FooterSection 
                                title={section.title}
                                links={section.links}
                            />
                        </div>
                    ))}

                    {/* Community & Social Presence (Takes 1 unit) */}
                    <div className="col-span-1 sm:col-span-2 lg:col-span-1">
                        <FooterSocial 
                            title="Follow Us"
                            links={socials}
                        />
                    </div>
                </div>

                {/* Bottom Bar: Copyright & Signature */}
                <FooterBottom brandName="BondBeyond" />
            </div>
        </footer>
    );
};

export default memo(Footer);
