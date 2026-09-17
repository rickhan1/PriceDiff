"use client";

export const dynamic = "force-dynamic";

import React, { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ComparisonSummary } from "@/types";
import { PriceCard } from "@/components/result/PriceCard";
import { AffiliatedButton } from "@/components/result/AffiliatedButton";
import { BannerAd } from "@/components/ads/BannerAd";
import { ArrowLeft, RotateCcw, Loader2, CheckCircle2, AlertTriangle } from "lucide-react";

function ResultContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams?.get("q") || "스캔 상품";
  const rawPrice = searchParams?.get("price");
  const offlinePrice = rawPrice && !isNaN(Number(rawPrice)) ? Number(rawPrice) : undefined;

  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<ComparisonSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchComparison = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch("/api/compare", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            product: { name: query },
            offlinePrice,
          }),
        });

        if (!res.ok) {
          throw new Error("서버 응답 오류가 발생했습니다.");
        }

        const data = await res.json();
        if (isMounted) {
          if (data && data.summary) {
            setSummary(data.summary);
          } else {
            setError("상품 가격 정보를 불러오지 못했습니다.");
          }
        }
      } catch (err: any) {
        if (isMounted) {
          console.error("Comparison fetch error:", err);
          setError(err?.message || "오류가 발생했습니다.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchComparison();

    return () => {
      isMounted = false;
    };
  }, [query, offlinePrice]);

  if (loading) {
    return (
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "32px 16px",
          textAlign: "center",
          minHeight: "350px",
        }}
      >
        <Loader2 style={{ width: 40, height: 40, color: "#dc2626", animation: "spin 1s linear infinite", marginBottom: "16px" }} />
        <h3 style={{ fontSize: "16px", fontWeight: 800, color: "#0f172a", margin: "0 0 6px 0" }}>
          쿠팡 최저가 및 로켓배송 탐색 중...
        </h3>
        <p style={{ fontSize: "12px", color: "#64748b", margin: 0 }}>
          실시간 로켓배송 재고와 와우 회원 할인가를 매칭하고 있습니다.
        </p>
      </div>
    );
  }

  if (error || !summary) {
    return (
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "32px 16px",
          textAlign: "center",
          minHeight: "350px",
        }}
      >
        <AlertTriangle style={{ width: 36, height: 36, color: "#ef4444", marginBottom: "12px" }} />
        <p style={{ fontSize: "14px", fontWeight: "bold", color: "#dc2626", marginBottom: "16px" }}>
          {error || "결과를 불러오지 못했습니다."}
        </p>
        <button
          type="button"
          onClick={() => router.push("/")}
          style={{
            padding: "10px 18px",
            backgroundColor: "#0f172a",
            color: "#ffffff",
            fontSize: "13px",
            fontWeight: "bold",
            borderRadius: "0.75rem",
            border: "none",
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <RotateCcw style={{ width: 14, height: 14 }} /> 다시 스캔하기
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        padding: "16px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        flex: 1,
        gap: "16px",
        boxSizing: "border-box",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {/* 상단 액션바 */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <button
            type="button"
            onClick={() => router.push("/")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              fontSize: "12px",
              fontWeight: "bold",
              color: "#475569",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
            }}
          >
            <ArrowLeft style={{ width: 16, height: 16 }} /> 다른 상품 스캔
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
      <div style={{ textAlign: "center", paddingTop: "8px" }}>
        <button
          type="button"
          onClick={() => router.push("/")}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "12px",
            fontWeight: "bold",
            color: "#64748b",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "8px 12px",
          }}
        >
          <RotateCcw style={{ width: 14, height: 14 }} /> 새로운 상품 바코드 스캔하기
        </button>
      </div>
    </div>
  );
}

export default function ResultPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "350px",
            color: "#64748b",
            gap: "8px",
          }}
        >
          <Loader2 style={{ width: 36, height: 36, animation: "spin 1s linear infinite", color: "#94a3b8" }} />
          <span style={{ fontSize: "12px" }}>가격 정보 준비 중...</span>
        </div>
      }
    >
      <ResultContent />
    </Suspense>
  );
}
