import { ProductInfo } from "@/types";

// 마트에서 가장 자주 비교되는 대표 바코드 샘플 DB (코스트코/이마트/트레이더스 인기 품목)
export const KNOWN_BARCODES: Record<string, ProductInfo> = {
  // 신라면 멀티팩 (5개입)
  "8801043014831": {
    barcode: "8801043014831",
    name: "농심 신라면 120g x 5개입",
    brand: "농심",
    category: "가공식품/라면",
    capacity: "120g x 5개입 (600g)",
    offlineEstimatePrice: 4380,
    imageUrl: "https://images.unsplash.com/photo-1612927601601-6638404737ce?w=400&auto=format&fit=crop&q=80",
  },
  // 삼다수 2L x 6병
  "8806299000078": {
    barcode: "8806299000078",
    name: "제주 삼다수 2L x 6병",
    brand: "광동제약",
    category: "생수/음료",
    capacity: "2L x 6개 (12L)",
    offlineEstimatePrice: 6480,
    imageUrl: "https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=400&auto=format&fit=crop&q=80",
  },
  // 햇반 210g x 12개입
  "8801007052947": {
    barcode: "8801007052947",
    name: "CJ 햇반 210g x 12개입",
    brand: "CJ제일제당",
    category: "즉석식품",
    capacity: "210g x 12개",
    offlineEstimatePrice: 14980,
    imageUrl: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&auto=format&fit=crop&q=80",
  },
  // 맥심 모카골드 마일드 220T (코스트코/트레이더스 대표 품목)
  "8801037019873": {
    barcode: "8801037019873",
    name: "동서식품 맥심 모카골드 마일드 커피믹스 220T",
    brand: "동서식품",
    category: "커피/차",
    capacity: "220개입 (2640g)",
    offlineEstimatePrice: 28900,
    imageUrl: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400&auto=format&fit=crop&q=80",
  },
  // 스팸 클래식 340g x 4캔
  "8801007137453": {
    barcode: "8801007137453",
    name: "CJ 스팸 클래식 340g x 4캔",
    brand: "CJ제일제당",
    category: "통조림/캔",
    capacity: "340g x 4개 (1360g)",
    offlineEstimatePrice: 18900,
    imageUrl: "https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=400&auto=format&fit=crop&q=80",
  },
  // 다우니 섬유유연제 대용량
  "8801007559132": {
    barcode: "8801007559132",
    name: "다우니 울트라 엑스퍼트 섬유유연제 4L",
    brand: "P&G",
    category: "세탁/세제",
    capacity: "4L (대용량)",
    offlineEstimatePrice: 23900,
    imageUrl: "https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=400&auto=format&fit=crop&q=80",
  },
};

/**
 * 바코드로 상품 정보를 조회하는 함수
 * DB에 없는 경우 일반화된 바코드 메타데이터 또는 공공 데이터 연동 가능
 */
export async function lookupBarcode(barcode: string): Promise<ProductInfo> {
  const cleanCode = barcode.trim();
  
  if (KNOWN_BARCODES[cleanCode]) {
    return KNOWN_BARCODES[cleanCode];
  }

  // 등록되지 않은 바코드일 경우, 바코드 번호 기반으로 상품명 검색이 가능하도록 기본 정보 반환
  return {
    barcode: cleanCode,
    name: `스캔 상품 (바코드: ${cleanCode})`,
    category: "기타 일반 상품",
    offlineEstimatePrice: 0,
  };
}
