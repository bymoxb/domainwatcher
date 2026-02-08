import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Footer from "@/componentes/footer";
import Nav from "@/componentes/nav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: 'DomainWatcher',
  description: 'DomainWatcher helps you monitor domain expiration dates. Stay informed about your domain portfolio with email alerts.',
  keywords: [
    'domain monitoring',
    'domain expiration tracking',
    'domain availability alerts',
    'domain status change',
    'domain portfolio management',
    'domain expiration reminders',
    'domain watch',
  ],
  openGraph: {
    title: 'DomainWatcher',
    description: 'DomainWatcher helps you monitor domain expiration dates. Stay informed about your domain portfolio with email alerts.',
    siteName: 'DomainWatcher',
    locale: 'en_US',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased container mx-auto flex flex-col gap-3`}
      >
        <Nav />
        {children}
        <Footer />
      </body>
    </html>
  );
}
