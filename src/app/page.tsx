"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { BarcodeScanner } from "@/components/scanner/BarcodeScanner";
import { PhotoCapture } from "@/components/scanner/PhotoCapture";
import { InterstitialAd } from "@/components/ads/InterstitialAd";
import { Barcode, Camera, Search, Flame, ArrowRight } from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"barcode" | "photo" | "search">("barcode");
  const [isAdOpen, setIsAdOpen] = useState(false);
  const [pendingSearchQuery, setPendingSearchQuery] = useState<string | null>(null);
  const [pendingOfflinePrice, setPendingOfflinePrice] = useState<number | undefined>(undefined);
  const [manualSearchInput, setManualSearchInput] = useState("");

  // 바코드 스캔 완료 처리
  const handleBarcodeSuccess = async (barcode: string) => {
    try {
      const res = await fetch(`/api/barcode?code=${encodeURIComponent(barcode)}`);
      const data = await res.json();
      if (data.product) {
        setPendingSearchQuery(data.product.name);
        setPendingOfflinePrice(data.product.offlineEstimatePrice);
        setIsAdOpen(true); // 결과 보기 전 전면 광고 노출
      }
    } catch (err) {
      console.error(err);
      setPendingSearchQuery(`상품 바코드 ${barcode}`);
      setIsAdOpen(true);
    }
  };

  // 사진 촬영 완료 처리
  const handlePhotoSuccess = (photoData: { detectedName?: string; detectedPrice?: number }) => {
    if (photoData.detectedName) {
      setPendingSearchQuery(photoData.detectedName);
      setPendingOfflinePrice(photoData.detectedPrice);
      setIsAdOpen(true);
    }
  };

  // 직접 검색 처리
  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualSearchInput.trim()) return;
    setPendingSearchQuery(manualSearchInput.trim());
    setPendingOfflinePrice(undefined);
    setIsAdOpen(true);
  };

  // 전면 광고 시청 완료 또는 닫기 시 결과 페이지로 이동
  const handleAdComplete = () => {
    setIsAdOpen(false);
    if (pendingSearchQuery) {
      const queryParams = new URLSearchParams({
        q: pendingSearchQuery,
        ...(pendingOfflinePrice ? { price: String(pendingOfflinePrice) } : {}),
      });
      router.push(`/result?${queryParams.toString()}`);
    }
  };

  return (
    <div className="p-4 flex-1 flex flex-col justify-between">
      {/* 탭 네비게이션 */}
      <div>
        <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl mb-4 text-xs font-bold text-slate-600">
          <button
            onClick={() => setActiveTab("barcode")}
            className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition ${
              activeTab === "barcode"
                ? "bg-white text-slate-900 shadow-sm"
                : "hover:text-slate-900"
            }`}
          >
            <Barcode className="w-3.5 h-3.5" /> 바코드 스캔
          </button>
          <button
            onClick={() => setActiveTab("photo")}
            className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition ${
              activeTab === "photo"
                ? "bg-white text-slate-900 shadow-sm"
                : "hover:text-slate-900"
            }`}
          >
            <Camera className="w-3.5 h-3.5" /> 사진 / 가격표
          </button>
          <button
            onClick={() => setActiveTab("search")}
            className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition ${
              activeTab === "search"
                ? "bg-white text-slate-900 shadow-sm"
                : "hover:text-slate-900"
            }`}
          >
            <Search className="w-3.5 h-3.5" /> 직접 검색
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
          <div className="w-full max-w-sm mx-auto">
            <form onSubmit={handleManualSearch} className="relative">
              <input
                type="text"
                value={manualSearchInput}
                onChange={(e) => setManualSearchInput(e.target.value)}
                placeholder="비교할 상품명을 입력하세요 (예: 삼다수 2L 6병)"
                className="w-full py-3.5 pl-4 pr-12 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* 추천 인기 검색어 */}
            <div className="mt-4">
              <span className="text-xs font-bold text-slate-500 flex items-center gap-1 mb-2">
                <Flame className="w-3.5 h-3.5 text-red-500" /> 오늘 마트에서 가장 많이 비교된 상품:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  "신라면 120g 5개입",
                  "제주 삼다수 2L 6병",
                  "맥심 모카골드 220T",
                  "스팸 클래식 340g 4캔",
                  "커클랜드 롤화장지",
                ].map((item) => (
                  <button
                    key={item}
                    onClick={() => {
                      setPendingSearchQuery(item);
                      setIsAdOpen(true);
                    }}
                    className="text-xs px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 쇼핑 꿀팁 안내 카드 */}
      <div className="mt-6 p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-200/60 text-xs text-amber-900">
        <div className="font-extrabold flex items-center gap-1 text-amber-800 mb-1">
          💡 마트 스마트 쇼핑 팁
        </div>
        <p className="leading-relaxed text-slate-600">
          코스트코나 트레이더스의 대용량 묶음 상품은 <strong>단위 가격(100g당/개당 가격)</strong>을 꼭 비교해보세요! 부피가 크고 무거운 생수, 쌀, 세제, 기저귀는 쿠팡 로켓배송으로 문 앞까지 무료배송 받는 것이 훨씬 이득입니다.
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
