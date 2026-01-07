import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import { useAuth } from "../context/AuthContext";
import { Loader2 } from "lucide-react";

export const SignIn: React.FC = () => {
  const { signIn, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Map Supabase error messages to user-friendly messages
  const getErrorMessage = (errorMsg: string): string => {
    const errorMap: Record<string, string> = {
      "Invalid login credentials":
        "Incorrect email or password. Please try again.",
      "Email not confirmed": "Please verify your email before signing in.",
      "Unable to validate email address: invalid format":
        "Please enter a valid email address.",
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
  const validateForm = (emailToValidate: string): string | null => {
    if (!emailToValidate.trim()) {
      return "Please enter your email address.";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailToValidate)) {
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

    // Normalize email: if user enters just username, append @prontx.com
    let normalizedEmail = email.trim();
    if (!normalizedEmail.includes("@")) {
      normalizedEmail = normalizedEmail + "@prontx.com";
    }

    // Validate using the normalized email directly
    const validationError = validateForm(normalizedEmail);
    if (validationError) {
      setError(validationError);
      setIsSubmitting(false);
      return;
    }

    // Update the email state with normalized version
    setEmail(normalizedEmail);

    try {
      const errorMsg = await signIn(normalizedEmail, password);
      if (errorMsg) {
        const friendlyError = getErrorMessage(errorMsg);
        setError(friendlyError);
        console.log("Sign in failed:", friendlyError);
      } else {
        console.log("Sign in successful");
        navigate("/dashboard");
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-6 sm:p-4 relative overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-10%] right-[-10%] w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-primary/10 rounded-full blur-[80px] sm:blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-primary/5 rounded-full blur-[80px] sm:blur-[120px]"></div>

      <div className="max-w-md w-full glass rounded-2xl sm:rounded-3xl overflow-hidden relative z-10 border border-white/5">
        <div className="p-6 sm:p-8 md:p-10">
          <div className="flex justify-center mb-6 sm:mb-8">
            <div className="w-20 h-20 sm:w-24 sm:h-24 relative flex items-center justify-center group">
              <div className="absolute inset-0 bg-primary/20 blur-xl sm:blur-2xl rounded-full group-hover:bg-primary/30 transition-all duration-500"></div>
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 bg-surface-highlight border border-white/10 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-inner transform group-hover:scale-105 transition-transform duration-300 overflow-hidden p-2.5 sm:p-3">
                <img
                  src={logo}
                  alt="PRONTX Logo"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          </div>

          <div className="text-center mb-6 sm:mb-8">
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight mb-1.5 sm:mb-2">
              Welcome back
            </h2>
            <p className="text-text-secondary text-xs sm:text-sm">
              Sign in with your @prontx.com account
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-2.5 sm:p-3 bg-red-500/10 border border-red-500/30 rounded-lg sm:rounded-xl">
              <p className="text-red-400 text-xs sm:text-sm text-center">
                {error}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            <div className="space-y-1.5">
              <label className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-text-secondary ml-1">
                Email Address
              </label>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-surface/40 border border-white/10 text-text-main rounded-lg sm:rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all placeholder:text-text-secondary/30 text-sm sm:text-base"
                placeholder="john.doe (or john.doe@prontx.com)"
              />
              <p className="text-[10px] sm:text-xs text-text-secondary/60 ml-1">
                @prontx.com will be added automatically
              </p>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center ml-1">
                <label className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-text-secondary">
                  Password
                </label>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-surface/40 border border-white/10 text-text-main rounded-lg sm:rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all placeholder:text-text-secondary/30 text-sm sm:text-base"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 sm:gap-3 px-4 py-3 sm:py-4 mt-2 bg-primary text-white rounded-lg sm:rounded-xl font-bold hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-primary/25 text-sm sm:text-base"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin h-5 w-5 text-white" />
                  <span>Signing In...</span>
                </>
              ) : (
                <span>Sign In</span>
              )}
            </button>
          </form>

          <div className="mt-6 sm:mt-8 text-center">
            <p className="text-xs sm:text-sm text-text-secondary">
              New here?{" "}
              <Link
                to="/signup"
                className="font-bold text-primary hover:text-white underline-offset-4 hover:underline transition-all"
              >
                Create an account
              </Link>
            </p>
          </div>
        </div>

        <div className="bg-white/[0.02] p-4 sm:p-5 border-t border-white/5 text-center">
          <p className="text-[9px] sm:text-[10px] uppercase tracking-[0.15em] sm:tracking-[0.2em] text-text-secondary/60 font-medium">
            &copy; {new Date().getFullYear()} PRONTX Indexic &bull; Secure
            Infrastructure
          </p>
        </div>
      </div>
    </div>
  );
};
