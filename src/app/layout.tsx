import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";
import { BannerAd } from "@/components/ads/BannerAd";
import { Sparkles, ShoppingBag } from "lucide-react";

export const metadata: Metadata = {
  title: "프라이스디프 (PriceDiff) - 마트 vs 쿠팡 실시간 가격비교",
  description: "마트에서 바코드나 사진만 찍으면 쿠팡 로켓배송 최저가와 즉시 비교해주는 스마트 쇼핑 비서",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const adClient = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;

  return (
    <html lang="ko">
      <head>
        {adClient && (
          <Script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adClient}`}
            crossOrigin="anonymous"
            strategy="afterInteractive"
          />
        )}
      </head>
      <body style={{ margin: 0, padding: 0, backgroundColor: "#f3f4f6", fontFamily: "-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif" }}>
        <div
          className="mobile-container"
          style={{
            maxWidth: "480px",
            margin: "0 auto",
            minHeight: "100vh",
            backgroundColor: "#ffffff",
            boxShadow: "0 0 25px rgba(0,0,0,0.08)",
            display: "flex",
            flexDirection: "column",
            position: "relative",
            boxSizing: "border-box",
          }}
        >
          {/* 상단 헤더 */}
          <header
            style={{
              position: "sticky",
              top: 0,
              zIndex: 40,
              backgroundColor: "rgba(255, 255, 255, 0.95)",
              backdropFilter: "blur(8px)",
              borderBottom: "1px solid #f1f5f9",
              padding: "12px 16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <a href="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
              <div
                style={{
                  width: "34px",
                  height: "34px",
                  borderRadius: "10px",
                  background: "linear-gradient(135deg, #ef4444, #f59e0b)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#ffffff",
                  boxShadow: "0 4px 10px rgba(239, 68, 68, 0.3)",
                }}
              >
                <ShoppingBag style={{ width: 18, height: 18 }} />
              </div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ fontWeight: 900, fontSize: "16px", letterSpacing: "-0.025em", color: "#0f172a" }}>
                    Price<span style={{ color: "#dc2626" }}>Diff</span>
                  </span>
                  <span
                    style={{
                      padding: "1px 6px",
                      borderRadius: "9999px",
                      backgroundColor: "#fef3c7",
                      color: "#92400e",
                      fontSize: "10px",
                      fontWeight: 800,
                    }}
                  >
                    PRO
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: "10px", color: "#94a3b8" }}>
                  코스트코 · 이마트 · 트레이더스 vs 쿠팡
                </p>
              </div>
            </a>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
                fontSize: "11px",
                fontWeight: 600,
                color: "#64748b",
                backgroundColor: "#f1f5f9",
                padding: "4px 10px",
                borderRadius: "9999px",
              }}
            >
              <Sparkles style={{ width: 12, height: 12, color: "#f59e0b" }} />
              <span>실시간 최저가</span>
            </div>
          </header>

          {/* 본문 */}
          <main style={{ flex: 1, display: "flex", flexDirection: "column" }}>
            {children}
          </main>

          {/* 하단 광고 배너 */}
          <BannerAd position="bottom" />
        </div>
      </body>
    </html>
  );
}
