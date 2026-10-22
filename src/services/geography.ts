import type { Listing } from "@/shared/lib/models";
import { places, type Place } from "@/features/search/mocks/places";
export type Coordinates = { lat: number; lng: number };
export function validCoordinates(p: Coordinates | undefined): p is Coordinates {
  return (
    !!p &&
    Number.isFinite(p.lat) &&
    Number.isFinite(p.lng) &&
    Math.abs(p.lat) <= 90 &&
    Math.abs(p.lng) <= 180
  );
}
export function haversine(
  a: Coordinates | undefined,
  b: Coordinates | undefined,
) {
  if (!validCoordinates(a) || !validCoordinates(b)) return null;
  const rad = (n: number) => (n * Math.PI) / 180,
    dlat = rad(b.lat - a.lat),
    dlng = rad(b.lng - a.lng);
  return (
    6371 *
    2 *
    Math.atan2(
      Math.sqrt(
        Math.sin(dlat / 2) ** 2 +
          Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dlng / 2) ** 2,
      ),
      Math.sqrt(
        1 -
          (Math.sin(dlat / 2) ** 2 +
            Math.cos(rad(a.lat)) *
              Math.cos(rad(b.lat)) *
              Math.sin(dlng / 2) ** 2),
      ),
    )
  );
}
export function distanceTo(
  room: Listing,
  id: string,
  catalog: Place[] = places,
) {
  const candidates =
    id === "nearest-metro"
      ? catalog.filter((p) => p.kind === "Metro")
      : catalog.filter((p) => p.id === id);
  const values = candidates
    .map((p) => haversine(room.location, p.location))
    .filter((n): n is number => n !== null);
  return values.length ? Math.min(...values) : null;
}
export const destinationName = (id: string, catalog: Place[] = places) =>
  id === "nearest-metro"
    ? "Ga metro gần nhất"
    : catalog.find((p) => p.id === id)?.name || "Điểm đến chưa rõ";
