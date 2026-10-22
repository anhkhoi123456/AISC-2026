import { test } from "node:test";
import assert from "node:assert/strict";
import { createInitialState, decodeState } from "../../src/services/demo-data";
import type { DemoState } from "../../src/shared/lib/models";
import {
  destinationCatalog,
  saveDestination,
} from "../../src/services/destinations";
import * as h from "../../src/services/housing";
import { getDeck, validateProfile } from "../../src/services/roommatch";
import {
  compositeTrust,
  roomTrust,
  transparency,
} from "../../src/services/room-trust";
import { cost } from "../../src/features/listings/lib/cost";
import {
  parseQuery,
  defaultQuery,
  writeQuery,
  readQuery,
} from "../../src/features/search/lib/query";
import { filterListings } from "../../src/services/search";
import { haversine } from "../../src/services/geography";
const tenant = (): DemoState => ({
  ...createInitialState(),
  status: "active" as const,
  role: "tenant" as const,
});
const role = (s: DemoState, r: DemoState["role"]): DemoState => ({
  ...s,
  role: r,
});
const request = (s: DemoState) =>
  h.requestStay(s, "phong-ban-cong", {
    plannedDate: "2026-11-01",
    sharers: 2,
    mode: "electronic",
    inventory: "Phòng đủ thiết bị theo bàn giao mẫu",
    electricityMeter: 100,
    waterMeter: 10,
  });
