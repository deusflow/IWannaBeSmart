/**
 * @file apps/web/src/components/auth/AuthModal.tsx
 * @description Blueprint paper-styled authentication modal with Google OAuth, Email/Password, and guest mode.
 */

import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { X, Mail, Lock, User, AlertCircle, LogIn, UserPlus, Cpu } from "lucide-react";
import { useAuthStore } from "../../store/authStore";

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
    isLoading,
    error,
    clearError,
    user,
  } = useAuthStore();

  const [mode, setMode] = useState<"signIn" | "signUp">(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [callsign, setCallsign] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  // Sync mode with initialMode
  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  // Clear errors when modal opens/closes or mode changes
  useEffect(() => {
    if (isOpen) {
      clearError();
      setLocalError(null);
    }
  }, [isOpen, mode, clearError]);

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

  const activeError = localError || error;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-md rounded-3xl bg-[#FAF7F2] text-[#1A1D20] border-2 border-[#1A1D20]/25 shadow-paper-lg overflow-hidden flex flex-col font-balsamiq animate-in zoom-in-95 duration-200"
      >
        {/* Modal Top Header (Blueprint paper header) */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1A1D20]/15 bg-[#EBE5DA]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-accent-blue/10 border border-accent-blue/30 text-accent-blue flex items-center justify-center shadow-paper-xs">
              <Cpu size={18} />
            </div>
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-accent-blue font-extrabold">
                {t("auth.badge", "ІНЖЕНЕРНА ТЕЛЕМЕТРІЯ")}
              </div>
              <h3 className="text-sm font-display font-extrabold text-[#1A1D20] tracking-tight">
                {mode === "signIn"
                  ? t("auth.titleSignIn", "Авторизація інженера")
                  : t("auth.titleSignUp", "Реєстрація профілю")}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-[#1A1D20]/5 hover:bg-[#1A1D20]/15 text-[#1A1D20]/70 hover:text-[#1A1D20] transition-all cursor-pointer"
            title={t("common.close", "Закрити")}
            aria-label={t("common.close", "Закрити")}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          {/* Mode Switcher Tabs */}
          <div className="grid grid-cols-2 gap-1 p-1 bg-[#E6DFCE] rounded-2xl border border-[#1A1D20]/15">
            <button
              type="button"
              onClick={() => setMode("signIn")}
              className={`flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-balsamiq font-bold transition-all cursor-pointer ${
                mode === "signIn"
                  ? "bg-[#FAF7F2] text-[#1A1D20] shadow-paper-xs border border-[#1A1D20]/15"
                  : "text-[#1A1D20]/60 hover:text-[#1A1D20]"
              }`}
            >
              <LogIn size={14} className={mode === "signIn" ? "text-accent-blue" : ""} />
              <span>{t("auth.tabSignIn", "Вхід")}</span>
            </button>
            <button
              type="button"
              onClick={() => setMode("signUp")}
              className={`flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-balsamiq font-bold transition-all cursor-pointer ${
                mode === "signUp"
                  ? "bg-[#FAF7F2] text-[#1A1D20] shadow-paper-xs border border-[#1A1D20]/15"
                  : "text-[#1A1D20]/60 hover:text-[#1A1D20]"
              }`}
            >
              <UserPlus size={14} className={mode === "signUp" ? "text-accent-blue" : ""} />
              <span>{t("auth.tabSignUp", "Реєстрація")}</span>
            </button>
          </div>

          {/* Google OAuth Quick Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl bg-white hover:bg-[#F4F0E8] active:scale-[0.99] text-[#1A1D20] font-balsamiq font-bold text-xs border border-[#1A1D20]/20 shadow-paper-xs transition-all cursor-pointer disabled:opacity-50"
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

          {/* Divider */}
          <div className="relative flex items-center justify-center my-1">
            <div className="w-full border-t border-[#1A1D20]/15" />
            <span className="bg-[#FAF7F2] px-3 text-[10px] font-mono uppercase text-[#1A1D20]/50 tracking-wider font-bold">
              {t("auth.orEmail", "або електронна пошта")}
            </span>
          </div>

          {/* Error Message */}
          {activeError && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-300 text-red-800 text-xs flex items-start gap-2.5 shadow-paper-xs animate-in fade-in duration-200">
              <AlertCircle size={16} className="text-red-600 shrink-0 mt-0.5" />
              <div className="leading-snug font-mono">{activeError}</div>
            </div>
          )}

          {/* Email/Password Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === "signUp" && (
              <div>
                <label className="block text-[11px] font-mono uppercase text-[#1A1D20]/70 font-bold mb-1">
                  {t("auth.callsignLabel", "Позивний інженера (Callsign)")}
                </label>
                <div className="relative flex items-center">
                  <User size={14} className="absolute left-3 text-[#1A1D20]/40 pointer-events-none" />
                  <input
                    type="text"
                    value={callsign}
                    onChange={(e) => setCallsign(e.target.value)}
                    placeholder={t("auth.callsignPlaceholder", "Наприклад: Ghost-01")}
                    className="w-full bg-white border border-[#1A1D20]/20 rounded-xl pl-9 pr-3 py-2 text-xs text-[#1A1D20] placeholder-[#1A1D20]/40 focus:outline-none focus:border-accent-blue focus:ring-2 focus:ring-accent-blue/20 font-mono shadow-paper-xs transition-all"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-mono uppercase text-[#1A1D20]/70 font-bold mb-1">
                {t("auth.emailLabel", "Email")}
              </label>
              <div className="relative flex items-center">
                <Mail size={14} className="absolute left-3 text-[#1A1D20]/40 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="engineer@corp.com"
                  required
                  className="w-full bg-white border border-[#1A1D20]/20 rounded-xl pl-9 pr-3 py-2 text-xs text-[#1A1D20] placeholder-[#1A1D20]/40 focus:outline-none focus:border-accent-blue focus:ring-2 focus:ring-accent-blue/20 font-mono shadow-paper-xs transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase text-[#1A1D20]/70 font-bold mb-1">
                {t("auth.passwordLabel", "Пароль (мінімум 6 символів)")}
              </label>
              <div className="relative flex items-center">
                <Lock size={14} className="absolute left-3 text-[#1A1D20]/40 pointer-events-none" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-white border border-[#1A1D20]/20 rounded-xl pl-9 pr-3 py-2 text-xs text-[#1A1D20] placeholder-[#1A1D20]/40 focus:outline-none focus:border-accent-blue focus:ring-2 focus:ring-accent-blue/20 font-mono shadow-paper-xs transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-2.5 px-4 rounded-xl bg-accent-blue hover:bg-accent-blue-hover active:scale-[0.99] text-white font-balsamiq font-bold text-xs uppercase tracking-wider shadow-paper transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
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

        {/* Modal Footer: Guest mode option */}
        <div className="px-6 py-3.5 bg-[#EBE5DA] border-t border-[#1A1D20]/15 flex items-center justify-between text-xs">
          <span className="text-[11px] font-mono text-[#1A1D20]/60">
            {t("auth.offlineNotice", "Offline-first: прогрес зберігається у браузері")}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="text-[11px] font-mono font-bold text-accent-blue hover:text-accent-blue-hover hover:underline cursor-pointer"
          >
            {t("auth.continueAsGuest", "Продовжити як гість →")}
          </button>
        </div>
      </div>
    </div>
  );
};
