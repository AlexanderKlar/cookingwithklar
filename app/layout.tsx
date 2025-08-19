import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Weekly Eats",
  description: "Personalized meal plans made simple",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  );
}