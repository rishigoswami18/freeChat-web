import React, { memo } from "react";
import { Link } from "react-router-dom";

const FooterSection = ({ title, links }) => {
    return (
        <nav className="space-y-4" aria-labelledby={`footer-heading-${title.toLowerCase()}`}>
            <h3 
                id={`footer-heading-${title.toLowerCase()}`}
                className="font-bold uppercase text-[10px] tracking-widest opacity-40"
            >
                {title}
            </h3>
            <ul className="flex flex-col gap-2.5">
                {links.map((link, idx) => (
                    <li key={idx}>
                        <Link 
                            to={link.path} 
                            className="group text-sm hover:text-primary flex items-center gap-2 transition-colors w-fit"
                        >
                            {link.icon && <link.icon className="size-4 opacity-50 group-hover:opacity-100 transition-opacity" />}
                            <span className="link-hover-underline">{link.label}</span>
                        </Link>
                    </li>
                ))}
            </ul>
        </nav>
    );
};

export default memo(FooterSection);
