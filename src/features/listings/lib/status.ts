import { validCoordinates } from "@/services/geography";
import { fee, feeKeys } from "./fees";
import type { Listing, ListingStatus } from "@/shared/lib/models";
export const statusLabels: Record<ListingStatus, string> = {
  closed: "Đóng",
  published: "Đang hiển thị",
  draft: "Bản nháp",
  pending: "Chờ duyệt",
  changes: "Cần bổ sung",
  hidden: "Tạm ẩn",
  rented: "Đã cho thuê",
  rejected: "Bị từ chối",
};

export function canSubmit(room: Listing) {
  return (
    room.title.trim().length >= 10 &&
    room.address.trim().length > 0 &&
    room.price >= 100000 &&
    room.size >= 5 &&
    room.size <= 500 &&
    room.price <= 100000000 &&
    (!room.location || (validCoordinates(room.location)&&room.locationConfirmed===true)) &&
    Number.isInteger(room.depositMonths ?? 1) &&
    (room.depositMonths ?? 1) >= 0 &&
    (room.depositMonths ?? 1) <= 12 &&
    Number.isInteger(room.advanceMonths ?? 1) &&
    (room.advanceMonths ?? 1) >= 1 &&
    (room.advanceMonths ?? 1) <= 12 &&
    Number.isInteger(room.capacity) &&
    room.capacity > 0 &&
    room.capacity <= 10 &&
    Number.isFinite(room.price) &&
    Number.isFinite(room.size) &&
    !!room.kind &&
    !!room.rules?.trim() &&
    !!room.image &&
    feeKeys.every((k) => {
      const f = fee(room, k);
      return (
        ["unknown", "none"].includes(f.status) ||
        (f.status === "included"
          ? !!f.includedIn?.trim()
          : Number.isFinite(f.amount) && Number(f.amount) > 0)
      );
    })
  );
}
