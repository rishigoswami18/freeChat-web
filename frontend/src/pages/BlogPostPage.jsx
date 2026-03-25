import React, { useMemo, useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { blogPosts } from "../lib/blogData";
import DynamicSEO from "../components/DynamicSEO";
import { Calendar, User, ArrowLeft, Share2, Bookmark, ArrowRight } from "lucide-react";
import { motion, useScroll, useSpring } from "framer-motion";

const BlogPostPage = () => {
    const { slug } = useParams();
    const { scrollYProgress } = useScroll();
    const scaleX = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });
    
    const post = useMemo(() => {
        return blogPosts.find(p => p.slug === slug);
    }, [slug]);

    const relatedPosts = useMemo(() => {
        return blogPosts.filter(p => p.slug !== slug).slice(0, 2);
    }, [slug]);

    if (!post) {
        return (
            <div className="min-h-screen bg-base-100 flex flex-col items-center justify-center p-4">
                <h1 className="text-4xl font-black mb-4">Post Not Found</h1>
                <Link to="/blog" className="btn btn-primary">Back to Blog</Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-base-100">
            <DynamicSEO 
                title={`${post.title} | Zyro AI Insights`}
                description={post.description}
                keywords={post.keywords}
                ogImage={post.image}
            />

            {/* Scroll Progress Bar */}
            <motion.div 
                className="fixed top-0 left-0 right-0 h-1.5 bg-primary z-[100] origin-left"
                style={{ scaleX }}
            />

            <div className="max-w-4xl mx-auto px-4 py-20">
                <Link to="/blog" className="flex items-center gap-2 text-sm font-bold opacity-40 hover:opacity-100 hover:text-primary transition-all mb-12 uppercase tracking-widest">
                    <ArrowLeft className="size-4" /> Back to Journal
                </Link>

                <motion.header 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-12"
                >
                    <div className="badge badge-primary font-bold uppercase tracking-widest text-[10px] p-4 mb-6">{post.category}</div>
                    <h1 className="text-4xl md:text-6xl font-black mb-8 leading-tight tracking-tighter uppercase italic">
                        {post.title}
                    </h1>
                    
                    <div className="flex flex-wrap items-center gap-6 text-sm opacity-50 font-black uppercase tracking-widest border-b border-base-content/10 pb-8">
                        <div className="flex items-center gap-2">
                             <div className="size-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                                 <User className="size-4" />
                             </div>
                             {post.author}
                        </div>
                        <div className="flex items-center gap-2"><Calendar className="size-4" /> {post.date}</div>
                        <div className="ml-auto flex gap-4">
                            <button className="hover:text-primary transition-colors hover:scale-110 active:scale-90 transition-all"><Share2 className="size-5" /></button>
                            <button className="hover:text-primary transition-colors hover:scale-110 active:scale-90 transition-all"><Bookmark className="size-5" /></button>
                        </div>
                    </div>
                </motion.header>

                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="rounded-[3rem] overflow-hidden mb-16 shadow-2xl border border-base-content/5"
                >
                    <img src={post.image} alt={post.title} className="w-full aspect-video object-cover" />
                </motion.div>

                <motion.article 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="prose prose-xl dark:prose-invert max-w-none prose-headings:font-black prose-headings:uppercase prose-headings:italic prose-a:text-primary prose-strong:text-primary/90"
                >
                    <div dangerouslySetInnerHTML={{ __html: post.content }} />
                </motion.article>

                {/* Author Selection */}
                <footer className="mt-20 pt-10 border-t border-base-content/10">
                    <div className="bg-base-200 p-10 rounded-[3rem] border border-base-content/5 flex flex-col md:flex-row gap-8 items-center mb-16">
                        <div className="size-20 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0 text-3xl font-black italic">
                            RG
                        </div>
                        <div className="text-center md:text-left">
                            <h4 className="text-xl font-bold mb-2 uppercase italic">About the Team</h4>
                            <p className="opacity-60 leading-relaxed mb-4">
                                This article was written by the technical team at Zyro, 
                                specializing in the intersection of AI architecture and human communication.
                            </p>
                            <Link to="/founder" className="text-primary font-bold hover:underline">Learn more about the vision →</Link>
                        </div>
                    </div>

                    {/* Recommended Reading */}
                    <div className="mb-20">
                        <h3 className="text-2xl font-black uppercase italic mb-8 opacity-40 tracking-tighter">Recommended Reading</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {relatedPosts.map(rp => (
                                <Link 
                                    to={`/blog/${rp.slug}`} 
                                    key={rp.id}
                                    className="group bg-base-100 border border-base-content/5 p-8 rounded-[2.5rem] hover:bg-base-200 transition-all hover:shadow-xl"
                                >
                                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary mb-4">
                                        {rp.category} <ArrowRight className="size-3 group-hover:translate-x-1 transition-transform" />
                                    </div>
                                    <h4 className="text-lg font-black uppercase italic leading-tight group-hover:text-primary transition-colors">{rp.title}</h4>
                                </Link>
                            ))}
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    );
};


export default BlogPostPage;
