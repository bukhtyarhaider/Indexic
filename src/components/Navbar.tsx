import React, { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Plus,
  Menu,
  X,
  Download,
  Upload,
  LogOut,
  Github,
  User as UserIcon,
  ChevronDown,
} from "lucide-react";
import logo from "../assets/logo.png";
import { Button } from "./ui/Button";
import { useAuth } from "../context/AuthContext";

interface NavbarProps {
  onExportJSON?: () => void;
  onImportJSON?: () => void;
  onGithubImport?: () => void;
  onNewProject?: () => void;
  hasProjects?: boolean;
  showActions?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  onExportJSON,
  onImportJSON,
  onGithubImport,
  onNewProject,
  hasProjects = false,
  showActions = true,
}) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut();
      navigate("/signin");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const getUserInitials = () => {
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    return user?.email?.substring(0, 2).toUpperCase() || "U";
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/5 bg-surface/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 sm:h-20">
          <div
            className="flex items-center gap-3 sm:gap-4 cursor-pointer group"
            onClick={() => navigate("/dashboard")}
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 relative flex items-center justify-center transition-transform group-hover:scale-105 duration-300">
              <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full group-hover:bg-primary/30 transition-colors"></div>
              <div className="relative flex items-center justify-center bg-surface-light rounded-xl p-2 border border-white/10 shadow-lg">
                <img
                  src={logo}
                  alt="Indexic Logo"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-display font-bold text-lg sm:text-xl text-white leading-none tracking-tight">
                INDEXIC
              </span>
              <span className="text-[10px] sm:text-xs text-text-secondary font-medium uppercase tracking-widest hidden sm:block opacity-70">
                Portfolio Manager
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            {showActions && (
              <>
                <div className="hidden md:flex items-center gap-2 mr-2">
                  <Button
                    variant="ghost"
                    onClick={onExportJSON}
                    disabled={!hasProjects}
                    className="text-text-secondary hover:text-white"
                    title="Export Data"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={onImportJSON}
                    className="text-text-secondary hover:text-white"
                    title="Import Data"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Import
                  </Button>
                </div>

                <div className="h-8 w-px bg-white/10 mx-2 hidden md:block"></div>

                <Button
                  variant="secondary"
                  onClick={onGithubImport}
                  className="hidden sm:flex"
                  leftIcon={<Github className="w-4 h-4" />}
                >
                  <span className="hidden lg:inline">Import GitHub</span>
                  <span className="lg:hidden">GitHub</span>
                </Button>

                <Button
                  variant="primary"
                  onClick={onNewProject}
                  className="hidden sm:flex shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-shadow"
                  leftIcon={<Plus className="w-4 h-4" />}
                >
                  <span className="hidden lg:inline">New Project</span>
                  <span className="lg:hidden">New</span>
                </Button>
              </>
            )}

            <div className="relative hidden sm:block">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-3 pl-2 pr-1 py-1 rounded-full hover:bg-white/5 transition-colors border border-transparent hover:border-white/10"
              >
                <div className="flex flex-col items-end mr-1">
                  <span className="text-sm font-semibold text-white leading-none">
                    {user?.user_metadata?.full_name || "User"}
                  </span>
                  <span className="text-[10px] text-text-secondary">
                    {user?.email}
                  </span>
                </div>
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center text-white font-bold text-sm shadow-inner ring-2 ring-background">
                  {getUserInitials()}
                </div>
                <ChevronDown className="w-4 h-4 text-text-secondary" />
              </button>

              {isUserMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsUserMenuOpen(false)}
                  />
                  <div className="absolute right-0 top-full mt-2 w-56 bg-surface border border-white/10 rounded-xl shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-200">
                    <div className="px-4 py-3 border-b border-white/5 mb-1">
                      <p className="text-sm text-white font-medium truncate">
                        Signed in as
                      </p>
                      <p className="text-xs text-text-secondary truncate">
                        {user?.email}
                      </p>
                    </div>
                    <Link
                      to="/profile"
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-text-secondary hover:text-white hover:bg-white/5 transition-colors"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <UserIcon className="w-4 h-4" />
                      Profile Settings
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>

            <Button
              variant="secondary"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="sm:hidden"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <>
          <div
            className="sm:hidden fixed inset-0 top-[64px] bg-black/60 z-40 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="sm:hidden absolute left-0 right-0 top-full z-50 border-t border-white/10 bg-surface shadow-2xl">
            <div className="p-4 space-y-3">
              <div className="flex items-center gap-3 px-2 py-3 mb-2 bg-white/5 rounded-xl border border-white/5">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold shadow-lg">
                  {getUserInitials()}
                </div>
                <div className="flex flex-col">
                  <span className="font-medium text-white">
                    {user?.user_metadata?.full_name || "User"}
                  </span>
                  <span className="text-xs text-text-secondary">
                    {user?.email}
                  </span>
                </div>
              </div>

              <Button
                variant="ghost"
                onClick={() => {
                  navigate("/profile");
                  setIsMobileMenuOpen(false);
                }}
                className="w-full justify-start h-12 text-base"
                leftIcon={<UserIcon className="w-5 h-5" />}
              >
                Profile Settings
              </Button>

              {showActions && (
                <>
                  <div className="h-px bg-white/10 my-2"></div>
                  <Button
                    variant="primary"
                    onClick={() => {
                      onNewProject?.();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full justify-start h-12 text-base"
                    leftIcon={<Plus className="w-5 h-5" />}
                  >
                    New Project
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      onGithubImport?.();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full justify-start h-12 text-base"
                    leftIcon={<Github className="w-5 h-5" />}
                  >
                    Import from GitHub
                  </Button>
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      variant="secondary"
                      onClick={() => {
                        onImportJSON?.();
                        setIsMobileMenuOpen(false);
                      }}
                      className="justify-center"
                      leftIcon={<Upload className="w-4 h-4" />}
                    >
                      Import
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => {
                        onExportJSON?.();
                        setIsMobileMenuOpen(false);
                      }}
                      disabled={!hasProjects}
                      className="justify-center"
                      leftIcon={<Download className="w-4 h-4" />}
                    >
                      Export
                    </Button>
                  </div>
                </>
              )}
              
              <div className="h-px bg-white/10 my-2"></div>
              
              <Button
                variant="ghost"
                onClick={() => {
                  handleLogout();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-500/10 h-12 text-base"
                leftIcon={<LogOut className="w-5 h-5" />}
              >
                Sign Out
              </Button>
            </div>
          </div>
        </>
      )}
    </nav>
  );
};
