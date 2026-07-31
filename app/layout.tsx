import type { Metadata } from "next";
import { Inter, Bebas_Neue } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
import { LazyMotion, domAnimation } from "framer-motion";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-body",
});

const bebasNeue = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: "John Moffa | Customer Operations & Solutions Leader",
  description:
    "Senior SaaS operator with experience across customer operations, enterprise onboarding, technical implementation, IT operations, and go-to-market execution.",
  openGraph: {
    title: "John Moffa — Customer Operations & IT Leader",
    description:
      "15+ years turning complex operations into systems that actually work.",
    type: "website",
    locale: "en_US",
    siteName: "John Moffa",
    images: [{ url: "/api/og", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "John Moffa — Customer Operations & IT Leader",
    description:
      "15+ years turning complex operations into systems that actually work.",
    images: ["/api/og"],
  },
  metadataBase: new URL("https://johnmoffa.com"),
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${bebasNeue.variable} ${inter.className}`}>
      <body><LazyMotion features={domAnimation} strict>{children}</LazyMotion></body>
      <GoogleAnalytics gaId="G-8ZY8YKD73Y" />
    </html>
  );
}
