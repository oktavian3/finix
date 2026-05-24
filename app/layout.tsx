import type { Metadata } from "next";
import "./globals.css";
import { AppProviders } from "@/providers/AppProviders";

export const metadata: Metadata = {
  title: "Finix",
  description: "Track your money, on-chain.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
