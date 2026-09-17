"use client";

import React, { useRef, useState } from "react";
import { Camera, Upload, Check, Loader2, Sparkles } from "lucide-react";

interface PhotoCaptureProps {
  onCaptureSuccess: (photoData: { imageUrl: string; detectedName?: string; detectedPrice?: number }) => void;
}

export const PhotoCapture: React.FC<PhotoCaptureProps> = ({ onCaptureSuccess }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [manualName, setManualName] = useState("");
  const [manualPrice, setManualPrice] = useState<number | "">("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const localUrl = URL.createObjectURL(file);
    setPreviewUrl(localUrl);

    // AI 이미지/OCR 분석 시뮬레이션 (약 1.2초)
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      // 가격표/패키지 분석 추정값 자동 채우기
      setManualName("코스트코 커클랜드 시그니처 롤화장지 30롤");
      setManualPrice(23990);
    }, 1200);
  };

  const handleConfirm = () => {
    if (!manualName.trim()) return;
    onCaptureSuccess({
      imageUrl: previewUrl || "",
      detectedName: manualName.trim(),
      detectedPrice: typeof manualPrice === "number" ? manualPrice : undefined,
    });
  };

  return (
    <div className="w-full flex flex-col items-center">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileChange}
      />

      {!previewUrl ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="w-full aspect-[4/3] max-w-sm rounded-2xl border-2 border-dashed border-slate-300 hover:border-blue-500 bg-slate-50 flex flex-col items-center justify-center cursor-pointer transition p-6 text-center group"
        >
          <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <Camera className="w-8 h-8" />
          </div>
          <span className="text-sm font-bold text-slate-800">
            상품 또는 가격표 사진 촬영하기
          </span>
          <p className="text-xs text-slate-500 mt-1">
            코스트코, 이마트 등 매장 가격표나 제품 패키지를 찍어보세요
          </p>
          <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-700 shadow-sm">
            <Upload className="w-3.5 h-3.5 text-slate-500" />
            사진 선택 또는 촬영
          </div>
        </div>
      ) : (
        <div className="w-full max-w-sm flex flex-col items-center">
          {/* 사진 미리보기 */}
          <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-slate-900 border border-slate-200 shadow-md">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewUrl}
              alt="촬영된 상품"
              className="w-full h-full object-cover"
            />
            {isAnalyzing && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center text-white">
                <Loader2 className="w-8 h-8 animate-spin text-blue-400 mb-2" />
                <p className="text-xs font-semibold flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" /> AI 가격표 및 상품명 분석 중...
                </p>
              </div>
            )}
            <button
              onClick={() => {
                setPreviewUrl(null);
                setManualName("");
                setManualPrice("");
              }}
              className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-black/70 text-white text-xs font-medium hover:bg-black"
            >
              다시 찍기
            </button>
          </div>

          {/* 인식된 정보 확인 및 수정 */}
          <div className="w-full mt-4 p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                인식된 상품명 (수정 가능)
              </label>
              <input
                type="text"
                value={manualName}
                onChange={(e) => setManualName(e.target.value)}
                placeholder="예: 코스트코 커클랜드 화장지"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                매장 판매가 (원)
              </label>
              <input
                type="number"
                value={manualPrice}
                onChange={(e) => setManualPrice(e.target.value ? Number(e.target.value) : "")}
                placeholder="예: 23990"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              onClick={handleConfirm}
              disabled={!manualName.trim() || isAnalyzing}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-bold text-sm rounded-xl shadow-md transition flex items-center justify-center gap-1.5"
            >
              <Check className="w-4 h-4" /> 쿠팡 최저가 비교 시작하기
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
