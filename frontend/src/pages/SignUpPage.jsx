import { useState } from "react";
import { ShipWheel } from "lucide-react";
import { Link } from "react-router-dom";

import useSignUp from "../hooks/useSignUp";
import GoogleSignInButton from "../components/GoogleSignInButton";

const SignUpPage = () => {
  const [signupData, setSignupData] = useState({
    fullName: "",
    email: "",
    password: "",
    dateOfBirth: "",
  });

  const maxDate = new Date();
  const maxDateStr = maxDate.toISOString().split("T")[0];

  const { isPending, error, signupMutation } = useSignUp();

  const handleSignup = (e) => {
    e.preventDefault();
    signupMutation(signupData);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 sm:p-6 md:p-8 bg-gradient-to-br from-base-300 via-base-100 to-base-300"
      data-theme="forest"
    >
      <div className="border border-base-content/5 flex flex-col lg:flex-row w-full max-w-5xl mx-auto bg-base-100 rounded-2xl shadow-2xl shadow-black/20 overflow-hidden">
        {/* SIGNUP FORM - LEFT SIDE */}
        <div className="w-full lg:w-1/2 p-6 sm:p-10 flex flex-col justify-center">
          {/* LOGO */}
          <div className="mb-6 flex items-center justify-start gap-2.5">
            <div className="relative">
              <ShipWheel className="size-10 text-primary" />
              <div className="absolute -inset-2 bg-primary/20 rounded-full blur-lg" />
            </div>
            <span className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
              freeChat
            </span>
          </div>

          {/* ERROR MESSAGE IF ANY */}
          {error && (
            <div className="alert alert-error mb-4 rounded-xl text-sm">
              <span>{error.response?.data?.message || "Signup failed"}</span>
            </div>
          )}

          <div className="w-full">
            <form onSubmit={handleSignup}>
              <div className="space-y-4">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">
                    Create an Account
                  </h2>
                  <p className="text-sm opacity-60 mt-1">
                    Join freeChat and start connecting with real people
                  </p>
                </div>

                <div className="space-y-3">
                  {/* FULLNAME */}
                  <div className="form-control w-full">
                    <label className="label py-1">
                      <span className="label-text font-medium text-xs uppercase tracking-wider opacity-60">
                        Full Name
                      </span>
                    </label>
                    <input
                      type="text"
                      placeholder="John Doe"
                      className="input input-bordered w-full rounded-xl focus:input-primary transition-all bg-base-200/50"
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
                    <label className="label py-1">
                      <span className="label-text font-medium text-xs uppercase tracking-wider opacity-60">
                        Email
                      </span>
                    </label>
                    <input
                      type="email"
                      placeholder="john@gmail.com"
                      className="input input-bordered w-full rounded-xl focus:input-primary transition-all bg-base-200/50"
                      value={signupData.email}
                      onChange={(e) =>
                        setSignupData({
                          ...signupData,
                          email: e.target.value,
                        })
                      }
                      required
                    />
                  </div>

                  {/* PASSWORD */}
                  <div className="form-control w-full">
                    <label className="label py-1">
                      <span className="label-text font-medium text-xs uppercase tracking-wider opacity-60">
                        Password
                      </span>
                    </label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      className="input input-bordered w-full rounded-xl focus:input-primary transition-all bg-base-200/50"
                      value={signupData.password}
                      onChange={(e) =>
                        setSignupData({
                          ...signupData,
                          password: e.target.value,
                        })
                      }
                      required
                    />
                    <p className="text-[11px] opacity-50 mt-1.5 pl-1">
                      Minimum 6 characters
                    </p>
                  </div>

                  {/* DATE OF BIRTH */}
                  <div className="form-control w-full">
                    <label className="label py-1">
                      <span className="label-text font-medium text-xs uppercase tracking-wider opacity-60">
                        Date of Birth
                      </span>
                    </label>
                    <input
                      type="date"
                      className="input input-bordered w-full rounded-xl focus:input-primary transition-all bg-base-200/50"
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

                  <div className="form-control">
                    <label className="label cursor-pointer justify-start gap-2.5">
                      <input
                        type="checkbox"
                        className="checkbox checkbox-sm checkbox-primary"
                        required
                      />
                      <span className="text-xs leading-tight opacity-70">
                        I agree to the{" "}
                        <Link
                          to="/terms"
                          className="text-primary hover:underline font-medium"
                        >
                          Terms of Service
                        </Link>{" "}
                        and{" "}
                        <Link
                          to="/privacy-policy"
                          className="text-primary hover:underline font-medium"
                        >
                          Privacy Policy
                        </Link>
                      </span>
                    </label>
                  </div>
                </div>

                <button
                  className="btn btn-primary w-full rounded-xl shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-shadow text-base"
                  type="submit"
                >
                  {isPending ? (
                    <>
                      <span className="loading loading-spinner loading-xs"></span>
                      Creating account...
                    </>
                  ) : (
                    "Create Account"
                  )}
                </button>

                {/* Google Sign Up */}
                <GoogleSignInButton text="signup_with" />

                <div className="text-center mt-2">
                  <p className="text-sm opacity-60">
                    Already have an account?{" "}
                    <Link
                      to="/login"
                      className="text-primary font-semibold hover:underline"
                    >
                      Sign in
                    </Link>
                  </p>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* SIGNUP FORM - RIGHT SIDE */}
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

export default SignUpPage;