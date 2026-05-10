import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lifebook",
  description: "用 10 個問題，拼湊你的人生故事",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW" className="h-full">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
