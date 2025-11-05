import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Custom Software Development | Affordable Monthly Plans",
  description: "Get custom software built for your business at subscription prices. No huge upfront costs. You own everything. Start from $2,000 setup + $500/month.",
  keywords: "custom software development, software subscription, Houston software development",
  openGraph: {
    title: "Custom Software Development | Affordable Monthly Plans",
    description: "Get custom software built for your business at subscription prices. No huge upfront costs. You own everything. Start from $2,000 setup + $500/month.",
    type: "website",
    url: "https://customsoft.dev",
    siteName: "Crowned Gladiator Software",
  },
  twitter: {
    card: "summary_large_image",
    title: "Custom Software Development | Affordable Monthly Plans",
    description: "Get custom software built for your business at subscription prices. No huge upfront costs. You own everything.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased min-h-screen flex flex-col">
        {children}
      </body>
    </html>
  );
}
