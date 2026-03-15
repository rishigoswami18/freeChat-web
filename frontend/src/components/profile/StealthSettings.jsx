import { memo } from "react";
import { Shield, Star, Keyboard, Globe } from "lucide-react";
import { Link } from "react-router-dom";

const StealthSettings = memo(({ isPremium, isStealthMode, setStealthMode, panicShortcut, setPanicShortcut }) => {
    return (
        <div className="mt-12 pt-8">
            <div className="section-divider" />
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2 section-heading">
                <Shield className="text-secondary" />
                Stealth Mode Settings
            </h2>

            <div className="bg-base-200 p-6 rounded-2xl space-y-6 relative overflow-hidden">
                {!isPremium && (
                    <div className="absolute inset-0 bg-base-200/60 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center p-6 text-center">
                        <div className="bg-primary/20 p-3 rounded-full mb-4">
                            <Shield className="size-8 text-primary" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">Privacy Pro Required</h3>
                        <p className="max-w-xs text-sm opacity-80 mb-6">
                            Stealth Mode and custom panic shortcuts are exclusive to Premium members.
                        </p>
                        <Link to="/membership" className="btn btn-primary rounded-xl gap-2 shadow-lg shadow-primary/20">
                            <Star className="size-4" />
                            Upgrade to Premium
                        </Link>
                    </div>
                )}

                <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                            <h3 className="font-semibold">Privacy Pro (Stealth Mode)</h3>
                            <span className="badge badge-primary badge-sm gap-1">
                                <Star className="size-3" /> Premium
                            </span>
                        </div>
                        <p className="text-sm opacity-60">Instantly switch to a dummy educational view.</p>
                    </div>
                    <input
                        type="checkbox"
                        className="toggle toggle-primary"
                        checked={isStealthMode}
                        onChange={(e) => isPremium && setStealthMode(e.target.checked)}
                        disabled={!isPremium}
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text font-semibold flex items-center gap-2">
                                <Keyboard className="size-4 opacity-50" /> Panic Shortcut
                            </span>
                        </label>
                        <select
                            className="select select-bordered rounded-xl"
                            value={panicShortcut}
                            onChange={(e) => setPanicShortcut(e.target.value)}
                            disabled={!isPremium}
                        >
                            <option value="Escape">Escape Key</option>
                            <option value="F2">F2 Key</option>
                            <option value="q">'q' Key</option>
                        </select>
                    </div>

                    <div className="form-control">
                        <label className="label">
                            <span className="label-text font-semibold flex items-center gap-2">
                                <Globe className="size-4 opacity-50" /> Dummy View
                            </span>
                        </label>
                        <select className="select select-bordered rounded-xl" disabled>
                            <option>LexiLearn Dictionary (Default)</option>
                            <option>Science Lab Reports (Coming Soon)</option>
                        </select>
                    </div>
                </div>

                <div className="p-4 bg-info/10 text-info text-sm rounded-xl flex gap-3">
                    <div className="size-5 shrink-0"><Shield className="size-5" /></div>
                    <div>
                        <p><strong>PC:</strong> Use your shortcut key (Default: <code>Esc</code>) to hide.</p>
                        <p className="mt-1"><strong>Mobile:</strong> 📱 <strong>Triple-tap</strong> anywhere on the screen to hide instantly!</p>
                        <p className="mt-2 opacity-70"><strong>To Exit:</strong> Double-click the menu icon in the top right of the mask, or repeat your trigger.</p>
                    </div>
                </div>
            </div>
        </div>
    );
});

StealthSettings.displayName = "StealthSettings";

export default StealthSettings;
