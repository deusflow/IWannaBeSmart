/**
 * @file apps/web/src/components/auth/UserNavBadge.tsx
 * @description Blueprint engineering navigation badge showing guest login status or active engineer profile with stars and cloud sync.
 */

import React, { useState, useRef, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { User, LogOut, ChevronDown, ShieldCheck, Sparkles, LogIn, ArrowRight } from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { useWorkbenchStore } from "../../store/workbenchStore";
import { AuthModal } from "./AuthModal";
import { UserProfileModal } from "../profile/UserProfileModal";

interface UserNavBadgeProps {
  className?: string;
}

export const UserNavBadge: React.FC<UserNavBadgeProps> = ({ className = "" }) => {
  const { t } = useTranslation();
  const { user, profile, signOut } = useAuthStore();
  const taskMasteryStars = useWorkbenchStore((s) => s.taskMasteryStars);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Compute total stars from taskMasteryStars or profile
  const totalStars = useMemo(() => {
    const localSum = Object.values(taskMasteryStars).reduce((acc, s) => acc + (s || 0), 0);
    const profileStars = profile?.total_stars || 0;
    return Math.max(localSum, profileStars);
  }, [taskMasteryStars, profile?.total_stars]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);

  // Derived user display info
  const callsign = profile?.callsign || user?.user_metadata?.callsign || user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Engineer";
  const initials = callsign.slice(0, 2).toUpperCase();

  return (
    <div className={`relative inline-flex items-center ${className}`} ref={menuRef}>
      {/* ── State 1: Unauthenticated (Guest Mode) ── */}
      {!user ? (
        <button
          id="btn-auth-guest-login"
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2.5 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-2xl bg-[#EBE5D8] hover:bg-[#FAF8F2] border-2 border-[#1A1D20]/20 hover:border-accent-blue/50 text-[#1A1D20] shadow-paper-xs hover:shadow-paper-sm transition-all duration-200 cursor-pointer active:scale-[0.98] select-none group"
          title={t("auth.guestTooltip", "Увійти в акаунт інженера або зберегти прогрес у хмарі")}
        >
          {/* Engineering Key / Login Icon Box */}
          <div className="w-7 h-7 rounded-xl bg-accent-blue/15 border border-accent-blue/35 text-accent-blue flex items-center justify-center transition-all duration-200 group-hover:bg-accent-blue group-hover:text-white group-hover:scale-105 shadow-2xs shrink-0">
            <LogIn size={15} strokeWidth={2.2} />
          </div>

          {/* Two-tier Engineering Telemetry Typography */}
          <div className="text-left flex flex-col justify-center leading-none">
            <div className="flex items-center gap-1.5 text-[9px] font-mono font-bold uppercase tracking-wider text-[#1A1D20]/60 group-hover:text-accent-blue transition-colors">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              <span>{t("auth.guestStatus", "Гість • Offline")}</span>
            </div>
            <div className="font-display font-extrabold text-xs sm:text-sm text-[#1A1D20] group-hover:text-accent-blue flex items-center gap-1 mt-0.5 transition-colors">
              <span>{t("auth.guestLoginAction", "Увійти в акаунт")}</span>
              <ArrowRight
                size={13}
                strokeWidth={2.4}
                className="text-accent-blue/70 group-hover:text-accent-blue group-hover:translate-x-0.5 transition-transform"
              />
            </div>
          </div>
        </button>
      ) : (
        /* ── State 2: Authenticated (Active Engineer Profile) ── */
        <button
          id="btn-user-profile-menu"
          type="button"
          onClick={() => setIsMenuOpen((prev) => !prev)}
          className={`flex items-center gap-2.5 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-2xl bg-[#EBE5D8] hover:bg-[#FAF8F2] border-2 border-[#1A1D20]/20 hover:border-emerald-600/50 text-[#1A1D20] shadow-paper-xs hover:shadow-paper-sm transition-all duration-200 cursor-pointer active:scale-[0.98] select-none group ${
            isMenuOpen ? "ring-2 ring-emerald-600/20 border-emerald-600" : ""
          }`}
          title={`${callsign} (${user.email})`}
        >
          {/* Avatar or Monogram Squircle */}
          <div className="w-7 h-7 rounded-xl overflow-hidden border-2 border-emerald-600/40 shadow-xs flex items-center justify-center shrink-0 bg-white">
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={callsign}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-[#1A1D20] to-[#2C3038] text-white flex items-center justify-center text-[10px] font-mono font-black">
                {initials}
              </div>
            )}
          </div>

          {/* Callsign & Online Sync Status */}
          <div className="text-left flex flex-col justify-center leading-none">
            <div className="flex items-center gap-1.5 text-[9px] font-mono font-bold uppercase tracking-wider text-emerald-800">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>{t("auth.syncBadge", "SYNC")} • ONLINE</span>
            </div>
            <div className="font-display font-extrabold text-xs sm:text-sm text-[#1A1D20] truncate max-w-[95px] sm:max-w-[130px] mt-0.5">
              {callsign}
            </div>
          </div>

          {/* Star Balance Badge */}
          <div className="flex items-center gap-0.5 text-amber-900 font-bold text-[10px] font-mono bg-amber-500/20 px-2 py-0.5 rounded-md border border-amber-600/35 shadow-2xs">
            <span className="text-amber-600">★</span>
            <span>{totalStars}/57</span>
          </div>

          <ChevronDown
            size={14}
            strokeWidth={2.2}
            className={`text-[#1A1D20]/60 transition-transform duration-200 ${
              isMenuOpen ? "rotate-180 text-emerald-700" : ""
            }`}
          />
        </button>
      )}

      {/* ── Dropdown Menu for Authenticated User (Blueprint Vellum Card) ── */}
      {isMenuOpen && user && (
        <div className="absolute right-0 top-full mt-2 w-72 rounded-2xl bg-[#FAF8F2] border-2 border-[#1A1D20]/25 shadow-paper-lg p-2.5 z-50 animate-in fade-in zoom-in-95 duration-150 font-sans text-[#1A1D20] select-none">
          {/* User Details Header */}
          <div className="px-3.5 py-2.5 bg-[#EFE9DC] rounded-xl border border-[#1A1D20]/15 mb-2">
            <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-accent-blue font-bold">
              <ShieldCheck size={14} className="text-accent-blue shrink-0" />
              <span>{t("auth.accreditation", "Акредитація інженера")}</span>
            </div>
            <div className="font-display font-extrabold text-sm text-[#1A1D20] mt-1">
              {callsign}
            </div>
            <div className="font-mono text-[11px] text-[#1A1D20]/60 truncate">
              {user.email}
            </div>
          </div>

          {/* Cloud Sync & Mastery Overview */}
          <div className="px-3 py-2 text-[11px] font-mono border-b border-[#1A1D20]/10 space-y-1.5 text-[#1A1D20]/75">
            <div className="flex items-center justify-between">
              <span>{t("auth.cloudSync", "Хмарна синхронізація:")}</span>
              <span className="text-emerald-700 font-bold flex items-center gap-1 bg-emerald-500/15 border border-emerald-600/30 px-1.5 py-0.5 rounded text-[10px]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {t("auth.online", "ONLINE")}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>{t("auth.masteryStars", "Зірки майстерності:")}</span>
              <span className="text-amber-800 font-bold bg-amber-500/20 border border-amber-600/30 px-1.5 py-0.5 rounded text-[10px] flex items-center gap-1">
                <Sparkles size={11} className="text-amber-600" />
                <span>★ {totalStars} / 57</span>
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-2 space-y-1">
            <button
              id="btn-open-user-profile"
              type="button"
              onClick={() => {
                setIsMenuOpen(false);
                setIsProfileModalOpen(true);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-display font-bold text-[#1A1D20] hover:bg-[#EBE5D8] border border-transparent hover:border-[#1A1D20]/15 transition-colors cursor-pointer"
            >
              <User size={15} className="text-accent-blue shrink-0" />
              <span>{t("profile.openProfileBtn", "Мій профіль та аналітика")}</span>
            </button>

            <button
              id="btn-auth-sign-out"
              type="button"
              onClick={async () => {
                setIsMenuOpen(false);
                await signOut();
              }}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-display font-bold text-accent-break hover:bg-accent-break/10 border border-transparent hover:border-accent-break/20 transition-colors cursor-pointer"
            >
              <LogOut size={15} className="text-accent-break shrink-0" />
              <span>{t("auth.signOut", "Вийти з акаунту")}</span>
            </button>
          </div>
        </div>
      )}

      {/* ── Auth Modal instance ── */}
      <AuthModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

      {/* ── User Profile & Analytics Modal instance ── */}
      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />
    </div>
  );
};
