import { memo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Heart, Sparkles, PenLine, Clock, Loader2, Waves } from "lucide-react";

/**
 * CoupleRomanticNote
 * Handles state logic purely inside component, offloading from page re-renders.
 */
const CoupleRomanticNote = memo(({ romanticNote, romanticNoteLastUpdated, onSaveNote, isUpdatngNote }) => {
    const [isEditingNote, setIsEditingNote] = useState(false);
    const [noteDraft, setNoteDraft] = useState("");

    // Update draft on external changes when not actively editing
    useEffect(() => {
        if (!isEditingNote) {
            setNoteDraft(romanticNote || "");
        }
    }, [romanticNote, isEditingNote]);

    const handleSave = () => {
        onSaveNote(noteDraft);
        setIsEditingNote(false);
    };

    return (
        <div className="romantic-card-luxe rounded-[40px] overflow-hidden group relative p-1">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
                <Sparkles className="size-32 text-red-500" />
            </div>
            
            <div className="card-body p-8">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-4">
                        <div className="size-14 bg-red-500/20 rounded-[22px] flex items-center justify-center text-red-500 shadow-2xl shadow-red-500/20 luxe-shadow-pink">
                            <Heart className="size-7 fill-current" />
                        </div>
                        <div>
                            <h3 className="font-black text-sm uppercase tracking-[0.3em] opacity-80 romantic-gradient-text">Sacred Whisper</h3>
                            <p className="text-[10px] opacity-40 font-black uppercase tracking-widest mt-0.5">Your soul-to-soul message</p>
                        </div>
                    </div>
                    {!isEditingNote && (
                        <button
                            onClick={() => setIsEditingNote(true)}
                            className="btn btn-ghost btn-md text-primary gap-2 hover:bg-primary/10 rounded-2xl active:scale-95 transition-all"
                        >
                            <PenLine className="size-4" />
                            <span className="text-xs font-black uppercase tracking-widest">
                                {romanticNote ? "Change Whisper" : "Write Soul Note"}
                            </span>
                        </button>
                    )}
                </div>

                {isEditingNote ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        <textarea
                            className="textarea textarea-bordered w-full bg-base-100/50 backdrop-blur-xl border-2 border-primary/20 focus:border-primary text-xl min-h-[180px] rounded-[32px] resize-none italic font-serif p-8 shadow-2xl placeholder:opacity-30"
                            placeholder="Whisper something eternal... ❤️"
                            value={noteDraft}
                            onChange={(e) => setNoteDraft(e.target.value)}
                            maxLength={500}
                        />
                        <div className="flex justify-end gap-3">
                            <button 
                                onClick={() => setIsEditingNote(false)} 
                                className="btn btn-ghost btn-md font-black uppercase tracking-widest rounded-2xl"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleSave} 
                                disabled={isUpdatngNote} 
                                className="btn romantic-gradient-bg text-white border-none btn-md px-10 rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all gap-2"
                            >
                                {isUpdatngNote ? <Loader2 className="size-5 animate-spin" /> : <Heart className="size-5 fill-current" />}
                                <span className="font-black uppercase tracking-widest">Seal with Love</span>
                            </button>
                        </div>
                    </motion.div>
                ) : (
                    <div className="relative group/note">
                        {romanticNote ? (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="p-10 bg-gradient-to-br from-red-500/5 via-transparent to-pink-500/5 rounded-[32px] border-2 border-white/5 italic text-center relative overflow-hidden luxe-shadow-pink"
                            >
                                <p className="text-2xl sm:text-4xl font-medium leading-relaxed font-serif text-base-content/90 tracking-tight drop-shadow-sm">
                                    “{romanticNote}”
                                </p>
                                <div className="mt-8 flex items-center justify-center gap-3 text-[10px] opacity-40 uppercase font-black tracking-[0.3em] pt-6 border-t border-white/5">
                                    <Clock className="size-4" />
                                    ETERNALIZED {new Date(romanticNoteLastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(romanticNoteLastUpdated).toLocaleDateString([], { month: 'long', day: 'numeric' })}
                                </div>
                            </motion.div>
                        ) : (
                            <div className="py-16 text-center opacity-40 italic flex flex-col items-center gap-5 bg-white/5 rounded-[32px] border-2 border-dashed border-white/10">
                                <div className="size-20 bg-primary/10 rounded-full flex items-center justify-center">
                                    <Waves className="size-10 text-primary animate-pulse" />
                                </div>
                                <p className="text-lg font-bold uppercase tracking-widest">Silence awaits your soul's message</p>
                                <button 
                                    onClick={() => setIsEditingNote(true)} 
                                    className="btn romantic-gradient-bg text-white border-none px-8 rounded-2xl uppercase font-black tracking-[0.2em] hover:scale-105 active:scale-95 transition-all"
                                >
                                    Start Your Story
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
});

CoupleRomanticNote.displayName = "CoupleRomanticNote";
export default CoupleRomanticNote;
