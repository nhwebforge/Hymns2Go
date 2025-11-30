import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "./fonts.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Hymns2Go - Free Hymn Downloads for Church Presentations",
    template: "%s | Hymns2Go"
  },
  description: "Download hymn lyrics formatted for PowerPoint, ProPresenter 6/7, and text. Free hymn presentation downloads for churches and worship services.",
  keywords: ["hymns", "church", "PowerPoint", "ProPresenter", "worship", "lyrics", "presentation", "free"],
  authors: [{ name: "Hymns2Go" }],
  openGraph: {
    title: "Hymns2Go",
    description: "Free hymn downloads for church presentations",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
