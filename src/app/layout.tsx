import type { Metadata } from "next";
import { Space_Mono, Caveat, Indie_Flower, Shadows_Into_Light, Patrick_Hand, Kalam, Permanent_Marker, Ma_Shan_Zheng } from "next/font/google";
import "./globals.css";

const spaceMono = Space_Mono({
  weight: ['400', '700'],
  subsets: ["latin"],
  variable: "--font-space-mono",
});

const caveat = Caveat({ subsets: ["latin"], variable: "--font-caveat" });
const indieFlower = Indie_Flower({ weight: "400", subsets: ["latin"], variable: "--font-indie-flower" });
const shadowsIntoLight = Shadows_Into_Light({ weight: "400", subsets: ["latin"], variable: "--font-shadows" });
const patrickHand = Patrick_Hand({ weight: "400", subsets: ["latin"], variable: "--font-patrick" });
const kalam = Kalam({ weight: ["400", "700"], subsets: ["latin"], variable: "--font-kalam" });
const permanentMarker = Permanent_Marker({ weight: "400", subsets: ["latin"], variable: "--font-permanent" });
const maShanZheng = Ma_Shan_Zheng({ weight: "400", subsets: ["latin"], variable: "--font-ma-shan" });

export const metadata: Metadata = {
  title: "FutureTree - 探索你的未来可能",
  description: "看见 20 种可能，与未来对话",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      </head>
      <body className={`${spaceMono.variable} ${caveat.variable} ${indieFlower.variable} ${shadowsIntoLight.variable} ${patrickHand.variable} ${kalam.variable} ${permanentMarker.variable} ${maShanZheng.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
