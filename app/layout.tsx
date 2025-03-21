import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import Providers from "./providers";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Trade-Buddy",
  description: "Your virtual trading buddy",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        <Providers>
          {children}
          <ReactQueryDevtools initialIsOpen={false} />
          <Toaster position="top-right" />
        </Providers>
      </body>
    </html>
  );
}
