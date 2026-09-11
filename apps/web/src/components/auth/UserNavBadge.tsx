/**
 * @file apps/web/src/components/auth/UserNavBadge.tsx
 * @description Blueprint-styled navigation badge showing guest login status or active engineer profile with stars and cloud sync.
 */

import React, { useState, useRef, useEffect, useMemo } from "react";
import { User, LogOut, ChevronDown, ShieldCheck } from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { useWorkbenchStore } from "../../store/workbenchStore";
import { AuthModal } from "./AuthModal";

interface UserNavBadgeProps {
  className?: string;
}

export const UserNavBadge: React.FC<UserNavBadgeProps> = ({ className = "" }) => {
  const { user, profile, signOut } = useAuthStore();
  const { taskMasteryStars } = useWorkbenchStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
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
  const callsign = profile?.callsign || user?.user_metadata?.callsign || user?.email?.split("@")[0] || "Engineer";
  const initials = callsign.slice(0, 2).toUpperCase();

  return (
    <div className={`relative inline-flex items-center ${className}`} ref={menuRef}>
      {/* ── State 1: Unauthenticated (Guest Mode) ── */}
      {!user ? (
        <button
          id="btn-auth-guest-login"
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-paper hover:bg-paper-muted border border-paper-border hover:border-cyan-500/50 text-ink font-balsamiq font-bold text-xs shadow-paper-sm transition-all cursor-pointer active:scale-95 group"
          title="Увійти в акаунт інженера або зберегти прогрес у хмарі"
        >
          <div className="w-5 h-5 rounded-lg bg-[#1A1D20]/10 group-hover:bg-cyan-500/20 text-[#1A1D20] group-hover:text-cyan-700 flex items-center justify-center transition-colors">
            <User size={13} />
          </div>
          <span className="font-mono text-[11px] text-ink-muted group-hover:text-ink font-semibold">
            👤 Гість: <span className="text-cyan-700 dark:text-cyan-400 font-bold underline decoration-dotted">Увійти</span>
          </span>
        </button>
      ) : (
        /* ── State 2: Authenticated (Active Engineer Profile) ── */
        <button
          id="btn-user-profile-menu"
          type="button"
          onClick={() => setIsMenuOpen((prev) => !prev)}
          className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-paper hover:bg-paper-muted border border-paper-border hover:border-cyan-600/40 shadow-paper-sm transition-all cursor-pointer active:scale-[0.98]"
          title={`${callsign} (${user.email})`}
        >
          {/* Avatar or Initials circle */}
          {profile?.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={callsign}
              className="w-5 h-5 rounded-full object-cover border border-cyan-500/40"
            />
          ) : (
            <div className="w-5 h-5 rounded-full bg-cyan-600/20 border border-cyan-500/40 text-cyan-800 dark:text-cyan-300 flex items-center justify-center text-[9px] font-mono font-extrabold">
              {initials}
            </div>
          )}

          {/* Callsign & Star Balance */}
          <div className="flex items-center gap-1.5 text-xs font-mono">
            <span className="font-bold text-ink truncate max-w-[90px] sm:max-w-[120px]">
              {callsign}
            </span>
            <div className="flex items-center gap-0.5 text-amber-600 dark:text-amber-400 font-bold text-[11px] bg-amber-500/10 px-1.5 py-0.5 rounded-md border border-amber-500/20">
              <span className="text-[10px]">★</span>
              <span>{totalStars}/57</span>
            </div>
          </div>

          {/* Online Sync Pill (Green dot) */}
          <div className="hidden md:flex items-center gap-1 text-[9px] font-mono font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-full border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>SYNC</span>
          </div>

          <ChevronDown
            size={13}
            className={`text-ink-muted transition-transform duration-200 ${
              isMenuOpen ? "rotate-180" : ""
            }`}
          />
        </button>
      )}

      {/* ── Dropdown Menu for Authenticated User ── */}
      {isMenuOpen && user && (
        <div className="absolute right-0 top-full mt-2 w-64 rounded-2xl bg-[#1E1E22] border border-white/10 shadow-[0_12px_36px_rgba(0,0,0,0.6)] py-2 z-50 animate-in fade-in zoom-in-95 duration-150 font-sans text-gray-200">
          {/* User Details Header */}
          <div className="px-4 py-2.5 border-b border-white/[0.08]">
            <div className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-cyan-400 shrink-0" />
              <div className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-bold">
                Акредитація інженера
              </div>
            </div>
            <div className="font-display font-extrabold text-sm text-white mt-1">
              {callsign}
            </div>
            <div className="font-mono text-[11px] text-gray-400 truncate">
              {user.email}
            </div>
          </div>

          {/* Sync & Stats row */}
          <div className="px-4 py-2 text-xs space-y-1.5 bg-[#17181B] border-b border-white/[0.06]">
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="text-gray-400">Хмарна синхронізація:</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                ONLINE
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="text-gray-400">Зірки майстерності:</span>
              <span className="text-amber-400 font-bold">★ {totalStars} / 57</span>
            </div>
          </div>

          {/* Actions */}
          <div className="p-1.5">
            <button
              type="button"
              onClick={() => {
                setIsMenuOpen(false);
                signOut();
              }}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-mono font-bold text-red-300 hover:text-red-100 hover:bg-red-950/40 border border-transparent hover:border-red-500/30 transition-all cursor-pointer"
            >
              <LogOut size={14} className="text-red-400" />
              <span>Вийти з акаунту</span>
            </button>
          </div>
        </div>
      )}

      {/* ── Auth Modal instance ── */}
      <AuthModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};
