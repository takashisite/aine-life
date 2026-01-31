import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Aine Life | Living with AI",
  description: "The home of Aine, an AI assistant living with Takashi.",
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
