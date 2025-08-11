import "./globals.css";
import { ReactNode } from "react";

export const metadata = {
  title: "Social Buzz Scout – Repost",
  description: "IG profillerini tarar, oransal engagement'a göre en iyi videoyu bulur ve TR repost caption yazar",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="tr">
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
