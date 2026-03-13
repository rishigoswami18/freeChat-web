import { useState } from "react";
import { Link } from "react-router-dom";
import useLogin from "../hooks/useLogin";
import GoogleSignInButton from "../components/GoogleSignInButton";
import Logo from "../components/Logo";

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
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 md:p-8 relative overflow-hidden bg-base-300">
      {/* Premium ambient animated background */}
      <div className="absolute inset-0 w-full h-full overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[120px] animate-pulse max-w-[600px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-secondary/20 rounded-full blur-[120px] animate-pulse max-w-[600px] delay-1000" />
      </div>

      <div className="glass-panel-heavy z-10 flex flex-col lg:flex-row w-full max-w-5xl mx-auto rounded-3xl overflow-hidden shadow-2xl transition-all duration-300">
        {/* LOGIN FORM SECTION */}
        <div className="w-full lg:w-1/2 p-8 sm:p-12 flex flex-col justify-center relative">
          {/* Subtle noise texture over the glass */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] mix-blend-overlay"></div>
          
          <div className="relative z-10">
            {/* LOGO */}
            <div className="mb-10">
              <Logo className="size-12" fontSize="text-4xl" />
            </div>

            {/* ERROR MESSAGE DISPLAY */}
            {error && (
              <div className="alert alert-error mb-6 rounded-2xl text-sm border-error/20 bg-error/10 text-error-content shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-5 w-5" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <span>{error.response?.data?.message || "Login failed"}</span>
              </div>
            )}

            <div className="w-full">
              <form onSubmit={handleLogin}>
                <div className="space-y-6">
                  <div>
                    <h2 className="text-3xl font-extrabold tracking-tight mb-2">Welcome Back</h2>
                    <p className="text-base opacity-60">
                      Sign in to continue your journey on <span className="text-primary font-medium">BondBeyond</span>
                    </p>
                  </div>

                  <div className="flex flex-col gap-5">
                    <div className="form-control w-full">
                      <label className="label pb-2">
                        <span className="label-text font-semibold text-xs uppercase tracking-widest opacity-70">
                          Email
                        </span>
                      </label>
                      <input
                        type="email"
                        placeholder="hello@example.com"
                        className="input-premium w-full rounded-2xl px-4 py-3.5 text-base"
                        value={loginData.email}
                        onChange={(e) =>
                          setLoginData({ ...loginData, email: e.target.value })
                        }
                        required
                      />
                    </div>

                    <div className="form-control w-full">
                      <div className="flex justify-between items-center px-1 pb-1">
                        <label className="label">
                          <span className="label-text font-semibold text-xs uppercase tracking-widest opacity-70">
                            Password
                          </span>
                        </label>
                        <Link
                          to="/forgot-password"
                          className="text-xs font-semibold text-primary hover:text-primary-focus transition-colors"
                        >
                          Forgot password?
                        </Link>
                      </div>
                      <input
                        type="password"
                        placeholder="••••••••"
                        className="input-premium w-full rounded-2xl px-4 py-3.5 text-base"
                        value={loginData.password}
                        onChange={(e) =>
                          setLoginData({ ...loginData, password: e.target.value })
                        }
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      className="btn btn-primary w-full rounded-2xl shadow-[0_4px_14px_0_oklch(var(--p)/0.39)] hover:shadow-[0_6px_20px_oklch(var(--p)/0.23)] hover:-translate-y-0.5 transition-all duration-200 text-base font-bold mt-2"
                      disabled={isPending}
                    >
                      {isPending ? (
                        <>
                          <span className="loading loading-spinner loading-sm"></span>
                          Authenticating...
                        </>
                      ) : (
                        "Sign In"
                      )}
                    </button>

                    <div className="divider text-xs uppercase tracking-wider opacity-40 before:bg-base-content/10 after:bg-base-content/10 my-1">OR</div>

                    {/* Google Sign In */}
                    <div className="w-full relative group">
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-secondary rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
                      <div className="relative">
                        <GoogleSignInButton text="signin_with" />
                      </div>
                    </div>

                    <div className="text-center mt-6">
                      <p className="text-sm opacity-70">
                        Don't have an account?{" "}
                        <Link
                          to="/signup"
                          className="text-primary font-bold hover:underline underline-offset-4 decoration-2"
                        >
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

        {/* IMAGE SECTION */}
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
                Connect the world.
              </h2>
              <p className="opacity-60 text-base leading-relaxed font-medium px-4">
                Secure messaging, crystal-clear video calls, and a vibrant community interface built for the modern internet.
              </p>

              {/* Feature badges with glassmorphism */}
              <div className="flex flex-wrap justify-center gap-3 pt-4">
                <span className="glass-panel-flat px-4 py-2 rounded-full text-sm font-semibold tracking-wide shadow-sm"><span className="text-primary mr-2">✦</span>Secure</span>
                <span className="glass-panel-flat px-4 py-2 rounded-full text-sm font-semibold tracking-wide shadow-sm"><span className="text-primary mr-2">✦</span>Fast</span>
                <span className="glass-panel-flat px-4 py-2 rounded-full text-sm font-semibold tracking-wide shadow-sm"><span className="text-primary mr-2">✦</span>Global</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default LoginPage;