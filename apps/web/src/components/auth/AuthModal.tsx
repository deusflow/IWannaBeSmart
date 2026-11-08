/**
 * @file apps/web/src/components/auth/AuthModal.tsx
 * @description Blueprint engineering authentication modal with Google OAuth, Email/Password, and guest mode.
 */

import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  X,
  Mail,
  Lock,
  User,
  AlertCircle,
  LogIn,
  UserPlus,
  Cpu,
  Eye,
  EyeOff,
  ShieldCheck,
} from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { LanguageSwitcher } from "../workbench/LanguageSwitcher";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: "signIn" | "signUp";
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = "signIn",
}) => {
  const { t } = useTranslation();
  const {
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    continueAsGuest,
    isLoading,
    error,
    clearError,
    user,
  } = useAuthStore();

  const [mode, setMode] = useState<"signIn" | "signUp">(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [callsign, setCallsign] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  // Sync mode with initialMode if prop changed
  const [prevInitialMode, setPrevInitialMode] = useState(initialMode);
  if (prevInitialMode !== initialMode) {
    setPrevInitialMode(initialMode);
    setMode(initialMode);
    setLocalError(null);
  }

  // Clear errors when modal transitions to open
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  if (prevIsOpen !== isOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) {
      clearError();
      setLocalError(null);
    }
  }

  const handleSwitchMode = (newMode: "signIn" | "signUp") => {
    setMode(newMode);
    setLocalError(null);
    clearError();
  };

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Automatically close if user becomes authenticated
  useEffect(() => {
    if (user && isOpen) {
      onClose();
    }
  }, [user, isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearError();

    if (!email.trim() || !password.trim()) {
      setLocalError(t("auth.requiredFields", "Будь ласка, заповніть усі обов'язкові поля"));
      return;
    }

    if (password.length < 6) {
      setLocalError(t("auth.passwordMinLength", "Пароль має містити щонайменше 6 символів"));
      return;
    }

    if (mode === "signIn") {
      const { error: err } = await signInWithEmail(email.trim(), password);
      if (!err) {
        onClose();
      }
    } else {
      const { error: err } = await signUpWithEmail(
        email.trim(),
        password,
        callsign.trim() || undefined
      );
      if (!err) {
        onClose();
      }
    }
  };

  const handleGoogleSignIn = async () => {
    setLocalError(null);
    clearError();
    const { error: err } = await signInWithGoogle();
    if (!err) {
      onClose();
    }
  };

  const handleGuestSignIn = async () => {
    setLocalError(null);
    clearError();
    const { error: err } = await continueAsGuest();
    if (!err) {
      onClose();
    }
  };

  const activeError = localError || error;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in select-none">
      <div
        className="relative w-full max-w-md bg-white text-obsidian rounded-3xl border border-black/[0.08] shadow-luxury overflow-hidden flex flex-col font-sans animate-in zoom-in-95 duration-200"
      >
        {/* Modal Top Header */}
        <div className="relative z-10 flex items-center justify-between px-6 py-5 border-b border-black/[0.06] bg-slate-50/70">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-[#252932]/10 border border-[#252932]/20 text-[#252932] flex items-center justify-center shadow-2xs shrink-0">
              <Cpu size={20} strokeWidth={2.2} />
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-widest text-slate-500">
                <ShieldCheck size={13} className="text-emerald-700" />
                <span>{t("auth.badge", "ІНЖЕНЕРНА ТЕЛЕМЕТРІЯ")}</span>
              </div>
              <h3 className="text-lg font-display font-extrabold text-obsidian tracking-tight mt-0.5">
                {mode === "signIn"
                  ? t("auth.titleSignIn", "Авторизація інженера")
                  : t("auth.titleSignUp", "Реєстрація профілю")}
              </h3>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSwitcher compact />
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 border border-black/[0.06] flex items-center justify-center text-slate-700 transition-all cursor-pointer"
              title={t("common.close", "Закрити")}
              aria-label={t("common.close", "Закрити")}
            >
              <X size={16} strokeWidth={2.4} />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="relative z-10 p-6 space-y-5">
          {/* Mode Switcher Tabs */}
          <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-2xl border border-black/[0.06]">
            <button
              type="button"
              onClick={() => handleSwitchMode("signIn")}
              className={`flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-display transition-all cursor-pointer ${
                mode === "signIn"
                  ? "bg-white text-obsidian font-extrabold shadow-2xs"
                  : "text-slate-500 hover:text-obsidian hover:bg-black/5 font-semibold"
              }`}
            >
              <LogIn size={14} strokeWidth={2.2} />
              <span>{t("auth.tabSignIn", "Вхід")}</span>
            </button>
            <button
              type="button"
              onClick={() => handleSwitchMode("signUp")}
              className={`flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-display transition-all cursor-pointer ${
                mode === "signUp"
                  ? "bg-white text-obsidian font-extrabold shadow-2xs"
                  : "text-slate-500 hover:text-obsidian hover:bg-black/5 font-semibold"
              }`}
            >
              <UserPlus size={14} strokeWidth={2.2} />
              <span>{t("auth.tabSignUp", "Реєстрація")}</span>
            </button>
          </div>

          {/* Google OAuth Quick Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-white hover:bg-slate-50 active:scale-[0.99] text-obsidian font-display font-bold text-xs shadow-2xs border border-black/[0.08] hover:border-black/[0.15] transition-all cursor-pointer disabled:opacity-50"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>{t("auth.googleSignIn", "Продовжити через Google")}</span>
          </button>

          {/* Guest Mode Quick Button */}
          <button
            type="button"
            onClick={handleGuestSignIn}
            disabled={isLoading}
            className="w-full flex flex-col items-center justify-center py-2.5 px-4 rounded-xl bg-slate-50/80 hover:bg-slate-100 active:scale-[0.99] text-obsidian shadow-2xs border border-black/[0.08] transition-all cursor-pointer disabled:opacity-50 group"
          >
            <div className="flex items-center gap-2 font-display font-bold text-xs text-obsidian group-hover:text-[#252932] transition-colors">
              <User size={14} className="text-[#252932]" />
              <span>{t("auth.continueAsGuest", "Продовжити як гість")}</span>
            </div>
            <span className="text-[10px] font-mono text-slate-500 mt-0.5">
              {t("auth.guestProgressNotice", "Прогрес збережеться тільки на цьому пристрої")}
            </span>
          </button>

          {/* Divider */}
          <div className="relative flex items-center justify-center my-1">
            <div className="w-full border-t border-black/[0.06]" />
            <span className="bg-white px-3 text-[10px] font-mono uppercase text-slate-400 tracking-wider font-bold">
              {t("auth.orEmail", "або електронна пошта")}
            </span>
          </div>

          {/* Error Message */}
          {activeError && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5 font-mono shadow-2xs animate-in fade-in duration-200">
              <AlertCircle size={16} className="text-rose-600 shrink-0 mt-0.5" />
              <div className="leading-snug">{activeError}</div>
            </div>
          )}

          {/* Email/Password Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {mode === "signUp" && (
              <div>
                <label className="block text-[11px] font-mono uppercase text-slate-600 font-bold mb-1.5">
                  {t("auth.callsignLabel", "Позивний інженера (Callsign)")}
                </label>
                <div className="relative flex items-center">
                  <User size={15} className="absolute left-3.5 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    value={callsign}
                    onChange={(e) => setCallsign(e.target.value)}
                    placeholder={t("auth.callsignPlaceholder", "Наприклад: Ghost-01")}
                    className="w-full bg-slate-50/50 border border-black/[0.12] hover:border-black/[0.25] focus:border-[#252932] focus:ring-2 focus:ring-[#252932]/15 rounded-xl pl-10 pr-4 py-2.5 text-xs text-obsidian placeholder-slate-400 font-mono transition-all outline-none shadow-2xs"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-mono uppercase text-slate-600 font-bold mb-1.5">
                {t("auth.emailLabel", "Email")}
              </label>
              <div className="relative flex items-center">
                <Mail size={15} className="absolute left-3.5 text-slate-400 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="engineer@corp.com"
                  required
                  className="w-full bg-slate-50/50 border border-black/[0.12] hover:border-black/[0.25] focus:border-[#252932] focus:ring-2 focus:ring-[#252932]/15 rounded-xl pl-10 pr-4 py-2.5 text-xs text-obsidian placeholder-slate-400 font-mono transition-all outline-none shadow-2xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase text-slate-600 font-bold mb-1.5">
                {t("auth.passwordLabel", "Пароль (мінімум 6 символів)")}
              </label>
              <div className="relative flex items-center">
                <Lock size={15} className="absolute left-3.5 text-slate-400 pointer-events-none" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-slate-50/50 border border-black/[0.12] hover:border-black/[0.25] focus:border-[#252932] focus:ring-2 focus:ring-[#252932]/15 rounded-xl pl-10 pr-10 py-2.5 text-xs text-obsidian placeholder-slate-400 font-mono transition-all outline-none shadow-2xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 text-slate-400 hover:text-obsidian transition-colors cursor-pointer"
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-[#252932] hover:bg-[#1A1D24] active:scale-[0.99] text-white font-display font-extrabold text-xs sm:text-sm uppercase tracking-wider shadow-luxury border border-[#252932] transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>{t("auth.processing", "Обробка...")}</span>
                </>
              ) : mode === "signIn" ? (
                <span>{t("auth.submitSignIn", "Увійти в систему")}</span>
              ) : (
                <span>{t("auth.submitSignUp", "Створити профіль")}</span>
              )}
            </button>
          </form>
        </div>

        {/* Modal Footer */}
        <div className="relative z-10 px-6 py-4 bg-slate-50/70 border-t border-black/[0.06] flex items-center justify-between text-xs">
          <span className="text-[11px] font-mono text-slate-500 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
            <span>{t("auth.offlineNotice", "Offline-first: прогрес зберігається у браузері")}</span>
          </span>
          <button
            type="button"
            onClick={handleGuestSignIn}
            className="text-[11px] font-display font-bold text-slate-700 hover:text-obsidian flex items-center gap-1 cursor-pointer"
          >
            <span>{t("auth.continueAsGuest", "Продовжити як гість")} →</span>
          </button>
        </div>
      </div>
    </div>
  );
};
