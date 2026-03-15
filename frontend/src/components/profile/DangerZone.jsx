import { memo, useState } from "react";
import { Trash2, AlertTriangle, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

const ConfirmDeleteModal = ({ isOpen, onClose, onConfirm }) => {
    const [confirmText, setConfirmText] = useState("");

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <motion.div 
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-base-100 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-error/20 flex flex-col"
            >
                <div className="p-4 sm:p-6 border-b border-error/10 flex justify-between items-center bg-error/5">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-error/10 rounded-xl text-error">
                            <AlertTriangle className="size-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold tracking-tight text-error">Delete Account</h2>
                        </div>
                    </div>
                </div>

                <div className="p-6 space-y-4">
                    <p className="font-semibold text-base-content/80">
                        This action CANNOT be undone.
                    </p>
                    <p className="text-sm opacity-70">
                        This will permanently delete your account, posts, messages, and profile.
                        To confirm, please type <strong className="text-error select-none">DELETE</strong> below.
                    </p>
                    
                    <input
                        type="text"
                        placeholder="Type DELETE"
                        value={confirmText}
                        onChange={(e) => setConfirmText(e.target.value)}
                        className="input input-bordered w-full border-error/30 focus:border-error focus:ring-error rounded-xl bg-base-200"
                    />

                    <div className="flex gap-3 pt-4 border-t border-base-300">
                        <button 
                            className="btn btn-ghost flex-1 rounded-xl"
                            onClick={() => {
                                setConfirmText("");
                                onClose();
                            }}
                        >
                            Cancel
                        </button>
                        <button 
                            className="btn btn-error flex-1 rounded-xl shadow-lg shadow-error/20"
                            disabled={confirmText !== "DELETE"}
                            onClick={onConfirm}
                        >
                            <Trash2 className="size-4" /> Permanently Delete
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};


const DangerZone = memo(({ onDeleteAccount }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <div className="mt-12 pt-8">
            <div className="section-divider" />
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2 section-heading border-error/20">
                <Trash2 className="text-error" />
                Danger Zone
            </h2>

            <div className="bg-error/5 border border-error/10 p-6 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="text-center sm:text-left">
                    <h3 className="font-bold text-error">Delete Account</h3>
                    <p className="text-sm opacity-60">Permanently delete your account and all associated data.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="btn btn-error btn-sm rounded-xl font-bold px-6 shadow-lg shadow-error/10 hover:shadow-error/20"
                >
                    Delete Account
                </button>
            </div>

            <AnimatePresence>
                <ConfirmDeleteModal 
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onConfirm={onDeleteAccount}
                />
            </AnimatePresence>
        </div>
    );
});

DangerZone.displayName = "DangerZone";

export default DangerZone;
