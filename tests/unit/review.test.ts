import { test } from "node:test";
import assert from "node:assert/strict";
import { emptyProfile } from "../../src/features/roommatch/mocks/people";
import { areas } from "../../src/features/listings/mocks/listings";
import { createInitialState, decodeState } from "../../src/services/demo-data";
import {
  compatibility,
  directionalScore,
  getDeck,
  swipe,
  undoSwipe,
  validateProfile,
} from "../../src/services/roommatch";
import { sendMessage } from "../../src/services/messages";
import {
  consentContact,
  displayMessage,
  safetyWarnings,
} from "../../src/services/chat-safety";
import {
  listingTrustScore,
  setListingReportDecision,
} from "../../src/services/listing-trust";
import { userTrustScore } from "../../src/services/user-trust";
import { cost } from "../../src/features/listings/lib/cost";
import { parseQuery, defaultQuery } from "../../src/features/search/lib/query";
import { filterListings } from "../../src/services/search";
const profile = () => structuredClone(emptyProfile);
const state = () => {
  const s = createInitialState();
  s.status = "active";
  s.profile.visible = true;
  return s;
};
test("hard filters check both directions, ordered areas, commute, intervals and room ownership", () => {
  const a = profile(),
    b = profile();
  assert.ok(
    compatibility(
      { ...a, min: 1000000, max: 2000000 },
      { ...b, min: 2000000, max: 3000000 },
    ),
  );
  a.areas = [areas[0], areas[1]];
  a.area = areas[0];
  b.areas = [areas[1], areas[2]];
  b.area = areas[1];
  assert.deepEqual(compatibility(a, b)?.sharedAreas, [areas[1]]);
  assert.equal(compatibility(a, { ...b, commuteMax: 15 }), null); // hcmut 20 min mock
  assert.equal(compatibility(a, { ...b, areas: [areas[3]] }), null);
  assert.equal(compatibility({ ...a, smoke: true, noSmoke: false }, b), null);
  assert.equal(
    compatibility(a, {
      ...b,
      pets: true,
      acceptPets: true,
      noSmoke: false,
      alcohol: 4,
    }),
    null,
  );
  assert.equal(compatibility(a, { ...b, months: 12, monthsMax: 12 }), null);
  assert.equal(
    compatibility(a, { ...b, months: 6, monthsMax: 12 })?.signals.lease,
    0.5,
  );
  assert.throws(() => validateProfile({ ...a, areas: [...areas, areas[0]] }));
  const s = state();
  assert.ok(getDeck(s, "discover").some((x) => x.person.id === "an"));
  s.profile.maxDepositMonths = 0;
  assert.ok(!getDeck(s, "discover").some((x) => x.person.id === "an"));
  s.profile.maxDepositMonths = 2;
  s.profile.scenario = "Đã có phòng";
  s.profile.roomId = "phong-ban-cong";
  assert.throws(() => getDeck(s, "discover"), /quyền tuyển roommate/); // Linking a published room alone is no longer proof of occupancy or permission.
  s.listings[0].status = "hidden";
  assert.throws(() => getDeck(s, "discover"));
});
test("scores and actual reasons use the same directional signals, including true 100", () => {
  const a = profile(),
    b = profile();
  assert.equal(compatibility(a, b)?.score, 100);
  b.sleep = "Dậy sớm";
  const r = compatibility(a, b)!;
  assert.equal(r.signals.sleep, 0.8);
  assert.ok(
    r.different.some(
      (x) => x.includes("Bình thường ↔ Dậy sớm") && x.includes("80%"),
    ),
  );
  assert.ok(!r.good.some((x) => x.startsWith("Giờ ngủ")));
  a.importance.area = "normal";
  b.importance.area = "normal";
  a.areas = [areas[0], areas[1]];
  const r2 = compatibility(a, b)!;
  assert.equal(r2.signals.area, 0.5);
  assert.equal(r2.reverseSignals.area, 1);
  assert.notEqual(r2.ab, r2.ba);
  assert.equal(
    r2.score,
    Math.round(Math.sqrt(directionalScore(a, b)! * directionalScore(b, a)!)),
  );
});
test("undo restores one swipe, repeated interests do not duplicate mutual match, ended matches stay ended", () => {
  let s = state();
  s = swipe(s, "linh", "like");
  s = swipe(s, "linh", "like");
  assert.equal(s.conversations.length, 1);
  s.profile.visible = false;
  assert.equal(getDeck(s, "matches").length, 1);
  s.profile.visible = true;
  s = undoSwipe(s);
  assert.equal(s.conversations.length, 0);
  assert.equal(s.likes.length, 0);
  assert.equal(s.lastSwipe, undefined);
  assert.throws(() => undoSwipe(s));
  s = swipe(s, "vy", "pass");
  assert.ok(s.passed.includes("vy"));
  s = undoSwipe(s);
  assert.ok(!s.passed.includes("vy"));
  s = swipe(s, "vy", "like");
  assert.equal(s.conversations.length, 0);
  s = swipe(s, "vy", "pass");
  assert.ok(!s.likes.includes("vy"));
  s = undoSwipe(s);
  assert.ok(s.likes.includes("vy"));
  s = swipe(s, "linh", "like");
  assert.throws(() => swipe(s, "linh", "pass"));
  s = sendMessage(s, "match-linh", "Chào", "m1");
  assert.throws(() => undoSwipe(s));
  s.conversations[0].ended = true;
  assert.throws(() => sendMessage(s, "match-linh", "Chào", "m2"));
  assert.throws(() => swipe(s, "linh", "like"));
});
test("contacts stay masked until both sides consent, including restored messages, revocation and ended chat", () => {
  let s = swipe(state(), "linh", "like");
  s = sendMessage(
    s,
    "match-linh",
    "0901234567 hoặc demo@example.com",
    "contact",
  );
  const c = () => s.conversations[0],
    text = () => c().messages.at(-1)!.text;
  assert.ok(!displayMessage(c(), text()).includes("0901234567"));
  s = consentContact(s, c().id, "mine");
  assert.ok(!displayMessage(c(), text()).includes("@"));
  s = decodeState(JSON.stringify({ version: 3, data: s })).state;
  assert.ok(!displayMessage(c(), text()).includes("@"));
  s = consentContact(s, c().id, "theirs");
  assert.equal(displayMessage(c(), text()), text());
  s = consentContact(s, c().id, "theirs", false);
  assert.ok(!displayMessage(c(), text()).includes("@"));
  s.conversations[0].ended = true;
  assert.throws(() => consentContact(s, c().id, "mine"));
  assert.ok(!displayMessage(c(), text()).includes("@"));
  assert.equal(
    safetyWarnings("Bạn cho mình hỏi tiền điện và cọc nhé.").length,
    0,
  );
  assert.equal(safetyWarnings("Mình không dùng Zalo.").length, 0);
  assert.ok(
    safetyWarnings("Chuyển cọc ngay trước khi xem phòng https://example.com")
      .length >= 2,
  );
  assert.ok(safetyWarnings("Kết bạn Zalo qua 0901234567").length > 0);
});
test("listing formula has correct maxima, explicit mock photo evidence, deductions and separate user formula", () => {
  const room = createInitialState().listings[0];
  let r = listingTrustScore(room, "2026-10-19");
  assert.deepEqual(
    r.components.map((c) => c.max),
    [30, 25, 20, 15, 10],
  );
  assert.equal(r.components[2].score, 0);
  const evidence = {
    ownerScore: 100,
    checkedImages: 5,
    video: true,
    rentalRight: true,
    flags: [] as ("lowPrice" | "images" | "fraud")[],
    validReports: 0,
  };
  r = listingTrustScore({ ...room, trustEvidence: evidence }, "2026-10-19");
  assert.equal(r.score, 100);
  r = listingTrustScore(
    {
      ...room,
      trustEvidence: {
        ...evidence,
        flags: ["images", "fraud"],
        validReports: 1,
      },
    },
    "2026-10-19",
  );
  assert.equal(r.score, 55);
  assert.equal(r.deductions, 45);
  assert.equal(
    listingTrustScore(
      { ...room, trustEvidence: evidence, updated: "2026-10-01" },
      "2026-10-19",
    ).components[4].score,
    0,
  );
  const u = userTrustScore({ otp: true, verified: true });
  assert.equal(u.score, 30);
  assert.deepEqual(
    u.components.map((c) => c.max),
    [30, 10, 10, 20, 20, 10],
  );
  assert.equal(
    userTrustScore({ otp: true, verified: true, verifiedFraud: true }).score,
    0,
  );
});
test("parser consumes recognized spans, distinguishes cats and dogs, and explicit fees/deposit remain separate", () => {
  const parsed = parseQuery(
    "Tìm phòng gần UIT dưới 3 triệu cho nuôi mèo thuê 10 tháng",
  );
  assert.deepEqual(parsed.unknown, []);
  assert.equal(parsed.patch.petType, "cat");
  assert.equal(parseQuery("cho nuôi chó").patch.petType, "dog");
  assert.equal(parseQuery("cho thú cưng").patch.petType, "any");
  assert.deepEqual(parseQuery("gần UIT, có sân bóng").unknown, ["co san bong"]);
  const s = createInitialState(),
    r = s.listings[0];
  assert.equal(
    filterListings(s.listings, { ...defaultQuery, pets: true, petType: "dog" })
      .exact.length,
    0,
  );
  assert.ok(
    filterListings(s.listings, { ...defaultQuery, pets: true, petType: "cat" })
      .exact.length > 0,
  );
  assert.equal(cost({ ...r, depositMonths: 2 }).deposit, r.price);
  assert.equal(
    cost({
      ...r,
      feeStates: {
        ...r.feeStates,
        internet: { status: "unknown", amount: null },
      },
    }).complete,
    false,
  );
  assert.equal(
    cost({
      ...r,
      feeStates: {
        ...r.feeStates,
        internet: { status: "included", amount: 0 },
      },
    }).total,
    cost(r).total - r.internet / 2,
  );
});
test("v2 migration preserves old chats and rooms, marks ambiguous legacy fees unknown and notifies", () => {
  const s = state();
  const legacy = JSON.parse(JSON.stringify(s));
  delete legacy.profile.areas;
  delete legacy.profile.commuteSamples;
  delete legacy.identity;
  delete legacy.listings[0].feeStates;
  legacy.listings[0].internet = 0;
  const migrated = decodeState(JSON.stringify({ version: 2, data: legacy }));
  assert.match(migrated.notice, /v2.*v3/);
  assert.equal(migrated.state.listings.length, s.listings.length);
  assert.deepEqual(migrated.state.profile.areas, [legacy.profile.area]);
  assert.equal(cost(migrated.state.listings[0]).complete, false);
});

test("confirmed report deductions are idempotent and reversible on a successful appeal", () => {
  const room = createInitialState().listings[0],
    base = listingTrustScore(room, "2026-10-19").score;
  const first = setListingReportDecision(room, "report-1", true);
  assert.equal(listingTrustScore(first, "2026-10-19").score, base - 10);
  const duplicate = setListingReportDecision(first, "report-1", true);
  assert.equal(listingTrustScore(duplicate, "2026-10-19").score, base - 10);
  assert.equal(
    listingTrustScore(
      setListingReportDecision(duplicate, "report-1", false),
      "2026-10-19",
    ).score,
    base,
  );
});
