import type { Listing } from "@/shared/lib/models";
import type { SearchQuery } from "@/features/search/lib/query";
import { places } from "@/features/search/mocks/places";
import { cost } from "@/features/listings/lib/cost";
import { trustScore } from "./trust";
import { delay } from "./latency";
export function allowsPet(r: Listing, type: SearchQuery["petType"]) {
  const allowed = r.allowedPets ?? (r.pets ? ["cat", "dog"] : []);
  return type === "any" ? allowed.length > 0 : allowed.includes(type);
}
export function filterListings(listings: Listing[], q: SearchQuery) {
  const exact: Listing[] = [],
    nearby: { room: Listing; reason: string }[] = [];
  const anchor = places.find((p) => p.id === q.place);
  for (const room of listings.filter((r) => r.status === "published")) {
    const reasons: string[] = [];
    if (
      (q.area && room.area !== q.area) ||
      (anchor && room.area !== anchor.area)
    )
      reasons.push("Khác cụm khu vực");
    if (room.capacity < q.people) reasons.push("Không đủ sức chứa");
    if (q.kind && room.kind !== q.kind) reasons.push("Khác loại phòng");
    if (q.months && Number(q.months) < (room.leaseMonths ?? 6))
      reasons.push("Chưa đạt thời hạn tối thiểu");
    if (q.pets && !allowsPet(room, q.petType) && q.petMode === "must")
      reasons.push("Không cho thú cưng");
    if (
      q.amenity &&
      !room.amenities.includes(q.amenity) &&
      q.amenityMode === "must"
    )
      reasons.push("Thiếu tiện nghi bắt buộc");
    const c = cost(room, Math.min(q.people, room.capacity));
    if (q.budget && (!c.complete || c.total > Number(q.budget)))
      reasons.push(
        c.complete
          ? "Tổng ước tính vượt ngân sách đã chọn."
          : c.unknown.includes("electricity")
            ? "Chưa khai báo giá điện, chưa thể xác nhận ngân sách."
            : "Chưa khai báo đủ khoản phí, chưa thể xác nhận ngân sách.",
      );
    if (reasons.length) nearby.push({ room, reason: reasons.join(" · ") });
    else exact.push(room);
  }
  const preference = (r: Listing) =>
    (q.pets && q.petMode === "prefer" && allowsPet(r, q.petType) ? 1 : 0) +
    (q.amenity && q.amenityMode === "prefer" && r.amenities.includes(q.amenity)
      ? 1
      : 0);
  exact.sort(
    (a, b) =>
      preference(b) - preference(a) ||
      (q.sort === "price"
        ? cost(a, q.people).total - cost(b, q.people).total
        : q.sort === "trust"
          ? trustScore(b).score - trustScore(a).score
          : b.updated.localeCompare(a.updated)),
  );
  return { exact, nearby };
}
export const searchService = {
  async search(rooms: Listing[], q: SearchQuery) {
    await delay();
    return filterListings(rooms, q);
  },
};
