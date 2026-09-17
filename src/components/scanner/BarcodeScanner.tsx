"use client";

import React, { useEffect, useRef, useState } from "react";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";
import { Camera, AlertCircle, RefreshCw, Barcode, CheckCircle2 } from "lucide-react";
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
  const [lastScannedCode, setLastScannedCode] = useState<string | null>(null);
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const readerId = "html5qr-code-full-region";

  const startScanner = async () => {
    try {
      setErrorMsg(null);

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

      await html5QrCodeRef.current.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 260, height: 160 },
          aspectRatio: 1.0,
        },
        (decodedText) => {
          // 스캔 성공 시
          if ("vibrate" in navigator) {
            navigator.vibrate(100); // 햅틱 피드백
          }
          setLastScannedCode(decodedText);
          stopScanner();
          onScanSuccess(decodedText);
        },
        () => {
          // 프레임별 스캔 실패는 무시
        }
      );

      setIsScanning(true);
    } catch (err: any) {
      console.error("Camera scanner failed to start:", err);
      setErrorMsg("카메라를 켤 수 없습니다. 브라우저 카메라 권한을 확인해주세요.");
      if (onError) onError(err?.message || "Camera access failed");
    }
  };

  const stopScanner = async () => {
    try {
      if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
        await html5QrCodeRef.current.stop();
        await html5QrCodeRef.current.clear();
      }
      setIsScanning(false);
    } catch (err) {
      console.error("Failed to stop scanner:", err);
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
      {/* 카메라 뷰 영역 */}
      <div className="relative w-full aspect-[4/3] max-w-sm rounded-2xl overflow-hidden bg-slate-900 border-2 border-slate-700 shadow-inner flex items-center justify-center">
        <div id={readerId} className="w-full h-full" />

        {/* 조준선 오버레이 가이드 */}
        {isScanning && (
          <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
            <div className="w-64 h-36 border-2 border-red-500/80 rounded-xl relative shadow-lg shadow-red-500/20">
              {/* 스캔 가이드 레이저 라인 */}
              <div className="absolute left-2 right-2 top-1/2 -translate-y-1/2 h-0.5 bg-red-500 shadow-md shadow-red-500 animate-pulse" />
              {/* 모서리 포인트 */}
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

        {/* 에러 상태 안내 */}
        {errorMsg && (
          <div className="absolute inset-0 bg-slate-900/90 flex flex-col items-center justify-center p-4 text-center">
            <AlertCircle className="w-10 h-10 text-amber-400 mb-2" />
            <p className="text-white text-sm font-semibold mb-3">{errorMsg}</p>
            <button
              onClick={startScanner}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition"
            >
              <RefreshCw className="w-3.5 h-3.5" /> 카메라 다시 시도
            </button>
          </div>
        )}
      </div>

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
