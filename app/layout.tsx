import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navigation } from "@/components/navigation";
import { PWAPrompt } from "@/components/pwa-prompt";
import { AuthWrapper } from "@/components/auth-wrapper";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "QuickSpense",
  description: "1-tap expense tracking",
  manifest: "/manifest.json",
  themeColor: "#000000",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "QuickSpense",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} antialiased dark`}>
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0"
        />
      </head>
      <body className="bg-zinc-950 text-zinc-50 min-h-screen flex justify-center overflow-hidden overscroll-none">
        <div className="w-full max-w-md bg-zinc-950 h-[100dvh] flex flex-col relative shadow-2xl shadow-black/50 overflow-hidden">
          <PWAPrompt />
          <AuthWrapper>
            <main className="flex-1 overflow-y-auto pb-20 scrollbar-hide">
              {children}
            </main>
            <Navigation />
          </AuthWrapper>
        </div>
      </body>
    </html>
  );
}