function active() {
  let s = request(tenant());
  const id = s.housing.stays.at(-1)!.id;
  s = h.agreeStay(role(s, "landlord"), id);
  s = h.handoverStay(s, id, "2026-11-01");
  s = h.handoverStay(role(s, "tenant"), id, "2026-11-01");
  return { s, id };
}
function ended() {
  const setup = active();
  let s = setup.s;
  const id = setup.id;
  s = h.requestExit(s, id, "2026-12-01", "Kết thúc lượt ở mẫu");
  s = h.confirmExit(role(s, "landlord"), id);
  return { s: role(s, "tenant"), id };
}
test("agreement and two-sided handover are separate, idempotent and enforce occupancy", () => {
  let s = tenant();
  const before = h.occupancy(s, "phong-ban-cong").occupied;
  s = request(s);
  const id = s.housing.stays.at(-1)!.id;
  assert.equal(h.occupancy(s, "phong-ban-cong").occupied, before);
  assert.equal(request(s), s);
  assert.throws(() => h.handoverStay(s, id, "2026-11-01"));
  s = h.agreeStay(role(s, "landlord"), id);
  assert.equal(s.housing.stays.at(-1)!.status, "handover");
  s = h.handoverStay(s, id, "2026-11-01");
  assert.equal(h.occupancy(s, "phong-ban-cong").occupied, before);
  assert.throws(() => h.handoverStay(role(s, "tenant"), id, "2026-11-02"));
  s = h.handoverStay(role(s, "tenant"), id, "2026-11-01");
  assert.equal(h.occupancy(s, "phong-ban-cong").occupied, before + 1);
  assert.equal(h.handoverStay(s, id, "2026-11-01"), s);
  assert.equal(s.listings[0].status, "rented");
  assert.throws(() => request(s));
  assert.throws(() =>
    h.saveReview(s, id, 5, [5, 5, 5, 5], "Chưa kết thúc không được đánh giá"),
  );
  assert.throws(() => h.agreeStay({ ...s, status: "blocked" }, id));
});
test("roommate recruiting needs current residency, free capacity and explicit permission", () => {
  const setup = active();
  let s = setup.s;
  const id = setup.id;
  assert.equal(h.recruitingAllowed(s, "phong-ban-cong"), false);
  assert.throws(() => h.requestRecruiting(s, "phong-ban-cong"));
  s.housing.rooms[0].capacity = 3;
  s.listings[0].capacity = 3;
  assert.equal(h.recruitingAllowed(s, "phong-ban-cong"), false);
  s = h.requestRecruiting(s, "phong-ban-cong");
  const p = s.housing.permissions.at(-1)!;
  assert.equal(h.requestRecruiting(s, "phong-ban-cong"), s);
  assert.throws(() => h.decideRecruiting(s, p.id, true));
  s = h.decideRecruiting(role(s, "landlord"), p.id, true);
  assert.equal(h.recruitingAllowed(s, "phong-ban-cong"), true);
  s = h.requestExit(
    role(s, "tenant"),
    id,
    "2026-12-01",
    "Rời đi theo kế hoạch",
  );
  s = h.confirmExit(role(s, "landlord"), id);
  assert.equal(h.recruitingAllowed(s, "phong-ban-cong"), false);
});
test("advertising prices, accepted terms, proposals, read receipts and monthly bills do not overwrite each other", () => {
  const setup = active();
  let s = setup.s;
  const id = setup.id;
  const original = s.housing.stays.at(-1)!.snapshot.price;
  s = role(s, "landlord");
  s = h.saveListing(s, {
    ...s.listings[0],
    price: 4500000,
    status: "pending",
    note: "Giá chào cho đợt mới",
  });
  assert.equal(s.housing.stays.at(-1)!.snapshot.price, original);
  assert.ok(s.housing.events.some((e) => e.before && e.after));
  s = h.proposeChange(s, id, 3500000, "2026-12-01", "Đề xuất giá kỳ sau");
  assert.equal(
    h.proposeChange(s, id, 3500000, "2026-12-01", "Đề xuất giá kỳ sau"),
    s,
  );
  const c = s.housing.changes.at(-1)!,
    n = s.housing.notifications.find((n) => n.recipient === h.TENANT)!;
  s = h.readNotice(role(s, "tenant"), n.id);
  assert.equal(s.housing.changes.at(-1)!.status, "proposed");
  assert.equal(
    h.termsFor(s, s.housing.stays.at(-1)!, "2026-12").price,
    original,
  );
  s = h.respondChange(s, c.id, true);
  assert.equal(
    h.termsFor(s, s.housing.stays.at(-1)!, "2026-11").price,
    original,
  );
  assert.equal(
    h.termsFor(s, s.housing.stays.at(-1)!, "2026-12").price,
    3500000,
  );
  s = h.createBill(
    role(s, "landlord"),
    id,
    "2026-11",
    120,
    1,
    0,
    "",
    "2026-11-10",
  );
  const b = s.housing.bills.at(-1)!;
  assert.equal(b.terms.price, original);
  assert.equal(b.total, cost(b.terms, 2).total);
  assert.equal(h.createBill(s, id, "2026-11", 120, 1, 0, "", "2026-11-10"), s);
  assert.throws(() => h.setPayment(s, b.id, "bill", "received"));
  s = h.setPayment(role(s, "tenant"), b.id, "bill", "declared", "Tiền mặt mẫu");
  assert.equal(s.housing.bills.at(-1)!.status, "declared");
  assert.throws(() => h.setPayment(s, b.id, "bill", "received"));
  s = h.setPayment(role(s, "landlord"), b.id, "bill", "received");
  assert.equal(s.housing.bills.at(-1)!.status, "received");
  assert.equal(s.housing.bills.at(-1)!.method, "Tiền mặt mẫu");
});
test("exit preserves history; a deposit dispute cannot lock valid reviews; relisting keeps review and room id", () => {
  const setup = active();
  let s = setup.s;
  const id = setup.id;
  s = h.setPayment(s, id, "deposit", "declared");
  s = h.setPayment(role(s, "landlord"), id, "deposit", "received");
  s = h.requestExit(
    role(s, "tenant"),
    id,
    "2026-12-01",
    "Rời phòng theo thỏa thuận",
  );
  s = h.proposeDeduction(
    role(s, "landlord"),
    id,
    100000,
    "Vệ sinh theo biên bản mẫu",
  );
  s = h.respondDeposit(role(s, "tenant"), id, false);
  s = h.confirmExit(role(s, "landlord"), id);
  assert.equal(s.housing.stays.at(-1)!.deposit.response, "disputed");
  const count = s.housing.reviews.length;
  s = h.saveReview(
    role(s, "tenant"),
    id,
    4,
    [4, 4, 4, 4],
    "Chi phí rõ, còn bất đồng khoản khấu trừ cọc mẫu.",
  );
  assert.equal(s.housing.reviews.length, count + 1);
  s = h.saveReview(
    s,
    id,
    3,
    [3, 4, 3, 4],
    "Nội dung đã chỉnh nhưng vẫn là một đánh giá gốc.",
  );
  assert.equal(s.housing.reviews.length, count + 1);
  assert.throws(() =>
    h.saveReview(
      role(s, "landlord"),
      id,
      5,
      [5, 5, 5, 5],
      "Chủ trọ không thể sửa review người thuê",
    ),
  );
  const before = s.housing.reviews.length;
  s = h.relistRoom(role(s, "landlord"), "phong-ban-cong");
  assert.equal(h.physicalId(s.listings.at(-1)!), "phong-ban-cong");
  assert.equal(s.housing.reviews.length, before);
  assert.equal(s.housing.stays.at(-1)!.status, "ended");
  assert.throws(() => h.relistRoom(s, "phong-ban-cong"));
  const tenantState = role(s, "tenant");
  assert.equal(h.confirmExit(tenantState, id), tenantState);
});
test("bank reconciliation is never inferred, deposit refund has two separate confirmations", () => {
  const setup = active();
  let s = setup.s;
  const id = setup.id;
  s = h.setPayment(s, id, "deposit", "declared");
  s = h.setPayment(role(s, "landlord"), id, "deposit", "received");
  s = h.requestExit(role(s, "tenant"), id, "2026-12-01", "Rời phòng mẫu");
  s = h.confirmExit(role(s, "landlord"), id);
  s = h.proposeDeduction(s, id, 0, "Bàn giao đầy đủ, không khấu trừ mẫu");
  s = h.respondDeposit(role(s, "tenant"), id, true);
  assert.throws(() => h.refundDeposit(s, id));
  s = h.refundDeposit(role(s, "landlord"), id);
  assert.equal(s.housing.stays.at(-1)!.deposit.refund, "declared");
  s = h.refundDeposit(role(s, "tenant"), id);
  assert.equal(s.housing.stays.at(-1)!.deposit.refund, "received");
  assert.equal(h.refundDeposit(s, id), s);
});
test("review reports do not hide automatically; Admin requires evidence/reason and logs a decision", () => {
  const setup = ended();
  let s = setup.s;
  const id = setup.id;
  s = h.saveReview(
    s,
    id,
    2,
    [2, 2, 2, 2],
    "Nhận xét mẫu còn điều cần trao đổi rõ.",
  );
  const r = s.housing.reviews.at(-1)!;
  s = h.createCase(
    role(s, "landlord"),
    "review",
    r.id,
    "Bằng chứng mẫu cần được xem xét lại",
  );
  const c = s.housing.cases.at(-1)!;
  assert.equal(s.housing.reviews.at(-1)!.hidden, false);
  assert.throws(() => h.decideCase(s, c.id, "accepted", "Lý do mẫu"));
  s = h.decideCase(
    role(s, "admin"),
    c.id,
    "accepted",
    "Đối chiếu bằng chứng mẫu: nội dung vi phạm",
  );
  assert.equal(s.housing.reviews.at(-1)!.hidden, true);
  assert.ok(s.housing.events.some((e) => e.kind === "Quyết định Admin"));
  assert.throws(() =>
    h.decideCase(s, c.id, "accepted", "Không thể xử lý hai lần"),
  );
});
test("external guests change availability, never generate review rights or fake stays", () => {
  let s = tenant();
  const n = s.housing.stays.length;
  s = h.setRoomPolicy(role(s, "landlord"), "studio-cua-so", "closed", 2);
  assert.equal(h.occupancy(s, "studio-cua-so").available, 0);
  assert.equal(s.housing.stays.length, n);
  assert.equal(
    s.listings.find((r) => r.id === "studio-cua-so")!.status,
    "rented",
  );
  assert.throws(() => h.setRoomPolicy(s, "studio-cua-so", "open", 3));
  assert.throws(() =>
    h.setRoomPolicy(role(s, "tenant"), "studio-cua-so", "open", 0),
  );
});
test("new listing approval checks verification and ownership; missing fees do not become free", () => {
  let s = tenant();
  const r = {
    ...structuredClone(s.listings[0]),
    id: "new",
    roomId: undefined,
    ownerId: undefined,
    status: "pending" as const,
    verification: undefined,
  };
  s = h.saveListing(s, r);
  assert.throws(() => h.publishListing(s, "new", "Chấp nhận mẫu"));
  assert.throws(() =>
    h.publishListing(role(s, "admin"), "new", "Chấp nhận mẫu"),
  );
  s.identity = { ...s.identity!, otp: true, verified: true };
  s = h.saveListing(s, { ...r, id: "verified-new" });
  s = h.publishListing(
    role(s, "admin"),
    "verified-new",
    "Đã kiểm tra dữ liệu mẫu",
  );
  assert.equal(s.listings.at(-1)!.status, "published");
  assert.throws(() =>
    h.saveListing(role(s, "landlord"), {
      ...s.listings.at(-1)!,
      status: "pending",
    }),
  );
  const unknown = {
    ...s.listings[0],
    feeStates: {
      ...s.listings[0].feeStates,
      water: { status: "unknown" as const, amount: null },
    },
  };
  assert.equal(cost(unknown, 2).complete, false);
  assert.equal(
    cost(
      {
        ...s.listings[0],
        feeStates: {
          ...s.listings[0].feeStates,
          water: { status: "included", amount: null },
        },
      },
      2,
    ).complete,
    false,
  );
  const standard = { ...s.listings[0], price: 3000000 };
  assert.equal(cost(standard, 2).total, 1940000);
  assert.equal(cost(standard, 2).initial, 3440000);
  assert.equal(cost({ ...standard, advanceMonths: 2 }, 2).initial, 4940000);
});
test("Haversine and multiple location constraints are real calculations on samples and survive URL", () => {
  assert.equal(haversine(undefined, { lat: 0, lng: 0 }), null);
  assert.equal(haversine({ lat: 0, lng: 0 }, { lat: 0, lng: 0 }), 0);
  assert.ok(
    Math.abs(haversine({ lat: 0, lng: 0 }, { lat: 0, lng: 1 })! - 111.195) <
      0.01,
  );
  const parsed = parseQuery(
    "Gần UIT dưới 2 km, gần metro dưới 1 km, tổng dưới 2 triệu/người, cho nuôi mèo",
  );
  assert.deepEqual(parsed.unknown, []);
  assert.equal(parsed.patch.destinations?.length, 2);
  const q = { ...defaultQuery, ...parsed.patch };
  assert.deepEqual(readQuery(new URLSearchParams(writeQuery(q))), q);
  const s = tenant();
  const found = filterListings(s.listings, { ...q, budget: "3000000" });
  assert.ok(found.exact.length > 0);
  const far = filterListings(s.listings, {
    ...q,
    destinations: [
      ...q.destinations,
      { placeId: "uit", radiusKm: 0.0001, mode: "must" },
    ],
  });
  assert.equal(far.exact.length, 0);
  assert.ok(far.nearby.length > 0);
  assert.equal(
    filterListings([{ ...s.listings[0], location: undefined }], q).exact.length,
    0,
  );
});
test("Trust uses M/R/H, minimum distinct accounts, no unverified report deductions and no relist reset", () => {
  assert.equal(compositeTrust(80, 80, 70), 78);
  let s = tenant();
  const r = s.listings[0];
  assert.equal(roomTrust(s, r).count, 3);
  assert.ok(roomTrust(s, r).score !== null);
  assert.equal(roomTrust(s, s.listings[1]).score, null);
  const before = roomTrust(s, r);
  s.reports.push({
    id: "fake-report",
    target: r.id,
    status: "new",
    reason: "Chưa kiểm chứng",
    detail: "Mẫu",
  });
  assert.equal(roomTrust(s, r).score, before.score);
  assert.ok(transparency({ ...r, electricity: null }) < transparency(r));
  s = h.relistRoom(role(s, "landlord"), r.id);
  assert.equal(roomTrust(s, s.listings.at(-1)!).score, before.score);
});
test("v3 migration keeps existing data without inventing verified stays and preserves v4 state", () => {
  const s = tenant();
  const { housing, ...old } = s;
  void housing;
  const migrated = decodeState(JSON.stringify({ version: 3, data: old }));
  assert.equal(migrated.state.housing.stays.length, 0);
  assert.deepEqual(migrated.state.listings, s.listings);
  assert.match(migrated.notice, /v4/);
  const { s: complete } = ended();
  const result = decodeState(JSON.stringify({ version: 4, data: complete }));
  assert.deepEqual(result.state.housing, complete.housing);
  assert.equal(result.notice, "");
});
test("Admin evidence is a separate review-right path and corrections have explicit amounts and audit", () => {
  let s = request(tenant());
  const id = s.housing.stays.at(-1)!.id;
  s = h.createCase(
    s,
    "residency",
    id,
    "Hồ sơ cư trú mẫu, đối chiếu các mốc nhận và trả",
  );
  let c = s.housing.cases.at(-1)!;
  assert.throws(() =>
    h.decideCase(
      role(s, "admin"),
      c.id,
      "accepted",
      "Đối chiếu bằng chứng mẫu",
    ),
  );
  s = h.decideCase(
    role(s, "admin"),
    c.id,
    "more",
    "Cần thêm mốc ngày trong hồ sơ mẫu",
  );
  s = h.supplementCase(
    role(s, "tenant"),
    c.id,
    "Bổ sung ngày vào và rời theo hồ sơ mẫu.",
  );
  s = h.decideCase(
    role(s, "admin"),
    c.id,
    "accepted",
    "Đối chiếu hồ sơ mẫu đủ căn cứ",
    { from: "2026-09-01", to: "2026-10-01" },
  );
  assert.equal(s.housing.stays.at(-1)!.verificationSource, "admin-sample");
  s = h.saveReview(
    role(s, "tenant"),
    id,
    4,
    [4, 4, 4, 4],
    "Review đủ điều kiện sau đối chiếu Admin mẫu.",
  );
  assert.equal(s.housing.reviews.at(-1)!.stayId, id);
  s = h.createCase(
    s,
    "trust",
    "phong-ban-cong",
    "Sai sự kiện đã được đối chiếu theo mẫu",
  );
  c = s.housing.cases.at(-1)!;
  const before = roomTrust(s, s.listings[0]).H;
  s = h.decideCase(
    role(s, "admin"),
    c.id,
    "accepted",
    "Đính chính sự kiện mẫu có căn cứ",
    { amount: 5 },
  );
  assert.equal(roomTrust(s, s.listings[0]).H, before + 5);
});
test("late handover checks current capacity and close/reopen never removes history", () => {
  let s = request(tenant());
  const id = s.housing.stays.at(-1)!.id;
  s = h.agreeStay(role(s, "landlord"), id);
  s = h.handoverStay(role(s, "tenant"), id, "2026-11-01");
  s = h.setRoomPolicy(role(s, "landlord"), "phong-ban-cong", "closed", 1);
  assert.throws(() => h.handoverStay(s, id, "2026-11-01"));
  assert.equal(s.housing.stays.at(-1)!.status, "handover");
  s = h.cancelStay(s, id, "Không còn chỗ theo dữ liệu cập nhật");
  const before = s.housing.stays.length;
  s = h.setListingStatus(
    s,
    "phong-ban-cong",
    "closed",
    "Đóng đợt tuyển theo yêu cầu quản lý",
  );
  assert.equal(s.housing.stays.length, before);
  assert.equal(s.housing.reviews.length, 3);
  assert.equal(s.listings[0].status, "closed");
});

