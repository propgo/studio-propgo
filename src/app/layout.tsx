import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/components/providers/query-provider";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "PropGo Studio",
  description: "AI-powered property video generation",
  icons: {
    icon: "/propgo_favicon_main.png",
    apple: "/propgo_favicon_main.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0A0A0F",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
      style={{ fontFamily: "var(--font-geist-sans), system-ui, sans-serif" }}
    >
      <body className="min-h-full flex flex-col bg-studio-bg">
        <QueryProvider>{children}</QueryProvider>
        <Toaster
          theme="dark"
          position="bottom-right"
          toastOptions={{
            style: {
              background: "#13131A",
              border: "1px solid #1E1E2E",
              color: "#fff",
            },
          }}
        />
      </body>
    </html>
  );
}
