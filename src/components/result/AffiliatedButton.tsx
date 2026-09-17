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
  allOptions = [],
}) => {
  const handleClickCoupang = () => {
    if (bestOnline?.productUrl) {
      window.open(bestOnline.productUrl, "_blank", "noopener,noreferrer");
    }
  };

  const bestPrice = bestOnline?.price || 12000;

  return (
    <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "10px" }}>
      {/* 주 구매 버튼 (쿠팡 최저가) */}
      <button
        type="button"
        onClick={handleClickCoupang}
        style={{
          width: "100%",
          padding: "16px 18px",
          background: "linear-gradient(135deg, #dc2626 0%, #ef4444 100%)",
          color: "#ffffff",
          borderRadius: "1rem",
          fontWeight: 900,
          fontSize: "15px",
          border: "none",
          cursor: "pointer",
          boxShadow: "0 8px 20px rgba(220, 38, 38, 0.3)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          boxSizing: "border-box",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <ShoppingBag style={{ width: 20, height: 20 }} />
          <span>쿠팡 최저가로 바로 사기</span>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "4px",
            fontSize: "12px",
            fontWeight: 700,
            backgroundColor: "rgba(255,255,255,0.25)",
            padding: "4px 10px",
            borderRadius: "9999px",
          }}
        >
          <span>{bestPrice.toLocaleString()}원</span>
          <ExternalLink style={{ width: 14, height: 14 }} />
        </div>
      </button>

      {/* 기타 온라인 구매 옵션 (토스 쇼핑 등) */}
      {allOptions && allOptions.length > 1 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <span style={{ fontSize: "11px", fontWeight: "bold", color: "#64748b", paddingLeft: "4px" }}>
            다른 쇼핑몰 옵션:
          </span>
          {allOptions
            .filter((opt) => opt.id !== bestOnline?.id)
            .map((opt) => (
              <a
                key={opt.id}
                href={opt.productUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  backgroundColor: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  borderRadius: "0.75rem",
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "#334155",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  textDecoration: "none",
                  boxSizing: "border-box",
                }}
              >
                <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "#3b82f6", display: "inline-block" }} />
                  {opt.platform === "toss" ? "토스 쇼핑 공동구매" : "온라인몰"} (
                  {(opt.price || 0).toLocaleString()}원)
                </span>
                <span style={{ fontSize: "11px", color: "#2563eb", fontWeight: "bold", display: "flex", alignItems: "center", gap: "2px" }}>
                  이동 <ExternalLink style={{ width: 12, height: 12 }} />
                </span>
              </a>
            ))}
        </div>
      )}

      {/* 공정거래위원회 법적 고지 문구 */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: "6px",
          padding: "4px 8px",
          fontSize: "10px",
          color: "#94a3b8",
          lineHeight: 1.4,
        }}
      >
        <ShieldCheck style={{ width: 14, height: 14, color: "#94a3b8", flexShrink: 0, marginTop: "1px" }} />
        <span>
          이 포스팅은 제휴 마케팅의 일환으로, 구매 시 일정액의 수수료를 제공받아 서비스 운영에 활용됩니다.
        </span>
      </div>
    </div>
  );
};
