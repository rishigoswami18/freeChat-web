import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import Logo from "../components/Logo";
import { Shield, Lock, Eye, EyeOff, Save, KeyRound } from "lucide-react";

const ResetPasswordPage = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [email, setEmail] = useState("");

    useEffect(() => {
        // Get email from location state
        if (location.state?.email) {
            setEmail(location.state.email);
        } else {
            // Redirect if no email state
            toast.error("Invalid access. Please start the process again.");
            navigate("/forgot-password");
        }
    }, [location.state, navigate]);

    const handleReset = async (e) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            return toast.error("Passwords do not match");
        }

        if (newPassword.length < 6) {
            return toast.error("Password must be at least 6 characters");
        }

        setIsSubmitting(true);

        try {
            const { data } = await axiosInstance.post("/auth/reset-password", {
                email,
                otp,
                newPassword
            });
            toast.success(data.message || "Password updated successfully!");
            navigate("/login");
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to reset password");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-base-300 via-base-100 to-base-300">
            <div className="card w-full max-w-md bg-base-100 shadow-2xl border border-base-content/5">
                <div className="card-body p-8">
                    <div className="mb-6 flex justify-between items-center">
                        <Logo className="size-8" fontSize="text-2xl" />
                        <div className="badge badge-primary font-bold text-[10px] py-3 px-4">SECURE TRANSIT</div>
                    </div>

                    <div className="space-y-2 mb-8">
                        <h2 className="text-2xl font-bold tracking-tight">Reset Password</h2>
                        <p className="text-sm opacity-60">
                            Sent to <span className="text-primary font-bold">{email}</span>
                        </p>
                    </div>

                    <form onSubmit={handleReset} className="space-y-6">
                        {/* OTP Input */}
                        <div className="form-control">
                            <label className="label py-1">
                                <span className="label-text font-medium text-xs uppercase tracking-wider opacity-60">Verification Code</span>
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-base-content/40">
                                    <KeyRound className="size-5" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="6-digit code"
                                    maxLength={6}
                                    className="input input-bordered w-full pl-10 rounded-xl focus:input-primary transition-all bg-base-200/50 tracking-[5px] font-bold text-center"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                                    required
                                />
                            </div>
                        </div>

                        {/* New Password */}
                        <div className="form-control">
                            <label className="label py-1">
                                <span className="label-text font-medium text-xs uppercase tracking-wider opacity-60">New Password</span>
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-base-content/40">
                                    <Lock className="size-5" />
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    className="input input-bordered w-full pl-10 rounded-xl focus:input-primary transition-all bg-base-200/50"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-base-content/40 hover:text-primary transition-colors"
                                >
                                    {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                                </button>
                            </div>
                        </div>

                        {/* Confirm Password */}
                        <div className="form-control">
                            <label className="label py-1">
                                <span className="label-text font-medium text-xs uppercase tracking-wider opacity-60">Confirm New Password</span>
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-base-content/40">
                                    <Shield className="size-5" />
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    className="input input-bordered w-full pl-10 rounded-xl focus:input-primary transition-all bg-base-200/50"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary w-full rounded-xl gap-2 h-12"
                            disabled={isSubmitting || !otp || !newPassword}
                        >
                            {isSubmitting ? (
                                <span className="loading loading-spinner"></span>
                            ) : (
                                <>
                                    <Save className="size-4" />
                                    Save New Password
                                </>
                            )}
                        </button>
                    </form>

                    <div className="text-center mt-8">
                        <Link
                            to="/forgot-password"
                            className="text-xs font-bold opacity-30 hover:opacity-100 uppercase tracking-widest transition-opacity hover:underline"
                        >
                            Resend code?
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResetPasswordPage;
