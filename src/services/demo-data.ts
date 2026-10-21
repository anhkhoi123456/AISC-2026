import type { DemoState, Profile } from "@/shared/lib/models";
import { initialListings } from "@/features/listings/mocks/listings";
import { emptyProfile } from "@/features/roommatch/mocks/people";
import { delay } from "./latency";
export const STORAGE_KEY = "antro-demo-v2";
export const createInitialState = (): DemoState =>
  structuredClone({
    identity: {
      name: "Minh Anh",
      gender: "Nữ",
      birthYear: 2005,
      occupation: "Sinh viên",
      otp: false,
      verified: false,
    },
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
    (v.areas === undefined || (strings(v.areas) && v.areas.length <= 5)) &&
    (v.commuteSamples === undefined ||
      (record(v.commuteSamples) &&
        Object.values(v.commuteSamples).every(
          (x) => typeof x === "number" && Number.isFinite(x),
        ))) &&
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
function validExpanded(s: DemoState) {
  const profile = (p: Profile) =>
    Array.isArray(p.areas) &&
    p.areas.length <= 5 &&
    new Set(p.areas).size === p.areas.length &&
    strings(p.areas) &&
    record(p.commuteSamples) &&
    Object.values(p.commuteSamples).every(
      (x) => typeof x === "number" && Number.isFinite(x) && x >= 0,
    ) &&
    nums(p as unknown as Record<string, unknown>, [
      "commuteMax",
      "monthsMax",
      "vacancies",
      "floorMin",
      "floorMax",
      "roomNoiseMax",
      "maxDepositMonths",
      "maxElectricity",
      "maxExtraFees",
      "alcohol",
      "alcoholMax",
      "guestsMax",
    ]) &&
    ["anchor", "view", "cooking", "diet", "chores", "personality"].every(
      (k) => typeof p[k as keyof Profile] === "string",
    ) &&
    strings(p.requiredAmenities) &&
    strings(p.interests) &&
    p.interests.length <= 5 &&
    typeof p.elevator === "boolean" &&
    typeof p.nightShift === "boolean" &&
    ["cat", "dog"].includes(p.petType);
  const id = s.identity;
  return (
    profile(s.profile) &&
    (!s.draft || profile(s.draft)) &&
    !!id &&
    typeof id.name === "string" &&
    typeof id.gender === "string" &&
    Number.isFinite(id.birthYear) &&
    typeof id.occupation === "string" &&
    typeof id.otp === "boolean" &&
    typeof id.verified === "boolean" &&
    (!s.lastSwipe ||
      (typeof s.lastSwipe.id === "string" &&
        strings(s.lastSwipe.likes) &&
        strings(s.lastSwipe.passed) &&
        strings(s.lastSwipe.conversationIds))) &&
    s.conversations.every(
      (c) =>
        !c.sharing ||
        (typeof c.sharing.mine === "boolean" &&
          typeof c.sharing.theirs === "boolean"),
    ) &&
    s.listings.every(
      (r) =>
        (!r.verifiedReportIds || strings(r.verifiedReportIds)) &&
        (!r.allowedPets ||
          (Array.isArray(r.allowedPets) &&
            r.allowedPets.every((x) => ["cat", "dog"].includes(x)))) &&
        (!r.feeStates ||
          (record(r.feeStates) &&
            Object.values(r.feeStates).every(
              (f) =>
                record(f) &&
                ["charged", "included", "none", "unknown"].includes(
                  String(f.status),
                ) &&
                (f.amount === null ||
                  (typeof f.amount === "number" &&
                    Number.isFinite(f.amount) &&
                    f.amount >= 0)),
            ))) &&
        (r.depositMonths === undefined ||
          (Number.isFinite(r.depositMonths) && r.depositMonths >= 0)),
    )
  );
}
export function migrateState(s: DemoState): DemoState {
  const profile = (p: Profile): Profile => ({
    ...structuredClone(emptyProfile),
    ...p,
    areas: p.areas ?? [p.area],
    monthsMax: p.monthsMax ?? p.months,
    commuteSamples:
      p.commuteSamples ?? Object.fromEntries([p.area].map((x) => [x, 30])),
  });
  return {
    ...s,
    identity: s.identity ?? {
      name: s.profile.name,
      gender: s.profile.gender,
      birthYear: 2005,
      occupation: "Sinh viên",
      otp: s.status === "active",
      verified: s.status === "active",
    },
    profile: profile(s.profile),
    draft: s.draft ? profile(s.draft) : null,
    listings: s.listings.map((r) => ({
      ...r,
      depositMonths: r.depositMonths ?? 1,
      allowedPets: r.allowedPets ?? (r.pets ? ["cat", "dog"] : []),
    })),
  };
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
      ![2, 3].includes(Number(envelope.version)) ||
      !validState(envelope.data) ||
      (envelope.version === 3 && !validExpanded(envelope.data as DemoState))
    )
      throw Error();
    return {
      state: migrateState(envelope.data),
      notice:
        envelope.version === 2
          ? "Đã nâng dữ liệu demo v2 lên v3, giữ hồ sơ, tin và hội thoại. Các khoản 0 cũ chưa phân loại được đánh dấu Chưa khai báo; hãy rà lại hồ sơ."
          : "",
    };
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
      const raw = localStorage.getItem(STORAGE_KEY);
      const decoded = decodeState(raw);
      if (
        raw &&
        decoded.notice &&
        !localStorage.getItem("antro-demo-before-v3")
      ) {
        try {
          localStorage.setItem("antro-demo-before-v3", raw);
        } catch {
          decoded.notice +=
            " Không tạo được bản sao lưu do hạn mức bộ nhớ; dữ liệu đã đọc vẫn được giữ trong phiên.";
        }
      }
      return decoded;
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
      JSON.stringify({ version: 3, data: state }),
    );
  },
};
