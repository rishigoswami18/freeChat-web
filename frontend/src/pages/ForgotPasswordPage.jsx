import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import Logo from "../components/Logo";
import { Mail, ArrowLeft, Send } from "lucide-react";

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState("");
    const [isPending, setIsPending] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsPending(true);

        try {
            const { data } = await axiosInstance.post("/auth/forgot-password", { email });
            toast.success(data.message || "Reset code sent to your email!");
            // Redirect to reset password page with email as state
            navigate("/reset-password", { state: { email } });
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to send reset code");
        } finally {
            setIsPending(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-base-300 via-base-100 to-base-300">
            <div className="card w-full max-w-md bg-base-100 shadow-2xl border border-base-content/5">
                <div className="card-body p-8">
                    <div className="mb-6">
                        <Logo className="size-8" fontSize="text-2xl" />
                    </div>

                    <div className="space-y-2 mb-8">
                        <h2 className="text-2xl font-bold tracking-tight">Forgot Password?</h2>
                        <p className="text-sm opacity-60">
                            Enter your email and we'll send you a 6-digit code to reset your password.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text font-medium text-xs uppercase tracking-wider opacity-60">Email Address</span>
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-base-content/40">
                                    <Mail className="size-5" />
                                </div>
                                <input
                                    type="email"
                                    placeholder="your-email@example.com"
                                    className="input input-bordered w-full pl-10 rounded-xl focus:input-primary transition-all bg-base-200/50"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary w-full rounded-xl gap-2 h-12"
                            disabled={isPending || !email}
                        >
                            {isPending ? (
                                <span className="loading loading-spinner"></span>
                            ) : (
                                <>
                                    <Send className="size-4" />
                                    Send Reset Code
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-base-content/5">
                        <Link
                            to="/login"
                            className="flex items-center justify-center gap-2 text-sm font-semibold opacity-60 hover:opacity-100 transition-opacity"
                        >
                            <ArrowLeft className="size-4" />
                            Back to Login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;
