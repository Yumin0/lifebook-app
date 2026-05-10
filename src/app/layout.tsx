import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LifeBook | 人生篇章",
  description: "用 10 個問題，逐步拼湊你的回憶，開始寫下人生故事",
  openGraph: {
    title: "LifeBook | 人生篇章",
    description: "用 10 個問題，逐步拼湊你的回憶，開始寫下人生故事",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
    type: "website",
  },
  appleWebApp: {
    capable: true,
    title: "LifeBook",
    statusBarStyle: "default",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW" className="h-full">
      <head>
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
