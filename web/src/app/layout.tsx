import type { Metadata } from "next";
import { Inter, Merriweather, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-inter",
  display: "swap",
});

const merriweather = Merriweather({
  weight: ["300", "400", "700"],
  subsets: ["latin", "cyrillic"],
  variable: "--font-merriweather",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin", "cyrillic"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    template: "%s | Okuulib — Кыргыз санарип китепканасы",
    default: "Okuulib — Кыргыз адабиятынын санарип платформасы жана Aitu AI",
  },
  description:
    "Кыргыз адабиятынын алтын казынасы, эпостор, Чыңгыз Айтматовдун чыгармалары жана жасалма интеллект Aitu менен интерактивдүү окуу тажрыйбасы.",
  keywords: [
    "Okuulib",
    "Кыргыз китептери",
    "Манас эпосу",
    "Чыңгыз Айтматов",
    "Aitu AI",
    "Санарип китепкана",
    "Кыргыз адабияты",
  ],
  authors: [{ name: "Okuulib Engineering" }],
  openGraph: {
    type: "website",
    locale: "ky_KG",
    url: "https://okuulib.kg",
    siteName: "Okuulib",
    title: "Okuulib — Кыргыз санарип китепканасы",
    description: "Кыргыз адабиятынын алтын казынасы жана жасалма интеллект Aitu",
    images: [
      {
        url: "https://okuulib.kg/og-image.png",
        width: 1200,
        height: 630,
        alt: "Okuulib Кыргыз Санарип Китепканасы",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Okuulib — Кыргыз санарип китепканасы",
    description: "Кыргыз адабиятынын алтын казынасы жана жасалма интеллект Aitu",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="ky"
      className={`${inter.variable} ${merriweather.variable} ${jetbrains.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Anti-FOUC script for reader theme pre-hydration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var prefs = localStorage.getItem('okuulib_reader_prefs_v1');
                  if (prefs) {
                    var parsed = JSON.parse(prefs);
                    if (parsed && parsed.state && parsed.state.theme) {
                      document.documentElement.setAttribute('data-reader-theme', parsed.state.theme);
                    }
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
