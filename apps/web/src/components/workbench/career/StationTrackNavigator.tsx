/**
 * @file apps/web/src/components/workbench/career/StationTrackNavigator.tsx
 * @description Data-driven seamless station transition actions for all StationVictoryModals.
 * Automatically resolves next track station or War Room graduation challenge via trackManifest.
 */

import React from "react";
import { useTranslation } from "react-i18next";
import { ArrowRight, Zap, LayoutGrid } from "lucide-react";
import { useWorkbenchStore } from "../../../store/workbenchStore";
import { useShallow } from "zustand/react/shallow";
import { getNextStationInTrack } from "./trackManifest";
import { audioFx } from "../../../utils/audioFx";

interface StationTrackNavigatorProps {
  currentStationId: string;
  onClose: () => void;
  accentClassName?: string;
  secondaryClassName?: string;
}

export const StationTrackNavigator: React.FC<StationTrackNavigatorProps> = ({
  currentStationId,
  onClose,
  accentClassName = "bg-[#1E2227] hover:bg-black text-white",
  secondaryClassName = "bg-[#FAF8F2] hover:bg-[#F0EDE6] text-[#1E2227] border border-[#1E2227]/25",
}) => {
  const { t } = useTranslation();
  const { userTrack, setCurrentStationId, setCurrentView } = useWorkbenchStore(
    useShallow((s) => ({
      userTrack: s.userTrack,
      setCurrentStationId: s.setCurrentStationId,
      setCurrentView: s.setCurrentView,
    }))
  );

  const {
    nextStationId,
    isLast,
    nextStationTitleKey,
    nextStationDefaultTitle,
  } = getNextStationInTrack(currentStationId, userTrack);

  const nextStationName = nextStationTitleKey
    ? t(nextStationTitleKey, nextStationDefaultTitle || nextStationId || "")
    : nextStationDefaultTitle || nextStationId || "";

  return (
    <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full sm:w-auto">
      {/* Secondary Action: Return to Hub */}
      <button
        type="button"
        id="btn-victory-back-to-hub"
        onClick={() => {
          audioFx.playRelayClick();
          onClose();
          setCurrentView("HUB");
        }}
        className={`w-full sm:w-auto px-4 py-2.5 rounded-xl font-mono font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95 shadow-2xs ${secondaryClassName}`}
      >
        <LayoutGrid size={13} className="shrink-0" />
        <span>{t("career.returnToHub", "На головний хаб")}</span>
      </button>

      {/* Primary Action: Next station in track OR War Room graduation */}
      {isLast ? (
        <button
          type="button"
          id="btn-victory-goto-war-room"
          onClick={() => {
            audioFx.playSuccessFanfare();
            onClose();
            setCurrentView("WAR_ROOM");
          }}
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#C86D32] hover:bg-[#B35F2B] text-white font-mono font-bold text-xs flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer active:scale-95"
        >
          <Zap size={14} className="text-amber-300 animate-pulse shrink-0" />
          <span>{t("career.warRoomGraduation", "Випускне випробування: Перейти в War Room ⚡")}</span>
          <ArrowRight size={14} className="shrink-0" />
        </button>
      ) : nextStationId ? (
        <button
          type="button"
          id={`btn-victory-goto-next-station-${nextStationId}`}
          onClick={() => {
            audioFx.playRelayClick();
            onClose();
            setCurrentStationId(nextStationId);
            setCurrentView("STATION");
          }}
          className={`w-full sm:w-auto px-5 py-2.5 rounded-xl font-mono font-bold text-xs flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer active:scale-95 ${accentClassName}`}
        >
          <span>
            {t("career.nextStationBtn", {
              name: nextStationName,
              defaultValue: `Наступна станція треку: ${nextStationName} ➔`,
            })}
          </span>
          <ArrowRight size={14} className="shrink-0" />
        </button>
      ) : null}
    </div>
  );
};
