import React from 'react';
import { PrivyProvider, usePrivy } from '@privy-io/react-auth';
import { motion } from 'framer-motion';
import { Wallet, ShieldCheck, Zap, ArrowRight } from 'lucide-react';

/**
 * Web3AuthContainer — The entry point for Decentralized Zyro.
 * Uses Privy to bridge the gap between Web2 emails and Web3 wallets.
 */

const LoginScreen = () => {
    const { login, authenticated, user } = usePrivy();

    return (
        <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 font-outfit">
            <div className="max-w-md w-full space-y-12 text-center">
                {/* Branding */}
                <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="space-y-4"
                >
                    <div className="size-20 bg-indigo-600 rounded-[2.5rem] mx-auto flex items-center justify-center shadow-2xl shadow-indigo-500/40">
                        <ShieldCheck className="size-10 text-white" />
                    </div>
                    <h1 className="text-4xl font-black tracking-tighter text-white">Zyro 2.0</h1>
                    <p className="text-white/40 font-bold uppercase tracking-[0.2em] text-[10px]">The Decentralized Social Layer</p>
                </motion.div>

                {/* Auth Card */}
                <div className="bg-white/5 border border-white/10 p-10 rounded-[3rem] backdrop-blur-3xl space-y-8">
                    <div className="space-y-2">
                        <h2 className="text-xl font-bold">Connect Your Identity</h2>
                        <p className="text-sm text-white/30 font-medium">No passwords. Just your wallet or social account. Your data, your $BOND.</p>
                    </div>

                    {!authenticated ? (
                        <button 
                            onClick={login}
                            className="w-full py-5 bg-white text-black rounded-3xl font-black text-lg hover:scale-[1.02] transition-all flex items-center justify-center gap-3 shadow-xl"
                        >
                            Start Mining $BOND <ArrowRight className="size-5" />
                        </button>
                    ) : (
                        <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-2xl">
                            <p className="text-green-400 font-bold flex items-center justify-center gap-2">
                                <Zap className="size-4" /> Connected: {user?.wallet?.address?.substring(0, 10)}...
                            </p>
                        </div>
                    )}
                </div>

                {/* Value Props */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-6 bg-white/5 rounded-[2rem] border border-white/5">
                        <Wallet className="size-5 text-indigo-400 mb-2" />
                        <h4 className="text-xs font-black uppercase tracking-widest text-white/40">Ownership</h4>
                        <p className="text-sm font-bold">Zero Platform Tax</p>
                    </div>
                    <div className="p-6 bg-white/5 rounded-[2rem] border border-white/5">
                        <Zap className="size-5 text-orange-400 mb-2" />
                        <h4 className="text-xs font-black uppercase tracking-widest text-white/40">Rewards</h4>
                        <p className="text-sm font-bold">Earn $BOND Daily</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const Web3AuthWrapper = ({ children }) => {
    return (
        <PrivyProvider
            appId={import.meta.env.VITE_PRIVY_APP_ID || "insert_app_id"}
            config={{
                loginMethods: ['email', 'wallet', 'google', 'apple'],
                appearance: {
                    theme: 'dark',
                    accentColor: '#6366f1',
                    showWalletLoginFirst: true,
                },
                embeddedWallets: {
                    createOnLogin: 'users-without-wallets',
                },
            }}
        >
            {children}
        </PrivyProvider>
    );
};

export default LoginScreen;
