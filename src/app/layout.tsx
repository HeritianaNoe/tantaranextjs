import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tantara An-tsoratra",
  description: "Tranonkala tantara an-tsoratra",
  icons: { icon: "/favicon.ico", shortcut: "/favicon.ico", apple: "/icon.png" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="mg">
      <body className="antialiased">{children}</body>
    </html>
  );
}
