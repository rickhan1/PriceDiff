"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import { Camera, AlertCircle, RefreshCw, Barcode, CheckCircle2, Upload, ShieldAlert, Sparkles } from "lucide-react";
import { KNOWN_BARCODES } from "@/lib/barcodeDb";

interface BarcodeScannerProps {
  onScanSuccess: (barcode: string) => void;
  onError?: (err: string) => void;
}

export const BarcodeScanner: React.FC<BarcodeScannerProps> = ({
  onScanSuccess,
  onError,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const galleryInputRef = useRef<HTMLInputElement | null>(null);

  const [isScanning, setIsScanning] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [lastScannedCode, setLastScannedCode] = useState<string | null>(null);
  const [isProcessingFile, setIsProcessingFile] = useState(false);

  const zxingReaderRef = useRef<BrowserMultiFormatReader | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const isStoppingRef = useRef(false);

  // 카메라 스트림 중지 유틸
  const stopCameraStream = useCallback(() => {
    isStoppingRef.current = true;
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsScanning(false);
  }, []);

  // 카메라 스트림 시작 및 바코드 스캔 루프
  const startCamera = useCallback(async () => {
    try {
      setErrorMsg(null);
      isStoppingRef.current = false;

      if (!navigator?.mediaDevices?.getUserMedia) {
        throw new Error("브라우저에서 카메라를 지원하지 않거나 보안 컨텍스트(HTTPS)가 필요합니다.");
      }

      // 후면 카메라 우선 요청
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setIsScanning(true);

        // 바코드 디코딩 루프 시작
        startScanningLoop();
      }
    } catch (err: any) {
      console.warn("Camera start failed:", err);
      setErrorMsg(
        err?.name === "NotAllowedError"
          ? "카메라 접근 권한이 거부되었습니다. 브라우저 설정에서 권한을 허용해주세요."
          : err?.message || "카메라를 시작할 수 없습니다."
      );
      if (onError) onError(err?.message || "Camera failed");
    }
  }, [onError]);

  // 프레임별 바코드 인식 (네이티브 BarcodeDetector 1순위, ZXing 2순위)
  const startScanningLoop = useCallback(async () => {
    if (!zxingReaderRef.current) {
      zxingReaderRef.current = new BrowserMultiFormatReader();
    }

    // 브라우저 표준 BarcodeDetector 지원 여부 확인 (최신 안드로이드 크롬, iOS 사파리 등)
    const hasNativeBarcodeDetector =
      typeof window !== "undefined" && "BarcodeDetector" in window;
    let nativeDetector: any = null;

    if (hasNativeBarcodeDetector) {
      try {
        // @ts-ignore
        nativeDetector = new window.BarcodeDetector({
          formats: ["ean_13", "ean_8", "upc_a", "upc_e", "code_128", "qr_code"],
        });
      } catch (e) {
        nativeDetector = null;
      }
    }

    const scanFrame = async () => {
      if (isStoppingRef.current || !videoRef.current || videoRef.current.readyState < 2) {
        if (!isStoppingRef.current) {
          requestAnimationFrame(scanFrame);
        }
        return;
      }

      try {
        if (nativeDetector) {
          // 네이티브 API로 고속 인식
          const barcodes = await nativeDetector.detect(videoRef.current);
          if (barcodes && barcodes.length > 0) {
            const rawValue = barcodes[0].rawValue;
            handleFoundBarcode(rawValue);
            return;
          }
        } else if (zxingReaderRef.current && videoRef.current) {
          // ZXing 소프트웨어 디코딩
          const result = await zxingReaderRef.current.decodeOnceFromVideoElement(videoRef.current);
          if (result && result.getText()) {
            handleFoundBarcode(result.getText());
            return;
          }
        }
      } catch (err) {
        // 프레임 미인식은 자연스러운 현상이므로 다음 프레임 계속 시도
      }

      if (!isStoppingRef.current) {
        requestAnimationFrame(scanFrame);
      }
    };

    requestAnimationFrame(scanFrame);
  }, []);

  const handleFoundBarcode = (code: string) => {
    if ("vibrate" in navigator) {
      navigator.vibrate(100);
    }
    setLastScannedCode(code);
    stopCameraStream();
    onScanSuccess(code);
  };

  // 사진 촬영 또는 갤러리 이미지 파일에서 바코드 디코딩
  const handleBarcodeImageFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsProcessingFile(true);
      setErrorMsg(null);
      stopCameraStream();

      if (!zxingReaderRef.current) {
        zxingReaderRef.current = new BrowserMultiFormatReader();
      }

      const imageUrl = URL.createObjectURL(file);
      const img = new Image();
      img.src = imageUrl;

      await new Promise((resolve) => {
        img.onload = resolve;
      });

      // 바코드 디코딩 시도
      const result = await zxingReaderRef.current.decodeFromImageUrl(imageUrl);
      if (result && result.getText()) {
        handleFoundBarcode(result.getText());
      } else {
        throw new Error("No barcode detected");
      }
    } catch (err: any) {
      console.warn("File decode error:", err);
      setErrorMsg("사진에서 바코드를 인식하지 못했습니다. 더 선명하고 밝은 바코드 사진으로 시도해 주세요.");
    } finally {
      setIsProcessingFile(false);
      if (e.target) e.target.value = "";
    }
  };

  useEffect(() => {
    startCamera();
    return () => {
      stopCameraStream();
    };
  }, [startCamera, stopCameraStream]);

  return (
    <div className="flex flex-col items-center w-full">
      {/* 인라인 display:none 처리로 UI 깨짐을 방지하는 숨김 파일 인풋 */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        style={{ display: "none" }}
        onChange={handleBarcodeImageFile}
      />
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={handleBarcodeImageFile}
      />

      {/* 모바일 최적화 카메라 뷰포트 (오버플로우 방지) */}
      <div className="relative w-full aspect-[4/3] max-w-sm rounded-2xl overflow-hidden bg-slate-950 border-2 border-slate-700 shadow-xl flex items-center justify-center">
        {/* 순수 React Video 태그 - 스타일 격리 및 DOM 변조 방지 */}
        <video
          ref={videoRef}
          playsInline
          muted
          autoPlay
          className="w-full h-full object-cover"
        />

        {/* 조준선 레이저 가이드 오버레이 */}
        {isScanning && !errorMsg && (
          <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
            <div className="w-60 h-32 border-2 border-red-500 rounded-xl relative shadow-lg shadow-red-500/30">
              {/* 빨간 레이저 조준선 */}
              <div className="absolute left-2 right-2 top-1/2 -translate-y-1/2 h-0.5 bg-red-500 shadow-md shadow-red-500 animate-pulse" />
              {/* 모서리 포인트 */}
              <div className="absolute -top-1 -left-1 w-3.5 h-3.5 border-t-2 border-l-2 border-white" />
              <div className="absolute -top-1 -right-1 w-3.5 h-3.5 border-t-2 border-r-2 border-white" />
              <div className="absolute -bottom-1 -left-1 w-3.5 h-3.5 border-b-2 border-l-2 border-white" />
              <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 border-b-2 border-r-2 border-white" />
            </div>
            <p className="text-white text-[11px] font-semibold mt-3 bg-black/60 px-3 py-1 rounded-full backdrop-blur-sm shadow">
              바코드를 사각형 안에 비춰주세요
            </p>
          </div>
        )}

        {/* 카메라 오류 또는 권한 거부 시 안내 화면 */}
        {errorMsg && (
          <div className="absolute inset-0 bg-slate-900/95 flex flex-col items-center justify-center p-4 text-center z-20">
            <ShieldAlert className="w-9 h-9 text-amber-400 mb-2" />
            <h4 className="text-white text-sm font-bold mb-1">카메라 알림</h4>
            <p className="text-slate-300 text-xs mb-4 px-2 leading-relaxed max-w-xs">
              {errorMsg}
            </p>

            <div className="flex flex-col w-full max-w-[220px] gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessingFile}
                className="w-full py-2.5 px-3 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-red-600/30 transition"
              >
                <Camera className="w-4 h-4" />
                {isProcessingFile ? "바코드 분석 중..." : "📸 바코드 사진 찍기"}
              </button>
              <button
                type="button"
                onClick={startCamera}
                className="w-full py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 border border-slate-700 transition"
              >
                <RefreshCw className="w-3.5 h-3.5" /> 다시 시도
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 카메라가 켜져 있을 때 사진 촬영 보조 옵션 */}
      {isScanning && !errorMsg && (
        <div className="w-full max-w-sm mt-2 flex justify-between items-center px-1">
          <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            카메라 작동 중
          </span>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1"
          >
            <Camera className="w-3 h-3" /> 사진으로 찍기
          </button>
        </div>
      )}

      {/* 인식된 바코드 피드백 */}
      {lastScannedCode && (
        <div className="mt-3 flex items-center gap-2 text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg text-xs font-semibold">
          <CheckCircle2 className="w-4 h-4" />
          <span>인식된 바코드: {lastScannedCode}</span>
        </div>
      )}

      {/* 마트 대표 상품 빠른 원클릭 테스트 */}
      <div className="w-full mt-4 p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-2">
          <Barcode className="w-4 h-4 text-slate-500" />
          <span>마트 대표 상품 샘플로 즉시 비교:</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {Object.entries(KNOWN_BARCODES).slice(0, 4).map(([code, item]) => (
            <button
              key={code}
              type="button"
              onClick={() => onScanSuccess(code)}
              className="text-[11px] font-medium px-2.5 py-1.5 bg-white hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 border border-slate-200 rounded-lg shadow-sm transition text-slate-700 text-left"
            >
              {item.name.split(" ")[1] || item.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
