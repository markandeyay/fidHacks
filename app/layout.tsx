import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Forte — Master Your Financial Instincts",
  description: "Interactive games that teach the money skills nobody teaches in school. Powered by Fidelity.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-bg-primary text-text-body">
        {children}
      </body>
    </html>
  );
}
