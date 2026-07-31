import { ImageResponse } from "@vercel/og";

export const runtime = "edge";

export async function GET(request: Request) {
  try {
    const { origin } = new URL(request.url);

    // Fetch logo as ArrayBuffer — edge runtime cannot reliably load same-origin URLs otherwise
    const logoRes = await fetch(`${origin}/fantrax-logo-hd.webp`);
    const logoData = await logoRes.arrayBuffer();
    const logoBase64 = `data:image/webp;base64,${Buffer.from(logoData).toString("base64")}`;

    return new ImageResponse(
      (
        <div
          style={{
            width: 1200,
            height: 630,
            display: "flex",
            flexDirection: "column",
            background: "#F3F6FB",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Top gradient bar */}
          <div
            style={{
              width: 1200,
              height: 10,
              background: "linear-gradient(90deg, #1E63E9 0%, #1AA160 100%)",
              flexShrink: 0,
              display: "flex",
            }}
          />

          {/* Main content — centered */}
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 0,
              paddingBottom: 20,
            }}
          >
            {/* Fantrax logo */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={logoBase64}
              alt="Fantrax"
              width={320}
              height={88}
              style={{ objectFit: "contain", marginBottom: 40 }}
            />

            {/* Eyebrow */}
            <div
              style={{
                color: "#1E63E9",
                fontSize: 16,
                fontWeight: 700,
                letterSpacing: "5px",
                textTransform: "uppercase",
                marginBottom: 20,
              }}
            >
              DYNASTY LEAGUE
            </div>

            {/* Headline */}
            <div
              style={{
                color: "#1A2333",
                fontSize: 80,
                fontWeight: 700,
                lineHeight: 1,
                letterSpacing: "-2px",
                marginBottom: 24,
              }}
            >
              Contract Manager
            </div>

            {/* Subtitle */}
            <div
              style={{
                color: "#7C8AA0",
                fontSize: 24,
                lineHeight: 1.4,
              }}
            >
              Fantasy Football · Contract &amp; Cap Management
            </div>
          </div>

          {/* Bottom gradient bar */}
          <div
            style={{
              width: 1200,
              height: 6,
              background: "linear-gradient(90deg, #1E63E9 0%, #1AA160 100%)",
              flexShrink: 0,
              display: "flex",
            }}
          />
        </div>
      ),
      { width: 1200, height: 630 }
    );
  } catch (e) {
    console.error(e);
    return new Response("Failed to generate OG image", { status: 500 });
  }
}
