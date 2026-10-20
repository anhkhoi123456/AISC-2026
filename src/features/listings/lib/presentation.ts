import type { Listing } from "@/shared/lib/models";

const sampleIds = new Set([
  "phong-ban-cong",
  "studio-cua-so",
  "phong-gan-ktx",
  "tin-cua-ban",
]);
const legacyTitles = new Set([
  "Một góc bình yên, đầy ánh sáng",
  "Studio nhỏ, đủ đầy cho ngày mới",
  "Ở gần hơn, sống thoải mái hơn",
  "Phòng có gác gần UIT, giờ giấc tự do",
]);
/** Refresh old sample copy at display time; keep saved and user-written data intact. */
export function presentListing(room: Listing): Listing {
  if (!room.demo) return room;
  const title =
    sampleIds.has(room.id) && legacyTitles.has(room.title)
      ? `${room.kind || "Phòng"} ${room.size} m²${room.amenities.length ? " · " + room.amenities.slice(0, 2).join(", ") : ""}`
      : room.title;
  const image = [
    "/images/room-1.jpg",
    "/images/room-3.jpg",
    "/images/room-4.jpg",
  ].includes(room.image)
    ? "/images/student-room.jpg"
    : room.image;
  return { ...room, title, image };
}
