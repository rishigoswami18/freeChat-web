import { memo } from "react";
import { CreditCard, Shield, Check, Loader2 } from "lucide-react";

/**
 * Pure display block for initializing a purchase checkout
 */
const PurchaseMembershipCard = memo(({ features, onPayment, isProcessing }) => {
    return (
        <section 
            className="space-y-6 animate-in slide-in-from-bottom-4 duration-500"
            aria-label="Purchase Premium Subscription"
        >
            <div className="card bg-base-200 border border-primary/20 shadow-xl relative overflow-hidden focus-within:ring-2 focus-within:ring-primary/40">
                {/* Glow effects mapped securely behind layout points */}
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl" aria-hidden="true"></div>
                <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-secondary/10 rounded-full blur-3xl" aria-hidden="true"></div>

                <div className="card-body items-center text-center relative z-10">
                    
                    {/* Price Node */}
                    <div className="mb-4" aria-label="Subscription Cost">
                        <div className="flex items-baseline justify-center gap-1">
                            <span className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
                                ₹49
                            </span>
                            <span className="text-sm opacity-50">/month</span>
                        </div>
                        <p className="text-xs opacity-50 mt-1 uppercase tracking-widest font-black">Cancel anytime</p>
                    </div>

                    {/* Features block */}
                    <div className="w-full max-w-xs space-y-3 mb-6" role="list" aria-label="Premium Benefits">
                        {features.map((feature, i) => (
                            <div
                                key={i}
                                role="listitem"
                                className={`flex items-center gap-3 text-left text-sm ${
                                    feature.highlight ? "font-semibold text-primary" : "opacity-80"
                                }`}
                            >
                                <div className={`p-1 rounded-full shrink-0 ${feature.highlight ? "bg-primary/20 shadow-sm shadow-primary/20" : "bg-base-300"}`}>
                                    <feature.icon className={`size-3.5 ${feature.highlight ? "text-primary" : ""}`} aria-hidden="true" />
                                </div>
                                <span className="leading-tight">{feature.text}</span>
                            </div>
                        ))}
                    </div>

                    {/* Action Block */}
                    <button
                        onClick={onPayment}
                        disabled={isProcessing}
                        aria-busy={isProcessing}
                        aria-label="Initiate ₹49 Monthly Subscription Payment via Razorpay"
                        className="btn btn-primary btn-wide gap-2 shadow-lg shadow-primary/25 hover:scale-105 transition-all w-full h-14 rounded-2xl"
                    >
                        {isProcessing ? (
                            <>
                                <Loader2 className="size-5 animate-spin" aria-hidden="true" />
                                <span>Securing Server...</span>
                            </>
                        ) : (
                            <>
                                <CreditCard className="size-5" aria-hidden="true" />
                                <span className="font-bold tracking-tight">Subscribe Now — ₹49</span>
                            </>
                        )}
                    </button>

                    {/* Trust Seals */}
                    <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 mt-6 text-[10px] font-black uppercase tracking-widest opacity-40" aria-label="Secure processing guarantees">
                        <div className="flex items-center gap-1.5" title="Payments secured by Razorpay 256-bit encryption">
                            <Shield className="size-3.5 text-accent" aria-hidden="true" />
                            <span>100% Secure Checkout</span>
                        </div>
                        <div className="flex items-center gap-1.5" title="No commitments, cancel via your portal instantly">
                            <Check className="size-3.5 text-success/80" aria-hidden="true" />
                            <span>No Hidden Fees</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
});

PurchaseMembershipCard.displayName = "PurchaseMembershipCard";

export default PurchaseMembershipCard;
