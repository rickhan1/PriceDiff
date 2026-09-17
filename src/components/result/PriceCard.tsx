"use client";

import React from "react";
import { ComparisonSummary } from "@/types";
import { TrendingDown, CheckCircle, Store, ShoppingCart } from "lucide-react";

interface PriceCardProps {
  summary: ComparisonSummary;
}

export const PriceCard: React.FC<PriceCardProps> = ({ summary }) => {
  const { product, offlinePrice, bestOnline, difference, savingsPercent } = summary;
  const isOnlineCheaper = difference > 0;

  return (
    <div className="w-full bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      {/* 절약 배지 헤더 */}
      <div
        className={`px-4 py-3 flex items-center justify-between ${
          isOnlineCheaper ? "bg-emerald-500 text-white" : "bg-slate-700 text-white"
        }`}
      >
        <div className="flex items-center gap-1.5 font-extrabold text-sm">
          {isOnlineCheaper ? (
            <>
              <TrendingDown className="w-4 h-4" />
              <span>온라인에서 사면 {difference.toLocaleString()}원 절약!</span>
            </>
          ) : (
            <>
              <Store className="w-4 h-4" />
              <span>오프라인 매장 가격이 더 합리적입니다!</span>
            </>
          )}
        </div>
        {isOnlineCheaper && (
          <span className="text-xs font-black bg-white/20 px-2 py-0.5 rounded-full">
            {savingsPercent}% OFF
          </span>
        )}
      </div>

      {/* 상품 정보 요약 */}
      <div className="p-4 border-b border-slate-100 flex gap-3 items-center">
        {product.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-16 h-16 rounded-xl object-cover border border-slate-200 flex-shrink-0"
          />
        ) : (
          <div className="w-16 h-16 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 font-bold text-xs flex-shrink-0">
            상품 이미지
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="text-xs font-bold text-blue-600 mb-0.5">
            {product.brand || product.category || "인증 상품"}
          </div>
          <h2 className="text-sm font-bold text-slate-900 truncate">
            {product.name}
          </h2>
          {product.capacity && (
            <p className="text-xs text-slate-500 mt-0.5">용량/규격: {product.capacity}</p>
          )}
        </div>
      </div>

      {/* 가격 1:1 직접 비교 그리드 */}
      <div className="grid grid-cols-2 divide-x divide-slate-100 bg-slate-50/70 p-4">
        {/* 오프라인 마트 가격 */}
        <div className="pr-3 flex flex-col justify-between">
          <div className="flex items-center gap-1 text-xs text-slate-500 font-semibold mb-1">
            <Store className="w-3.5 h-3.5" /> 오프라인 매장가
          </div>
          <div>
            <div className="text-lg font-black text-slate-800">
              {offlinePrice.toLocaleString()}
              <span className="text-xs font-normal">원</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">현장 카트 담기</div>
          </div>
        </div>

        {/* 온라인(쿠팡) 최저가 */}
        <div className="pl-3 flex flex-col justify-between">
          <div className="flex items-center gap-1 text-xs text-red-600 font-bold mb-1">
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>쿠팡 와우 회원가</span>
          </div>
          <div>
            <div className="text-xl font-black text-red-600">
              {bestOnline.price.toLocaleString()}
              <span className="text-xs font-bold">원</span>
            </div>
            <div className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 mt-0.5">
              <CheckCircle className="w-3 h-3" />
              {bestOnline.rocketShipping ? "내일 새벽 무료배송" : "무료배송"}
            </div>
          </div>
        </div>
      </div>

      {/* 단위 가격 비교 팁 (100g당/개당) */}
      {bestOnline.unitPriceText && (
        <div className="px-4 py-2.5 bg-blue-50/80 border-t border-blue-100 text-xs text-blue-800 font-medium flex items-center justify-between">
          <span>💡 단가 혜택:</span>
          <span className="font-bold">{bestOnline.unitPriceText}</span>
        </div>
      )}
    </div>
  );
};
