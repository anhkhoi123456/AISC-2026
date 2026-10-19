import type { FeeKey, Fee, Listing } from "@/shared/lib/models";
export const feeLabels: Record<FeeKey, string> = {
  internet: "Internet / phòng / tháng",
  cleaning: "Vệ sinh / phòng / tháng",
  electricity: "Điện / kWh",
  water: "Nước / người / tháng",
  parking: "Giữ xe / xe / tháng",
  management: "Quản lý / phòng / tháng",
  extraGuest: "Phụ thu khách / người / tháng",
  laundry: "Giặt dùng chung / người / tháng",
  transfer: "Phí chuyển nhượng / lần",
};
export const feeKeys = Object.keys(feeLabels) as FeeKey[];
export const feeStatusLabels = {
  charged: "Có phí",
  included: "Đã gồm",
  none: "Không có",
  unknown: "Chưa khai báo",
};
export function fee(room: Listing, key: FeeKey): Fee {
  const explicit = room.feeStates?.[key];
  // Legacy numeric fields remain compatible; unknown zero is never silently classified.
  const legacy = key in room ? room[key as keyof Listing] : undefined;
  if (explicit?.status === "charged" && legacy === null)
    return { status: "unknown", amount: null };
  if (explicit)
    return explicit.status === "charged" &&
      ["internet", "cleaning", "electricity", "water", "parking"].includes(key)
      ? {
          ...explicit,
          amount: typeof legacy === "number" ? legacy : explicit.amount,
        }
      : explicit;
  return {
    status: typeof legacy === "number" && legacy > 0 ? "charged" : "unknown",
    amount: typeof legacy === "number" && legacy > 0 ? legacy : null,
  };
}
export function feeAmount(room: Listing, key: FeeKey) {
  const f = fee(room, key);
  return f.status === "unknown" ||
    (f.status === "charged" && (f.amount === null || f.amount <= 0))
    ? null
    : f.status === "charged"
      ? f.amount
      : 0;
}
