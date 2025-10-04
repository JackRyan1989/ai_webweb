import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI WEB WEB",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <main className="dark:bg-black big-white dark:text-white text-black m-auto grid grid-cols-12 grid-rows-1 gap-1 max-w-screen min-h-vh">
          {children}
        </main>
      </body>
    </html>
  );
}
