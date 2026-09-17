"use client";

import React from "react";
import { ComparisonSummary } from "@/types";
import { TrendingDown, CheckCircle, Store, ShoppingCart } from "lucide-react";

interface PriceCardProps {
  summary: ComparisonSummary;
}

export const PriceCard: React.FC<PriceCardProps> = ({ summary }) => {
  const product = summary?.product || { name: "상품" };
  const offlinePrice = summary?.offlinePrice ?? 15000;
  const bestOnline = summary?.bestOnline || {
    id: "cp-default",
    platform: "coupang" as const,
    title: product.name,
    price: Math.round(offlinePrice * 0.8),
    rocketShipping: true,
    productUrl: "https://www.coupang.com",
    imageUrl: "",
  };

  const difference = summary?.difference ?? (offlinePrice - bestOnline.price);
  const savingsPercent = summary?.savingsPercent ?? (offlinePrice > 0 ? Math.round((difference / offlinePrice) * 100) : 15);
  const isOnlineCheaper = difference > 0;

  return (
    <div
      style={{
        width: "100%",
        backgroundColor: "#ffffff",
        borderRadius: "1rem",
        border: "1px solid #e2e8f0",
        overflow: "hidden",
        boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
        boxSizing: "border-box",
      }}
    >
      {/* 절약 배지 헤더 */}
      <div
        style={{
          padding: "12px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: isOnlineCheaper ? "#10b981" : "#334155",
          color: "#ffffff",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "6px", fontWeight: 800, fontSize: "13px" }}>
          {isOnlineCheaper ? (
            <>
              <TrendingDown style={{ width: 16, height: 16 }} />
              <span>온라인에서 사면 {(difference || 0).toLocaleString()}원 절약!</span>
            </>
          ) : (
            <>
              <Store style={{ width: 16, height: 16 }} />
              <span>오프라인 매장 가격이 더 합리적입니다!</span>
            </>
          )}
        </div>
        {isOnlineCheaper && (
          <span
            style={{
              fontSize: "11px",
              fontWeight: 900,
              backgroundColor: "rgba(255,255,255,0.25)",
              padding: "2px 8px",
              borderRadius: "9999px",
            }}
          >
            {savingsPercent}% OFF
          </span>
        )}
      </div>

      {/* 상품 정보 요약 */}
      <div
        style={{
          padding: "14px 16px",
          borderBottom: "1px solid #f1f5f9",
          display: "flex",
          gap: "12px",
          alignItems: "center",
        }}
      >
        {product.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.imageUrl}
            alt={product.name}
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "10px",
              objectFit: "cover",
              border: "1px solid #e2e8f0",
              flexShrink: 0,
            }}
          />
        ) : (
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "10px",
              backgroundColor: "#f1f5f9",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#94a3b8",
              fontWeight: "bold",
              fontSize: "11px",
              flexShrink: 0,
            }}
          >
            상품
          </div>
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: "11px", fontWeight: "bold", color: "#2563eb", marginBottom: "2px" }}>
            {product.brand || product.category || "스캔 인증 상품"}
          </div>
          <h2
            style={{
              fontSize: "14px",
              fontWeight: "bold",
              color: "#0f172a",
              margin: 0,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {product.name}
          </h2>
          {product.capacity && (
            <p style={{ margin: "2px 0 0 0", fontSize: "11px", color: "#64748b" }}>
              규격: {product.capacity}
            </p>
          )}
        </div>
      </div>

      {/* 가격 1:1 비교 그리드 */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
          backgroundColor: "#f8fafc",
          padding: "14px 16px",
        }}
      >
        {/* 오프라인 매장 가격 */}
        <div style={{ paddingRight: "12px", borderRight: "1px solid #e2e8f0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "11px", color: "#64748b", fontWeight: 600, marginBottom: "4px" }}>
            <Store style={{ width: 14, height: 14 }} /> 오프라인 매장가
          </div>
          <div>
            <div style={{ fontSize: "17px", fontWeight: 900, color: "#1e293b" }}>
              {(offlinePrice || 0).toLocaleString()}
              <span style={{ fontSize: "12px", fontWeight: 500 }}>원</span>
            </div>
            <div style={{ fontSize: "10px", color: "#94a3b8", marginTop: "2px" }}>현장 카트 담기</div>
          </div>
        </div>

        {/* 온라인 쿠팡 최저가 */}
        <div style={{ paddingLeft: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "11px", color: "#dc2626", fontWeight: "bold", marginBottom: "4px" }}>
            <ShoppingCart style={{ width: 14, height: 14 }} />
            <span>쿠팡 와우 회원가</span>
          </div>
          <div>
            <div style={{ fontSize: "19px", fontWeight: 900, color: "#dc2626" }}>
              {(bestOnline.price || 0).toLocaleString()}
              <span style={{ fontSize: "12px", fontWeight: "bold" }}>원</span>
            </div>
            <div style={{ fontSize: "10px", color: "#059669", fontWeight: 600, display: "flex", alignItems: "center", gap: "4px", marginTop: "2px" }}>
              <CheckCircle style={{ width: 12, height: 12 }} />
              {bestOnline.rocketShipping ? "내일 새벽 무료배송" : "무료배송"}
            </div>
          </div>
        </div>
      </div>

      {/* 단위 가격 비교 팁 */}
      {bestOnline.unitPriceText && (
        <div
          style={{
            padding: "10px 16px",
            backgroundColor: "#eff6ff",
            borderTop: "1px solid #dbeafe",
            fontSize: "11px",
            color: "#1e40af",
            fontWeight: 500,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span>💡 단가 혜택:</span>
          <span style={{ fontWeight: "bold" }}>{bestOnline.unitPriceText}</span>
        </div>
      )}
    </div>
  );
};
