import type { Metadata } from "next";
import { Noto_Sans_SC } from "next/font/google";
import "./globals.css";

const notoSansSC = Noto_Sans_SC({
  variable: "--font-noto-sans-sc",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
});

export const metadata: Metadata = {
  title: "AutoPriceTag - 价签设计师",
  description: "智能商品标价签设计与排版工具，支持多种模板、自定义样式和高清导出",
  keywords: "价签,标签,排版,设计,打印,商品,零售",
  authors: [{ name: "AutoPriceTag Team" }],
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function DesignerLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className={`${notoSansSC.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}