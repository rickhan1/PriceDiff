export interface ProductInfo {
  barcode?: string;
  name: string;
  category?: string;
  imageUrl?: string;
  brand?: string;
  capacity?: string; // 예: "500g", "20개입", "1.2kg"
  offlineEstimatePrice?: number; // 오프라인 매장 예상가
}

export interface OnlinePriceResult {
  id: string;
  platform: 'coupang' | 'toss' | 'naver';
  title: string;
  price: number;
  originalPrice?: number;
  discountRate?: number;
  unitPriceText?: string; // 예: "100g당 890원"
  rocketShipping: boolean; // 로켓배송 / 무료배송 여부
  productUrl: string; // 제휴 딥링크 URL
  imageUrl: string;
  rating?: number;
  reviewCount?: number;
}

export interface ComparisonSummary {
  product: ProductInfo;
  offlinePrice: number;
  bestOnline: OnlinePriceResult;
  difference: number; // offlinePrice - bestOnline.price (양수면 온라인이 더 쌈)
  savingsPercent: number; // 절약 비율 (%)
  allOptions: OnlinePriceResult[];
}
