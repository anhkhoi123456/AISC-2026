import { normalize } from "./text";
import { places, type Place } from "../mocks/places";
export type Destination = {
  placeId: string;
  radiusKm: number;
  mode: "must" | "prefer";
};
export type SearchQuery = {
  destinations: Destination[];
  area: string;
  place: string;
  budget: string;
  people: number;
  pets: boolean;
  petType: "any" | "cat" | "dog";
  amenity: string;
  months: string;
  kind: string;
  petMode: "must" | "prefer";
  amenityMode: "must" | "prefer";
  sort: string;
};
export const defaultQuery: SearchQuery = {
  destinations: [],
  area: "",
  place: "",
  budget: "",
  people: 2,
  pets: false,
  petType: "any",
  amenity: "",
  months: "",
  kind: "",
  petMode: "must",
  amenityMode: "must",
  sort: "new",
};
export function readQuery(
  params: URLSearchParams,
  catalog: Place[] = places,
): SearchQuery {
  const raw = Object.fromEntries(params);
  let destinations: Destination[] = [];
  try {
    const v: unknown = JSON.parse(raw.destinations || "[]");
    if (Array.isArray(v))
      destinations = v
        .filter(
          (x): x is Destination =>
            x &&
            typeof x.placeId === "string" &&
            (catalog.some((p) => p.id === x.placeId) ||
              x.placeId === "nearest-metro") &&
            Number.isFinite(x.radiusKm) &&
            x.radiusKm > 0 &&
            x.radiusKm <= 50 &&
            ["must", "prefer"].includes(x.mode),
        )
        .slice(0, 5);
  } catch {
    /* Invalid URL constraints are ignored, never executed. */
  }
  return {
    ...defaultQuery,
    destinations,
    area: raw.area ?? "",
    place: catalog.some((p) => p.id === raw.place) ? raw.place : "",
    budget: /^\d+$/.test(raw.budget ?? "") ? raw.budget : "",
    people: Math.max(1, Math.min(4, Number(raw.people) || 2)),
    pets: raw.pets === "1",
    petType:
      raw.petType === "cat" || raw.petType === "dog" ? raw.petType : "any",
    amenity: raw.amenity ?? "",
    months: ["3", "6", "10", "12"].includes(raw.months) ? raw.months : "",
    kind: raw.kind ?? "",
    petMode: raw.petMode === "prefer" ? "prefer" : "must",
    amenityMode: raw.amenityMode === "prefer" ? "prefer" : "must",
    sort: ["new", "price", "trust", "distance"].includes(raw.sort)
      ? raw.sort
      : "new",
  };
}
export function writeQuery(q: SearchQuery) {
  const p = new URLSearchParams();
  for (const [key, value] of Object.entries(q)) {
    if (key === "destinations") {
      if (q.destinations.length) p.set(key, JSON.stringify(q.destinations));
      continue;
    }
    if (value !== defaultQuery[key as keyof SearchQuery])
      p.set(key, value === true ? "1" : String(value));
  }
  return p.toString();
}
export function suggestPlaces(input: string, catalog: Place[] = places) {
  const q = normalize(input);
  if (!q) return [];
  return catalog
    .filter((p) =>
      normalize(p.name + " " + p.kind + " " + p.aliases.join(" ")).includes(q),
    )
    .slice(0, 8);
}
export function parseQuery(input: string, catalog: Place[] = places) {
  const q = normalize(input).replace(/(\d),(\d)/g, "$1.$2"),
    patch: Partial<SearchQuery> = {},
    unknown: string[] = [];
  const escape = (v: string) => v.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const destinations: Destination[] = [];
  for (const part of q
    .split(/[,;]+|\s+va\s+(?=gan\b)/)
    .map((x) => x.trim())
    .filter(Boolean)) {
    let rest = part;
    const pet = rest.match(/cho\s*(?:phep\s*)?(?:nuoi\s*)?(meo|cho|thu cung)/);
    if (pet) {
      patch.pets = true;
      patch.petType =
        pet[1] === "meo" ? "cat" : pet[1] === "cho" ? "dog" : "any";
      rest = rest.replace(pet[0], " ");
    }
    const money = rest.match(
      /(?:duoi|toi da)\s*(\d+(?:[.,]\d+)?)\s*(trieu|tr)/,
    );
    if (money) {
      patch.budget = String(Number(money[1]) * 1000000);
      rest = rest.replace(money[0], " ");
    }
    const lease = rest.match(/(?:thue|o)\s*(3|6|10|12)\s*thang/);
    if (lease) {
      patch.months = lease[1];
      rest = rest.replace(lease[0], " ");
    }
    const aliases = catalog
      .flatMap((p) =>
        [p.name, ...p.aliases].map((a) => ({ p, a: normalize(a) })),
      )
      .sort((x, y) => y.a.length - x.a.length);
    for (const { p, a } of aliases) {
      const re = new RegExp("(?:^|\\s)" + escape(a) + "(?=$|\\s)", "g");
      if (re.test(rest)) {
        patch.place = patch.place || p.id;
        const radius = rest.match(
          /(?:duoi|trong|toi da)\s*(\d+(?:\.\d+)?)\s*km/,
        );
        const placeId =
          a === "metro" || a === "tau dien" ? "nearest-metro" : p.id;
        destinations.push({
          placeId,
          radiusKm: radius ? Number(radius[1]) : 2,
          mode: "must",
        });
        if (radius) rest = rest.replace(radius[0], " ");
        rest = rest.replace(re, " ");
        break;
      }
    }
    rest = rest
      .replace(/\b(?:tim|phong|gan|va|toi muon|can)\b/g, " ")
      .replace(/(?:tong|ngan sach|\/nguoi|nguoi|moi thang)/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    if (rest) unknown.push(rest);
  }
  if (destinations.length) {
    patch.destinations = destinations;
    patch.area = "";
  }
  return { patch, unknown };
}
