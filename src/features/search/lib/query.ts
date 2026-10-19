import { normalize } from "./text";
import { places } from "../mocks/places";
export type SearchQuery = {
  area: string;
  place: string;
  budget: string;
  people: number;
  pets: boolean;
  amenity: string;
  months: string;
  kind: string;
  petMode: "must" | "prefer";
  amenityMode: "must" | "prefer";
  sort: string;
};
export const defaultQuery: SearchQuery = {
  area: "",
  place: "",
  budget: "",
  people: 2,
  pets: false,
  amenity: "",
  months: "",
  kind: "",
  petMode: "must",
  amenityMode: "must",
  sort: "new",
};
export function readQuery(params: URLSearchParams): SearchQuery {
  const raw = Object.fromEntries(params);
  return {
    ...defaultQuery,
    area: raw.area ?? "",
    place: places.some((p) => p.id === raw.place) ? raw.place : "",
    budget: /^\d+$/.test(raw.budget ?? "") ? raw.budget : "",
    people: Math.max(1, Math.min(4, Number(raw.people) || 2)),
    pets: raw.pets === "1",
    amenity: raw.amenity ?? "",
    months: ["3", "6", "10", "12"].includes(raw.months) ? raw.months : "",
    kind: raw.kind ?? "",
    petMode: raw.petMode === "prefer" ? "prefer" : "must",
    amenityMode: raw.amenityMode === "prefer" ? "prefer" : "must",
    sort: ["new", "price", "trust"].includes(raw.sort) ? raw.sort : "new",
  };
}
export function writeQuery(q: SearchQuery) {
  const p = new URLSearchParams();
  for (const [key, value] of Object.entries(q)) {
    if (value !== defaultQuery[key as keyof SearchQuery])
      p.set(key, value === true ? "1" : String(value));
  }
  return p.toString();
}
export function suggestPlaces(input: string) {
  const q = normalize(input);
  if (!q) return [];
  return places
    .filter((p) =>
      normalize(p.name + " " + p.kind + " " + p.aliases.join(" ")).includes(q),
    )
    .slice(0, 8);
}
export function parseQuery(input: string) {
  const q = normalize(input).replace(/(\d),(\d)/g, "$1.$2");
  const patch: Partial<SearchQuery> = {};
  const unknown: string[] = [];
  for (const part of q
    .split(/[,;]+/)
    .map((s) => s.trim())
    .filter(Boolean)) {
    const locationPart = part.replace(
      /cho\s*(?:nuoi\s*)?(?:meo|cho|thu cung)/,
      "",
    );
    const place = places.find((p) =>
      [p.name, ...p.aliases].some((a) => {
        const n = normalize(a);
        return (
          n.length >= 2 &&
          new RegExp(
            "(?:^|\\s)" +
              n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") +
              "(?:$|\\s)",
          ).test(locationPart)
        );
      }),
    );
    const money = part.match(
      /(?:duoi|toi da)\s*(\d+(?:[.,]\d+)?)\s*(trieu|tr)/,
    );
    const lease = part.match(/(?:thue|o)\s*(3|6|10|12)\s*thang/);
    const pet = /cho\s*(?:nuoi\s*)?(?:meo|cho|thu cung)/.test(part);
    if (place) {
      patch.place = place.id;
      patch.area = place.area;
    }
    if (money)
      patch.budget = String(Number(money[1].replace(",", ".")) * 1000000);
    if (lease) patch.months = lease[1];
    if (pet) patch.pets = true;
    if (!place && !money && !lease && !pet) unknown.push(part);
    else {
      let rest = part;
      if (place)
        rest = rest.replace(
          new RegExp(
            "^(?:gan|phong gan)?\\s*(?:" +
              [place.name, ...place.aliases]
                .map(normalize)
                .sort((a, b) => b.length - a.length)
                .join("|") +
              ")\\s*",
          ),
          "",
        );
      if (money) rest = rest.replace(money[0], "");
      if (lease) rest = rest.replace(lease[0], "");
      if (pet)
        rest = rest.replace(/cho\s*(?:nuoi\s*)?(?:meo|cho|thu cung)/, "");
      rest = rest.trim();
      if (rest && rest !== "phong") unknown.push(rest);
    }
  }
  return { patch, unknown };
}
