import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { SafeSdkProvider } from "@/components/providers/SafeSdkProvider";
import { ThirdwebProviderWrapper } from "@/components/providers/ThirdwebProvider";

const outfit = Outfit({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "M.P2P | Merchant Terminal",
  description: "Instant USDC settlement for Indian merchants via P2P.me",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark h-full antialiased">
      <body className={`${outfit.className} bg-black min-h-full flex flex-col`}>
        <ThirdwebProviderWrapper>
          <SafeSdkProvider>
            {children}
          </SafeSdkProvider>
        </ThirdwebProviderWrapper>
      </body>
    </html>
  );
}
