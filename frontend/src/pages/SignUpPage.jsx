import { useState } from "react";
import { Link } from "react-router-dom";

import useSignUp from "../hooks/useSignUp";
import GoogleSignInButton from "../components/GoogleSignInButton";
import Logo from "../components/Logo";
import toast from "react-hot-toast";
import { requestOTP } from "../lib/api";
import { motion } from "framer-motion";
import { ArrowRight, Shield, Sparkles, Heart } from "lucide-react";

const SignUpPage = () => {
  const [signupData, setSignupData] = useState({
    fullName: "",
    email: "",
    password: "",
    dateOfBirth: "",
    otp: "",
  });

  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  const maxDate = new Date();
  const maxDateStr = maxDate.toISOString().split("T")[0];

  const { isPending, error, signupMutation } = useSignUp();

  const handleSendCode = async () => {
    if (!signupData.email) return toast.error("Please enter your email first");
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(signupData.email)) {
      return toast.error("Please enter a valid email address");
    }
    setIsSendingOtp(true);
    try {
      await requestOTP(signupData.email);
      setOtpSent(true);
      toast.success("Verification code sent to your email!");
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Failed to send code");
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleSignup = (e) => {
    e.preventDefault();
    signupMutation(signupData);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 md:p-8 relative overflow-hidden bg-[#020617]">
      {/* Ambient background */}
      <div className="absolute inset-0 w-full h-full overflow-hidden z-0">
        <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-indigo-500/8 rounded-full blur-[150px]" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[50%] bg-violet-500/5 rounded-full blur-[150px]" />
        <div className="absolute inset-0 opacity-[0.015]" style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.5) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="z-10 flex flex-col lg:flex-row w-full max-w-5xl mx-auto rounded-3xl overflow-hidden shadow-2xl border border-white/5 bg-white/[0.02] backdrop-blur-xl"
      >
        {/* SIGNUP FORM */}
        <div className="w-full lg:w-1/2 p-8 sm:p-12 flex flex-col justify-center relative">
          <div className="relative z-10">
            <div className="mb-8">
              <Logo className="size-12" fontSize="text-3xl" />
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/15 flex items-center gap-3">
                <div className="size-8 rounded-xl bg-rose-500/20 flex items-center justify-center shrink-0">
                  <span className="text-rose-400 text-sm">!</span>
                </div>
                <span className="text-sm text-rose-300 font-medium">{error.response?.data?.message || "Signup failed"}</span>
              </div>
            )}

            <div className="w-full">
              <form onSubmit={handleSignup}>
                <div className="space-y-6">
                  <div>
                    <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2 text-white">Create your account</h2>
                    <p className="text-sm text-white/40 font-medium">
                      Join <span className="text-indigo-400">FreeChat</span> — India's social platform
                    </p>
                  </div>

                  <div className="space-y-4">
                    {/* FULLNAME */}
                    <div className="space-y-2">
                      <label className="text-[11px] font-semibold uppercase tracking-wider text-white/40 ml-1">Full Name</label>
                      <input
                        type="text"
                        placeholder="John Doe"
                        className="input-premium w-full rounded-2xl px-4 py-3.5 text-base"
                        value={signupData.fullName}
                        onChange={(e) => setSignupData({ ...signupData, fullName: e.target.value })}
                        required
                      />
                    </div>

                    {/* EMAIL */}
                    <div className="space-y-2">
                      <label className="text-[11px] font-semibold uppercase tracking-wider text-white/40 ml-1">Email</label>
                      <div className="relative">
                        <input
                          type="email"
                          placeholder="john@example.com"
                          className={`input-premium w-full rounded-2xl px-4 py-3.5 text-base pr-26 ${signupData.email && !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(signupData.email)
                            ? "border-rose-500/30 focus:border-rose-500/50" : ""
                            }`}
                          value={signupData.email}
                          onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                          required
                          disabled={otpSent}
                        />
                        {!otpSent && (
                          <button
                            type="button"
                            onClick={handleSendCode}
                            disabled={isSendingOtp}
                            className="absolute right-2 top-1/2 -translate-y-1/2 h-8 px-3 bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-semibold rounded-xl transition-all"
                          >
                            {isSendingOtp ? <span className="loading loading-spinner loading-xs"></span> : "Send Code"}
                          </button>
                        )}
                      </div>
                      {signupData.email && !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(signupData.email) && (
                        <p className="text-[11px] text-rose-400 mt-1 pl-1">Please enter a valid email address</p>
                      )}
                      {otpSent && (
                        <p className="text-[11px] text-emerald-400 mt-1 pl-1 font-medium">✓ Code sent — check your inbox</p>
                      )}
                    </div>

                    {/* OTP FIELD */}
                    {otpSent && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="space-y-2"
                      >
                        <label className="text-[11px] font-semibold uppercase tracking-wider text-indigo-400 ml-1">Verification Code</label>
                        <input
                          type="text"
                          placeholder="6-digit code"
                          maxLength={6}
                          className="input-premium w-full rounded-2xl px-4 py-3.5 text-base font-mono tracking-[0.5em] text-center"
                          value={signupData.otp}
                          onChange={(e) => setSignupData({ ...signupData, otp: e.target.value.replace(/\D/g, "") })}
                          required
                        />
                      </motion.div>
                    )}

                    {/* PASSWORD */}
                    <div className="space-y-2">
                      <label className="text-[11px] font-semibold uppercase tracking-wider text-white/40 ml-1">Password</label>
                      <input
                        type="password"
                        placeholder="••••••••"
                        className="input-premium w-full rounded-2xl px-4 py-3.5 text-base"
                        value={signupData.password}
                        onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                        required
                      />
                      <p className="text-[10px] text-white/25 mt-1 pl-1">Minimum 6 characters</p>
                    </div>

                    {/* DOB */}
                    <div className="space-y-2">
                      <label className="text-[11px] font-semibold uppercase tracking-wider text-white/40 ml-1">Date of Birth</label>
                      <input
                        type="date"
                        className="input-premium w-full rounded-2xl px-4 py-3.5 text-base"
                        value={signupData.dateOfBirth}
                        onChange={(e) => setSignupData({ ...signupData, dateOfBirth: e.target.value })}
                        max={maxDateStr}
                        required
                      />
                    </div>

                    <div className="flex items-start gap-3 mt-2">
                      <input type="checkbox" className="checkbox checkbox-sm checkbox-primary rounded mt-0.5" required />
                      <span className="text-xs text-white/40 leading-relaxed">
                        I agree to the{" "}
                        <Link to="/terms" className="text-indigo-400 hover:text-indigo-300 font-semibold">Terms</Link>{" "}and{" "}
                        <Link to="/privacy-policy" className="text-indigo-400 hover:text-indigo-300 font-semibold">Privacy Policy</Link>
                      </span>
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className="h-14 bg-indigo-500 hover:bg-indigo-400 w-full rounded-2xl text-white shadow-lg shadow-indigo-500/20 transition-all text-sm font-semibold flex items-center justify-center gap-2"
                    type="submit"
                    disabled={isPending}
                  >
                    {isPending ? (
                      <><span className="loading loading-spinner loading-xs"></span> Creating account...</>
                    ) : (
                      <>Create Account <ArrowRight size={16} /></>
                    )}
                  </motion.button>

                  <div className="divider text-[10px] uppercase tracking-wider text-white/20 before:bg-white/5 after:bg-white/5 my-1">or continue with</div>

                  <div className="w-full">
                    <GoogleSignInButton text="signup_with" />
                  </div>

                  <div className="text-center mt-4">
                    <p className="text-sm text-white/40">
                      Already have an account?{" "}
                      <Link to="/login" className="text-indigo-400 font-semibold hover:text-indigo-300 transition-colors">Sign in</Link>
                    </p>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="hidden lg:flex w-full lg:w-1/2 bg-gradient-to-br from-violet-500/10 via-transparent to-indigo-500/5 items-center justify-center relative overflow-hidden border-l border-white/5">
          <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.5) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

          <div className="max-w-sm p-10 relative z-10 flex flex-col items-center">
            <div className="relative w-64 h-64 mx-auto">
              <img
                src="/Video call-bro.png"
                alt="Join FreeChat"
                className="w-full h-full object-contain"
              />
            </div>

            <div className="text-center space-y-6 mt-8">
              <h2 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
                Join the community
              </h2>
              <p className="text-white/40 text-sm leading-relaxed font-medium">
                Connect, create, and grow with millions of users across India.
              </p>

              <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-white/[0.03] border border-white/5">
                  <Shield size={18} className="text-indigo-400" />
                  <span className="text-[9px] font-semibold text-white/40 uppercase">Free Forever</span>
                </div>
                <div className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-white/[0.03] border border-white/5">
                  <Sparkles size={18} className="text-amber-400" />
                  <span className="text-[9px] font-semibold text-white/40 uppercase">Games</span>
                </div>
                <div className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-white/[0.03] border border-white/5">
                  <Heart size={18} className="text-rose-400" />
                  <span className="text-[9px] font-semibold text-white/40 uppercase">Stories</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SignUpPage;
