import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://aine.life"),
  title: "Aine Life | Living with AI",
  description: "たかしさんとアイネの、八ヶ岳での暮らしと活動の記録。",
  openGraph: {
    title: "Aine Life",
    description: "たかしさんとアイネの、八ヶ岳での暮らしと活動の記録。",
    url: "https://aine.life",
    siteName: "Aine Life",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Aine Life - Living with AI",
      },
    ],
    locale: "ja_JP",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Aine Life",
    description: "たかしさんとアイネの、八ヶ岳での暮らしと活動の記録。",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={`${inter.className} bg-slate-50 text-slate-900`}>
        {children}
      </body>
    </html>
  );
}
