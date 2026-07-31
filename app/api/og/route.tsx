import { ImageResponse } from "@vercel/og";

export const runtime = "edge";

export async function GET(request: Request) {
  try {
    const { origin } = new URL(request.url);
    const headshotUrl = `${origin}/headshot.jpg`;

    return new ImageResponse(
      (
        <div
          style={{
            width: 1200,
            height: 630,
            display: "flex",
            background: "#0a0a0a",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Amber left border accent */}
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: 4,
              height: 630,
              background: "#c9a84c",
            }}
          />

          {/* Subtle radial glow */}
          <div
            style={{
              position: "absolute",
              left: -100,
              top: -100,
              width: 700,
              height: 700,
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(201,168,76,0.06) 0%, transparent 70%)",
            }}
          />

          {/* Left side — text content (60%) */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              paddingLeft: 80,
              paddingRight: 40,
              width: 720,
              gap: 0,
            }}
          >
            {/* Label */}
            <div
              style={{
                color: "#c9a84c",
                fontSize: 16,
                fontWeight: 700,
                letterSpacing: "3px",
                textTransform: "uppercase",
                marginBottom: 28,
              }}
            >
              AVAILABLE FOR NEW OPPORTUNITIES
            </div>

            {/* Headline */}
            <div
              style={{
                color: "#f0ede8",
                fontSize: 80,
                fontWeight: 700,
                lineHeight: 1,
                marginBottom: 24,
                letterSpacing: "-1px",
              }}
            >
              Hi, I&apos;m John.
            </div>

            {/* Subtitle */}
            <div
              style={{
                color: "#888",
                fontSize: 24,
                lineHeight: 1.5,
                marginBottom: 48,
              }}
            >
              15+ years turning complex operations into systems that actually work.
            </div>

            {/* Domain */}
            <div
              style={{
                color: "#c9a84c",
                fontSize: 18,
                fontWeight: 600,
                letterSpacing: "1px",
              }}
            >
              johnmoffa.com
            </div>
          </div>

          {/* Right side — headshot (40%) */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 480,
              height: 630,
              flexShrink: 0,
            }}
          >
            {/* Amber ring */}
            <div
              style={{
                width: 292,
                height: 292,
                borderRadius: "50%",
                border: "3px solid #c9a84c",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={headshotUrl}
                alt="John Moffa"
                width={280}
                height={280}
                style={{
                  borderRadius: "50%",
                  objectFit: "cover",
                  objectPosition: "center top",
                }}
              />
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e) {
    console.error(e);
    return new Response("Failed to generate OG image", { status: 500 });
  }
}
