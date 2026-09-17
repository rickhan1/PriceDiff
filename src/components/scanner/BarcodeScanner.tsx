"use client";

import React, { useEffect, useRef, useState } from "react";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";
import { Camera, AlertCircle, RefreshCw, Barcode, CheckCircle2, Upload, Lock, ShieldAlert } from "lucide-react";
import { KNOWN_BARCODES } from "@/lib/barcodeDb";

interface BarcodeScannerProps {
  onScanSuccess: (barcode: string) => void;
  onError?: (err: string) => void;
}

export const BarcodeScanner: React.FC<BarcodeScannerProps> = ({
  onScanSuccess,
  onError,
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isHttpsWarning, setIsHttpsWarning] = useState(false);
  const [lastScannedCode, setLastScannedCode] = useState<string | null>(null);
  const [isProcessingFile, setIsProcessingFile] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const readerId = "html5qr-code-full-region";

  // 인스턴스 초기화 유틸
  const getScannerInstance = () => {
    if (!html5QrCodeRef.current) {
      html5QrCodeRef.current = new Html5Qrcode(readerId, {
        formatsToSupport: [
          Html5QrcodeSupportedFormats.EAN_13,
          Html5QrcodeSupportedFormats.EAN_8,
          Html5QrcodeSupportedFormats.UPC_A,
          Html5QrcodeSupportedFormats.UPC_E,
          Html5QrcodeSupportedFormats.CODE_128,
          Html5QrcodeSupportedFormats.QR_CODE,
        ],
        verbose: false,
      });
    }
    return html5QrCodeRef.current;
  };

  const startScanner = async () => {
    try {
      setErrorMsg(null);
      setIsHttpsWarning(false);

      // 브라우저의 Secure Context 및 미디어 디바이스 지원 여부 체크
      if (typeof window !== "undefined") {
        const isLocalhost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
        const isHttps = window.location.protocol === "https:";

        if (!isHttps && !isLocalhost) {
          setIsHttpsWarning(true);
        }

        if (!navigator?.mediaDevices?.getUserMedia) {
          setIsHttpsWarning(true);
          throw new Error("브라우저 보안 정책상 HTTPS 또는 localhost에서만 실시간 카메라 스트림이 허용됩니다.");
        }
      }

      const scanner = getScannerInstance();

      await scanner.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 260, height: 160 },
          aspectRatio: 1.0,
        },
        (decodedText) => {
          if ("vibrate" in navigator) {
            navigator.vibrate(100);
          }
          setLastScannedCode(decodedText);
          stopScanner();
          onScanSuccess(decodedText);
        },
        () => {}
      );

      setIsScanning(true);
    } catch (err: any) {
      console.warn("Realtime camera stream not available:", err);
      setErrorMsg(err?.message || "카메라 스트림을 켤 수 없습니다.");
      if (onError) onError(err?.message || "Camera access failed");
    }
  };

  const stopScanner = async () => {
    try {
      if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
        await html5QrCodeRef.current.stop();
      }
      setIsScanning(false);
    } catch (err) {
      console.error("Failed to stop scanner:", err);
    }
  };

  // 사진 촬영 또는 갤러리 이미지 파일에서 바코드 디코딩 (HTTP에서도 100% 작동)
  const handleBarcodeImageFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsProcessingFile(true);
      setErrorMsg(null);

      // 스트림이 돌고 있다면 잠시 멈춤
      await stopScanner();

      const scanner = getScannerInstance();
      const decodedResult = await scanner.scanFile(file, true);

      if ("vibrate" in navigator) {
        navigator.vibrate(100);
      }
      setLastScannedCode(decodedResult);
      onScanSuccess(decodedResult);
    } catch (err: any) {
      console.error("Failed to scan barcode from image:", err);
      setErrorMsg("사진에서 바코드를 인식하지 못했습니다. 더 선명하거나 밝은 사진으로 다시 시도해주세요.");
    } finally {
      setIsProcessingFile(false);
      if (e.target) e.target.value = "";
    }
  };

  useEffect(() => {
    startScanner();
    return () => {
      stopScanner();
    };
  }, []);

  return (
    <div className="flex flex-col items-center w-full">
      {/* HTTP에서도 작동하는 카메라 촬영용 숨김 input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleBarcodeImageFile}
      />
      {/* 갤러리/파일용 숨김 input */}
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleBarcodeImageFile}
      />

      {/* 카메라 뷰 영역 */}
      <div className="relative w-full aspect-[4/3] max-w-sm rounded-2xl overflow-hidden bg-slate-900 border-2 border-slate-700 shadow-inner flex items-center justify-center">
        <div id={readerId} className="w-full h-full" />

        {/* 조준선 오버레이 가이드 */}
        {isScanning && !errorMsg && (
          <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
            <div className="w-64 h-36 border-2 border-red-500/80 rounded-xl relative shadow-lg shadow-red-500/20">
              <div className="absolute left-2 right-2 top-1/2 -translate-y-1/2 h-0.5 bg-red-500 shadow-md shadow-red-500 animate-pulse" />
              <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-white" />
              <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-white" />
              <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-white" />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-white" />
            </div>
            <p className="text-white text-xs font-medium mt-3 bg-black/60 px-3 py-1 rounded-full backdrop-blur-sm">
              바코드를 사각형 안에 비춰주세요
            </p>
          </div>
        )}

        {/* 카메라 스트림 제한 시 대체 화면 (HTTP 환경 또는 권한 거부 시) */}
        {errorMsg && (
          <div className="absolute inset-0 bg-slate-900/95 flex flex-col items-center justify-center p-4 text-center z-20">
            <ShieldAlert className="w-10 h-10 text-amber-400 mb-2" />
            <h4 className="text-white text-sm font-bold mb-1">
              {isHttpsWarning ? "브라우저 HTTPS 보안 제한 안내" : "실시간 카메라 권한 필요"}
            </h4>
            <p className="text-slate-300 text-xs mb-3 px-2 leading-relaxed">
              최신 브라우저는 보안 정책상 HTTPS 환경에서만 비디오 스트림을 허용합니다.<br />
              <strong className="text-white">아래 버튼으로 바코드 사진을 바로 찍어 스캔</strong>하실 수 있습니다!
            </p>

            <div className="flex flex-col w-full max-w-[240px] gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessingFile}
                className="w-full py-2.5 px-3 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-red-600/30 transition"
              >
                <Camera className="w-4 h-4" />
                {isProcessingFile ? "바코드 분석 중..." : "📸 바코드 사진 찍어 즉시 스캔"}
              </button>
              <button
                type="button"
                onClick={() => galleryInputRef.current?.click()}
                className="w-full py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 border border-slate-700 transition"
              >
                <Upload className="w-3.5 h-3.5" /> 갤러리 사진에서 선택
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 실시간 스트림이 켜져 있을 때도 언제든 사진으로 찍을 수 있는 보조 버튼 */}
      {isScanning && !errorMsg && (
        <div className="w-full max-w-sm mt-2 flex justify-end">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1"
          >
            <Camera className="w-3 h-3" /> 인식이 잘 안 될 땐 사진으로 찍기
          </button>
        </div>
      )}

      {/* 스캔 성공 피드백 */}
      {lastScannedCode && (
        <div className="mt-3 flex items-center gap-2 text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg text-xs font-semibold">
          <CheckCircle2 className="w-4 h-4" />
          <span>인식된 바코드: {lastScannedCode}</span>
        </div>
      )}

      {/* PC / 시뮬레이션 환경용 빠른 원클릭 테스트 상품 바코드 */}
      <div className="w-full mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-2">
          <Barcode className="w-4 h-4 text-slate-500" />
          <span>마트 대표 상품 샘플로 바로 테스트해보기:</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {Object.entries(KNOWN_BARCODES).slice(0, 4).map(([code, item]) => (
            <button
              key={code}
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
