import type { Metadata } from "next";
import { Inter } from "next/font/google";
import ConvexClientProvider from "@/components/convex-client-provider";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TruePlace - Find Your Perfect Home",
  description: "Personalized location recommendations based on safety, affordability, diversity, and your unique preferences.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} font-sans antialiased`}
      >
        <ConvexClientProvider>
          {children}
        </ConvexClientProvider>
      </body>
    </html>
  );
}
