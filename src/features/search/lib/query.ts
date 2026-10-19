import { normalize } from "./text";
import { places } from "../mocks/places";
export type SearchQuery = {
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
export function readQuery(params: URLSearchParams): SearchQuery {
  const raw = Object.fromEntries(params);
  return {
    ...defaultQuery,
    area: raw.area ?? "",
    place: places.some((p) => p.id === raw.place) ? raw.place : "",
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
  const q = normalize(input).replace(/(\d),(\d)/g, "$1.$2"),
    patch: Partial<SearchQuery> = {},
    unknown: string[] = [];
  const escape = (v: string) => v.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  for (const part of q
    .split(/[,;]+/)
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
    const aliases = places
      .flatMap((p) =>
        [p.name, ...p.aliases].map((a) => ({ p, a: normalize(a) })),
      )
      .sort((x, y) => y.a.length - x.a.length);
    for (const { p, a } of aliases) {
      const re = new RegExp("(?:^|\\s)" + escape(a) + "(?=$|\\s)", "g");
      if (re.test(rest)) {
        patch.place = p.id;
        patch.area = p.area;
        rest = rest.replace(re, " ");
        break;
      }
    }
    rest = rest
      .replace(/\b(?:tim|phong|gan|va|toi muon|can)\b/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    if (rest) unknown.push(rest);
  }
  return { patch, unknown };
}
