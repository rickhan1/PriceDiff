"use client";

import React from "react";
import { ComparisonSummary } from "@/types";
import { PriceCard } from "@/components/result/PriceCard";
import { AffiliatedButton } from "@/components/result/AffiliatedButton";
import { BannerAd } from "@/components/ads/BannerAd";
import { ArrowLeft, RotateCcw, CheckCircle2 } from "lucide-react";

interface ResultViewProps {
  summary: ComparisonSummary;
  onReset: () => void;
}

export const ResultView: React.FC<ResultViewProps> = ({ summary, onReset }) => {
  return (
    <div
      style={{
        padding: "16px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        flex: 1,
        gap: "16px",
        width: "100%",
        maxWidth: "480px",
        margin: "0 auto",
        boxSizing: "border-box",
        animation: "fadeIn 0.25s ease-out",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {/* 상단 액션바 */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <button
            type="button"
            onClick={onReset}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              fontSize: "13px",
              fontWeight: "bold",
              color: "#475569",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "4px 0",
            }}
          >
            <ArrowLeft style={{ width: 18, height: 18 }} /> 다른 상품 스캔
          </button>
          <span
            style={{
              fontSize: "11px",
              fontWeight: 600,
              color: "#059669",
              backgroundColor: "#ecfdf5",
              padding: "4px 10px",
              borderRadius: "9999px",
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            <CheckCircle2 style={{ width: 14, height: 14 }} /> 실시간 매칭 완료
          </span>
        </div>

        {/* 가격 비교 메인 카드 */}
        <PriceCard summary={summary} />

        {/* 인라인 광고 배너 */}
        <BannerAd position="inline" />

        {/* 쿠팡 제휴 구매 버튼 */}
        <AffiliatedButton
          bestOnline={summary.bestOnline}
          allOptions={summary.allOptions}
        />
      </div>

      {/* 하단 새 상품 스캔 버튼 */}
      <div style={{ textAlign: "center", paddingTop: "8px", paddingBottom: "16px" }}>
        <button
          type="button"
          onClick={onReset}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "13px",
            fontWeight: "bold",
            color: "#64748b",
            background: "#f1f5f9",
            border: "none",
            borderRadius: "0.75rem",
            cursor: "pointer",
            padding: "10px 16px",
          }}
        >
          <RotateCcw style={{ width: 14, height: 14 }} /> 새로운 상품 바코드 스캔하기
        </button>
      </div>
    </div>
  );
};
