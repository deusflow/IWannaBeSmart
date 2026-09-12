/**
 * @file apps/web/src/components/workbench/POSBlueprintDevice.tsx
 * @description Blueprint-styled Hardware POS Terminal with LCD screen, thermal receipt printer, fee breakdown, and PIN lockout
 */

import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ShieldCheck,
  ShieldAlert,
  CreditCard,
  Lock,
  ArrowDownRight,
  RefreshCw,
  Printer,
  FileText,
  AlertOctagon,
  Scissors,
} from "lucide-react";
import { useWorkbenchStore } from "../../store/workbenchStore";
import { useShallow } from "zustand/react/shallow";
import { audioFx } from "../../utils/audioFx";

export const POSBlueprintDevice: React.FC = () => {
  const { t } = useTranslation();
  const {
    posState,
    resetPosState,
    applyPosExecution,
    posManualPin,
    posIsCardInserted,
    posKeypadInput,
    posTapNfc,
    posInsertChip,
    posEjectCard,
  } = useWorkbenchStore(
    useShallow((s) => ({
      posState: s.posState,
      resetPosState: s.resetPosState,
      applyPosExecution: s.applyPosExecution,
      posManualPin: s.posManualPin,
      posIsCardInserted: s.posIsCardInserted,
      posKeypadInput: s.posKeypadInput,
      posTapNfc: s.posTapNfc,
      posInsertChip: s.posInsertChip,
      posEjectCard: s.posEjectCard,
    }))
  );
  const [receiptTorn, setReceiptTorn] = useState<boolean>(false);

  const isDeclined = posState.status === "DECLINED";
  const isApproved = posState.status === "APPROVED";
  const isBlocked = posState.isLocked === true || posState.status === "BLOCKED";
  const isSettled = posState.status === "SETTLED";

  const handleKeypadPress = (key: string) => {
    if (isBlocked) {
      audioFx.playErrorBuzz();
      return;
    }
    posKeypadInput(key);
  };

  const handleTearReceipt = () => {
    audioFx.playRelayClick();
    setReceiptTorn(true);
    setTimeout(() => {
      applyPosExecution({ receiptLines: [] });
      setReceiptTorn(false);
    }, 400);
  };

  const hasReceipt = Boolean(posState.receiptLines && posState.receiptLines.length > 0);

  return (
    <div className="w-full max-w-xl mx-auto p-4 select-none">
        {/* ── Top Thermal Printer Mechanism ── */}
        <div
          data-guide="pos-printer"
          className="relative mb-[-12px] z-20 flex flex-col items-center"
        >
        {/* Printer Head Casing */}
        <div className="w-64 h-5 bg-[#141518] border-t-2 border-x-2 border-[#2C3038] rounded-t-xl flex items-center justify-between px-3 text-[9px] font-mono text-gray-500 shadow-md">
          <div className="flex items-center gap-1">
            <Printer size={10} className={hasReceipt ? "text-emerald-400 animate-pulse" : "text-gray-500"} />
            <span>THERMAL PRINTER 58MM</span>
          </div>
          <span className="text-[8px] text-gray-600">AUTO-CUT</span>
        </div>

        {/* Paper Ejection Slot */}
        <div className="w-60 h-2 bg-[#090A0C] border-b border-[#2C3038] rounded-b-sm shadow-inner relative flex justify-center">
          {/* Active paper indicator glow */}
          {hasReceipt && (
            <div className="absolute inset-0 bg-emerald-500/20 blur-xs animate-pulse" />
          )}
        </div>

        {/* Animated Emerging Receipt Paper Tape */}
        {hasReceipt && (
          <div
            className={`w-56 bg-[#FAF8F2] text-[#1A1A1A] p-3 pt-2 font-mono text-[9px] shadow-2xl border-x border-[#D8D4C8] transition-all duration-500 transform origin-top ${
              receiptTorn ? "opacity-0 -translate-y-4 scale-95" : "animate-in slide-in-from-top-6 duration-700"
            }`}
            style={{
              clipPath:
                "polygon(0% 0%, 100% 0%, 100% calc(100% - 6px), 95% 100%, 90% calc(100% - 6px), 85% 100%, 80% calc(100% - 6px), 75% 100%, 70% calc(100% - 6px), 65% 100%, 60% calc(100% - 6px), 55% 100%, 50% calc(100% - 6px), 45% 100%, 40% calc(100% - 6px), 35% 100%, 30% calc(100% - 6px), 25% 100%, 20% calc(100% - 6px), 15% 100%, 10% calc(100% - 6px), 5% 100%, 0% calc(100% - 6px))",
            }}
          >
            <div className="text-center font-bold pb-1 border-b border-dashed border-gray-400 mb-1 flex items-center justify-center gap-1">
              <FileText size={10} />
              <span>{t("posDevice.zReportTitle", "Z-REPORT BATCH SUMMARY")}</span>
            </div>

            <div className="space-y-0.5 leading-tight text-gray-800">
              {posState.receiptLines?.map((line, idx) => (
                <div
                  key={idx}
                  className={`${
                    line.includes("TOTAL")
                      ? "font-extrabold text-[10px] text-black pt-1 border-t border-dashed border-gray-400"
                      : line.includes("===") || line.includes("---")
                      ? "text-gray-400 text-center"
                      : ""
                  }`}
                >
                  {line}
                </div>
              ))}
            </div>

            {/* Tear off receipt button */}
            <button
              onClick={handleTearReceipt}
              className="mt-2.5 w-full py-1 rounded bg-[#E8E4D8] hover:bg-[#DCD7C8] border border-[#C8C2B2] text-[#4A453A] font-bold text-[8px] flex items-center justify-center gap-1 transition-colors cursor-pointer"
            >
              <Scissors size={10} />
              <span>{t("posDevice.tearReceipt", "Відірвати чек")}</span>
            </button>
          </div>
        )}
      </div>

      {/* ── Outer POS Terminal Casing ── */}
      <div className="relative rounded-3xl bg-[#1C1E22] border-2 border-[#32363E] shadow-2xl p-6 text-white overflow-hidden z-10">
        {/* Subtle carbon/grid texture */}
        <div className="absolute inset-0 bg-[radial-gradient(#2A2E36_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none" />

        {/* Header: Brand & Status & Reset */}
        <div className="relative z-10 flex items-center justify-between border-b border-[#2C3038] pb-3 mb-4">
          <div className="flex items-center gap-2">
            <div
              className={`w-7 h-7 rounded-lg border flex items-center justify-center transition-colors ${
                isBlocked
                  ? "bg-red-500/20 border-red-500/50 text-red-400"
                  : "bg-emerald-500/20 border-emerald-500/40 text-emerald-400"
              }`}
            >
              <CreditCard size={16} />
            </div>
            <div>
              <div className="font-mono font-bold text-xs tracking-wider text-emerald-400 flex items-center gap-1.5">
                <span>{t("posDevice.title", "POS-7402 PRO")}</span>
                {isBlocked && (
                  <span className="px-1.5 py-0.2 rounded bg-red-900/80 border border-red-500/60 text-red-300 text-[9px] uppercase animate-pulse">
                    {t("posDevice.locked", "LOCKED")}
                  </span>
                )}
                {posIsCardInserted && (
                  <span className="px-1.5 py-0.2 rounded bg-amber-500/20 border border-amber-500/50 text-amber-300 text-[9px] uppercase animate-pulse">
                    {t("posDevice.cardInserted", "КАРТКУ ВСТАВЛЕНО")}
                  </span>
                )}
              </div>
              <div className="text-[10px] font-mono text-gray-400">
                {t("posDevice.subtitle", "EMV / NFC Core")} • {posState.terminalId || "TERMINAL-01"}
              </div>
            </div>
          </div>

          {/* Reset Terminal State */}
          <button
            onClick={() => {
              audioFx.playRelayClick();
              resetPosState();
            }}
            title={t("posDevice.resetTooltip", "Reset Terminal State")}
            className={`p-1.5 rounded-lg transition-all cursor-pointer border flex items-center gap-1 text-xs font-mono ${
              isBlocked
                ? "bg-red-900/40 hover:bg-red-900/70 text-red-200 border-red-500/60 animate-bounce"
                : "bg-[#272A31] hover:bg-[#32363E] text-gray-400 hover:text-white border-[#3C414D]"
            }`}
          >
            <RefreshCw size={14} className={isBlocked ? "animate-spin" : ""} />
            {isBlocked && <span className="text-[10px] font-bold">{t("posDevice.reset", "Скинути")}</span>}
          </button>
        </div>

        {/* POS LCD Display Screen */}
        <div
          data-guide="pos-lcd"
          className={`relative z-10 rounded-2xl border-2 p-4 shadow-inner space-y-3 transition-colors duration-300 ${
            isBlocked
              ? "bg-[#180A0C] border-red-600/70 shadow-red-950/40"
              : "bg-[#0F1012] border-[#2C3038]"
          }`}
        >
          {/* Top Status Banner */}
          <div className="flex items-center justify-between text-[11px] font-mono border-b border-[#1E2126] pb-2 flex-wrap gap-1">
            <span className="flex items-center gap-1.5">
              {isBlocked ? (
                <>
                  <AlertOctagon size={12} className="text-red-400 animate-spin" />
                  <span className="text-red-400 font-bold">{t("posDevice.cardLockoutActive", "CARD LOCKOUT ACTIVE")}</span>
                </>
              ) : (
                <>
                  <Lock size={12} className="text-amber-400" />
                  <span className="text-gray-400">{t("posDevice.tls", "TLS 1.3")}</span>
                </>
              )}
            </span>

            {/* Active Payment Gateway Badge (Task 6) */}
            <div
              data-guide="pos-net"
              className="flex items-center gap-1 px-2 py-0.5 rounded bg-[#16181D] border border-[#2B2F38] text-[9px] font-mono"
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  posState.isGatewayRegistered && posState.activeGateway
                    ? "bg-emerald-400 animate-pulse"
                    : "bg-amber-500"
                }`}
              />
              <span
                className={
                  posState.isGatewayRegistered && posState.activeGateway
                    ? "text-emerald-300 font-bold"
                    : "text-amber-400 font-medium"
                }
              >
                NET:{" "}
                {posState.isGatewayRegistered && posState.activeGateway
                  ? posState.activeGateway.replace(/Gateway$/i, "").toUpperCase()
                  : t("posDevice.netDisconnected", "DISCONNECTED")}
              </span>
            </div>

            <span className={isBlocked ? "text-red-400 font-bold text-[10px]" : "text-gray-400 text-[10px]"}>
              {posState.accountHolder || "Cardholder"}
            </span>
          </div>

          {/* Physical Lockout Banner */}
          {isBlocked ? (
            <div className="p-3 rounded-xl bg-red-950/70 border-2 border-red-500 text-center space-y-1 animate-pulse">
              <div className="flex items-center justify-center gap-1.5 text-red-400 font-mono font-extrabold text-xs uppercase tracking-wider">
                <AlertOctagon size={16} />
                <span>{t("posDevice.cardBlocked", "КАРТКУ ЗАБЛОКОВАНО")}</span>
              </div>
              <div className="text-[10px] font-mono text-red-300">
                {t("posDevice.pinLimitExceeded", {
                  count: posState.failedAttempts || 3,
                  defaultValue: `Перевищено ліміт 3 спроб введення PIN (${posState.failedAttempts || 3}/3). Клавіатуру вимкнено.`
                })}
              </div>
            </div>
          ) : (
            /* Financial Amounts Display */
            <div className="grid grid-cols-2 gap-3 py-1">
              {/* Account Balance */}
              <div className="p-3 rounded-xl bg-[#17191D] border border-[#262931]">
                <div className="text-[10px] font-mono text-gray-400 uppercase tracking-wider">
                  {t("posDevice.currentBalance", "Поточний баланс")}
                </div>
                <div className="font-mono font-bold text-lg sm:text-xl text-emerald-400">
                  ${posState.balance.toFixed(2)}
                </div>
                <div className="text-[9px] font-mono text-gray-500">{t("posDevice.checkingAccount", "Checking •••• 4421")}</div>
              </div>

              {/* Transaction Amount & Fee breakdown */}
              <div className="p-3 rounded-xl bg-[#17191D] border border-[#262931]">
                <div className="text-[10px] font-mono text-gray-400 uppercase tracking-wider">
                  {posState.dailyTotal && posState.dailyTotal > 0
                    ? t("posDevice.dailyTotal", "Денний виторг (Z-звіт)")
                    : t("posDevice.transactionAmount", "Сума транзакції")}
                </div>
                <div className="font-mono font-bold text-lg sm:text-xl text-amber-400">
                  ${(posState.dailyTotal && posState.dailyTotal > 0
                    ? posState.dailyTotal
                    : posState.totalAmount && posState.totalAmount > 0
                    ? posState.totalAmount
                    : posState.transactionAmount
                  ).toFixed(2)}
                </div>
                <div className="text-[9px] font-mono text-gray-500 flex items-center gap-0.5">
                  <ArrowDownRight size={10} className="text-amber-400" />
                  {posState.fee && posState.fee > 0 ? (
                    <span className="text-amber-300 font-bold">
                      {t("posDevice.inclFee", { fee: posState.fee.toFixed(2), defaultValue: `Вкл. збір: $${posState.fee.toFixed(2)}` })}
                    </span>
                  ) : posState.dailyTotal && posState.dailyTotal > 0 ? (
                    <span className="text-emerald-400 font-bold">
                      {t("posDevice.transactionsClosed", { count: posState.transactions?.length || 4, defaultValue: `${posState.transactions?.length || 4} транзакцій закрито` })}
                    </span>
                  ) : (
                    <span>{t("posDevice.txRequest", "Запит транзакції")}</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* PIN Entry Live LCD Line */}
          {(posIsCardInserted || posManualPin.length > 0 || (posState.failedAttempts && posState.failedAttempts > 0 && !isBlocked)) && !isBlocked && (
            <div className="px-3 py-2 rounded-xl bg-[#14161A] border border-amber-500/40 flex items-center justify-between font-mono text-xs">
              <span className="text-amber-400 font-bold flex items-center gap-1.5">
                <Lock size={12} />
                <span>{t("posDevice.enterPinPrompt", "Введіть PIN на клавіатурі")}:</span>
              </span>
              <span className="tracking-[0.35em] text-white font-extrabold text-sm">
                {posManualPin ? "•".repeat(posManualPin.length) : "____"}
              </span>
              <span className="text-[10px] text-gray-400 font-bold">
                {posState.failedAttempts && posState.failedAttempts > 0 ? (
                  <span className="text-red-400">Спроби: {posState.failedAttempts}/3</span>
                ) : (
                  <span>{posManualPin.length}/4</span>
                )}
              </span>
            </div>
          )}

          {/* Fee Calculation Breakdown Line (Task 2) */}
          {posState.fee && posState.fee > 0 && !isBlocked && (
            <div className="px-3 py-1.5 rounded-lg bg-[#14161A] border border-[#262931] flex items-center justify-between text-[10px] font-mono">
              <span className="text-gray-400">
                {t("posDevice.amountLabel", "Сума:")} <strong className="text-white">${posState.transactionAmount.toFixed(2)}</strong> + {t("posDevice.feeLabel", "Комісія:")}{" "}
                <strong className="text-amber-400">${posState.fee.toFixed(2)}</strong>
              </span>
              <span className="text-emerald-400 font-bold">
                {t("posDevice.totalLabel", "Разом:")} ${(posState.totalAmount || posState.transactionAmount + posState.fee).toFixed(2)}
              </span>
            </div>
          )}

          {/* Live Decision Status Box */}
          <div
            className={`p-3 rounded-xl border flex items-center justify-between transition-all duration-300 ${
              isBlocked
                ? "bg-red-950/60 border-red-500/70 text-red-200"
                : isDeclined
                ? "bg-red-950/40 border-red-500/50 text-red-200"
                : isApproved || isSettled
                ? "bg-emerald-950/40 border-emerald-500/50 text-emerald-200"
                : "bg-[#17191D] border-gray-700/40 text-gray-300"
            }`}
          >
            <div className="flex items-center gap-2.5">
              {isBlocked ? (
                <ShieldAlert size={20} className="text-red-400 animate-bounce" />
              ) : isDeclined ? (
                <ShieldAlert size={20} className="text-red-400 animate-bounce" />
              ) : isApproved || isSettled ? (
                <ShieldCheck size={20} className="text-emerald-400" />
              ) : (
                <CreditCard size={20} className="text-gray-400" />
              )}
              <div>
                <div className="font-mono text-[10px] uppercase font-bold tracking-wider opacity-75">
                  {t("posDevice.fsmState", "Стан автомата (FSM State):")}
                </div>
                <div className="font-mono font-extrabold text-base tracking-widest">
                  {posState.status}
                </div>
              </div>
            </div>

            {isDeclined && (
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-red-900/60 border border-red-500/50 text-red-300">
                {t("posDevice.overdraftStopped", "Овердрафт зупинено!")}
              </span>
            )}
            {isApproved && (
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-900/60 border border-emerald-500/50 text-emerald-300">
                {t("posDevice.authorized", "Авторизовано ✓")}
              </span>
            )}
            {isSettled && (
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-900/60 border border-cyan-500/50 text-cyan-300">
                {t("posDevice.batchClosed", "Пакет закрито ✓")}
              </span>
            )}
            {isBlocked && (
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-red-900/80 border border-red-500/80 text-red-200 animate-pulse">
                {t("posDevice.blocked", "БЛОКОВАНО ⛔")}
              </span>
            )}
          </div>
        </div>

        {/* Interactive NFC Tap & Chip Insert Hardware Bar */}
        <div
          data-guide="pos-chip"
          className="relative z-10 my-3 flex items-center justify-between gap-2 text-[10px] font-mono"
        >
          {/* Interactive NFC Tap Button */}
          <button
            onClick={posTapNfc}
            disabled={isBlocked}
            className="flex-1 py-2 px-3 rounded-xl bg-[#22252C] hover:bg-[#2B2F38] border border-[#3A404D] hover:border-emerald-500/60 flex items-center justify-center gap-1.5 text-gray-200 hover:text-emerald-300 transition-all cursor-pointer active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
            title={t("posDevice.tapCard", "Прикласти картку (NFC)")}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isBlocked ? "bg-red-500" : "bg-emerald-400 animate-pulse"
              }`}
            />
            <span className="font-bold">{t("posDevice.tapCard", "Прикласти картку (NFC)")}</span>
          </button>

          {/* Interactive Chip Insert Button */}
          <button
            onClick={posIsCardInserted ? posEjectCard : posInsertChip}
            disabled={isBlocked}
            className={`flex-1 py-2 px-3 rounded-xl border flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm ${
              posIsCardInserted
                ? "bg-amber-950/40 hover:bg-amber-900/60 border-amber-500/70 text-amber-300"
                : "bg-[#22252C] hover:bg-[#2B2F38] border-[#3A404D] hover:border-amber-500/60 text-gray-200 hover:text-amber-300"
            }`}
            title={
              posIsCardInserted
                ? t("posDevice.ejectCard", "Витягнути картку")
                : t("posDevice.insertChip", "Вставити чип (EMV)")
            }
          >
            <CreditCard size={13} className={posIsCardInserted ? "text-amber-400 animate-pulse" : "text-gray-400"} />
            <span className="font-bold">
              {posIsCardInserted
                ? t("posDevice.ejectCard", "Витягнути картку")
                : t("posDevice.insertChip", "Вставити чип (EMV)")}
            </span>
          </button>
        </div>

        {/* Tactile Keypad (Physically disabled when isBlocked) */}
        <div
          className={`relative z-10 grid grid-cols-4 gap-2 pt-1 transition-opacity ${
            isBlocked ? "opacity-30 pointer-events-none cursor-not-allowed" : ""
          }`}
        >
          {/* Row 1 */}
          {["1", "2", "3", "CLR"].map((k) => (
            <button
              key={k}
              disabled={isBlocked}
              onClick={() => handleKeypadPress(k)}
              className={`py-2.5 rounded-xl font-mono font-bold text-xs border transition-all active:scale-95 cursor-pointer shadow-md ${
                k === "CLR"
                  ? "bg-amber-900/30 border-amber-600/50 text-amber-300 hover:bg-amber-900/50"
                  : "bg-[#252830] border-[#373B45] text-gray-200 hover:bg-[#2F333D]"
              }`}
            >
              {k}
            </button>
          ))}
          {/* Row 2 */}
          {["4", "5", "6", "CNCL"].map((k) => (
            <button
              key={k}
              disabled={isBlocked}
              onClick={() => handleKeypadPress(k)}
              className={`py-2.5 rounded-xl font-mono font-bold text-xs border transition-all active:scale-95 cursor-pointer shadow-md ${
                k === "CNCL"
                  ? "bg-red-900/30 border-red-600/50 text-red-300 hover:bg-red-900/50"
                  : "bg-[#252830] border-[#373B45] text-gray-200 hover:bg-[#2F333D]"
              }`}
            >
              {k}
            </button>
          ))}
          {/* Row 3 */}
          {["7", "8", "9", "ENTR"].map((k) => (
            <button
              key={k}
              disabled={isBlocked}
              onClick={() => handleKeypadPress(k)}
              className={`py-2.5 rounded-xl font-mono font-bold text-xs border transition-all active:scale-95 cursor-pointer shadow-md ${
                k === "ENTR"
                  ? "bg-emerald-900/30 border-emerald-600/50 text-emerald-300 hover:bg-emerald-900/50"
                  : "bg-[#252830] border-[#373B45] text-gray-200 hover:bg-[#2F333D]"
              }`}
            >
              {k}
            </button>
          ))}
          {/* Row 4: *, 0, #, EJECT */}
          {[
            { label: "*", val: "*" },
            { label: "0", val: "0" },
            { label: "#", val: "#" },
            {
              label: posIsCardInserted ? "EJECT" : "•",
              val: posIsCardInserted ? "CNCL" : "00",
            },
          ].map((item) => (
            <button
              key={item.label}
              disabled={isBlocked}
              onClick={() => handleKeypadPress(item.val)}
              className={`py-2.5 rounded-xl font-mono font-bold text-xs border transition-all active:scale-95 cursor-pointer shadow-md ${
                item.label === "EJECT"
                  ? "bg-amber-900/40 border-amber-600/50 text-amber-200 hover:bg-amber-900/60"
                  : "bg-[#252830] border-[#373B45] text-gray-300 hover:bg-[#2F333D]"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
