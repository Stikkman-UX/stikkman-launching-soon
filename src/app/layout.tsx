import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Header from "@/app/shared/Header";
import OpticalAlignProvider from "@/app/shared/OpticalAlignProvider";
import "./globals.css";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  // Chrome asks for /favicon.ico at the origin root whether or not a <link>
  // says so, and caches a 404 there hard, so that file has to exist rather
  // than only the PNG. The .ico carries 16/32/48 for the tab strip and
  // bookmarks bar; the 800px PNG is the high-DPI icon; iOS ignores both and
  // takes apple-icon.png.
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "16x16 32x32 48x48" },
      { url: "/favicon.png", type: "image/png", sizes: "800x800" },
    ],
    shortcut: "/favicon.ico",
    apple: { url: "/apple-icon.png", sizes: "180x180", type: "image/png" },
  },
  title: "A Global UI UX Agency | Stikkman UX",
  description:
    "A Global UI UX Agency. Stikkman UX integrates behavioral psychology to create meaningful, inclusive and intuitive digital experience. 100M+ Lives Touched.",
  authors: [
    {
      name: "Vatsal Patel",
      url: "https://www.linkedin.com/in/vatsalpatelux/",
    },
  ],
  openGraph: {
    title: "A Global UI UX Agency | Stikkman UX",
    description:
      "A Global UI UX Agency. Stikkman UX integrates behavioral psychology to create meaningful, inclusive and intuitive digital experience. 100M+ Lives Touched.",
    url: "https://stikkmanux.com",
    type: "website",
    images: [
      {
        url: "https://www.stikkmanux.com/og-preview.png",
        width: 1200,
        height: 630,
        alt: "Stikkman UX Open Graph Preview",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        {/* ✅ Google Tag Manager */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','GTM-KZRGKZJL');`,
          }}
        />

        {/* ✅ Google Analytics (gtag.js) */}
        <script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-GLWB8H726R"
        ></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-GLWB8H726R');
            `,
          }}
        />
      </head>
      <body
        style={{ fontFamily: "var(--font-geist-sans)" }}
        className="min-h-full bg-white"
      >
        <Header />
        <OpticalAlignProvider />
        {children}
      </body>
    </html>
  );
}
