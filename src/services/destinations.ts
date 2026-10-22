import { places, type Place } from "@/features/search/mocks/places";
import type { DemoState } from "@/shared/lib/models";
import { actorId, ADMIN } from "./housing";
import { validCoordinates } from "./geography";
export function destinationCatalog(s: DemoState): Place[] {
  const overrides = s.housing.placeOverrides ?? [];
  return [
    ...places.filter((p) => !overrides.some((o) => o.id === p.id)),
    ...overrides,
  ];
}
export function saveDestination(state: DemoState, place: Place) {
  if (state.status !== "active" || actorId(state) !== ADMIN)
    throw Error("Chỉ Admin mẫu được cập nhật điểm đến.");
  if (
    !/^[a-z0-9-]{1,80}$/.test(place.id) ||
    !place.name.trim() ||
    !place.area ||
    !["Trường", "Metro", "Siêu thị", "Chợ", "Bệnh viện", "Cây xăng"].includes(
      place.kind,
    ) ||
    !validCoordinates(place.location) ||
    !Array.isArray(place.aliases) ||
    place.aliases.some((a) => typeof a !== "string")
  )
    throw Error("Điền tên, loại, khu vực và tọa độ mẫu hợp lệ.");
  const value = {
    ...place,
    name: place.name.trim(),
    aliases: [...new Set(place.aliases.map((a) => a.trim()).filter(Boolean))],
  };
  const previous = destinationCatalog(state).find((p) => p.id === place.id);
  if (JSON.stringify(previous) === JSON.stringify(value)) return state;
  const s = structuredClone(state);
  s.housing.placeOverrides = [
    ...(s.housing.placeOverrides ?? []).filter((p) => p.id !== place.id),
    value,
  ];
  s.housing.events.push({
    id: crypto.randomUUID(),
    roomId: "destinations",
    kind: "Cập nhật điểm đến",
    actor: ADMIN,
    date: new Date().toISOString(),
    reason: "Cập nhật danh mục tọa độ giả lập",
    before: previous
      ? `${previous.name}: ${previous.location?.lat}, ${previous.location?.lng}`
      : "Điểm mới",
    after: `${value.name}: ${value.location!.lat}, ${value.location!.lng}`,
  });
  return s;
}
