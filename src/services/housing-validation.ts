import { validCoordinates } from "./geography";
import type { HousingState } from "@/features/housing/models";
const record = (x: unknown): x is Record<string, unknown> =>
  !!x && typeof x === "object" && !Array.isArray(x);
const ids = (xs: unknown[]) =>
  xs.every((x) => record(x) && typeof x.id === "string") &&
  new Set(xs.map((x) => (x as { id: string }).id)).size === xs.length;
export function validHousing(h: unknown): h is HousingState {
  if (!record(h)) return false;
  const keys = [
    "rooms",
    "stays",
    "bills",
    "reviews",
    "cases",
    "events",
    "versions",
    "notifications",
    "changes",
    "permissions",
    "follows",
  ];
  if (!keys.every((k) => Array.isArray(h[k])) || !record(h.listingDrafts))
    return false;
  const v = h as unknown as HousingState;
  return (
    (v.placeOverrides === undefined ||
      (Array.isArray(v.placeOverrides) &&
        ids(v.placeOverrides) &&
        v.placeOverrides.every(
          (p) =>
            typeof p.name === "string" &&
            Array.isArray(p.aliases) &&
            typeof p.area === "string" &&
            [
              "Trường",
              "Metro",
              "Siêu thị",
              "Chợ",
              "Bệnh viện",
              "Cây xăng",
            ].includes(p.kind) &&
            validCoordinates(p.location),
        ))) &&
    [
      v.rooms,
      v.stays,
      v.bills,
      v.reviews,
      v.cases,
      v.events,
      v.versions,
      v.notifications,
      v.changes,
      v.permissions,
    ].every(ids) &&
    v.rooms.every(
      (r) =>
        typeof r.managerId === "string" &&
        Number.isInteger(r.capacity) &&
        r.capacity >= 1 &&
        r.capacity <= 10 &&
        Number.isInteger(r.externalResidents) &&
        r.externalResidents >= 0 &&
        r.externalResidents <= r.capacity &&
        Array.isArray(r.allowedRecruiters) &&
        ["closed", "approval", "open"].includes(r.roommatePolicy),
    ) &&
    v.stays.every(
      (x) =>
        v.rooms.some((r) => r.id === x.roomId) &&
        typeof x.tenantId === "string" &&
        typeof x.ownerId === "string" &&
        [
          "requested",
          "handover",
          "active",
          "leaving",
          "ended",
          "rejected",
        ].includes(x.status) &&
        [x.accepted, x.handover, x.exitConfirmed].every(Array.isArray) &&
        record(x.snapshot) &&
        typeof x.snapshot.price === "number" &&
        record(x.deposit) &&
        record(x.contract) &&
        Number.isInteger(x.sharers) &&
        x.sharers >= 1,
    ) &&
    v.bills.every(
      (b) =>
        v.stays.some((x) => x.id === b.stayId) &&
        Number.isFinite(b.total) &&
        b.total >= 0 &&
        record(b.terms) &&
        ["unpaid", "declared", "checking", "received", "disputed"].includes(
          b.status,
        ),
    ) &&
    v.reviews.every(
      (r) =>
        v.stays.some((x) => x.id === r.stayId) &&
        Number.isInteger(r.stars) &&
        r.stars >= 1 &&
        r.stars <= 5 &&
        typeof r.text === "string" &&
        typeof r.name === "string" &&
        Array.isArray(r.criteria) &&
        typeof r.hidden === "boolean",
    ) &&
    v.notifications.every(
      (n) =>
        typeof n.text === "string" &&
        typeof n.recipient === "string" &&
        typeof n.href === "string",
    ) &&
    Object.values(v.listingDrafts).every(
      (d) =>
        record(d) &&
        record(d.listing) &&
        Number.isInteger(d.step) &&
        d.step >= 0 &&
        d.step <= 3,
    )
  );
}
