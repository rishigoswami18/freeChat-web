import { memo, useState, useCallback } from "react";
import { Lock, Loader2, Key } from "lucide-react";
import toast from "react-hot-toast";
import { changePassword } from "../../lib/api";

const SecuritySettings = memo(() => {
    const [showSecurity, setShowSecurity] = useState(false);
    const [passwordData, setPasswordData] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
    const [isChangingPassword, setIsChangingPassword] = useState(false);

    const handleChangePassword = useCallback(async (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            return toast.error("New passwords do not match");
        }
        if (passwordData.newPassword.length < 6) {
            return toast.error("Password must be at least 6 characters");
        }

        setIsChangingPassword(true);
        try {
            await changePassword(passwordData.currentPassword, passwordData.newPassword);
            toast.success("Password updated successfully!");
            setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
            setShowSecurity(false);
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to update password");
        } finally {
            setIsChangingPassword(false);
        }
    }, [passwordData]);

    return (
        <div className="mt-12 pt-8">
            <div className="section-divider" />
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2 section-heading">
                <Lock className="text-primary" />
                Security & Privacy
            </h2>

            <div className="bg-base-200 p-6 rounded-2xl space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="font-semibold">Password Management</h3>
                        <p className="text-sm opacity-50">Keep your account secure by rotating passwords.</p>
                    </div>
                    <button
                        onClick={() => setShowSecurity(!showSecurity)}
                        className="btn btn-ghost btn-sm rounded-xl"
                    >
                        {showSecurity ? "Hide Settings" : "Change Password"}
                    </button>
                </div>

                {showSecurity && (
                    <form onSubmit={handleChangePassword} className="space-y-4 animate-in slide-in-from-top-2">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <input
                                type="password"
                                placeholder="Current Password"
                                className="input input-bordered rounded-xl"
                                value={passwordData.currentPassword}
                                onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                                required
                            />
                            <div className="hidden sm:block" />
                            <input
                                type="password"
                                placeholder="New Password"
                                className="input input-bordered rounded-xl"
                                value={passwordData.newPassword}
                                onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                                required
                            />
                            <input
                                type="password"
                                placeholder="Confirm New Password"
                                className="input input-bordered rounded-xl"
                                value={passwordData.confirmPassword}
                                onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isChangingPassword}
                            className="btn btn-primary btn-sm rounded-xl gap-2"
                        >
                            {isChangingPassword ? <Loader2 className="size-4 animate-spin" /> : <Key className="size-4" />}
                            Update Password
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
});

SecuritySettings.displayName = "SecuritySettings";

export default SecuritySettings;
