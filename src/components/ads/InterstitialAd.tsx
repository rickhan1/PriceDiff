"use client";

import React, { useEffect, useState } from "react";
import { X, Sparkles, Zap, ShieldCheck } from "lucide-react";

interface InterstitialAdProps {
  isOpen: boolean;
  onComplete: () => void;
  countdownSeconds?: number;
}

export const InterstitialAd: React.FC<InterstitialAdProps> = ({
  isOpen,
  onComplete,
  countdownSeconds = 3,
}) => {
  const [secondsLeft, setSecondsLeft] = useState(countdownSeconds);
  const [canSkip, setCanSkip] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setSecondsLeft(countdownSeconds);
      setCanSkip(false);
      return;
    }

    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setCanSkip(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, countdownSeconds]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl text-center overflow-hidden border border-slate-100">
        {/* 상단 닫기/카운트다운 헤더 */}
        <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Zap className="w-3 h-3 text-amber-500 fill-amber-500" /> 스폰서 광고
          </span>
          {canSkip ? (
            <button
              onClick={onComplete}
              className="flex items-center gap-1 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-full transition-colors"
            >
              결과 보기 <X className="w-3.5 h-3.5" />
            </button>
          ) : (
            <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
              {secondsLeft}초 후 결과 표시
            </span>
          )}
        </div>

        {/* 광고 콘텐츠 영역 (전면 배너형) */}
        <div className="my-3 py-6 px-4 bg-gradient-to-br from-indigo-50 via-blue-50 to-white rounded-xl border border-blue-100 flex flex-col items-center">
          <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/30 mb-3">
            <Sparkles className="w-7 h-7 animate-pulse" />
          </div>
          <h3 className="text-lg font-extrabold text-slate-900 leading-snug">
            최저가 데이터 분석 완료!
          </h3>
          <p className="text-xs text-slate-600 mt-1 mb-4 leading-relaxed">
            쿠팡 로켓배송 실시간 재고 및<br />
            토스 쇼핑 최저가 혜택을 매칭했습니다.
          </p>

          <div className="w-full py-2.5 px-3 bg-white rounded-lg shadow-sm border border-slate-200 text-left flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span className="text-xs font-semibold text-slate-700">
              와우 회원은 추가 할인 및 무료 반품 적용
            </span>
          </div>
        </div>

        {/* 하단 진행 버튼 */}
        <button
          onClick={onComplete}
          disabled={!canSkip}
          className={`w-full py-3.5 rounded-xl text-sm font-bold transition-all shadow-md ${
            canSkip
              ? "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/30 cursor-pointer animate-bounce"
              : "bg-slate-200 text-slate-400 cursor-not-allowed"
          }`}
        >
          {canSkip ? "가격 비교 결과 확인하기 ➔" : `${secondsLeft}초 후 확인 가능합니다`}
        </button>
      </div>
    </div>
  );
};
