import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Allerta } from "next/font/google";
import { GoogleOAuthWrapper } from "./components/GoogleOAuthWrapper";

const allerta = Allerta({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-allerta",
});
const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "SyntaxRush — Code. Battle. Rank Up.",
  description: "The ultimate competitive coding arena. Solve problems, battle opponents in real-time, and climb the global leaderboards.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${allerta.variable} antialiased bg-[#F7F8FD] text-gray-900`}
      >
        <GoogleOAuthWrapper>
          {children}
        </GoogleOAuthWrapper>
      </body>
    </html>
  );
}
