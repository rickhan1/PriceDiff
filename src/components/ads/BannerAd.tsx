"use client";

import React from "react";

interface BannerAdProps {
  slotId?: string;
  position?: "top" | "bottom" | "inline";
}

export const BannerAd: React.FC<BannerAdProps> = ({
  slotId = "BANNER_DEFAULT",
  position = "bottom",
}) => {
  const adClient = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;

  return (
    <div
      style={{
        width: "100%",
        overflow: "hidden",
        backgroundColor: "#ffffff",
        borderTop: "1px solid #f1f5f9",
        padding: "8px 12px",
        textAlign: "center",
        boxSizing: "border-box",
        ...(position === "bottom"
          ? {
              position: "sticky",
              bottom: 0,
              zIndex: 30,
              boxShadow: "0 -2px 10px rgba(0,0,0,0.05)",
            }
          : {}),
      }}
    >
      <div
        style={{
          fontSize: "9px",
          color: "#94a3b8",
          fontWeight: 700,
          marginBottom: "4px",
          letterSpacing: "0.05em",
          textTransform: "uppercase",
        }}
      >
        Sponsor Advertisement
      </div>

      {adClient ? (
        <ins
          className="adsbygoogle"
          style={{ display: "block", minHeight: "50px" }}
          data-ad-client={adClient}
          data-ad-slot={slotId}
          data-ad-format="horizontal"
          data-full-width-responsive="true"
        />
      ) : (
        <a
          href="https://www.coupang.com"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "8px 12px",
            background: "linear-gradient(135deg, #fff1f2 0%, #fef2f2 100%)",
            border: "1px solid #fecdd3",
            borderRadius: "10px",
            textDecoration: "none",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span
              style={{
                backgroundColor: "#e11d48",
                color: "#ffffff",
                fontSize: "10px",
                fontWeight: 800,
                padding: "2px 6px",
                borderRadius: "4px",
              }}
            >
              쿠팡 WOW
            </span>
            <span
              style={{
                fontSize: "11px",
                fontWeight: 600,
                color: "#1e293b",
                textAlign: "left",
                lineHeight: 1.3,
              }}
            >
              지금 첫 달 무료 ➔ 로켓배송 무제한 무료
            </span>
          </div>
          <span
            style={{
              fontSize: "11px",
              fontWeight: 800,
              color: "#e11d48",
              whiteSpace: "nowrap",
              marginLeft: "8px",
            }}
          >
            보기 ➔
          </span>
        </a>
      )}
    </div>
  );
};
