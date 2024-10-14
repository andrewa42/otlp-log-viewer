import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "OTLP Log Viewer",
  description: "Dash0",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
