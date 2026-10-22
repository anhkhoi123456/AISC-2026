import type { Metadata } from "next";
import { Shell } from "@/shared/components/shell";
import "./globals.css";
import "./design.css";
import { themeBootstrap } from "@/shared/lib/theme";
export const metadata: Metadata = {
  icons: { icon: { url: "/images/logo.jpg", type: "image/jpeg" } },
  robots: { index: false, follow: false },
  title: "AnTro — Tìm phòng gần trường",
  description:
    "Tìm phòng và bạn ở ghép quanh Làng Đại học Quốc gia. Xem chi phí, điều kiện thuê và lưu những phòng phù hợp.",
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootstrap }} />
      </head>
      <body>
        <Shell>{children}</Shell>
      </body>
    </html>
  );
}
