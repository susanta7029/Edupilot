import type { Metadata } from "next";
import { Outfit, Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/shared/Footer";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  weight: ["300", "400", "500", "600", "700", "800"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "EduPilot AI | AI-Powered Learning Companion",
  description: "Accelerate your learning journey with personalized AI study assistants, interactive roadmaps, instant doubt solvers, and progress analytics.",
  keywords: ["EdTech", "AI Study Buddy", "Next.js 15", "Gemini API", "Learning Companion", "Roadmap Generator"],
  authors: [{ name: "House of EdTech Candidate" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${outfit.variable} ${inter.variable}`} suppressHydrationWarning>
      <body className="font-sans antialiased bg-background text-foreground transition-colors duration-200">
        <Providers>
          <div className="relative flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1">{children}</main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
