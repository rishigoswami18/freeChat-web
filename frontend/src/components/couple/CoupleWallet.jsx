import { memo } from "react";
import { Link } from "react-router-dom";
import { Gem, TrendingUp, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";

/**
 * CoupleWallet
 * Renders gem balances and earning summaries.
 */
const CoupleWallet = memo(({ authUser }) => {
    return (
        <div className="grid grid-cols-2 gap-3 mb-6">
            <Link
                to="/gem-shop"
                className="card bg-base-200 border border-yellow-500/10 p-4 rounded-3xl shadow-sm group hover:border-yellow-500/30 transition-all active:scale-95"
            >
                <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                        <Gem className="size-4 text-yellow-500" />
                        <span className="text-[10px] font-black opacity-40 uppercase tracking-widest text-base-content">My Gems</span>
                    </div>
                    <ArrowRight className="size-3 text-primary opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                </div>
                <p className="text-2xl font-black italic">{authUser?.gems || 0}</p>
                <span className="text-[9px] text-primary font-bold uppercase mt-2 group-hover:underline">Top Up &rarr;</span>
            </Link>
            <div className="card bg-base-200 border border-success/10 p-4 rounded-3xl shadow-sm group hover:border-success/30 transition-all">
                <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="size-4 text-success" />
                    <span className="text-[10px] font-black opacity-40 uppercase tracking-widest">Earnings</span>
                </div>
                <p className="text-2xl font-black italic">₹{authUser?.earnings?.toFixed(2) || "0.00"}</p>
                <button onClick={() => toast("Payout feature coming soon!", { position: "bottom-center" })} className="text-[9px] text-success font-bold uppercase mt-2 hover:underline">Withdraw -&gt;</button>
            </div>
        </div>
    );
});

CoupleWallet.displayName = "CoupleWallet";
export default CoupleWallet;
