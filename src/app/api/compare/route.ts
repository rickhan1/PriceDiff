import { NextRequest, NextResponse } from "next/server";
import { searchCoupangProducts } from "@/lib/coupang";
import { ComparisonSummary, ProductInfo } from "@/types";

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
      offlinePrice || product.offlineEstimatePrice || 15000;

    // 쿠팡 및 온라인 검색
    const onlineOptions = await searchCoupangProducts(product.name, effectiveOfflinePrice);

    // 가장 저렴한 옵션 선택
    const bestOnline = [...onlineOptions].sort((a, b) => a.price - b.price)[0];

    const difference = effectiveOfflinePrice - bestOnline.price;
    const savingsPercent = Math.round((difference / effectiveOfflinePrice) * 100);

    const summary: ComparisonSummary = {
      product,
      offlinePrice: effectiveOfflinePrice,
      bestOnline,
      difference,
      savingsPercent,
      allOptions: onlineOptions,
    };

    return NextResponse.json({ success: true, summary });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to compare prices", details: error.message },
      { status: 500 }
    );
  }
}
