import type { Listing, ListingStatus } from "@/shared/lib/models";
export const statusLabels: Record<ListingStatus, string> = {
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
    Number.isInteger(room.capacity) &&
    room.capacity > 0
  );
}
