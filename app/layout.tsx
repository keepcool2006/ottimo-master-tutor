import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Ottimo Master Tutor — AI-Powered Learning Platform",
  description:
    "A next-generation RAG-powered tutor for school textbook publishers. Socratic AI for students, auto-generated test papers for teachers.",
  keywords: ["AI tutor", "textbook", "Socratic learning", "quiz generator", "education technology"],
  openGraph: {
    title: "Ottimo Master Tutor",
    description: "AI-powered Socratic tutor and test paper generator for school publishers",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css"
          crossOrigin="anonymous"
        />
      </head>
      <body className="bg-[#080812] text-gray-100 antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
