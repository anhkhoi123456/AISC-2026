/** Legacy score export retained for old fixtures only; UI 3.0 uses room-trust.ts. */
export { listingTrustScore as trustScore } from "./listing-trust";
const observations: Record<string, number[]> = {
  "Gần ĐH Công nghệ Thông tin": [
    2700000, 2800000, 2900000, 3000000, 3100000, 3200000, 3200000, 3300000,
    3400000, 3500000, 3500000, 3600000,
  ],
  "Gần ĐH Bách Khoa": [
    2300000, 2400000, 2500000, 2600000, 2700000, 2800000, 2900000, 3000000,
    3200000, 3400000,
  ],
};
export const priceBenchmark = (area: string) => {
  const samples = observations[area];
  return samples?.length
    ? {
        min: Math.min(...samples),
        max: Math.max(...samples),
        samples: samples.length,
      }
    : null;
};
