import { NextRequest, NextResponse } from "next/server";
import { LogEntry } from "@/lib/logger";

export const dynamic = "force-dynamic";

// 서버 메모리 최근 로그 버퍼 (최대 150개 보관)
const serverLogs: LogEntry[] = [];
const MAX_SERVER_LOGS = 150;

export async function POST(request: NextRequest) {
  try {
    const entry = (await request.json()) as LogEntry;

    if (entry && entry.message) {
      serverLogs.unshift({
        ...entry,
        timestamp: entry.timestamp || new Date().toISOString(),
      });

      if (serverLogs.length > MAX_SERVER_LOGS) {
        serverLogs.pop();
      }

      // Vercel 함수 실행 로그에도 동시 기록
      const tag = `[CLIENT-${entry.level}] [${entry.source}]`;
      if (entry.level === "ERROR") {
        console.error(tag, entry.message, entry.data || "");
      } else if (entry.level === "WARN") {
        console.warn(tag, entry.message, entry.data || "");
      } else {
        console.log(tag, entry.message, entry.data || "");
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message }, { status: 400 });
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const format = searchParams.get("format");
  const level = searchParams.get("level");

  let filtered = serverLogs;
  if (level) {
    filtered = filtered.filter((l) => l.level === level.toUpperCase());
  }

  // 텍스트 포맷 요청 시 (curl 등으로 보기 편하게)
  if (format === "text") {
    const textOutput = filtered
      .map(
        (l) =>
          `[${l.timestamp}] [${l.level}] [${l.source}]\n  ${l.message}${
            l.data ? "\n  Data: " + JSON.stringify(l.data, null, 2) : ""
          }\n`
      )
      .join("\n");
    return new NextResponse(textOutput || "No logs recorded yet.", {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  return NextResponse.json({
    total: serverLogs.length,
    filteredCount: filtered.length,
    logs: filtered,
  });
}

export async function DELETE() {
  serverLogs.length = 0;
  return NextResponse.json({ success: true, message: "Logs cleared" });
}
