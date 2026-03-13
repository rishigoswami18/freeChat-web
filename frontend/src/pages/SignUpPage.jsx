import { useState } from "react";
import { Link } from "react-router-dom";

import useSignUp from "../hooks/useSignUp";
import GoogleSignInButton from "../components/GoogleSignInButton";
import Logo from "../components/Logo";
import toast from "react-hot-toast";
import { requestOTP } from "../lib/api";

const SignUpPage = () => {
  const [signupData, setSignupData] = useState({
    fullName: "",
    email: "",
    password: "",
    dateOfBirth: "",
    otp: "", // Added otp field
  });

  const [isSendingOtp, setIsSendingOtp] = useState(false); // Added isSendingOtp state
  const [otpSent, setOtpSent] = useState(false); // Added otpSent state

  const maxDate = new Date();
  const maxDateStr = maxDate.toISOString().split("T")[0];

  const { isPending, error, signupMutation } = useSignUp();

  // Added handleSendCode function
  const handleSendCode = async () => {
    if (!signupData.email) return toast.error("Please enter your email first");

    // Quick local regex check
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
      console.error("OTP Error:", err);
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
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 md:p-8 relative overflow-hidden bg-base-300">
      {/* Premium ambient animated background */}
      <div className="absolute inset-0 w-full h-full overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[120px] animate-pulse max-w-[600px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-secondary/20 rounded-full blur-[120px] animate-pulse max-w-[600px] delay-1000" />
      </div>

      <div className="glass-panel-heavy z-10 flex flex-col lg:flex-row w-full max-w-5xl mx-auto rounded-3xl overflow-hidden shadow-2xl transition-all duration-300">
        {/* SIGNUP FORM - LEFT SIDE */}
        <div className="w-full lg:w-1/2 p-8 sm:p-12 flex flex-col justify-center relative">
          {/* Subtle noise texture over the glass */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] mix-blend-overlay"></div>
          
          <div className="relative z-10">
            {/* LOGO */}
            <div className="mb-8">
              <Logo className="size-12" fontSize="text-4xl" />
            </div>

            {/* ERROR MESSAGE IF ANY */}
            {error && (
              <div className="alert alert-error mb-6 rounded-2xl text-sm border-error/20 bg-error/10 text-error-content shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-5 w-5" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <span>{error.response?.data?.message || "Signup failed"}</span>
              </div>
            )}

            <div className="w-full">
              <form onSubmit={handleSignup}>
                <div className="space-y-6">
                  <div>
                    <h2 className="text-3xl font-extrabold tracking-tight mb-2">
                      Create an Account
                    </h2>
                    <p className="text-base opacity-60">
                      Join <span className="text-primary font-medium">BondBeyond</span> and start connecting
                    </p>
                  </div>

                  <div className="space-y-4">
                    {/* FULLNAME */}
                    <div className="form-control w-full">
                      <label className="label pb-2">
                        <span className="label-text font-semibold text-xs uppercase tracking-widest opacity-70">
                          Full Name
                        </span>
                      </label>
                      <input
                        type="text"
                        placeholder="John Doe"
                        className="input-premium w-full rounded-2xl px-4 py-3.5 text-base"
                        value={signupData.fullName}
                        onChange={(e) =>
                          setSignupData({
                            ...signupData,
                            fullName: e.target.value,
                          })
                        }
                        required
                      />
                    </div>

                    {/* EMAIL */}
                    <div className="form-control w-full">
                      <label className="label pb-2">
                        <span className="label-text font-semibold text-xs uppercase tracking-widest opacity-70">
                          Email
                        </span>
                      </label>
                      <div className="relative">
                        <input
                          type="email"
                          placeholder="john@example.com"
                          className={`input-premium w-full rounded-2xl px-4 py-3.5 text-base pr-26 ${signupData.email && !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(signupData.email)
                            ? "border-error focus:border-error ring-1 ring-error/20" : ""
                            }`}
                          value={signupData.email}
                          onChange={(e) =>
                            setSignupData({
                              ...signupData,
                              email: e.target.value,
                            })
                          }
                          required
                          disabled={otpSent}
                        />
                        {!otpSent && (
                          <button
                            type="button"
                            onClick={handleSendCode}
                            disabled={isSendingOtp}
                            className="absolute right-2 top-1/2 -translate-y-1/2 btn btn-xs h-8 px-3 btn-primary text-xs font-bold rounded-xl shadow-sm"
                          >
                            {isSendingOtp ? <span className="loading loading-spinner loading-xs"></span> : "Send Code"}
                          </button>
                        )}
                      </div>
                      {signupData.email && !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(signupData.email) && (
                        <p className="text-[11px] font-medium text-error mt-1.5 pl-1">
                          Please enter a valid email address
                        </p>
                      )}
                      {otpSent && (
                        <p className="text-[11px] text-success mt-1.5 pl-1 font-bold">
                          ✓ Email locked for verification
                        </p>
                      )}
                    </div>

                    {/* OTP FIELD */}
                    {otpSent && (
                      <div className="form-control w-full animate-in fade-in slide-in-from-top-2 duration-300">
                        <label className="label pb-2">
                          <span className="label-text font-semibold text-xs uppercase tracking-widest text-primary">
                            Verification Code
                          </span>
                        </label>
                        <input
                          type="text"
                          placeholder="6-digit code"
                          maxLength={6}
                          className="input-premium w-full rounded-2xl px-4 py-3.5 text-base font-mono tracking-[0.5em] text-center"
                          value={signupData.otp}
                          onChange={(e) =>
                            setSignupData({
                              ...signupData,
                              otp: e.target.value.replace(/\D/g, ""),
                            })
                          }
                          required
                        />
                      </div>
                    )}

                    {/* PASSWORD */}
                    <div className="form-control w-full">
                      <label className="label pb-2">
                        <span className="label-text font-semibold text-xs uppercase tracking-widest opacity-70">
                          Password
                        </span>
                      </label>
                      <input
                        type="password"
                        placeholder="••••••••"
                        className="input-premium w-full rounded-2xl px-4 py-3.5 text-base"
                        value={signupData.password}
                        onChange={(e) =>
                          setSignupData({
                            ...signupData,
                            password: e.target.value,
                          })
                        }
                        required
                      />
                      <p className="text-[11px] font-medium opacity-50 mt-1.5 pl-1">
                        Minimum 6 characters
                      </p>
                    </div>

                    {/* DATE OF BIRTH */}
                    <div className="form-control w-full">
                      <label className="label pb-2">
                        <span className="label-text font-semibold text-xs uppercase tracking-widest opacity-70">
                          Date of Birth
                        </span>
                      </label>
                      <input
                        type="date"
                        className="input-premium w-full rounded-2xl px-4 py-3.5 text-base"
                        value={signupData.dateOfBirth}
                        onChange={(e) =>
                          setSignupData({
                            ...signupData,
                            dateOfBirth: e.target.value,
                          })
                        }
                        max={maxDateStr}
                        required
                      />
                    </div>

                    <div className="form-control mt-2 mb-2">
                      <label className="label cursor-pointer justify-start gap-3 pl-1">
                        <input
                          type="checkbox"
                          className="checkbox checkbox-sm checkbox-primary rounded shadow-sm border-base-content/20"
                          required
                        />
                        <span className="text-xs leading-tight opacity-70 font-medium">
                          I agree to the{" "}
                          <Link
                            to="/terms"
                            className="text-primary hover:underline font-bold"
                          >
                            Terms of Service
                          </Link>{" "}
                          and{" "}
                          <Link
                            to="/privacy-policy"
                            className="text-primary hover:underline font-bold"
                          >
                            Privacy Policy
                          </Link>
                        </span>
                      </label>
                    </div>
                  </div>

                  <button
                    className="btn btn-primary w-full rounded-2xl shadow-[0_4px_14px_0_oklch(var(--p)/0.39)] hover:shadow-[0_6px_20px_oklch(var(--p)/0.23)] hover:-translate-y-0.5 transition-all duration-200 text-base font-bold mt-2"
                    type="submit"
                    disabled={isPending}
                  >
                    {isPending ? (
                      <>
                        <span className="loading loading-spinner loading-sm"></span>
                        Creating account...
                      </>
                    ) : (
                      "Create Account"
                    )}
                  </button>

                  <div className="divider text-xs uppercase tracking-widest opacity-40 before:bg-base-content/10 after:bg-base-content/10 my-1">OR</div>

                  {/* Google Sign Up */}
                  <div className="w-full relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-secondary rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
                    <div className="relative">
                      <GoogleSignInButton text="signup_with" />
                    </div>
                  </div>

                  <div className="text-center mt-6">
                    <p className="text-sm opacity-70">
                      Already have an account?{" "}
                      <Link
                        to="/login"
                        className="text-primary font-bold hover:underline underline-offset-4 decoration-2"
                      >
                        Sign in
                      </Link>
                    </p>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* SIGNUP FORM - RIGHT SIDE */}
        <div className="hidden lg:flex w-full lg:w-1/2 bg-base-200/50 backdrop-blur-md items-center justify-center relative overflow-hidden border-l border-base-content/5">
          {/* Grid pattern overlay */}
          <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: "radial-gradient(oklch(var(--bc)) 1px, transparent 1px)", backgroundSize: "24px 24px" }}></div>

          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent/10 rounded-full blur-[100px]" />

          <div className="max-w-md p-10 relative z-10 flex flex-col items-center">
            <div className="relative aspect-square w-80 mx-auto transform transition duration-500 hover:scale-105">
              <img
                src="/Video call-bro.png"
                alt="BondBeyond Connection"
                className="w-full h-full object-contain filter drop-shadow-[0_20px_30px_rgba(0,0,0,0.15)]"
              />
            </div>

            <div className="text-center space-y-5 mt-10">
              <h2 className="text-2xl font-black tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Join the network.
              </h2>
              <p className="opacity-60 text-base leading-relaxed font-medium px-4">
                Experience unparalleled communication, rich community features, and instant video calling wrapped in a premium interface.
              </p>

              {/* Feature badges */}
              <div className="flex flex-wrap justify-center gap-3 pt-4">
                <span className="glass-panel-flat px-4 py-2 rounded-full text-sm font-semibold tracking-wide shadow-sm"><span className="text-primary mr-2">✦</span>Free Forever</span>
                <span className="glass-panel-flat px-4 py-2 rounded-full text-sm font-semibold tracking-wide shadow-sm"><span className="text-primary mr-2">✦</span>Premium Games</span>
                <span className="glass-panel-flat px-4 py-2 rounded-full text-sm font-semibold tracking-wide shadow-sm"><span className="text-primary mr-2">✦</span>Reels & Stories</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;