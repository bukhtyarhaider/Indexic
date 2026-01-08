import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { Navbar } from "../components/Navbar";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { User as UserIcon, Lock, Save, Shield, Sparkles } from "lucide-react";

export const Profile: React.FC = () => {
  const { user, updateProfile, updatePassword } = useAuth();
  const { showSuccess, showError } = useToast();

  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  useEffect(() => {
    if (user?.user_metadata?.full_name) {
      setFullName(user.user_metadata.full_name);
    }
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) return;

    setIsUpdatingProfile(true);
    try {
      const error = await updateProfile({ full_name: fullName });
      if (error) {
        showError(error);
      } else {
        showSuccess("Profile updated successfully!");
      }
    } catch (error) {
      showError("Failed to update profile.");
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      showError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      showError("Password must be at least 6 characters.");
      return;
    }

    setIsUpdatingPassword(true);
    try {
      const error = await updatePassword(password);
      if (error) {
        showError(error);
      } else {
        showSuccess("Password updated successfully!");
        setPassword("");
        setConfirmPassword("");
      }
    } catch (error) {
      showError("Failed to update password.");
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const getUserInitials = () => {
    if (fullName) {
      return fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    return user?.email?.substring(0, 2).toUpperCase() || "U";
  };

  return (
    <div className="min-h-screen bg-background text-text-main font-sans pb-32">
      <Navbar showActions={false} />

      <div className="relative pt-12 pb-20 sm:pt-16 sm:pb-24 lg:pb-32 overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full z-0 pointer-events-none">
          <div className="absolute top-20 left-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl opacity-60"></div>
          <div className="absolute bottom-20 right-20 w-[30rem] h-[30rem] bg-indigo-500/10 rounded-full blur-3xl opacity-60"></div>
        </div>

        <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 animate-in slide-in-from-bottom-5 fade-in duration-500">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-white mb-4">
              Your Profile
            </h1>
            <p className="text-text-secondary text-lg max-w-2xl mx-auto">
              Manage your personal information and account security settings.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Sidebar / User Summary */}
            <div className="lg:col-span-4 animate-in slide-in-from-bottom-8 fade-in duration-700 delay-100">
              <Card
                variant="surface"
                className="p-8 flex flex-col items-center text-center borde-white/5 bg-surface/50 backdrop-blur-xl"
              >
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center mb-6 shadow-xl ring-4 ring-white/5">
                  <span className="text-4xl font-bold text-white">
                    {getUserInitials()}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-white mb-1">
                  {fullName || "User"}
                </h2>
                <p className="text-sm text-text-secondary mb-6 break-all">
                  {user?.email}
                </p>
                
                <div className="w-full flex flex-col gap-2">
                  <div className="p-3 rounded-lg bg-surface-highlight border border-white/5 flex items-center gap-3">
                    <div className="p-2 rounded-md bg-green-500/10 text-green-400">
                        <Shield className="w-4 h-4"/>
                    </div>
                    <div className="text-left">
                        <p className="text-xs text-text-secondary font-medium uppercase">Account Status</p>
                        <p className="text-sm font-semibold text-white">Active</p>
                    </div>
                  </div>
                   <div className="p-3 rounded-lg bg-surface-highlight border border-white/5 flex items-center gap-3">
                    <div className="p-2 rounded-md bg-purple-500/10 text-purple-400">
                        <Sparkles className="w-4 h-4"/>
                    </div>
                    <div className="text-left">
                        <p className="text-xs text-text-secondary font-medium uppercase">Role</p>
                        <p className="text-sm font-semibold text-white">Agency Owner</p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Main Content Areas */}
            <div className="lg:col-span-8 space-y-6">
              {/* Personal Information */}
              <div className="animate-in slide-in-from-bottom-10 fade-in duration-700 delay-200">
                <Card variant="surface" className="overflow-hidden border-white/5 bg-surface/50 backdrop-blur-xl">
                  <div className="px-6 py-4 border-b border-white/5 bg-surface-highlight/30 flex items-center gap-3">
                    <UserIcon className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold text-white">
                      Personal Information
                    </h3>
                  </div>
                  <div className="p-6">
                    <form onSubmit={handleUpdateProfile} className="space-y-6">
                      <div className="grid gap-6 sm:grid-cols-2">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-text-secondary">
                            Email Address
                          </label>
                          <Input
                            value={user?.email || ""}
                            disabled
                            className="bg-surface/50 opacity-75 cursor-not-allowed"
                            rightIcon={<Lock className="w-4 h-4 text-text-secondary"/>}
                          />
                        </div>

                        <div className="space-y-2">
                          <label
                            htmlFor="fullName"
                            className="text-sm font-medium text-text-secondary"
                          >
                            Display Name
                          </label>
                          <Input
                            id="fullName"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="Enter your full name"
                            className="bg-surface-highlight/50 focus:bg-surface-highlight transition-colors"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end pt-2">
                        <Button
                          type="submit"
                          isLoading={isUpdatingProfile}
                          className="w-full sm:w-auto"
                          leftIcon={<Save className="w-4 h-4" />}
                        >
                          Save Changes
                        </Button>
                      </div>
                    </form>
                  </div>
                </Card>
              </div>

              {/* Security */}
             <div className="animate-in slide-in-from-bottom-12 fade-in duration-700 delay-300">
                <Card variant="surface" className="overflow-hidden border-white/5 bg-surface/50 backdrop-blur-xl">
                  <div className="px-6 py-4 border-b border-white/5 bg-surface-highlight/30 flex items-center gap-3">
                    <Lock className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold text-white">Security</h3>
                  </div>
                  <div className="p-6">
                    <form onSubmit={handleUpdatePassword} className="space-y-6">
                      <div className="grid gap-6 sm:grid-cols-2">
                        <div className="space-y-2">
                          <label
                            htmlFor="newPassword"
                            className="text-sm font-medium text-text-secondary"
                          >
                            New Password
                          </label>
                          <Input
                            id="newPassword"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Min. 6 characters"
                             className="bg-surface-highlight/50 focus:bg-surface-highlight transition-colors"
                          />
                        </div>

                        <div className="space-y-2">
                          <label
                            htmlFor="confirmPassword"
                            className="text-sm font-medium text-text-secondary"
                          >
                            Confirm Password
                          </label>
                          <Input
                            id="confirmPassword"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm new password"
                             className="bg-surface-highlight/50 focus:bg-surface-highlight transition-colors"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end pt-2">
                        <Button
                          type="submit"
                          isLoading={isUpdatingPassword}
                           className="w-full sm:w-auto"
                          leftIcon={<Save className="w-4 h-4" />}
                        >
                          Update Password
                        </Button>
                      </div>
                    </form>
                  </div>
                </Card>
             </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
