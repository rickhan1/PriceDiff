"use client";

import React from "react";

interface BannerAdProps {
  slotId?: string;
  position?: "top" | "bottom" | "inline";
}

export const BannerAd: React.FC<BannerAdProps> = ({
  slotId = "BANNER_DEFAULT",
  position = "bottom",
}) => {
  const adClient = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;

  return (
    <div
      className={`w-full overflow-hidden bg-slate-50 border-t border-b border-slate-200 text-center py-2 transition-all ${
        position === "bottom" ? "sticky bottom-0 z-30 shadow-md bg-white/95 backdrop-blur" : ""
      }`}
    >
      <div className="text-[10px] text-slate-400 font-medium mb-1 tracking-wider uppercase">
        Advertisement
      </div>
      {adClient ? (
        // 실제 Google AdSense 배너 슬롯
        <ins
          className="adsbygoogle block"
          style={{ display: "block", minHeight: "50px" }}
          data-ad-client={adClient}
          data-ad-slot={slotId}
          data-ad-format="horizontal"
          data-full-width-responsive="true"
        />
      ) : (
        // 테스트/시뮬레이션용 배너 (쿠팡 와우 멤버십 및 토스 혜택 홍보)
        <div className="flex items-center justify-between px-4 py-2 mx-3 rounded-lg bg-gradient-to-r from-red-500/10 via-amber-500/10 to-blue-500/10 border border-slate-200">
          <div className="flex items-center space-x-2">
            <span className="px-1.5 py-0.5 rounded bg-red-600 text-white text-[11px] font-bold">
              쿠팡 WOW
            </span>
            <span className="text-xs font-semibold text-slate-700 text-left">
              지금 가입하면 첫 달 무료 & 무제한 무료 로켓배송
            </span>
          </div>
          <a
            href="https://www.coupang.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] font-bold text-red-600 hover:underline whitespace-nowrap ml-2"
          >
            보기 ➔
          </a>
        </div>
      )}
    </div>
  );
};
