import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: "John Moffa | Customer Operations & Solutions Leader",
  description:
    "Senior SaaS operator with experience across customer operations, enterprise onboarding, technical implementation, IT operations, and go-to-market execution.",
  openGraph: {
    title: "John Moffa | Customer Operations & Solutions Leader",
    description:
      "Senior SaaS operator with experience across customer operations, enterprise onboarding, technical implementation, IT operations, and go-to-market execution.",
    type: "website",
    locale: "en_US",
    siteName: "John Moffa",
  },
  twitter: {
    card: "summary_large_image",
    title: "John Moffa | Customer Operations & Solutions Leader",
    description:
      "Senior SaaS operator with experience across customer operations, enterprise onboarding, technical implementation, IT operations, and go-to-market execution.",
  },
  metadataBase: new URL("https://johnmoffa.com"),
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={inter.className}>
      <body style={{ background: "var(--bg-deep)" }}>{children}</body>
    </html>
  );
}
