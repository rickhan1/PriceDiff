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
      <body>
        <div className="mobile-container">
          {/* 상단 모바일 앱 네비게이션 헤더 */}
          <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-100 px-4 py-3 flex items-center justify-between shadow-sm">
            <a href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-red-500 to-amber-500 flex items-center justify-center text-white shadow-md shadow-red-500/20">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-1">
                  <span className="font-black text-base tracking-tight text-slate-900">
                    Price<span className="text-red-600">Diff</span>
                  </span>
                  <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 text-[10px] font-bold">
                    PRO
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 -mt-0.5">
                  코스트코 · 이마트 · 트레이더스 vs 쿠팡
                </p>
              </div>
            </a>

            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium bg-slate-100 px-2.5 py-1 rounded-full">
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>실시간 최저가</span>
            </div>
          </header>

          {/* 메인 콘텐츠 영역 */}
          <main className="flex-1 flex flex-col">{children}</main>

          {/* 하단 고정 배너 광고 */}
          <BannerAd position="bottom" />
        </div>
      </body>
    </html>
  );
}
