import type { Metadata } from "next";
import { Shell } from "@/shared/components/shell";
import "./globals.css";
export const metadata: Metadata = {
  title: "AnTro — Tìm nơi ở, gặp người hợp",
  description:
    "Tìm phòng và bạn ở ghép quanh Làng Đại học Quốc gia. Không gian cho những khởi đầu mới.",
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi">
      <body>
        <Shell>{children}</Shell>
      </body>
    </html>
  );
}
