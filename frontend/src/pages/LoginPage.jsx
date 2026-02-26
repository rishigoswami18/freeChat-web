import { useState } from "react";
import { ShipWheel } from "lucide-react";
import { Link } from "react-router-dom";
import useLogin from "../hooks/useLogin";
import GoogleSignInButton from "../components/GoogleSignInButton";

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
    <div
      className="min-h-screen flex items-center justify-center p-4 sm:p-6 md:p-8 bg-gradient-to-br from-base-300 via-base-100 to-base-300"
      data-theme="forest"
    >
      <div className="border border-base-content/5 flex flex-col lg:flex-row w-full max-w-5xl mx-auto bg-base-100 rounded-2xl shadow-2xl shadow-black/20 overflow-hidden">
        {/* LOGIN FORM SECTION */}
        <div className="w-full lg:w-1/2 p-6 sm:p-10 flex flex-col justify-center">
          {/* LOGO */}
          <div className="mb-8 flex items-center justify-start gap-2.5">
            <div className="relative">
              <ShipWheel className="size-10 text-primary" />
              <div className="absolute -inset-2 bg-primary/20 rounded-full blur-lg" />
            </div>
            <span className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
              freeChat
            </span>
          </div>

          {/* ERROR MESSAGE DISPLAY */}
          {error && (
            <div className="alert alert-error mb-6 rounded-xl text-sm">
              <span>{error.response?.data?.message || "Login failed"}</span>
            </div>
          )}

          <div className="w-full">
            <form onSubmit={handleLogin}>
              <div className="space-y-5">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">Welcome Back</h2>
                  <p className="text-sm opacity-60 mt-1">
                    Sign in to continue your journey on freeChat
                  </p>
                </div>

                <div className="flex flex-col gap-4">
                  <div className="form-control w-full">
                    <label className="label">
                      <span className="label-text font-medium text-xs uppercase tracking-wider opacity-60">
                        Email
                      </span>
                    </label>
                    <input
                      type="email"
                      placeholder="hello@example.com"
                      className="input input-bordered w-full rounded-xl focus:input-primary transition-all bg-base-200/50"
                      value={loginData.email}
                      onChange={(e) =>
                        setLoginData({ ...loginData, email: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="form-control w-full">
                    <label className="label">
                      <span className="label-text font-medium text-xs uppercase tracking-wider opacity-60">
                        Password
                      </span>
                    </label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      className="input input-bordered w-full rounded-xl focus:input-primary transition-all bg-base-200/50"
                      value={loginData.password}
                      onChange={(e) =>
                        setLoginData({ ...loginData, password: e.target.value })
                      }
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary w-full rounded-xl shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-shadow text-base"
                    disabled={isPending}
                  >
                    {isPending ? (
                      <>
                        <span className="loading loading-spinner loading-xs"></span>
                        Signing in...
                      </>
                    ) : (
                      "Sign In"
                    )}
                  </button>

                  {/* Divider */}
                  <div className="flex items-center gap-3 my-1">
                    <div className="flex-1 h-px bg-base-300" />
                    <span className="text-xs font-medium opacity-40 uppercase tracking-wider">or</span>
                    <div className="flex-1 h-px bg-base-300" />
                  </div>

                  {/* Google Sign In */}
                  <GoogleSignInButton text="signin_with" />

                  <div className="text-center mt-2">
                    <p className="text-sm opacity-60">
                      Don't have an account?{" "}
                      <Link
                        to="/signup"
                        className="text-primary font-semibold hover:underline"
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

        {/* IMAGE SECTION */}
        <div className="hidden lg:flex w-full lg:w-1/2 bg-gradient-to-br from-primary/5 via-primary/10 to-secondary/5 items-center justify-center relative overflow-hidden">
          {/* Decorative blobs */}
          <div className="absolute top-10 right-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-10 left-10 w-40 h-40 bg-secondary/10 rounded-full blur-3xl" />

          <div className="max-w-md p-8 relative z-10">
            <div className="relative aspect-square max-w-sm mx-auto">
              <img
                src="/Video call-bro.png"
                alt="freeChat connection illustration"
                className="w-full h-full drop-shadow-lg"
              />
            </div>

            <div className="text-center space-y-3 mt-6">
              <h2 className="text-xl font-bold">
                Connect with people worldwide
              </h2>
              <p className="opacity-60 text-sm leading-relaxed">
                Secure messaging, crystal-clear video calls, and a community
                built on real connection
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default LoginPage;