"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import { Camera, AlertCircle, RefreshCw, Barcode, CheckCircle2, Upload, ShieldAlert } from "lucide-react";
import { KNOWN_BARCODES } from "@/lib/barcodeDb";
import { logger } from "@/lib/logger";

interface BarcodeScannerProps {
  onScanSuccess: (barcode: string) => void;
  onError?: (err: string) => void;
}

export const BarcodeScanner: React.FC<BarcodeScannerProps> = ({
  onScanSuccess,
  onError,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const galleryInputRef = useRef<HTMLInputElement | null>(null);

  const [isScanning, setIsScanning] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [lastScannedCode, setLastScannedCode] = useState<string | null>(null);
  const [isProcessingFile, setIsProcessingFile] = useState(false);

  const streamRef = useRef<MediaStream | null>(null);
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const zxingReaderRef = useRef<BrowserMultiFormatReader | null>(null);
  const isScanningActiveRef = useRef(false);

  const stopScanner = useCallback(() => {
    logger.debug("BarcodeScanner", "Stopping camera stream and scan loop");
    isScanningActiveRef.current = false;
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsScanning(false);
  }, []);

  const handleBarcodeFound = useCallback(
    (code: string, method: string) => {
      const trimmed = code.trim();
      if (!trimmed) return;

      logger.info("BarcodeScanner", `Barcode detected successfully via ${method}`, {
        code: trimmed,
        knownMatch: Boolean(KNOWN_BARCODES[trimmed]),
      });

      if ("vibrate" in navigator) {
        try {
          navigator.vibrate(100);
        } catch (e) {}
      }

      setLastScannedCode(trimmed);
      stopScanner();
      onScanSuccess(trimmed);
    },
    [onScanSuccess, stopScanner]
  );

  const startCamera = useCallback(async () => {
    try {
      logger.info("BarcodeScanner", "Requesting camera permissions...");
      setErrorMsg(null);
      stopScanner();

      if (!navigator?.mediaDevices?.getUserMedia) {
        throw new Error("브라우저에서 카메라 API를 지원하지 않습니다. (HTTPS 환경 필요)");
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      streamRef.current = stream;
      logger.info("BarcodeScanner", "Camera stream obtained successfully", {
        tracks: stream.getVideoTracks().map((t) => ({ label: t.label, readyState: t.readyState })),
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute("playsinline", "true");
        videoRef.current.setAttribute("muted", "true");
        await videoRef.current.play();

        setIsScanning(true);
        isScanningActiveRef.current = true;
        logger.info("BarcodeScanner", "Video playing, initializing scan loop");

        initScanningLoop();
      }
    } catch (err: any) {
      logger.error("BarcodeScanner", "Failed to start camera", {
        name: err?.name,
        message: err?.message,
      });

      setErrorMsg(
        err?.name === "NotAllowedError"
          ? "카메라 접근 권한이 거부되었습니다. 브라우저 주소창 왼쪽의 자물쇠/설정 아이콘을 눌러 권한을 허용해주세요."
          : err?.message || "카메라를 시작할 수 없습니다."
      );
      if (onError) onError(err?.message || "Camera failed");
    }
  }, [onError, stopScanner]);

  const initScanningLoop = () => {
    if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);

    let nativeDetector: any = null;
    const hasNative = typeof window !== "undefined" && "BarcodeDetector" in window;

    if (hasNative) {
      try {
        // @ts-ignore
        nativeDetector = new window.BarcodeDetector({
          formats: ["ean_13", "ean_8", "upc_a", "upc_e", "code_128", "qr_code"],
        });
        logger.info("BarcodeScanner", "Native BarcodeDetector enabled");
      } catch (e) {
        nativeDetector = null;
      }
    }

    if (!zxingReaderRef.current) {
      zxingReaderRef.current = new BrowserMultiFormatReader();
    }

    scanIntervalRef.current = setInterval(async () => {
      if (!isScanningActiveRef.current || !videoRef.current) return;
      const video = videoRef.current;
      if (video.readyState < 2 || video.videoWidth === 0) return;

      try {
        if (nativeDetector) {
          const barcodes = await nativeDetector.detect(video);
          if (barcodes && barcodes.length > 0 && barcodes[0].rawValue) {
            handleBarcodeFound(barcodes[0].rawValue, "Native BarcodeDetector");
            return;
          }
        }

        const canvas = canvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext("2d", { willReadFrequently: true });
          if (ctx) {
            canvas.width = Math.min(video.videoWidth, 640);
            canvas.height = Math.min(video.videoHeight, 480);
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

            const imgUrl = canvas.toDataURL("image/jpeg", 0.7);
            if (zxingReaderRef.current) {
              const result = await zxingReaderRef.current.decodeFromImageUrl(imgUrl);
              if (result && result.getText()) {
                handleBarcodeFound(result.getText(), "ZXing Canvas Decoder");
                return;
              }
            }
          }
        }
      } catch (err) {
        // 미감지 무시
      }
    }, 250);
  };

  const handleBarcodeImageFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      logger.info("BarcodeScanner", "Processing barcode from uploaded image/photo", {
        fileName: file.name,
        size: file.size,
      });

      setIsProcessingFile(true);
      setErrorMsg(null);
      stopScanner();

      if (!zxingReaderRef.current) {
        zxingReaderRef.current = new BrowserMultiFormatReader();
      }

      const imageUrl = URL.createObjectURL(file);
      const result = await zxingReaderRef.current.decodeFromImageUrl(imageUrl);

      if (result && result.getText()) {
        handleBarcodeFound(result.getText(), "ZXing Image Upload");
      } else {
        throw new Error("바코드를 찾을 수 없습니다.");
      }
    } catch (err: any) {
      logger.warn("BarcodeScanner", "Failed to decode barcode from image file", { error: err?.message });
      setErrorMsg("사진에서 바코드를 인식하지 못했습니다. 더 선명한 바코드 사진으로 다시 시도해주세요.");
    } finally {
      setIsProcessingFile(false);
      if (e.target) e.target.value = "";
    }
  };

  useEffect(() => {
    startCamera();
    return () => {
      stopScanner();
    };
  }, [startCamera, stopScanner]);

  return (
    <div className="flex flex-col items-center w-full" style={{ width: "100%", position: "relative" }}>
      <canvas ref={canvasRef} style={{ display: "none" }} />

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

      <div
        style={{
          width: "100%",
          maxWidth: "380px",
          aspectRatio: "4/3",
          borderRadius: "1rem",
          overflow: "hidden",
          backgroundColor: "#020617",
          position: "relative",
          boxShadow: "0 10px 25px -5px rgba(0,0,0,0.3)",
        }}
      >
        <video
          ref={videoRef}
          playsInline
          muted
          autoPlay
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            borderRadius: "1rem",
            display: "block",
          }}
        />

        {isScanning && !errorMsg && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              pointerEvents: "none",
            }}
          >
            <div
              style={{
                width: "240px",
                height: "130px",
                border: "2px solid #ef4444",
                borderRadius: "0.75rem",
                position: "relative",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  left: "8px",
                  right: "8px",
                  top: "50%",
                  height: "2px",
                  backgroundColor: "#ef4444",
                  boxShadow: "0 0 8px #ef4444",
                }}
              />
            </div>
            <p
              style={{
                color: "#ffffff",
                fontSize: "11px",
                fontWeight: 600,
                marginTop: "12px",
                backgroundColor: "rgba(0,0,0,0.6)",
                padding: "4px 12px",
                borderRadius: "9999px",
                backdropFilter: "blur(4px)",
              }}
            >
              바코드를 사각형 안에 비춰주세요
            </p>
          </div>
        )}

        {errorMsg && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundColor: "rgba(15, 23, 42, 0.95)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "16px",
              textAlign: "center",
              zIndex: 20,
            }}
          >
            <ShieldAlert style={{ color: "#fbbf24", width: 36, height: 36, marginBottom: 8 }} />
            <h4 style={{ color: "#ffffff", fontSize: "14px", fontWeight: "bold", marginBottom: "4px" }}>
              카메라 안내
            </h4>
            <p style={{ color: "#cbd5e1", fontSize: "12px", marginBottom: "16px", lineHeight: "1.5", maxWidth: "260px" }}>
              {errorMsg}
            </p>

            <div style={{ display: "flex", flexDirection: "column", width: "100%", maxWidth: "220px", gap: "8px" }}>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessingFile}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  backgroundColor: "#dc2626",
                  color: "#ffffff",
                  fontSize: "12px",
                  fontWeight: "bold",
                  borderRadius: "0.75rem",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                }}
              >
                <Camera style={{ width: 16, height: 16 }} />
                {isProcessingFile ? "바코드 분석 중..." : "📸 바코드 사진 찍기"}
              </button>
              <button
                type="button"
                onClick={startCamera}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  backgroundColor: "#1e293b",
                  color: "#cbd5e1",
                  fontSize: "12px",
                  fontWeight: "600",
                  borderRadius: "0.75rem",
                  border: "1px solid #334155",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                }}
              >
                <RefreshCw style={{ width: 14, height: 14 }} /> 다시 시도
              </button>
            </div>
          </div>
        )}
      </div>

      {isScanning && !errorMsg && (
        <div
          style={{
            width: "100%",
            maxWidth: "380px",
            marginTop: "8px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "0 4px",
          }}
        >
          <span style={{ fontSize: "11px", fontWeight: 600, color: "#059669", display: "flex", alignItems: "center", gap: "4px" }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "#10b981", display: "inline-block" }} />
            카메라 작동 중
          </span>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            style={{
              fontSize: "11px",
              fontWeight: 600,
              color: "#64748b",
              background: "none",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            <Camera style={{ width: 12, height: 12 }} /> 사진으로 찍기
          </button>
        </div>
      )}

      {lastScannedCode && (
        <div
          style={{
            marginTop: "12px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            color: "#059669",
            backgroundColor: "#ecfdf5",
            padding: "6px 12px",
            borderRadius: "8px",
            fontSize: "12px",
            fontWeight: 600,
          }}
        >
          <CheckCircle2 style={{ width: 16, height: 16 }} />
          <span>인식된 바코드: {lastScannedCode}</span>
        </div>
      )}

      <div
        style={{
          width: "100%",
          maxWidth: "380px",
          marginTop: "16px",
          padding: "14px",
          backgroundColor: "#f8fafc",
          borderRadius: "1rem",
          border: "1px solid #e2e8f0",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", fontWeight: "bold", color: "#334155", marginBottom: "8px" }}>
          <Barcode style={{ width: 16, height: 16, color: "#64748b" }} />
          <span>마트 대표 상품 샘플로 즉시 비교:</span>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
          {Object.entries(KNOWN_BARCODES).slice(0, 4).map(([code, item]) => (
            <button
              key={code}
              type="button"
              onClick={() => onScanSuccess(code)}
              style={{
                fontSize: "11px",
                fontWeight: 500,
                padding: "6px 10px",
                backgroundColor: "#ffffff",
                color: "#334155",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                cursor: "pointer",
                boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
              }}
            >
              {item.name.split(" ")[1] || item.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
