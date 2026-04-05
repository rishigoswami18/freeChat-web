import { useState } from "react";
import { Link } from "react-router-dom";
import useLogin from "../hooks/useLogin";
import GoogleSignInButton from "../components/GoogleSignInButton";
import Logo from "../components/Logo";
import { motion } from "framer-motion";
import { ArrowRight, Shield, Zap, Users } from "lucide-react";

const LoginPage = () => {
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  const { isPending, error, loginMutation } = useLogin();

  const handleLogin = (e) => {
    e.preventDefault();
    loginMutation(loginData);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 md:p-8 relative overflow-hidden bg-[#020617]">
      {/* Ambient background */}
      <div className="absolute inset-0 w-full h-full overflow-hidden z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-indigo-500/8 rounded-full blur-[150px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-violet-500/5 rounded-full blur-[150px]" />
        <div className="absolute inset-0 opacity-[0.015]" style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.5) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="z-10 flex flex-col lg:flex-row w-full max-w-5xl mx-auto rounded-3xl overflow-hidden shadow-2xl border border-white/5 bg-white/[0.02] backdrop-blur-xl"
      >
        {/* LOGIN FORM */}
        <div className="w-full lg:w-1/2 p-8 sm:p-12 flex flex-col justify-center relative">
          <div className="relative z-10">
            <div className="mb-10">
              <Logo className="size-12" fontSize="text-3xl" />
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/15 flex items-center gap-3">
                <div className="size-8 rounded-xl bg-rose-500/20 flex items-center justify-center shrink-0">
                  <span className="text-rose-400 text-sm">!</span>
                </div>
                <span className="text-sm text-rose-300 font-medium">{error.response?.data?.message || "Login failed. Please try again."}</span>
              </div>
            )}

            <div className="w-full">
              <form onSubmit={handleLogin}>
                <div className="space-y-7">
                  <div>
                    <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-2">Welcome back</h2>
                    <p className="text-sm text-white/40 font-medium">
                      Sign in to your FreeChat account
                    </p>
                  </div>

                  <div className="flex flex-col gap-5">
                    <div className="space-y-2">
                      <label className="text-[11px] font-semibold uppercase tracking-wider text-white/40 ml-1">Email</label>
                      <input
                        type="email"
                        placeholder="hello@example.com"
                        className="input-premium w-full rounded-2xl px-4 py-3.5 text-base"
                        value={loginData.email}
                        onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center px-1">
                        <label className="text-[11px] font-semibold uppercase tracking-wider text-white/40">Password</label>
                        <Link to="/forgot-password" className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors">
                          Forgot password?
                        </Link>
                      </div>
                      <input
                        type="password"
                        placeholder="••••••••"
                        className="input-premium w-full rounded-2xl px-4 py-3.5 text-base"
                        value={loginData.password}
                        onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                        required
                      />
                    </div>

                    <motion.button
                      type="submit"
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      className="h-14 bg-indigo-500 hover:bg-indigo-400 w-full rounded-2xl text-white shadow-lg shadow-indigo-500/20 transition-all duration-200 text-sm font-semibold flex items-center justify-center gap-2 mt-1"
                      disabled={isPending}
                    >
                      {isPending ? (
                        <>
                          <span className="loading loading-spinner loading-xs"></span>
                          Signing in...
                        </>
                      ) : (
                        <>Sign In <ArrowRight size={16} /></>
                      )}
                    </motion.button>

                    <div className="divider text-[10px] uppercase tracking-wider text-white/20 before:bg-white/5 after:bg-white/5 my-1">or continue with</div>

                    <div className="w-full">
                      <GoogleSignInButton text="signin_with" />
                    </div>

                    <div className="text-center mt-4">
                      <p className="text-sm text-white/40">
                        Don't have an account?{" "}
                        <Link to="/signup" className="text-indigo-400 font-semibold hover:text-indigo-300 transition-colors">
                          Create one
                        </Link>
                      </p>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="hidden lg:flex w-full lg:w-1/2 bg-gradient-to-br from-indigo-500/10 via-transparent to-violet-500/5 items-center justify-center relative overflow-hidden border-l border-white/5">
          <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.5) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
          
          <div className="max-w-sm p-10 relative z-10 flex flex-col items-center">
            <div className="relative w-64 h-64 mx-auto">
              <img
                src="/Video call-bro.png"
                alt="Connect with FreeChat"
                className="w-full h-full object-contain"
              />
            </div>

            <div className="text-center space-y-6 mt-8">
              <h2 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
                India's Social Platform
              </h2>
              <p className="text-white/40 text-sm leading-relaxed font-medium">
                Secure messaging, video calls, communities, and creator tools — all in one platform.
              </p>

              <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-white/[0.03] border border-white/5">
                  <Shield size={18} className="text-indigo-400" />
                  <span className="text-[9px] font-semibold text-white/40 uppercase">Secure</span>
                </div>
                <div className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-white/[0.03] border border-white/5">
                  <Zap size={18} className="text-amber-400" />
                  <span className="text-[9px] font-semibold text-white/40 uppercase">Fast</span>
                </div>
                <div className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-white/[0.03] border border-white/5">
                  <Users size={18} className="text-emerald-400" />
                  <span className="text-[9px] font-semibold text-white/40 uppercase">Social</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
export default LoginPage;
