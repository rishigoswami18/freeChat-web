import React from 'react';
import { Link } from 'react-router-dom';

const RichText = ({ text, className = "" }) => {
    if (!text) return null;

    // Pattern for hashtags, mentions, and URLs
    const regex = /([#@][\w]+)|(https?:\/\/[^\s]+)/g;
    
    const parts = text.split(regex);
    
    return (
        <span className={className}>
            {parts.map((part, i) => {
                if (!part) return null;
                
                if (part.startsWith('#')) {
                    return (
                        <Link 
                            key={i} 
                            to={`/search?q=${encodeURIComponent(part)}`}
                            className="text-[#f97316] hover:underline font-bold"
                        >
                            {part}
                        </Link>
                    );
                }
                
                if (part.startsWith('@')) {
                    return (
                        <Link 
                            key={i} 
                            to={`/search?q=${encodeURIComponent(part.substring(1))}`}
                            className="text-[#3b82f6] hover:underline font-bold"
                        >
                            {part}
                        </Link>
                    );
                }

                if (part.startsWith('http')) {
                    return (
                        <a 
                            key={i} 
                            href={part} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-[#10b981] hover:underline"
                        >
                            {part}
                        </a>
                    );
                }

                return <span key={i}>{part}</span>;
            })}
        </span>
    );
};

export default RichText;
