export { listingTrustScore as trustScore } from "./listing-trust";
const benchmarks: Record<
  string,
  { min: number; max: number; samples: number }
> = {
  "Gần ĐH Công nghệ Thông tin": { min: 2700000, max: 3600000, samples: 12 },
  "Gần ĐH Bách Khoa": { min: 2300000, max: 3400000, samples: 10 },
};
export const priceBenchmark = (area: string) => benchmarks[area] ?? null;
