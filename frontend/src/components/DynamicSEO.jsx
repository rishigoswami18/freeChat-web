import { useEffect } from "react";

/**
 * DynamicSEO — Senior Growth Component
 * Injects meta tags and structured data into the head at runtime.
 */
const DynamicSEO = ({ title, description, keywords, canonical, schema, ogImage }) => {
    useEffect(() => {
        if (title) document.title = title;

        const updateMeta = (name, content, attr = "name") => {
            if (!content) return;
            let meta = document.querySelector(`meta[${attr}="${name}"]`);
            if (meta) {
                meta.setAttribute("content", content);
            } else {
                meta = document.createElement("meta");
                meta.setAttribute(attr, name);
                meta.setAttribute("content", content);
                document.head.appendChild(meta);
            }
        };

        updateMeta("description", description);
        updateMeta("keywords", keywords);
        updateMeta("og:title", title, "property");
        updateMeta("og:description", description, "property");
        updateMeta("og:image", ogImage || "https://www.freechatweb.in/og-image.png", "property");
        updateMeta("twitter:title", title);
        updateMeta("twitter:description", description);

        // Canonical
        let link = document.querySelector("link[rel='canonical']");
        if (link) {
            link.setAttribute("href", canonical || window.location.href);
        }

        // Schema.org Logic
        if (schema) {
            const scriptId = "dynamic-json-ld";
            let script = document.getElementById(scriptId);
            if (!script) {
                script = document.createElement("script");
                script.id = scriptId;
                script.type = "application/ld+json";
                document.head.appendChild(script);
            }
            script.text = JSON.stringify(schema);
        }
    }, [title, description, keywords, canonical, schema, ogImage]);

    return null;
};

export default DynamicSEO;
