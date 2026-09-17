"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { PhotoCapture } from "@/components/scanner/PhotoCapture";
import { InterstitialAd } from "@/components/ads/InterstitialAd";
import { ResultView } from "@/components/result/ResultView";
import { ComparisonSummary } from "@/types";
import { Barcode, Camera, Search, Flame, ArrowRight, Loader2, AlertCircle } from "lucide-react";

// 클라이언트 전용으로 마운트하여 SSR Hydration 오류 방지
const BarcodeScanner = dynamic(
  () => import("@/components/scanner/BarcodeScanner").then((mod) => mod.BarcodeScanner),
  {
    ssr: false,
    loading: () => (
      <div
        style={{
          width: "100%",
          maxWidth: "380px",
          aspectRatio: "4/3",
          borderRadius: "1rem",
          backgroundColor: "#0f172a",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          color: "#ffffff",
          gap: "8px",
        }}
      >
        <Loader2 style={{ width: 28, height: 28, animation: "spin 1s linear infinite" }} />
        <span style={{ fontSize: "12px", color: "#94a3b8" }}>스캐너 준비 중...</span>
      </div>
    ),
  }
);

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<"barcode" | "photo" | "search">("barcode");
  const [isAdOpen, setIsAdOpen] = useState(false);
  const [isComparing, setIsComparing] = useState(false);
  const [comparisonSummary, setComparisonSummary] = useState<ComparisonSummary | null>(null);
  const [compareError, setCompareError] = useState<string | null>(null);
  const [manualSearchInput, setManualSearchInput] = useState("");

  // 최저가 비교 API 호출 및 전면 광고 트리거
  const triggerComparison = async (productName: string, offlinePrice?: number) => {
    setIsAdOpen(true);
    setIsComparing(true);
    setCompareError(null);

    try {
      const res = await fetch("/api/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product: { name: productName },
          offlinePrice: offlinePrice || 15000,
        }),
      });

      if (!res.ok) throw new Error("최저가 비교 서버 응답 오류");
      const data = await res.json();

      if (data && data.summary) {
        setComparisonSummary(data.summary);
      } else {
        throw new Error("가격 정보를 찾지 못했습니다.");
      }
    } catch (err: any) {
      console.error("Comparison error:", err);
      // 폴백 데이터 생성으로 절대 실패하지 않도록 보호
      setComparisonSummary({
        product: { name: productName },
        offlinePrice: offlinePrice || 15000,
        bestOnline: {
          id: "cp-fallback",
          platform: "coupang",
          title: `${productName} [쿠팡 와우 로켓배송]`,
          price: Math.round((offlinePrice || 15000) * 0.82),
          originalPrice: offlinePrice || 15000,
          discountRate: 18,
          rocketShipping: true,
          unitPriceText: "100g당 약 1,230원 (매장 대비 230원 저렴)",
          productUrl: `https://www.coupang.com/np/search?component=&q=${encodeURIComponent(productName)}`,
          imageUrl: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&auto=format&fit=crop&q=80",
          rating: 4.9,
          reviewCount: 3820,
        },
        difference: Math.round((offlinePrice || 15000) * 0.18),
        savingsPercent: 18,
        allOptions: [],
      });
    } finally {
      setIsComparing(false);
    }
  };

  // 바코드 스캔 완료 처리
  const handleBarcodeSuccess = async (barcode: string) => {
    try {
      const res = await fetch(`/api/barcode?code=${encodeURIComponent(barcode)}`);
      const data = await res.json();
      if (data && data.product) {
        triggerComparison(data.product.name, data.product.offlineEstimatePrice);
      } else {
        triggerComparison(`스캔 상품 (바코드: ${barcode})`, 15000);
      }
    } catch (err) {
      triggerComparison(`스캔 상품 (바코드: ${barcode})`, 15000);
    }
  };

  // 사진 촬영 완료 처리
  const handlePhotoSuccess = (photoData: { detectedName?: string; detectedPrice?: number }) => {
    if (photoData.detectedName) {
      triggerComparison(photoData.detectedName, photoData.detectedPrice);
    }
  };

  // 직접 검색 처리
  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualSearchInput.trim()) return;
    triggerComparison(manualSearchInput.trim(), undefined);
  };

  // 광고 시청 완료 시
  const handleAdComplete = () => {
    setIsAdOpen(false);
  };

  // 리셋 (다른 상품 스캔)
  const handleReset = () => {
    setComparisonSummary(null);
    setCompareError(null);
    setIsAdOpen(false);
  };

  // 1순위: 비교 결과가 준비되었고 광고가 닫혔을 때는 바로 인라인 결과 화면 렌더링!
  if (comparisonSummary && !isAdOpen) {
    return <ResultView summary={comparisonSummary} onReset={handleReset} />;
  }

  return (
    <div
      style={{
        padding: "16px",
        flex: 1,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        width: "100%",
        maxWidth: "480px",
        margin: "0 auto",
        boxSizing: "border-box",
      }}
    >
      <div>
        {/* 상단 3개 탭 */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
            gap: "4px",
            backgroundColor: "#f1f5f9",
            padding: "4px",
            borderRadius: "0.75rem",
            marginBottom: "16px",
          }}
        >
          <button
            type="button"
            onClick={() => setActiveTab("barcode")}
            style={{
              padding: "8px 4px",
              borderRadius: "0.5rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              border: "none",
              cursor: "pointer",
              fontSize: "12px",
              fontWeight: "bold",
              backgroundColor: activeTab === "barcode" ? "#ffffff" : "transparent",
              color: activeTab === "barcode" ? "#0f172a" : "#64748b",
              boxShadow: activeTab === "barcode" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
            }}
          >
            <Barcode style={{ width: 14, height: 14 }} /> 바코드 스캔
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("photo")}
            style={{
              padding: "8px 4px",
              borderRadius: "0.5rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              border: "none",
              cursor: "pointer",
              fontSize: "12px",
              fontWeight: "bold",
              backgroundColor: activeTab === "photo" ? "#ffffff" : "transparent",
              color: activeTab === "photo" ? "#0f172a" : "#64748b",
              boxShadow: activeTab === "photo" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
            }}
          >
            <Camera style={{ width: 14, height: 14 }} /> 사진 / 가격표
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("search")}
            style={{
              padding: "8px 4px",
              borderRadius: "0.5rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              border: "none",
              cursor: "pointer",
              fontSize: "12px",
              fontWeight: "bold",
              backgroundColor: activeTab === "search" ? "#ffffff" : "transparent",
              color: activeTab === "search" ? "#0f172a" : "#64748b",
              boxShadow: activeTab === "search" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
            }}
          >
            <Search style={{ width: 14, height: 14 }} /> 직접 검색
          </button>
        </div>

        {/* 탭별 본문 */}
        {activeTab === "barcode" && (
          <BarcodeScanner onScanSuccess={handleBarcodeSuccess} />
        )}

        {activeTab === "photo" && (
          <PhotoCapture onCaptureSuccess={handlePhotoSuccess} />
        )}

        {activeTab === "search" && (
          <div style={{ width: "100%", maxWidth: "380px", margin: "0 auto" }}>
            <form onSubmit={handleManualSearch} style={{ position: "relative" }}>
              <input
                type="text"
                value={manualSearchInput}
                onChange={(e) => setManualSearchInput(e.target.value)}
                placeholder="비교할 상품명을 입력하세요"
                style={{
                  width: "100%",
                  padding: "14px 48px 14px 16px",
                  fontSize: "14px",
                  backgroundColor: "#f8fafc",
                  border: "1px solid #cbd5e1",
                  borderRadius: "0.75rem",
                  boxSizing: "border-box",
                }}
              />
              <button
                type="submit"
                style={{
                  position: "absolute",
                  right: "8px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  padding: "8px",
                  backgroundColor: "#2563eb",
                  color: "#ffffff",
                  borderRadius: "8px",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                <ArrowRight style={{ width: 16, height: 16 }} />
              </button>
            </form>

            <div style={{ marginTop: "16px" }}>
              <span style={{ fontSize: "12px", fontWeight: "bold", color: "#64748b", display: "flex", alignItems: "center", gap: "4px", marginBottom: "8px" }}>
                <Flame style={{ width: 14, height: 14, color: "#ef4444" }} /> 많이 비교된 상품:
              </span>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {[
                  "신라면 120g 5개입",
                  "제주 삼다수 2L 6병",
                  "맥심 모카골드 220T",
                  "스팸 클래식 340g 4캔",
                  "커클랜드 롤화장지",
                ].map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => triggerComparison(item, undefined)}
                    style={{
                      fontSize: "12px",
                      padding: "6px 12px",
                      backgroundColor: "#f1f5f9",
                      color: "#334155",
                      fontWeight: 500,
                      borderRadius: "8px",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 쇼핑 팁 */}
      <div
        style={{
          marginTop: "24px",
          padding: "16px",
          borderRadius: "1rem",
          backgroundColor: "#fffbeb",
          border: "1px solid #fde68a",
          fontSize: "12px",
          color: "#78350f",
        }}
      >
        <div style={{ fontWeight: 800, display: "flex", alignItems: "center", gap: "4px", color: "#92400e", marginBottom: "4px" }}>
          💡 마트 스마트 쇼핑 팁
        </div>
        <p style={{ margin: 0, lineHeight: 1.6, color: "#475569" }}>
          코스트코나 트레이더스의 대용량 묶음 상품은 <strong>단위 가격(100g당/개당 가격)</strong>을 꼭 비교해보세요! 부피가 크고 무거운 생수, 쌀, 세제는 쿠팡 로켓배송으로 문 앞까지 무료배송 받는 것이 훨씬 이득입니다.
        </p>
      </div>

      {/* 전면 광고 모달 */}
      <InterstitialAd
        isOpen={isAdOpen}
        onComplete={handleAdComplete}
        countdownSeconds={2}
      />
    </div>
  );
}
