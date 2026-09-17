"use client";

import React from "react";
import { OnlinePriceResult } from "@/types";
import { ExternalLink, ShoppingBag, ShieldCheck } from "lucide-react";

interface AffiliatedButtonProps {
  bestOnline: OnlinePriceResult;
  allOptions: OnlinePriceResult[];
}

export const AffiliatedButton: React.FC<AffiliatedButtonProps> = ({
  bestOnline,
  allOptions,
}) => {
  const handleClickCoupang = () => {
    window.open(bestOnline.productUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="w-full space-y-3">
      {/* 주 구매 버튼 (쿠팡 와우 로켓배송 딥링크) */}
      <button
        onClick={handleClickCoupang}
        className="w-full py-4 px-5 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white rounded-2xl font-black text-base shadow-lg shadow-red-500/25 flex items-center justify-between transition-all transform active:scale-[0.98]"
      >
        <div className="flex items-center gap-2">
          <ShoppingBag className="w-5 h-5 text-white" />
          <span>쿠팡 최저가로 바로 사기</span>
        </div>
        <div className="flex items-center gap-1 text-xs font-semibold bg-white/20 px-2.5 py-1 rounded-full">
          <span>{bestOnline.price.toLocaleString()}원</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </div>
      </button>

      {/* 기타 온라인 구매 옵션 (토스 쇼핑 등) */}
      {allOptions.length > 1 && (
        <div className="space-y-1.5">
          <span className="text-[11px] font-bold text-slate-500 px-1">
            다른 쇼핑몰 옵션:
          </span>
          {allOptions
            .filter((opt) => opt.id !== bestOnline.id)
            .map((opt) => (
              <a
                key={opt.id}
                href={opt.productUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 flex items-center justify-between transition"
              >
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  {opt.platform === "toss" ? "토스 쇼핑 공동구매" : "온라인몰"} (
                  {opt.price.toLocaleString()}원)
                </span>
                <span className="text-[11px] text-blue-600 font-bold flex items-center gap-0.5">
                  이동 <ExternalLink className="w-3 h-3" />
                </span>
              </a>
            ))}
        </div>
      )}

      {/* 공정거래위원회 법적 고지 문구 (쿠팡 파트너스 필수 가이드라인 준수) */}
      <div className="flex items-start gap-1.5 px-2 py-1 text-[10px] text-slate-400 leading-tight">
        <ShieldCheck className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
        <span>
          이 링크는 제휴 마케팅의 일환으로, 구매 시 일정액의 수수료를 제공받아 서비스 운영에 활용됩니다.
        </span>
      </div>
    </div>
  );
};
