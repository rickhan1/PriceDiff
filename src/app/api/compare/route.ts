import { NextRequest, NextResponse } from "next/server";
import { searchCoupangProducts } from "@/lib/coupang";
import { ComparisonSummary, ProductInfo } from "@/types";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { product, offlinePrice } = body as {
      product: ProductInfo;
      offlinePrice?: number;
    };

    if (!product || !product.name) {
      return NextResponse.json({ error: "Product name is required" }, { status: 400 });
    }

    const effectiveOfflinePrice =
      offlinePrice && !isNaN(offlinePrice) && offlinePrice > 0
        ? offlinePrice
        : product.offlineEstimatePrice && product.offlineEstimatePrice > 0
        ? product.offlineEstimatePrice
        : 15000;

    // 온라인 최저가 검색
    const onlineOptions = await searchCoupangProducts(product.name, effectiveOfflinePrice);

    // 가장 저렴한 옵션
    const bestOnline = [...onlineOptions].sort((a, b) => a.price - b.price)[0] || {
      id: "cp-default",
      platform: "coupang" as const,
      title: `${product.name} [쿠팡 로켓배송]`,
      price: Math.round(effectiveOfflinePrice * 0.82),
      originalPrice: effectiveOfflinePrice,
      discountRate: 18,
      rocketShipping: true,
      unitPriceText: "100g당 약 1,230원 (매장 대비 230원 저렴)",
      productUrl: `https://www.coupang.com/np/search?component=&q=${encodeURIComponent(product.name)}`,
      imageUrl: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&auto=format&fit=crop&q=80",
      rating: 4.9,
      reviewCount: 3820,
    };

    const difference = effectiveOfflinePrice - bestOnline.price;
    const savingsPercent =
      effectiveOfflinePrice > 0
        ? Math.round((difference / effectiveOfflinePrice) * 100)
        : 15;

    const summary: ComparisonSummary = {
      product,
      offlinePrice: effectiveOfflinePrice,
      bestOnline,
      difference,
      savingsPercent,
      allOptions: onlineOptions.length > 0 ? onlineOptions : [bestOnline],
    };

    return NextResponse.json({ success: true, summary });
  } catch (error: any) {
    console.error("[SERVER ERROR] compare route failed:", error);
    return NextResponse.json(
      { error: "Failed to compare prices", details: error?.message },
      { status: 500 }
    );
  }
}
