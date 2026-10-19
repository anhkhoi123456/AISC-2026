import type { Listing } from "@/shared/lib/models";
export function trustScore(room: Listing) {
  const components = [
    {
      label: "Thông tin phòng có cấu trúc",
      score: room.title && room.address && room.size > 0 ? 25 : 10,
      max: 25,
    },
    {
      label: "Đầy đủ các khoản phí",
      score: room.electricity === null ? 15 : 30,
      max: 30,
    },
    { label: "Ảnh minh họa có sẵn", score: 10, max: 10 },
    {
      label: "Trạng thái kiểm duyệt demo",
      score: room.status === "published" ? 20 : 0,
      max: 20,
    },
    {
      label: "Có nội quy và thời hạn",
      score: room.rules && room.leaseMonths ? 15 : 5,
      max: 15,
    },
  ];
  return { score: components.reduce((n, c) => n + c.score, 0), components };
}
const benchmarks: Record<
  string,
  { min: number; max: number; samples: number }
> = {
  "Gần ĐH Công nghệ Thông tin": { min: 2700000, max: 3600000, samples: 12 },
  "Gần ĐH Bách Khoa": { min: 2300000, max: 3400000, samples: 10 },
};
export const priceBenchmark = (area: string) => benchmarks[area] ?? null;
