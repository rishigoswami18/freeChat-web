import { memo } from "react";
import { motion } from "framer-motion";
import { Shield, Loader2 } from "lucide-react";

/**
 * CoupleVerification
 * Call to action for users to purchase verified badge
 */
const CoupleVerification = memo(({ isVerified, onBuyVerification, isBuying }) => {
    if (isVerified) return null;

    return (
        <motion.div
            whileHover={{ scale: 1.01 }}
            className="card bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-3xl p-5 flex flex-row items-center justify-between shadow-lg mb-6"
        >
            <div className="flex items-center gap-4">
                <div className="size-12 bg-primary rounded-2xl flex items-center justify-center text-primary-content shadow-lg shadow-primary/20">
                    <Shield className="size-7" />
                </div>
                <div>
                    <h3 className="font-black text-sm uppercase italic tracking-tighter">Get Verified</h3>
                    <p className="text-[10px] opacity-60">Unlock trust & visibility for 1000 Gems.</p>
                </div>
            </div>
            <button
                onClick={() => {
                    const confirmBuy = window.confirm("Spend 1000 Gems for verification?");
                    if (confirmBuy) onBuyVerification();
                }}
                disabled={isBuying}
                className="btn btn-primary btn-sm rounded-xl font-bold uppercase text-[10px]"
            >
                {isBuying ? <Loader2 className="size-3 animate-spin" /> : "Verify Now"}
            </button>
        </motion.div>
    );
});

CoupleVerification.displayName = "CoupleVerification";
export default CoupleVerification;
