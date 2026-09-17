"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ResultPage() {
  const router = useRouter();

  useEffect(() => {
    // 단일 페이지 앱(SPA) 아키텍처로 전환되었으므로 메인으로 매끄럽게 복귀
    router.replace("/");
  }, [router]);

  return null;
}
