import React from "react";
import { ShoppingCart, Tag, ShieldCheck, Sparkles } from "lucide-react";

interface ShopStandProps {
  cartTotal: number;
  discountApplied: boolean;
  freeShippingApplied: boolean;
  purchasesCount: number;
  bonusPointsEarned: boolean;
}

export const ShopStand: React.FC<ShopStandProps> = ({
  cartTotal,
  discountApplied,
  freeShippingApplied,
  purchasesCount,
  bonusPointsEarned,
}) => {
  const discountAmount = discountApplied ? Math.round(cartTotal * 0.1) : 0;
  const shippingCost = freeShippingApplied ? 0 : 49;
  const finalTotal = cartTotal - discountAmount + shippingCost;

  return (
    <div className="w-full rounded-2xl bg-[#161B22] border border-[#30363D] p-4 text-white font-mono flex flex-col gap-3 shadow-lg">
      <div className="flex items-center justify-between border-b border-[#30363D] pb-2">
        <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
          <ShoppingCart size={15} />
          <span>E-COMMERCE CHECKOUT SIMULATOR</span>
        </div>
        <span className="text-[10px] text-stone-400 bg-[#21262D] px-2 py-0.5 rounded">
          LIVE STORE
        </span>
      </div>

      {/* Cart Summary */}
      <div className="space-y-1.5 text-xs bg-[#0D1117] p-3 rounded-xl border border-[#21262D]">
        <div className="flex justify-between text-stone-300">
          <span>Subtotal (Сума товарів):</span>
          <span className="font-bold text-white">{cartTotal} DKK</span>
        </div>

        {/* 10% Discount Rule */}
        <div className="flex justify-between items-center text-[11px]">
          <span className="flex items-center gap-1.5 text-stone-400">
            <Tag size={12} className={discountApplied ? "text-emerald-400" : "text-stone-500"} />
            <span>10% VIP Discount (від 1000 DKK):</span>
          </span>
          {discountApplied ? (
            <span className="text-emerald-400 font-bold bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-500/40">
              -10% (-{discountAmount} DKK)
            </span>
          ) : (
            <span className="text-stone-500">Не застосовано</span>
          )}
        </div>

        {/* Free Shipping Rule */}
        <div className="flex justify-between items-center text-[11px]">
          <span className="flex items-center gap-1.5 text-stone-400">
            <ShieldCheck size={12} className={freeShippingApplied ? "text-cyan-400" : "text-stone-500"} />
            <span>Free Shipping (від 500 DKK):</span>
          </span>
          {freeShippingApplied ? (
            <span className="text-cyan-400 font-bold bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-500/40">
              БЕЗКОШТОВНО (0 DKK)
            </span>
          ) : (
            <span className="text-amber-400/90 font-bold">+49 DKK</span>
          )}
        </div>

        {/* Customer History & Loyalty Rule */}
        <div className="flex justify-between items-center text-[11px] pt-1 border-t border-[#21262D]">
          <span className="text-stone-400">Кількість замовлень:</span>
          <span className="text-white font-bold">{purchasesCount}</span>
        </div>
        <div className="flex justify-between items-center text-[11px]">
          <span className="flex items-center gap-1.5 text-stone-400">
            <Sparkles size={12} className={bonusPointsEarned ? "text-amber-400 animate-pulse" : "text-stone-500"} />
            <span>Бонусні бали (+500 балів):</span>
          </span>
          {bonusPointsEarned ? (
            <span className="text-amber-300 font-bold bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-500/40">
              НАРАХОВАНО (+500)
            </span>
          ) : (
            <span className="text-stone-500">Потрібно від 5 покупок</span>
          )}
        </div>
      </div>

      {/* Total Order Footer */}
      <div className="flex items-center justify-between p-2.5 rounded-xl bg-gradient-to-r from-[#1F242C] to-[#161B22] border border-[#30363D]">
        <span className="text-xs text-stone-300 font-bold">Разом до сплати:</span>
        <span className="text-sm font-bold text-emerald-400">{finalTotal} DKK</span>
      </div>
    </div>
  );
};
