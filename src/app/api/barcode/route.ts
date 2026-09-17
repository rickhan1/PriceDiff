import { NextRequest, NextResponse } from "next/server";
import { lookupBarcode } from "@/lib/barcodeDb";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.json({ error: "Barcode is required" }, { status: 400 });
  }

  try {
    const productInfo = await lookupBarcode(code);
    return NextResponse.json({ success: true, product: productInfo });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to lookup barcode", details: error.message },
      { status: 500 }
    );
  }
}
