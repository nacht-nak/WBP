import { NextRequest, NextResponse } from "next/server";
import { visitorCount } from "@/lib/visits";

const cookieName = "portfolio-visit";
const headers = { "Cache-Control": "no-store" };

export async function GET() {
  try {
    return NextResponse.json({ count: await visitorCount() }, { headers });
  } catch {
    return NextResponse.json(
      { error: "Visit count unavailable" },
      { status: 503, headers },
    );
  }
}

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (
    request.headers.get("sec-fetch-site") === "cross-site" ||
    (origin &&
      (!URL.canParse(origin) ||
        new URL(origin).host !== request.headers.get("host")))
  ) {
    return NextResponse.json(
      { error: "Invalid origin" },
      { status: 403, headers },
    );
  }
  try {
    const isNewVisit = request.cookies.get(cookieName)?.value !== "1";
    const count = await visitorCount(isNewVisit);
    const response = NextResponse.json({ count }, { headers });
    if (isNewVisit) {
      response.cookies.set(cookieName, "1", {
        httpOnly: true,
        sameSite: "lax",
        secure: request.nextUrl.protocol === "https:",
        path: "/",
        maxAge: 60 * 60 * 24,
      });
    }
    return response;
  } catch {
    return NextResponse.json(
      { error: "Visit count unavailable" },
      { status: 503, headers },
    );
  }
}
