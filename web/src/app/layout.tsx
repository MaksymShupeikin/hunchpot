import type { Metadata, Viewport } from "next";
import { Dela_Gothic_One, Onest } from "next/font/google";
import "./globals.css";

const display = Dela_Gothic_One({ variable: "--font-display", subsets: ["latin"], weight: "400" });
const ui = Onest({ variable: "--font-ui", subsets: ["latin"] });

export const metadata: Metadata = {
  title: { default: "Hunchpot", template: "%s · Hunchpot" },
  description: "Call it before it happens. Campus bets with friends.",
  appleWebApp: { capable: true, title: "Hunchpot", statusBarStyle: "black-translucent" },
};

export const viewport: Viewport = {
  themeColor: "#0E0E12",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${display.variable} ${ui.variable}`}>
      <body>{children}</body>
    </html>
  );
}
