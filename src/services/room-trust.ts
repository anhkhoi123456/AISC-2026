import type { DemoState, Listing } from "@/shared/lib/models";
import { fee, feeKeys } from "@/features/listings/lib/fees";
import { physicalId } from "./housing";
export function transparency(r: Listing) {
  const supplied = [
    !!r.title.trim(),
    !!r.address.trim(),
    !!r.location,
    r.size > 0,
    r.capacity > 0,
    r.price > 0,
    !!r.kind,
    !!r.rules?.trim(),
    !!r.leaseMonths,
    !!r.refundTerms?.trim(),
    ...feeKeys.map((k) => {
      const f = fee(r, k);
      return f.status === "included"
        ? !!f.includedIn?.trim()
        : f.status === "charged"
          ? Number.isFinite(f.amount) && Number(f.amount) > 0
          : f.status === "none";
    }),
  ];
  return Math.round((100 * supplied.filter(Boolean).length) / supplied.length);
}
export function validReviews(s: DemoState, roomId: string) {
  return s.housing.reviews.filter(
    (r) =>
      r.roomId === roomId &&
      !r.hidden &&
      s.housing.stays.some(
        (x) =>
          x.id === r.stayId &&
          x.roomId === roomId &&
          x.tenantId === r.tenantId &&
          x.status === "ended" &&
          ((x.handover.includes(x.tenantId) &&
            x.handover.includes(x.ownerId)) ||
            x.verificationSource === "admin-sample"),
      ),
  );
}
export const compositeTrust = (m: number, r: number, h: number) =>
  Math.round(0.4 * m + 0.4 * r + 0.2 * h);
export function roomTrust(s: DemoState, r: Listing) {
  const id = physicalId(r),
    reviews = validReviews(s, id),
    accounts = new Set(reviews.map((x) => x.tenantId)),
    stays = new Set(reviews.map((x) => x.stayId)),
    average = reviews.length
      ? reviews.reduce((a, x) => a + x.stars, 0) / reviews.length
      : null;
  const M = transparency(r),
    R = average === null ? null : 25 * (average - 1);
  const confirmations = new Set(
    s.housing.events
      .filter((e) => e.roomId === id && e.kind === "Bàn giao")
      .map((e) => e.id),
  ).size;
  const confirmedReports = new Set(
    s.listings
      .filter((x) => physicalId(x) === id)
      .flatMap((x) => x.verifiedReportIds || []),
  ).size;
  const H = Math.max(
    0,
    Math.min(
      100,
      70 +
        Math.min(20, confirmations * 2) -
        confirmedReports * 10 +
        (s.housing.trustAdjustments || [])
          .filter((a) => a.roomId === id)
          .reduce((sum, a) => sum + a.amount, 0),
    ),
  );
  return {
    M,
    R,
    H,
    average,
    count: reviews.length,
    accounts: accounts.size,
    score:
      R !== null && accounts.size >= 3 && stays.size >= 3
        ? compositeTrust(M, R, H)
        : null,
    at: new Date().toISOString(),
    reviews,
  };
}
