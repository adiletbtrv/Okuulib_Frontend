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
        {/* Anti-FOUC script for theme and language pre-hydration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  // Theme hydration
                  var themeData = localStorage.getItem('okuulib_theme_v1');
                  if (themeData) {
                    var parsed = JSON.parse(themeData);
                    var t = parsed && parsed.state ? parsed.state.theme : 'light';
                    var active = t;
                    if (t === 'system') {
                      active = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                    }
                    if (active === 'dark') {
                      document.documentElement.classList.add('dark');
                      document.documentElement.setAttribute('data-theme', 'dark');
                    } else {
                      document.documentElement.classList.remove('dark');
                      document.documentElement.setAttribute('data-theme', 'light');
                    }
                  }
                  // Language hydration
                  var langData = localStorage.getItem('okuulib_language_v1');
                  if (langData) {
                    var parsedLang = JSON.parse(langData);
                    if (parsedLang && parsedLang.state && parsedLang.state.language) {
                      document.documentElement.lang = parsedLang.state.language;
                    }
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-screen flex flex-col font-sans transition-colors duration-150">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
