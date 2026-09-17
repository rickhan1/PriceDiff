"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ComparisonSummary } from "@/types";
import { PriceCard } from "@/components/result/PriceCard";
import { AffiliatedButton } from "@/components/result/AffiliatedButton";
import { BannerAd } from "@/components/ads/BannerAd";
import { ArrowLeft, RotateCcw, Loader2, Sparkles, CheckCircle2 } from "lucide-react";

function ResultContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get("q");
  const offlinePrice = searchParams.get("price") ? Number(searchParams.get("price")) : undefined;

  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<ComparisonSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!query) return;

    const fetchComparison = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/compare", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            product: { name: query },
            offlinePrice,
          }),
        });

        const data = await res.json();
        if (data.summary) {
          setSummary(data.summary);
        } else {
          setError("상품 가격 정보를 불러오지 못했습니다.");
        }
      } catch (err: any) {
        setError(err.message || "오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchComparison();
  }, [query, offlinePrice]);

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <Loader2 className="w-12 h-12 animate-spin text-red-500 mb-4" />
        <h3 className="text-base font-extrabold text-slate-900">
          쿠팡 & 온라인 최저가 탐색 중...
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          실시간 로켓배송 재고와 와우 회원 할인가를 매칭하고 있습니다.
        </p>
      </div>
    );
  }

  if (error || !summary) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <p className="text-sm font-bold text-red-500 mb-4">{error || "결과가 없습니다."}</p>
        <button
          onClick={() => router.push("/")}
          className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl flex items-center gap-1.5"
        >
          <RotateCcw className="w-3.5 h-3.5" /> 다시 스캔하기
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4 flex-1 flex flex-col justify-between">
      <div className="space-y-4">
        {/* 상단 액션바 */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="w-4 h-4" /> 다른 상품 스캔
          </button>
          <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> 실시간 매칭 완료
          </span>
        </div>

        {/* 가격 비교 메인 카드 */}
        <PriceCard summary={summary} />

        {/* 중간 인라인 광고 슬롯 */}
        <BannerAd position="inline" />

        {/* 제휴 파트너스 구매 버튼 섹션 */}
        <AffiliatedButton
          bestOnline={summary.bestOnline}
          allOptions={summary.allOptions}
        />
      </div>

      {/* 하단 추가 안내 */}
      <div className="text-center pt-2">
        <button
          onClick={() => router.push("/")}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 py-2"
        >
          <RotateCcw className="w-3.5 h-3.5" /> 새로운 상품 바코드 스캔하기
        </button>
      </div>
    </div>
  );
}

export default function ResultPage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex items-center justify-center p-6">
          <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
        </div>
      }
    >
      <ResultContent />
    </Suspense>
  );
}
