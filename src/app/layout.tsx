import type { Metadata, Viewport } from "next";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import Script from "next/script";
import { AnalyticsTracker } from "@/components/AnalyticsTracker";
import "./globals.css";

const grotesk = Space_Grotesk({
  variable: "--font-grotesk",
  subsets: ["latin"],
  display: "swap",
});

const jet = JetBrains_Mono({
  variable: "--font-jet",
  subsets: ["latin"],
  display: "swap",
});

const SITE_URL = "https://ziopsyop.me";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "ZIOPSYOP — Signal From Noise | Influence Operation Forensics",
    template: "%s | ZIOPSYOP",
  },
  description:
    "Open-source forensic analysis of a coordinated influence operation targeting Lebanese communities on Reddit. 93,000+ data points, 79 months, one verdict: the conversation was never organic.",
  keywords: [
    "OSINT",
    "influence operations",
    "psyop analysis",
    "Reddit forensics",
    "ForbiddenBromance",
    "counter-intelligence",
    "data journalism",
    "Lebanon",
    "astroturfing detection",
  ],
  authors: [{ name: "ZIOPSYOP" }],
  alternates: { canonical: SITE_URL },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "ZIOPSYOP",
    title: "ZIOPSYOP — Signal From Noise",
    description:
      "Forensic dissection of a coordinated influence operation. 93,000+ Reddit data points across 79 months. Every chart is one piece of the puzzle.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "ZIOPSYOP — Signal From Noise. Influence operation forensics.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ZIOPSYOP — Signal From Noise",
    description:
      "Forensic dissection of a coordinated influence operation on Reddit. 93,000+ data points. The conversation was never organic.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
};

export const viewport: Viewport = {
  themeColor: "#060608",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (


    <html
      lang="en"
      className={`${grotesk.variable} ${jet.variable} h-full antialiased dark bg-background`}
      suppressHydrationWarning
    >
      <head>
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
      </head>
      <body className="min-h-full flex flex-col bg-background">
        {children}
        <AnalyticsTracker />
        <div className="crt-overlay" aria-hidden="true" />

        {/* Matomo Analytics */}
        <Script id="matomo-analytics" strategy="afterInteractive">
          {`
            var _paq = window._paq = window._paq || [];
            _paq.push(["setDocumentTitle", document.domain + "/" + document.title]);
            if (window.location.hostname.includes('ziopsyop.me')) {
              _paq.push(["setCookieDomain", "*.ziopsyop.me"]);
              _paq.push(["setDomains", ["*.ziopsyop.me"]]);
            }
            _paq.push(["enableCrossDomainLinking"]);
            _paq.push(['trackPageView']);
            _paq.push(['enableLinkTracking']);
            (function() {
              var u="//matomo.myhayat.app/";
              _paq.push(['setTrackerUrl', u+'matomo.php']);
              _paq.push(['setSiteId', '13']);
              var d=document, g=d.createElement('script'), s=d.getElementsByTagName('script')[0];
              g.async=true; g.src=u+'matomo.js'; s.parentNode.insertBefore(g,s);
            })();
          `}
        </Script>
        <noscript>
          <p>
            <img
              referrerPolicy="no-referrer-when-downgrade"
              src="//matomo.myhayat.app/matomo.php?idsite=13&rec=1"
              style={{ border: 0 }}
              alt=""
            />
          </p>
        </noscript>

        {/* Tianji Analytics */}
        <Script
          src="https://tianji.myhayat.app/tracker.js"
          data-website-id="cmq7q7le70ueh8lxczt7zoirq"
          strategy="afterInteractive"
          async
          defer
        />
      </body>
    </html>
  );
}