test("RoomMatch keeps the physical room after relisting and cannot recruit beyond actual capacity", () => {
  let s = tenant();
  assert.ok(getDeck(s, "discover").some((x) => x.person.id === "an"));
  s = h.relistRoom(role(s, "landlord"), "phong-ban-cong");
  const listing = s.listings.at(-1)!;
  s = h.setListingStatus(s, listing.id, "pending", "Mở lại đợt tuyển mẫu");
  s = h.publishListing(
    role(s, "admin"),
    listing.id,
    "Đã đối chiếu đủ dữ liệu mẫu",
  );
  s = role(s, "tenant");
  assert.ok(getDeck(s, "discover").some((x) => x.person.id === "an"));
  s.profile = {
    ...s.profile,
    scenario: "Đã có phòng",
    roomId: "phong-ban-cong",
    vacancies: 2,
  };
  const room = s.housing.rooms.find((r) => r.id === "phong-ban-cong")!;
  const stay = s.housing.stays.find((x) => x.id === "an-current-stay")!;
  stay.tenantId = h.TENANT;
  room.allowedRecruiters = [h.TENANT];
  assert.throws(() => validateProfile(s.profile, s), /chỗ trống thực tế/);
});

test("Admin destination updates persist, recalculate all distance constraints and remain sample data", () => {
  let s = tenant();
  const old = destinationCatalog(s).find((p) => p.id === "uit")!;
  assert.throws(() =>
    saveDestination(s, { ...old, location: { lat: 30, lng: 106.8 } }),
  );
  assert.throws(() =>
    saveDestination(role(s, "admin"), {
      ...old,
      location: { lat: 999, lng: 106.8 },
    }),
  );
  const q = {
    ...defaultQuery,
    destinations: [{ placeId: "uit", radiusKm: 2, mode: "must" as const }],
  };
  assert.ok(
    filterListings(s.listings, q, destinationCatalog(s)).exact.length > 0,
  );
  s = saveDestination(role(s, "admin"), {
    ...old,
    location: { lat: 30, lng: 106.8 },
  });
  assert.equal(
    filterListings(s.listings, q, destinationCatalog(s)).exact.length,
    0,
  );
  assert.equal(
    decodeState(JSON.stringify({ version: 4, data: s })).state.housing
      .placeOverrides?.[0].location?.lat,
    30,
  );
  const added = {
    ...old,
    id: "new-market",
    name: "Chợ mới mẫu",
    aliases: ["cho moi"],
    kind: "Chợ" as const,
  };
  s = saveDestination(s, added);
  const parsed = parseQuery("Gần chợ mới dưới 1 km", destinationCatalog(s));
  assert.equal(parsed.patch.destinations?.[0].placeId, "new-market");
  assert.deepEqual(
    readQuery(
      new URLSearchParams(writeQuery({ ...defaultQuery, ...parsed.patch })),
      destinationCatalog(s),
    ).destinations,
    parsed.patch.destinations,
  );
  const eventCount = s.housing.events.length;
  s = saveDestination(s, added);
  assert.equal(s.housing.events.length, eventCount);
});
