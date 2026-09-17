"use client";

import React, { useState, useEffect } from "react";
import { logger, LogEntry } from "@/lib/logger";
import { Bug, X, RefreshCw, Trash2, Copy, Check } from "lucide-react";

export const DebugOverlay: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [copied, setCopied] = useState(false);

  const refreshLogs = () => {
    setLogs(logger.getLocalLogs());
  };

  useEffect(() => {
    refreshLogs();
    const interval = setInterval(refreshLogs, 1500);
    return () => clearInterval(interval);
  }, []);

  const handleClear = () => {
    logger.clearLocalLogs();
    setLogs([]);
  };

  const handleCopyAll = () => {
    const text = logs
      .map(
        (l) =>
          `[${l.timestamp.substring(11, 19)}] [${l.level}] [${l.source}] ${l.message} ${
            l.data ? JSON.stringify(l.data) : ""
          }`
      )
      .join("\n");
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const errorCount = logs.filter((l) => l.level === "ERROR").length;

  return (
    <>
      {/* 우측 하단 플로팅 디버그 트리거 버튼 */}
      <button
        type="button"
        onClick={() => {
          setIsOpen(!isOpen);
          refreshLogs();
        }}
        style={{
          position: "fixed",
          right: "12px",
          bottom: "70px",
          zIndex: 99999,
          backgroundColor: errorCount > 0 ? "#dc2626" : "#0f172a",
          color: "#ffffff",
          padding: "6px 12px",
          borderRadius: "9999px",
          fontSize: "11px",
          fontWeight: "bold",
          border: "1px solid rgba(255,255,255,0.2)",
          boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: "6px",
        }}
      >
        <Bug style={{ width: 14, height: 14 }} />
        <span>디버그 {errorCount > 0 ? `(${errorCount} 에러!)` : `(${logs.length})`}</span>
      </button>

      {/* 디버그 로그 뷰어 모달 */}
      {isOpen && (
        <div
          style={{
            position: "fixed",
            left: 0,
            right: 0,
            bottom: 0,
            height: "55vh",
            backgroundColor: "#020617",
            color: "#e2e8f0",
            zIndex: 999999,
            borderTop: "2px solid #334155",
            boxShadow: "0 -8px 24px rgba(0,0,0,0.5)",
            display: "flex",
            flexDirection: "column",
            fontSize: "11px",
            fontFamily: "monospace",
            boxSizing: "border-box",
          }}
        >
          {/* 상단 컨트롤 바 */}
          <div
            style={{
              padding: "8px 12px",
              backgroundColor: "#0f172a",
              borderBottom: "1px solid #1e293b",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontWeight: "bold", color: "#38bdf8" }}>실시간 로그 ({logs.length})</span>
              {errorCount > 0 && (
                <span style={{ backgroundColor: "#dc2626", color: "#fff", padding: "1px 6px", borderRadius: "4px", fontSize: "10px" }}>
                  에러 {errorCount}
                </span>
              )}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <button
                type="button"
                onClick={handleCopyAll}
                style={{
                  background: "#1e293b",
                  border: "none",
                  color: "#cbd5e1",
                  padding: "4px 8px",
                  borderRadius: "4px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                {copied ? <Check style={{ width: 12, height: 12, color: "#4ade80" }} /> : <Copy style={{ width: 12, height: 12 }} />}
                {copied ? "복사됨" : "전체 복사"}
              </button>
              <button
                type="button"
                onClick={handleClear}
                style={{
                  background: "#1e293b",
                  border: "none",
                  color: "#ef4444",
                  padding: "4px 8px",
                  borderRadius: "4px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                <Trash2 style={{ width: 12, height: 12 }} /> 지우기
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                style={{
                  background: "none",
                  border: "none",
                  color: "#94a3b8",
                  padding: "4px",
                  cursor: "pointer",
                }}
              >
                <X style={{ width: 16, height: 16 }} />
              </button>
            </div>
          </div>

          {/* 로그 리스트 */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "8px 12px",
              display: "flex",
              flexDirection: "column",
              gap: "6px",
            }}
          >
            {logs.length === 0 ? (
              <div style={{ color: "#64748b", padding: "16px 0", textAlign: "center" }}>
                아직 기록된 로그가 없습니다. 스캔을 시도해 보세요.
              </div>
            ) : (
              logs.map((log, idx) => {
                const isErr = log.level === "ERROR";
                const isWarn = log.level === "WARN";
                return (
                  <div
                    key={idx}
                    style={{
                      padding: "6px 8px",
                      backgroundColor: isErr ? "rgba(220, 38, 38, 0.15)" : isWarn ? "rgba(245, 158, 11, 0.1)" : "#0b1329",
                      borderLeft: `3px solid ${isErr ? "#ef4444" : isWarn ? "#f59e0b" : "#3b82f6"}`,
                      borderRadius: "4px",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", color: "#64748b", marginBottom: "2px" }}>
                      <span>
                        <strong style={{ color: isErr ? "#f87171" : isWarn ? "#fbbf24" : "#60a5fa" }}>[{log.level}]</strong>{" "}
                        <span style={{ color: "#cbd5e1" }}>[{log.source}]</span>
                      </span>
                      <span>{log.timestamp.substring(11, 19)}</span>
                    </div>
                    <div style={{ color: isErr ? "#fca5a5" : "#f1f5f9", wordBreak: "break-all" }}>
                      {log.message}
                    </div>
                    {log.data && (
                      <pre
                        style={{
                          margin: "4px 0 0 0",
                          padding: "4px",
                          backgroundColor: "rgba(0,0,0,0.3)",
                          borderRadius: "4px",
                          fontSize: "10px",
                          color: "#94a3b8",
                          maxHeight: "80px",
                          overflowX: "auto",
                        }}
                      >
                        {JSON.stringify(log.data, null, 2)}
                      </pre>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </>
  );
};
