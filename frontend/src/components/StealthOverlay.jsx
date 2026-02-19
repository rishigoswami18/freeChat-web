import React, { useEffect, useState } from "react";
import { useStealthStore } from "../store/useStealthStore";
import { Book, Search, History, Star, Languages, Menu } from "lucide-react";

const StealthOverlay = ({ children }) => {
    const { isStealthMode, toggleStealthMode, panicShortcut } = useStealthStore();
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === panicShortcut) {
                e.preventDefault();
                toggleStealthMode();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [panicShortcut, toggleStealthMode]);

    useEffect(() => {
        let lastTap = 0;
        let tapCount = 0;

        const handleTouchStart = (e) => {
            const now = Date.now();
            if (now - lastTap < 400) {
                tapCount++;
            } else {
                tapCount = 1;
            }
            lastTap = now;

            if (tapCount === 3) {
                toggleStealthMode();
                tapCount = 0;
            }
        };

        window.addEventListener("touchstart", handleTouchStart);
        return () => window.removeEventListener("touchstart", handleTouchStart);
    }, [toggleStealthMode]);

    const dictionaryEntries = [
        { word: "Linguistics", type: "noun", definition: "The scientific study of language and its structure." },
        { word: "Syntax", type: "noun", definition: "The arrangement of words and phrases to create well-formed sentences." },
        { word: "Semantics", type: "noun", definition: "The branch of linguistics and logic concerned with meaning." },
        { word: "Phonology", type: "noun", definition: "The system of contrastive relationships among the speech sounds." },
    ];

    return (
        <>
            {/* 
        Children are always rendered to keep the app state (like video calls) 
        alive in the background when Stealth Mode is active.
      */}
            {children}

            {isStealthMode && (
                <div className="fixed inset-0 z-[99999] bg-base-100 flex flex-col font-sans text-base-content overflow-hidden animate-in fade-in duration-200">
                    {/* Educational App Header */}
                    <header className="border-b bg-base-200 p-4 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Book className="text-primary size-6" />
                            <h1 className="text-lg font-bold tracking-tight">LexiLearn Dictionary</h1>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="hidden sm:flex items-center gap-2 text-xs opacity-60">
                                <span className="badge badge-sm badge-outline">Premium</span>
                                <span>Last synced: 2m ago</span>
                            </div>
                            <button
                                className="btn btn-ghost btn-sm btn-circle"
                                onDoubleClick={toggleStealthMode} // Secret exit
                                title="Double click to reveal"
                            >
                                <Menu className="size-5" />
                            </button>
                        </div>
                    </header>

                    <div className="flex flex-1 overflow-hidden">
                        {/* Sidebar */}
                        <aside className="hidden md:flex flex-col w-64 border-r bg-base-100 p-4 space-y-6">
                            <nav className="space-y-1">
                                <button className="flex items-center gap-3 w-full p-2 rounded-lg bg-primary/10 text-primary font-medium">
                                    <Search className="size-4" /> Search
                                </button>
                                <button className="flex items-center gap-3 w-full p-2 rounded-lg hover:bg-base-200 transition-colors">
                                    <History className="size-4" /> History
                                </button>
                                <button className="flex items-center gap-3 w-full p-2 rounded-lg hover:bg-base-200 transition-colors">
                                    <Star className="size-4" /> Favorites
                                </button>
                            </nav>

                            <div className="pt-6 border-t">
                                <h3 className="text-xs font-semibold uppercase opacity-50 mb-3 px-2">Your Courses</h3>
                                <div className="space-y-2">
                                    <div className="p-3 bg-base-200 rounded-xl space-y-2">
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="font-medium">English Grammar</span>
                                            <span className="opacity-60">75%</span>
                                        </div>
                                        <progress className="progress progress-primary w-full h-1.5" value="75" max="100"></progress>
                                    </div>
                                    <div className="p-3 bg-base-200 rounded-xl space-y-2">
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="font-medium">Vocabulary 101</span>
                                            <span className="opacity-60">40%</span>
                                        </div>
                                        <progress className="progress progress-secondary w-full h-1.5" value="40" max="100"></progress>
                                    </div>
                                </div>
                            </div>
                        </aside>

                        {/* Main Content Area */}
                        <main className="flex-1 overflow-y-auto p-4 sm:p-8 bg-base-100 max-w-4xl mx-auto w-full">
                            <div className="relative mb-8">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Search className="size-5 opacity-40" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Search dictionary..."
                                    className="input input-bordered w-full pl-10 h-12 bg-base-200 border-none focus:ring-2 focus:ring-primary/20 transition-all rounded-2xl"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>

                            <div className="space-y-8">
                                <div>
                                    <h2 className="text-sm font-semibold uppercase opacity-50 mb-4 tracking-wider">Definition of the Day</h2>
                                    <div className="card bg-base-200 overflow-hidden">
                                        <div className="p-6">
                                            <div className="flex items-baseline gap-3 mb-2">
                                                <h3 className="text-3xl font-bold italic">Antigravity</h3>
                                                <span className="text-primary font-medium">noun</span>
                                            </div>
                                            <p className="text-lg opacity-80 leading-relaxed">
                                                A hypothetical force that would oppose gravity and cause things to be weightless or to move away from a massive object.
                                            </p>
                                            <div className="mt-4 pt-4 border-t flex items-center gap-6 text-sm opacity-60">
                                                <span className="flex items-center gap-1.5"><Languages className="size-4" /> [an-tee-grav-i-tee]</span>
                                                <span>Origin: Latin & Greek</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h2 className="text-sm font-semibold uppercase opacity-50 mb-4 tracking-wider">Recent Searches</h2>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {dictionaryEntries.map((entry, i) => (
                                            <div key={i} className="p-4 border rounded-2xl hover:bg-base-200 cursor-pointer transition-colors group">
                                                <div className="flex items-center justify-between mb-1">
                                                    <h4 className="font-bold group-hover:text-primary transition-colors">{entry.word}</h4>
                                                    <span className="text-[10px] uppercase font-bold opacity-40 px-1.5 py-0.5 border rounded-md">{entry.type}</span>
                                                </div>
                                                <p className="text-sm opacity-70 line-clamp-2">{entry.definition}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </main>
                    </div>

                    {/* Footer / Status Bar to make it look legit */}
                    <footer className="bg-base-200 border-t px-4 py-2 flex items-center justify-between text-[11px] opacity-50">
                        <div>v4.2.0 Educational Licensing | Terms of Service</div>
                        <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1"><div className="size-1.5 rounded-full bg-success"></div> Sync Online</span>
                            <span>© 2026 Academic Press</span>
                        </div>
                    </footer>
                </div>
            )}
        </>
    );
};

export default StealthOverlay;
