import type { Listing } from "@/shared/lib/models";
import { fee, feeKeys } from "@/features/listings/lib/fees";
export function listingTrustScore(
  room: Listing,
  now = new Date().toISOString().slice(0, 10),
) {
  const e = room.trustEvidence;
  const fields = [
    !!room.title,
    !!room.address,
    !!room.area,
    room.size > 0,
    room.price > 0,
    room.capacity > 0,
    !!room.kind,
    !!room.rules,
    !!room.leaseMonths,
    ...feeKeys.map((k) => {
      const f = fee(room, k);
      return (
        f.status !== "unknown" &&
        (f.status !== "charged" || (f.amount !== null && f.amount > 0))
      );
    }),
  ];
  const age = Math.max(
    0,
    (Date.parse(now) - Date.parse(room.updated)) / 86400000,
  );
  const components = [
    {
      label: "Uy tín chủ tin · User Trust mẫu",
      score: 0.3 * Math.min(100, Math.max(0, e?.ownerScore ?? 0)),
      max: 30,
    },
    {
      label: "Đầy đủ thông tin & chi phí",
      score: (25 * fields.filter(Boolean).length) / fields.length,
      max: 25,
    },
    {
      label: "Ảnh/video · kết quả kiểm tra giả lập",
      score: (e && e.checkedImages >= 5 ? 15 : 0) + (e?.video ? 5 : 0),
      max: 20,
    },
    {
      label: "Quyền cho thuê · duyệt giấy tờ mẫu",
      score: e?.rentalRight ? 15 : 0,
      max: 15,
    },
    {
      label: "Độ tươi",
      score: !Number.isFinite(age)
        ? 0
        : age <= 7
          ? 10
          : age < 14
            ? (10 * (14 - age)) / 7
            : 0,
      max: 10,
    },
  ];
  const penalties = [
    ...(e?.flags ?? []).map((f) => ({
      label: {
        lowPrice: "Cờ giá mẫu",
        images: "Cờ ảnh mẫu",
        fraud: "Cờ nội dung mẫu",
      }[f],
      score: { lowPrice: 10, images: 15, fraud: 20 }[f],
    })),
    {
      label: "Báo cáo đã xác nhận mẫu",
      score:
        10 *
        (Math.max(0, e?.validReports ?? 0) +
          new Set(room.verifiedReportIds ?? []).size),
    },
  ].filter((x) => x.score > 0);
  const deductions = penalties.reduce((n, p) => n + p.score, 0);
  return {
    score: Math.round(
      Math.max(
        0,
        Math.min(100, components.reduce((n, c) => n + c.score, 0) - deductions),
      ),
    ),
    components,
    penalties,
    deductions,
    stale: age >= 14,
  };
}

export function setListingReportDecision(
  room: Listing,
  reportId: string,
  confirmed: boolean,
): Listing {
  const ids = new Set(room.verifiedReportIds ?? []);
  if (confirmed) ids.add(reportId);
  else ids.delete(reportId);
  return { ...room, verifiedReportIds: [...ids] };
}
