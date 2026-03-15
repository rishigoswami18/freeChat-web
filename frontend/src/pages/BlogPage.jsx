import React from "react";
import DynamicSEO from "../components/DynamicSEO";
import { Link } from "react-router-dom";
import { Calendar, User, ArrowRight, Star } from "lucide-react";
import { motion } from "framer-motion";

const BlogPage = () => {
    const posts = [
        {
            id: 1,
            title: "How AI Girlfriend Apps Work: The Science of Digital Connection",
            excerpt: "Explore the technology behind AI companions and how BondBeyond is leading the charge in virtual relationship reality.",
            author: "Rishi Goswami",
            date: "Mar 14, 2026",
            category: "Technology",
            image: "https://www.freechatweb.in/ai-coach.png"
        },
        {
            id: 2,
            title: "The Future of AI Relationships: Why Virtual Partners are Here to Stay",
            excerpt: "From emotional support to personalized coaching, discover how AI partners are bridging the gap in modern social life.",
            author: "Hrishikesh Giri",
            date: "Mar 12, 2026",
            category: "Lifestyle",
            image: "https://www.freechatweb.in/ai-bestfriend.png"
        },
        {
            id: 3,
            title: "How BondBeyond is Changing Social Media for the Better",
            excerpt: "Developer Hrishikesh Giri explains the vision behind a social network that prioritizes privacy and real human connection.",
            author: "Team BondBeyond",
            date: "Mar 10, 2026",
            category: "Vision",
            image: "https://www.freechatweb.in/logo.png"
        }
    ];

    return (
        <div className="min-h-screen bg-base-100 py-20">
            <DynamicSEO 
                title="BondBeyond Blog | AI Relationships, Virtual Partners & Tech Insights"
                description="Read the latest from BondBeyond. Expert insights on AI girlfriend apps, the future of social media, and updates from founder Hrishikesh Giri."
                keywords="AI relationship blog, virtual partner insights, BondBeyond news, AI social media articles"
            />

            <div className="container mx-auto px-4 max-w-6xl">
                <div className="text-center mb-20">
                    <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tighter uppercase italic">
                        The <span className="text-primary italic">BondBeyond</span> Journal
                    </h1>
                    <p className="text-xl opacity-60 max-w-2xl mx-auto">
                        Deep dives into the intersection of Artificial Intelligence, 
                        human emotion, and the next version of the social web.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {posts.map((post, i) => (
                        <motion.article 
                            key={post.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="bg-base-200 border border-base-content/5 rounded-[2.5rem] overflow-hidden group hover:shadow-2xl transition-all"
                        >
                            <div className="h-64 overflow-hidden relative">
                                <img 
                                    src={post.image} 
                                    alt={post.title} 
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                />
                                <div className="absolute top-4 left-4">
                                     <span className="badge badge-primary font-bold uppercase tracking-widest text-[10px] p-4">{post.category}</span>
                                </div>
                            </div>
                            
                            <div className="p-10">
                                <div className="flex items-center gap-4 text-xs opacity-40 uppercase font-black tracking-widest mb-6">
                                    <div className="flex items-center gap-1"><User className="size-3" /> {post.author}</div>
                                    <div className="flex items-center gap-1"><Calendar className="size-3" /> {post.date}</div>
                                </div>
                                <h2 className="text-2xl font-black mb-4 leading-tight group-hover:text-primary transition-colors italic uppercase">
                                    {post.title}
                                </h2>
                                <p className="opacity-60 leading-relaxed mb-8">
                                    {post.excerpt}
                                </p>
                                <button className="flex items-center gap-2 font-bold text-sm tracking-widest uppercase italic group/btn">
                                    Read Article <ArrowRight className="size-4 group-hover/btn:translate-x-2 transition-transform" />
                                </button>
                            </div>
                        </motion.article>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default BlogPage;
