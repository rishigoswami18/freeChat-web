import React, { memo } from "react";

const FooterSocial = ({ title, links }) => {
    return (
        <div className="space-y-4">
            <h3 className="font-bold uppercase text-[10px] tracking-widest opacity-40">
                {title}
            </h3>
            <div className="flex items-center gap-3">
                {links.map((social, idx) => (
                    <a
                        key={idx}
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`size-9 rounded-xl bg-base-300/50 flex items-center justify-center transition-all duration-300 hover:-translate-y-1 hover:bg-base-300 ${social.color}`}
                        aria-label={`Follow us on ${social.name}`}
                    >
                        <social.icon className="size-4.5" />
                    </a>
                ))}
            </div>
        </div>
    );
};

export default memo(FooterSocial);
