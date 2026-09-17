export type LogLevel = "INFO" | "WARN" | "ERROR" | "DEBUG";

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  source: string; // 예: "BarcodeScanner", "Page", "CompareAPI"
  message: string;
  data?: any;
  userAgent?: string;
}

// 브라우저 로컬 최근 로그 캐시 (오프라인/화면 디버그 오버레이용)
const localLogs: LogEntry[] = [];
const MAX_LOCAL_LOGS = 50;

/**
 * 범용 클라이언트/서버 로거
 */
export const logger = {
  log: (level: LogLevel, source: string, message: string, data?: any) => {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      source,
      message,
      data: data ? sanitizeData(data) : undefined,
      userAgent: typeof window !== "undefined" ? window.navigator.userAgent : "SERVER",
    };

    // 1. 콘솔 출력
    const prefix = `[${entry.timestamp.substring(11, 19)}] [${level}] [${source}]`;
    if (level === "ERROR") {
      console.error(prefix, message, data || "");
    } else if (level === "WARN") {
      console.warn(prefix, message, data || "");
    } else {
      console.log(prefix, message, data || "");
    }

    // 2. 브라우저 로컬 메모리 버퍼
    if (typeof window !== "undefined") {
      localLogs.unshift(entry);
      if (localLogs.length > MAX_LOCAL_LOGS) {
        localLogs.pop();
      }

      // 3. 백엔드 /api/log 로 원격 전송
      sendToServer(entry);
    }
  },

  info: (source: string, message: string, data?: any) => {
    logger.log("INFO", source, message, data);
  },

  warn: (source: string, message: string, data?: any) => {
    logger.log("WARN", source, message, data);
  },

  error: (source: string, message: string, data?: any) => {
    logger.log("ERROR", source, message, data);
  },

  debug: (source: string, message: string, data?: any) => {
    logger.log("DEBUG", source, message, data);
  },

  getLocalLogs: (): LogEntry[] => {
    return [...localLogs];
  },

  clearLocalLogs: () => {
    localLogs.length = 0;
  },
};

function sanitizeData(data: any): any {
  try {
    if (data instanceof Error) {
      return {
        name: data.name,
        message: data.message,
        stack: data.stack,
      };
    }
    return JSON.parse(JSON.stringify(data));
  } catch (e) {
    return String(data);
  }
}

function sendToServer(entry: LogEntry) {
  try {
    if (typeof window === "undefined") return;
    const body = JSON.stringify(entry);

    if (navigator.sendBeacon) {
      const blob = new Blob([body], { type: "application/json" });
      navigator.sendBeacon("/api/log", blob);
    } else {
      fetch("/api/log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
        keepalive: true,
      }).catch(() => {});
    }
  } catch (err) {
    // 로깅 전송 실패는 무시
  }
}

/**
 * 사파리/모바일 브라우저에서 발생하는 모든 잡히지 않은 예외(Uncaught Exception)를 자동 캡처
 */
export function initGlobalErrorCapture() {
  if (typeof window === "undefined") return;

  window.addEventListener("error", (event) => {
    logger.error("GlobalWindow", `Uncaught Error: ${event.message}`, {
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      error: event.error,
    });
  });

  window.addEventListener("unhandledrejection", (event) => {
    logger.error("GlobalPromise", `Unhandled Promise Rejection: ${event.reason}`, {
      reason: event.reason,
    });
  });

  logger.info("System", "Global error capture initialized for mobile debugging");
}
