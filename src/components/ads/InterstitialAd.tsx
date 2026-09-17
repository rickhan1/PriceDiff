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
  countdownSeconds = 2,
}) => {
  const [secondsLeft, setSecondsLeft] = useState(countdownSeconds);
  const [canSkip, setCanSkip] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setSecondsLeft(countdownSeconds);
      setCanSkip(false);
      return;
    }

    setSecondsLeft(countdownSeconds);
    setCanSkip(false);

    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setCanSkip(true);
          // 카운트다운 종료 시 0.5초 뒤 자동으로 결과 페이지로 전환!
          setTimeout(() => {
            onComplete();
          }, 400);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, countdownSeconds, onComplete]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(0, 0, 0, 0.82)",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 999999,
        padding: "16px",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "360px",
          backgroundColor: "#ffffff",
          borderRadius: "1.25rem",
          padding: "24px",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
          textAlign: "center",
          position: "relative",
          boxSizing: "border-box",
          border: "1px solid #f1f5f9",
          animation: "fadeIn 0.2s ease-out",
        }}
      >
        {/* 상단 닫기/헤더 */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "16px",
            paddingBottom: "8px",
            borderBottom: "1px solid #f1f5f9",
          }}
        >
          <span
            style={{
              fontSize: "11px",
              fontWeight: 700,
              color: "#94a3b8",
              textTransform: "uppercase",
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            <Zap style={{ width: 14, height: 14, color: "#f59e0b", fill: "#f59e0b" }} /> 스폰서 광고
          </span>
          {canSkip ? (
            <button
              type="button"
              onClick={onComplete}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
                fontSize: "12px",
                fontWeight: "bold",
                color: "#1e293b",
                backgroundColor: "#f1f5f9",
                border: "none",
                borderRadius: "9999px",
                padding: "4px 10px",
                cursor: "pointer",
              }}
            >
              결과 보기 <X style={{ width: 14, height: 14 }} />
            </button>
          ) : (
            <span
              style={{
                fontSize: "11px",
                fontWeight: 600,
                color: "#64748b",
                backgroundColor: "#f8fafc",
                padding: "2px 8px",
                borderRadius: "9999px",
              }}
            >
              {secondsLeft}초 후 결과 전환
            </span>
          )}
        </div>

        {/* 광고 메인 콘텐츠 */}
        <div
          style={{
            padding: "20px 16px",
            backgroundColor: "#f0fdf4",
            borderRadius: "1rem",
            border: "1px solid #bbf7d0",
            marginBottom: "16px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "14px",
              backgroundColor: "#16a34a",
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "12px",
              boxShadow: "0 8px 16px rgba(22, 163, 74, 0.25)",
            }}
          >
            <Sparkles style={{ width: 24, height: 24 }} />
          </div>
          <h3
            style={{
              fontSize: "16px",
              fontWeight: 800,
              color: "#0f172a",
              margin: "0 0 6px 0",
              lineHeight: 1.3,
            }}
          >
            최저가 실시간 비교 완료!
          </h3>
          <p
            style={{
              fontSize: "12px",
              color: "#475569",
              margin: "0 0 12px 0",
              lineHeight: 1.5,
            }}
          >
            쿠팡 로켓배송 최저가 및<br />
            와우 회원 무료배송 혜택을 매칭했습니다.
          </p>

          <div
            style={{
              width: "100%",
              padding: "8px 10px",
              backgroundColor: "#ffffff",
              borderRadius: "8px",
              border: "1px solid #dcfce7",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              boxSizing: "border-box",
            }}
          >
            <ShieldCheck style={{ width: 16, height: 16, color: "#16a34a", flexShrink: 0 }} />
            <span style={{ fontSize: "11px", fontWeight: 600, color: "#166534" }}>
              쿠팡 와우 회원가는 내일 아침 도착 보장
            </span>
          </div>
        </div>

        {/* 진행 버튼 */}
        <button
          type="button"
          onClick={onComplete}
          style={{
            width: "100%",
            padding: "14px",
            borderRadius: "0.85rem",
            fontSize: "14px",
            fontWeight: "bold",
            border: "none",
            cursor: "pointer",
            backgroundColor: canSkip ? "#2563eb" : "#cbd5e1",
            color: "#ffffff",
            boxShadow: canSkip ? "0 4px 14px rgba(37, 99, 235, 0.35)" : "none",
            transition: "all 0.2s ease",
          }}
        >
          {canSkip ? "가격 비교 결과 확인하기 ➔" : `${secondsLeft}초 후 자동 이동합니다...`}
        </button>
      </div>
    </div>
  );
};
