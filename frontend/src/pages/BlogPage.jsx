import React from "react";
import DynamicSEO from "../components/DynamicSEO";
import { Link } from "react-router-dom";
import { Calendar, User, ArrowRight, Star } from "lucide-react";
import { motion } from "framer-motion";

import { blogPosts } from "../lib/blogData";

const BlogPage = () => {
    // We can filter or modify posts if needed, or just use them directly
    const posts = blogPosts;

    return (
        <div className="min-h-screen bg-base-100 py-20">
            <DynamicSEO 
                title="Zyro Blog | AI Relationships, Virtual Partners & Tech Insights"
                description="Read the latest from Zyro. Expert insights on AI girlfriend apps, the future of social media, and updates from founder Hrishikesh Giri."
                keywords="AI relationship blog, virtual partner insights, Zyro news, AI social media articles"
            />

            <div className="container mx-auto px-4 max-w-6xl">
                <div className="text-center mb-20">
                    <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tighter uppercase italic">
                        The <span className="text-primary italic">Zyro</span> Journal
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
                            <Link to={`/blog/${post.slug || "post-" + post.id}`}>
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
                                        {post.description}
                                    </p>
                                    <div className="flex items-center gap-2 font-bold text-sm tracking-widest uppercase italic group/btn text-primary">
                                        Read Article <ArrowRight className="size-4 group-hover/btn:translate-x-2 transition-transform" />
                                    </div>
                                </div>
                            </Link>
                        </motion.article>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default BlogPage;
