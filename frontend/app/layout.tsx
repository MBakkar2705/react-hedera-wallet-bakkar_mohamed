import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ActiveAccountProvider } from "@/lib/active-account";
import { ActiveAccountBar } from "@/components/ActiveAccountBar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Hedera Minimalist Wallet",
  description: "Hedera testnet demo wallet",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ActiveAccountProvider>
          <ActiveAccountBar />
          {children}
        </ActiveAccountProvider>
      </body>
    </html>
  );
}
