import type { Metadata } from "next";
import { Shell } from "@/shared/components/shell";
import "./globals.css";
import "./design.css";
import { themeBootstrap } from "@/shared/lib/theme";
export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: "AnTro — Tìm nơi ở, gặp người hợp",
  description:
    "Tìm phòng và bạn ở ghép quanh Làng Đại học Quốc gia. Bản demo tìm phòng, so sánh chi phí và kết nối ở ghép.",
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
