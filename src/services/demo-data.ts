import type { DemoState, Profile } from "@/shared/lib/models";
import { initialListings } from "@/features/listings/mocks/listings";
import { emptyProfile } from "@/features/roommatch/mocks/people";
import { delay } from "./latency";
export const STORAGE_KEY = "antro-demo-v2";
export const createInitialState = (): DemoState =>
  structuredClone({
    status: "guest",
    role: "guest",
    name: "Minh Anh",
    saved: [],
    listings: initialListings,
    profile: emptyProfile,
    draft: null,
    draftStep: 0,
    likes: [],
    passed: [],
    blocked: [],
    hiddenProfiles: [],
    conversations: [],
    reports: [
      {
        id: "report-sample",
        target: "phong-gan-ktx",
        reason: "Thông tin chi phí chưa rõ",
        detail: "Tin mẫu chưa khai báo giá điện. Cần kiểm tra lại thông tin.",
        status: "new",
      },
    ],
    logs: [],
    contractText: "",
  });
const record = (v: unknown): v is Record<string, unknown> =>
  v !== null && typeof v === "object" && !Array.isArray(v);
const strings = (v: unknown): v is string[] =>
  Array.isArray(v) && v.every((x) => typeof x === "string");
const nums = (v: Record<string, unknown>, keys: string[]) =>
  keys.every((k) => typeof v[k] === "number" && Number.isFinite(v[k]));
export function validProfile(v: unknown): v is Profile {
  if (!record(v)) return false;
  return (
    [
      "name",
      "gender",
      "scenario",
      "area",
      "moveFrom",
      "moveTo",
      "sleep",
      "bio",
      "roomId",
      "food",
    ].every((k) => typeof v[k] === "string") &&
    nums(v, ["min", "max", "months", "tidy", "noise", "guests"]) &&
    ["smoke", "noSmoke", "pets", "acceptPets", "visible", "quiet"].every(
      (k) => typeof v[k] === "boolean",
    ) &&
    record(v.importance) &&
    [
      "area",
      "budget",
      "lease",
      "sleep",
      "tidy",
      "smoking",
      "guests",
      "noise",
      "food",
      "pets",
    ].every((k) =>
      ["must", "important", "normal", "ignore"].includes(
        String((v.importance as Record<string, unknown>)[k]),
      ),
    )
  );
}
export function validState(v: unknown): v is DemoState {
  if (!record(v)) return false;
  return (
    ["guest", "pending", "active", "review", "rejected", "blocked"].includes(
      String(v.status),
    ) &&
    ["guest", "tenant", "landlord", "admin"].includes(String(v.role)) &&
    typeof v.name === "string" &&
    typeof v.contractText === "string" &&
    validProfile(v.profile) &&
    (v.draft === null || validProfile(v.draft)) &&
    nums(v, ["draftStep"]) &&
    ["saved", "likes", "passed", "blocked", "hiddenProfiles", "logs"].every(
      (k) => strings(v[k]),
    ) &&
    Array.isArray(v.listings) &&
    v.listings.every(
      (r) =>
        record(r) &&
        ["id", "title", "area", "address", "image", "owner", "updated"].every(
          (k) => typeof r[k] === "string",
        ) &&
        nums(r, [
          "price",
          "size",
          "capacity",
          "internet",
          "cleaning",
          "water",
          "parking",
        ]) &&
        (r.electricity === null ||
          (typeof r.electricity === "number" &&
            Number.isFinite(r.electricity))) &&
        typeof r.pets === "boolean" &&
        typeof r.demo === "boolean" &&
        ["kind", "rules", "note"].every(
          (k) => r[k] === undefined || typeof r[k] === "string",
        ) &&
        (r.leaseMonths === undefined ||
          (typeof r.leaseMonths === "number" &&
            Number.isFinite(r.leaseMonths))) &&
        strings(r.amenities) &&
        [
          "published",
          "draft",
          "pending",
          "changes",
          "rejected",
          "hidden",
          "rented",
        ].includes(String(r.status)),
    ) &&
    Array.isArray(v.reports) &&
    v.reports.every(
      (r) =>
        record(r) &&
        ["id", "target", "reason", "detail"].every(
          (k) => typeof r[k] === "string",
        ) &&
        ["new", "review", "closed", "needs-info"].includes(String(r.status)) &&
        ["decision", "appeal"].every(
          (k) => r[k] === undefined || typeof r[k] === "string",
        ) &&
        (r.previousStatus === undefined ||
          [
            "published",
            "draft",
            "pending",
            "changes",
            "rejected",
            "hidden",
            "rented",
          ].includes(String(r.previousStatus))) &&
        (r.previousProfileHidden === undefined ||
          typeof r.previousProfileHidden === "boolean"),
    ) &&
    Array.isArray(v.conversations) &&
    v.conversations.every(
      (c) =>
        record(c) &&
        ["id", "name", "avatar"].every((k) => typeof c[k] === "string") &&
        ["roommatch", "listing"].includes(String(c.type)) &&
        typeof c.ended === "boolean" &&
        Array.isArray(c.messages) &&
        c.messages.every(
          (m) =>
            record(m) &&
            ["id", "text", "time"].every((k) => typeof m[k] === "string") &&
            typeof m.mine === "boolean",
        ),
    )
  );
}
export function decodeState(raw: string | null): {
  state: DemoState;
  notice: string;
} {
  if (!raw) return { state: createInitialState(), notice: "" };
  try {
    const envelope: unknown = JSON.parse(raw);
    if (
      !record(envelope) ||
      envelope.version !== 2 ||
      !validState(envelope.data)
    )
      throw Error();
    return { state: envelope.data, notice: "" };
  } catch {
    return {
      state: createInitialState(),
      notice:
        "Dữ liệu demo lưu trước đó không hợp lệ hoặc khác phiên bản. Đã khôi phục dữ liệu mẫu.",
    };
  }
}
export const demoDataService = {
  async load() {
    await delay();
    try {
      return decodeState(localStorage.getItem(STORAGE_KEY));
    } catch {
      return {
        state: createInitialState(),
        notice:
          "Không đọc được bộ nhớ trình duyệt. Demo vẫn hoạt động trong phiên này.",
      };
    }
  },
  save(state: DemoState) {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ version: 2, data: state }),
    );
  },
};
