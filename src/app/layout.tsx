import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const plusJakartaSans = localFont({
  src: [
    { path: "../../public/fonts/plusjakartasans-regular.ttf", weight: "400", style: "normal" },
    { path: "../../public/fonts/plusjakartasans-italic.ttf", weight: "400", style: "italic" },
    { path: "../../public/fonts/plusjakartasans-medium.ttf", weight: "500", style: "normal" },
    { path: "../../public/fonts/plusjakartasans-mediumitalic.ttf", weight: "500", style: "italic" },
    { path: "../../public/fonts/plusjakartasans-semibold.ttf", weight: "600", style: "normal" },
    { path: "../../public/fonts/plusjakartasans-semibolditalic.ttf", weight: "600", style: "italic" },
    { path: "../../public/fonts/plusjakartasans-bold.ttf", weight: "700", style: "normal" },
    { path: "../../public/fonts/plusjakartasans-bolditalic.ttf", weight: "700", style: "italic" },
    { path: "../../public/fonts/plusjakartasans-extrabold.ttf", weight: "800", style: "normal" },
    { path: "../../public/fonts/plusjakartasans-extrabolditalic.ttf", weight: "800", style: "italic" },
  ],
  variable: "--font-plus-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Dashboard Monitoring Registrasi Mahasiswa",
  description:
    "Dashboard monitoring registrasi mahasiswa baru Universitas Terbuka Majene",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${plusJakartaSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
