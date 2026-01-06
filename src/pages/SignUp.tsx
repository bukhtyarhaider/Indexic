import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import { useAuth } from "../context/AuthContext";

export const SignUp: React.FC = () => {
  const { signUp, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [verificationPending, setVerificationPending] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState("");

  // Map Supabase error messages to user-friendly messages
  const getErrorMessage = (errorMsg: string): string => {
    const errorMap: Record<string, string> = {
      "User already registered": "An account with this email already exists.",
      "Password should be at least 6 characters":
        "Password must be at least 6 characters long.",
      "Unable to validate email address: invalid format":
        "Please enter a valid email address.",
      "Signup requires a valid password": "Please enter a valid password.",
      "Email rate limit exceeded": "Too many attempts. Please try again later.",
      "For security purposes, you can only request this once every 60 seconds":
        "Please wait a moment before trying again.",
    };

    for (const [key, value] of Object.entries(errorMap)) {
      if (errorMsg.toLowerCase().includes(key.toLowerCase())) {
        return value;
      }
    }

    return errorMsg || "An error occurred. Please try again.";
  };

  // Client-side validation
  const validateForm = (): string | null => {
    if (!fullName.trim()) {
      return "Please enter your full name.";
    }

    if (!email.trim()) {
      return "Please enter your email address.";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return "Please enter a valid email address.";
    }

    if (!password) {
      return "Please enter your password.";
    }

    if (password.length < 6) {
      return "Password must be at least 6 characters long.";
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      setIsSubmitting(false);
      return;
    }

    try {
      const errorMsg = await signUp(email, password, fullName.trim());
      if (errorMsg) {
        const friendlyError = getErrorMessage(errorMsg);
        setError(friendlyError);
        console.log("Sign up failed:", friendlyError);
      } else {
        setVerificationEmail(email);
        setVerificationPending(true);
        setEmail("");
        setPassword("");
        setFullName("");
        console.log("Sign up successful, verification pending");
      }
    } catch (err) {
      const errorMessage =
        "Something went wrong. Please check your connection and try again.";
      setError(errorMessage);
      console.error("Auth error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show verification pending UI
  if (verificationPending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px]"></div>

        <div className="max-w-md w-full glass rounded-3xl overflow-hidden relative z-10 border border-white/5">
          <div className="p-8 sm:p-10 text-center">
            {/* Email Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center">
                <svg
                  className="w-10 h-10 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
            </div>

            <h2 className="text-2xl font-display font-bold text-white mb-3">
              Check your email
            </h2>

            <p className="text-text-secondary mb-2">
              We've sent a verification link to:
            </p>
            <p className="text-primary font-semibold mb-6">
              {verificationEmail}
            </p>

            <p className="text-text-secondary text-sm mb-8">
              Click the link in the email to verify your account. You can then
              return here to sign in.
            </p>

            <Link
              to="/signin"
              className="block w-full px-4 py-3 bg-primary text-white rounded-xl font-bold hover:brightness-110 transition-all text-center"
            >
              Back to Sign In
            </Link>

            <p className="text-text-secondary text-xs mt-6">
              Didn't receive the email? Check your spam folder or{" "}
              <button
                onClick={() => setVerificationPending(false)}
                className="text-primary hover:underline"
              >
                try signing up again
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px]"></div>

      <div className="max-w-md w-full glass rounded-3xl overflow-hidden relative z-10 border border-white/5">
        <div className="p-8 sm:p-10">
          <div className="flex justify-center mb-8">
            <div className="w-24 h-24 relative flex items-center justify-center group">
              <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full group-hover:bg-primary/30 transition-all duration-500"></div>
              <div className="relative w-20 h-20 bg-surface-highlight border border-white/10 rounded-2xl flex items-center justify-center shadow-inner transform group-hover:scale-105 transition-transform duration-300 overflow-hidden p-3">
                <img
                  src={logo}
                  alt="PRONTX Logo"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-3xl font-display font-bold text-white tracking-tight mb-2">
              Create account
            </h2>
            <p className="text-text-secondary text-sm">
              Join our community and start building today
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl">
              <p className="text-red-400 text-sm text-center">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-text-secondary ml-1">
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="w-full px-4 py-3 bg-surface/40 border border-white/10 text-text-main rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all placeholder:text-text-secondary/30"
                placeholder="John Doe"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-text-secondary ml-1">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-surface/40 border border-white/10 text-text-main rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all placeholder:text-text-secondary/30"
                placeholder="name@company.com"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center ml-1">
                <label className="text-xs font-bold uppercase tracking-wider text-text-secondary">
                  Password
                </label>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-3 bg-surface/40 border border-white/10 text-text-main rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all placeholder:text-text-secondary/30"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-3 px-4 py-4 mt-2 bg-primary text-white rounded-xl font-bold hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-primary/25"
            >
              {isSubmitting ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span>Creating Account...</span>
                </>
              ) : (
                <span>Get Started</span>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-text-secondary">
              Already a member?{" "}
              <Link
                to="/signin"
                className="font-bold text-primary hover:text-white underline-offset-4 hover:underline transition-all"
              >
                Sign in to your account
              </Link>
            </p>
          </div>
        </div>

        <div className="bg-white/[0.02] p-5 border-t border-white/5 text-center">
          <p className="text-[10px] uppercase tracking-[0.2em] text-text-secondary/60 font-medium">
            &copy; {new Date().getFullYear()} PRONTX Indexic &bull; Secure
            Infrastructure
          </p>
        </div>
      </div>
    </div>
  );
};
