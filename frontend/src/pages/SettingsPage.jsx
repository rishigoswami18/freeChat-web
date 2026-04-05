import { useState, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
    User, Shield, Bell, Globe, Trash2, Save, ChevronRight,
    Lock, EyeOff, Palette, Settings as SettingsIcon
} from "lucide-react";
import useAuthUser from "../hooks/useAuthUser";
import { updateProfile, deleteAccount, changePassword } from "../lib/api";
import { useThemeStore } from "../store/useThemeStore";
import toast from "react-hot-toast";

const SettingsSection = ({ title, description, icon: Icon, children }) => (
    <motion.div 
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 sm:p-8 space-y-6"
    >
        <div className="flex items-start gap-4">
            <div className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-400">
                <Icon size={20} />
            </div>
            <div className="space-y-1">
                <h3 className="text-lg font-bold tracking-tight">{title}</h3>
                <p className="text-[11px] text-white/30 font-medium">{description}</p>
            </div>
        </div>
        <div className="pt-2">{children}</div>
    </motion.div>
);

const SettingsPage = () => {
    const { authUser } = useAuthUser();
    const [activeCategory, setActiveCategory] = useState("account");
    const { theme: currentTheme, setTheme } = useThemeStore();
    const [isUpdating, setIsUpdating] = useState(false);
    const [formData, setFormData] = useState({
        fullName: authUser?.fullName || "",
        username: authUser?.username || "",
        bio: authUser?.bio || ""
    });

    const handleUpdateProfile = async () => {
        try {
            setIsUpdating(true);
            await updateProfile(formData);
            toast.success("Profile updated successfully");
        } catch (err) {
            toast.error("Failed to update profile");
        } finally {
            setIsUpdating(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (!window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) return;
        try {
            await deleteAccount();
            window.location.href = "/";
        } catch (err) {
            toast.error("Failed to delete account");
        }
    };

    const categories = [
        { id: "account", label: "Account", icon: User },
        { id: "privacy", label: "Privacy", icon: Shield },
        { id: "appearance", label: "Theme", icon: Palette },
        { id: "danger", label: "Danger", icon: Trash2 },
    ];

    return (
        <div className="min-h-screen pb-24 bg-[#020617] text-white">
            {/* Header */}
            <div className="sticky top-0 z-30 bg-[#020617]/80 backdrop-blur-xl border-b border-white/5 px-6 py-8 sm:px-12">
                <div className="max-w-4xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <SettingsIcon size={16} className="text-indigo-400" />
                            <span className="text-[10px] font-semibold uppercase tracking-wider text-indigo-400">Preferences</span>
                        </div>
                        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Settings</h1>
                    </div>

                    <div className="flex p-1 bg-white/[0.03] rounded-2xl border border-white/5 overflow-x-auto no-scrollbar">
                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => setActiveCategory(cat.id)}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[11px] font-semibold whitespace-nowrap transition-all relative ${
                                    activeCategory === cat.id ? 'text-white' : 'text-white/30 hover:text-white/50'
                                }`}
                            >
                                <cat.icon size={14} className={activeCategory === cat.id ? 'text-indigo-400' : ''} />
                                {cat.label}
                                {activeCategory === cat.id && (
                                    <motion.div 
                                        layoutId="settingsTab"
                                        className="absolute inset-0 bg-white/[0.06] rounded-xl -z-10"
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                                    />
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-6 mt-10 space-y-6">
                <AnimatePresence mode="wait">
                    {activeCategory === "account" && (
                        <motion.div 
                            key="account"
                            initial={{ opacity: 0, x: 16 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -16 }}
                            className="space-y-6"
                        >
                            <SettingsSection title="Profile" description="Your display name, username, and bio" icon={User}>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-semibold uppercase text-white/30 tracking-wider ml-1">Full Name</label>
                                        <input 
                                            type="text" 
                                            value={formData.fullName}
                                            onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                                            className="w-full bg-white/[0.03] border border-white/5 rounded-2xl px-5 py-3.5 text-sm font-medium focus:outline-none focus:border-indigo-500/40 transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-semibold uppercase text-white/30 tracking-wider ml-1">Username</label>
                                        <input 
                                            type="text" 
                                            value={formData.username}
                                            onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                                            className="w-full bg-white/[0.03] border border-white/5 rounded-2xl px-5 py-3.5 text-sm font-medium focus:outline-none focus:border-indigo-500/40 transition-all"
                                        />
                                    </div>
                                    <div className="sm:col-span-2 space-y-2">
                                        <label className="text-[10px] font-semibold uppercase text-white/30 tracking-wider ml-1">Bio</label>
                                        <textarea 
                                            value={formData.bio}
                                            onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                                            className="w-full bg-white/[0.03] border border-white/5 rounded-2xl px-5 py-3.5 text-sm font-medium focus:outline-none focus:border-indigo-500/40 transition-all min-h-[100px] resize-none"
                                            placeholder="Tell people about yourself..."
                                        />
                                    </div>
                                </div>
                                <motion.button 
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleUpdateProfile}
                                    disabled={isUpdating}
                                    className="w-full mt-6 h-12 bg-indigo-500 hover:bg-indigo-400 rounded-2xl text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2"
                                >
                                    {isUpdating ? "Saving..." : <><Save size={16} /> Save Changes</>}
                                </motion.button>
                            </SettingsSection>

                            <SettingsSection title="Contact" description="Your email and verification status" icon={Globe}>
                                <div className="flex items-center justify-between p-4 bg-white/[0.03] border border-white/5 rounded-2xl">
                                    <div className="space-y-0.5">
                                        <p className="text-[11px] text-white/40 font-medium">Email Address</p>
                                        <p className="text-sm font-semibold">{authUser?.email}</p>
                                    </div>
                                    <span className="text-[9px] font-semibold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/15">
                                        Verified
                                    </span>
                                </div>
                            </SettingsSection>
                        </motion.div>
                    )}

                    {activeCategory === "privacy" && (
                        <motion.div 
                            key="privacy"
                            initial={{ opacity: 0, x: 16 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -16 }}
                            className="space-y-6"
                        >
                            <SettingsSection title="Privacy Controls" description="Manage your visibility and online status" icon={EyeOff}>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between p-5 bg-white/[0.03] border border-white/5 rounded-2xl hover:border-white/10 transition-all">
                                        <div className="space-y-1">
                                            <p className="text-sm font-semibold">Invisible Mode</p>
                                            <p className="text-[10px] text-white/30 font-medium">Hide your online status from other users</p>
                                        </div>
                                        <input type="checkbox" className="toggle toggle-primary toggle-sm" defaultChecked />
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div className="p-4 bg-white/[0.03] border border-white/5 rounded-2xl space-y-1">
                                            <p className="text-[10px] text-white/30 font-medium">Quick Exit Shortcut</p>
                                            <p className="text-sm font-semibold">ESC Key</p>
                                        </div>
                                        <div className="p-4 bg-white/[0.03] border border-white/5 rounded-2xl space-y-1">
                                            <p className="text-[10px] text-white/30 font-medium">Safe Redirect</p>
                                            <p className="text-sm font-semibold">google.com</p>
                                        </div>
                                    </div>
                                </div>
                            </SettingsSection>

                            <SettingsSection title="Security" description="Password and login settings" icon={Lock}>
                                <button className="flex items-center justify-between w-full p-5 bg-white/[0.03] hover:bg-white/[0.05] border border-white/5 rounded-2xl transition-all group">
                                    <div className="text-left">
                                        <p className="text-sm font-semibold">Change Password</p>
                                        <p className="text-[10px] text-white/30 font-medium mt-0.5">Update your login password</p>
                                    </div>
                                    <ChevronRight className="size-4 text-white/20 group-hover:text-white/40 transition-all group-hover:translate-x-0.5" />
                                </button>
                            </SettingsSection>
                        </motion.div>
                    )}

                    {activeCategory === "appearance" && (
                        <motion.div 
                            key="appearance"
                            initial={{ opacity: 0, x: 16 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -16 }}
                            className="space-y-6"
                        >
                            <SettingsSection title="App Theme" description="Choose your preferred visual style" icon={Palette}>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    {[
                                        { name: 'Deep Space', theme: 'zyrodark', color: '#6366f1', bg: '#020617' },
                                        { name: 'Oceanic', theme: 'aqua', color: '#06b6d4', bg: '#042f2e' },
                                        { name: 'Cyberpunk', theme: 'luxury', color: '#f59e0b', bg: '#1a0a00' },
                                        { name: 'Classic', theme: 'light', color: '#6366f1', bg: '#f8fafc' }
                                    ].map((t) => {
                                        const isActive = currentTheme === t.theme;
                                        return (
                                            <motion.button 
                                                key={t.name}
                                                whileTap={{ scale: 0.97 }}
                                                onClick={() => {
                                                    setTheme(t.theme);
                                                    toast.success(`${t.name} theme applied`);
                                                }}
                                                className={`p-5 rounded-2xl border transition-all flex flex-col items-center gap-3 ${
                                                    isActive 
                                                        ? 'bg-indigo-500/15 border-indigo-500/30 shadow-lg shadow-indigo-500/10' 
                                                        : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.04]'
                                                }`}
                                            >
                                                <div className="flex gap-1.5">
                                                    <div className="size-6 rounded-full border border-white/10" style={{ backgroundColor: t.bg }} />
                                                    <div className="size-6 rounded-full" style={{ backgroundColor: t.color }} />
                                                </div>
                                                <span className={`text-[10px] font-semibold uppercase tracking-wider ${isActive ? 'text-indigo-400' : 'text-white/40'}`}>{t.name}</span>
                                            </motion.button>
                                        );
                                    })}
                                </div>
                            </SettingsSection>
                        </motion.div>
                    )}

                    {activeCategory === "danger" && (
                        <motion.div 
                            key="danger"
                            initial={{ opacity: 0, x: 16 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -16 }}
                            className="space-y-6"
                        >
                            <SettingsSection title="Delete Account" description="Permanently remove your account and all data" icon={Trash2}>
                                <div className="bg-rose-500/5 border border-rose-500/10 rounded-2xl p-6 space-y-5">
                                    <div className="space-y-2">
                                        <h4 className="text-base font-bold text-rose-400">This action is permanent</h4>
                                        <p className="text-sm text-rose-300/50 leading-relaxed">
                                            Deleting your account will permanently remove your profile, messages, media, and all social connections. This cannot be undone.
                                        </p>
                                    </div>
                                    <motion.button 
                                        whileTap={{ scale: 0.98 }}
                                        onClick={handleDeleteAccount}
                                        className="w-full h-12 bg-rose-500 hover:bg-rose-400 rounded-2xl text-sm font-semibold text-white transition-all shadow-lg shadow-rose-500/20"
                                    >
                                        Delete My Account
                                    </motion.button>
                                </div>
                            </SettingsSection>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Background accents */}
            <div className="fixed inset-0 bg-[radial-gradient(circle_at_bottom_right,_rgba(99,102,241,0.04),_transparent_40%)] z-[-1] pointer-events-none" />
        </div>
    );
};

export default memo(SettingsPage);
