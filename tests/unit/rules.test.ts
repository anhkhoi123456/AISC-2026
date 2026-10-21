import { test } from "node:test";
import assert from "node:assert/strict";
import {
  initialListings,
  areas,
} from "../../src/features/listings/mocks/listings";
import { cost } from "../../src/features/listings/lib/cost";
import {
  emptyProfile,
  people,
} from "../../src/features/roommatch/mocks/people";
import {
  compatibility,
  directionalScore,
  geometricScore,
  getDeck,
  swipe,
} from "../../src/services/roommatch";
import {
  defaultQuery,
  parseQuery,
  suggestPlaces,
  readQuery,
  writeQuery,
} from "../../src/features/search/lib/query";
import { filterListings } from "../../src/services/search";
import {
  createInitialState,
  decodeState,
  validState,
} from "../../src/services/demo-data";
import { sendMessage } from "../../src/services/messages";
import {
  contractSample,
  inspectContract,
} from "../../src/features/contract/services/reader";
import { trustScore, priceBenchmark } from "../../src/services/trust";
test("cost uses room, person and consumption units without dividing person fees twice", () => {
  const room = { ...initialListings[0], price: 3000000 };
  assert.equal(cost(room, 2).total, 1940000);
  assert.equal(cost(room, 2).deposit, 1500000);
  assert.equal(cost(room, 1).total, 3720000);
  assert.equal(cost({ ...room, electricity: null }, 2).complete, false);
  assert.throws(() => cost(room, 0));
  assert.throws(() => cost(room, 2, -1));
});
test("place aliases, accent-free input and sentence parser preserve unknown requirements", () => {
  for (const [q, n] of [
    ["truong", 6],
    ["UIT", 1],
    ["metro", 2],
    ["sieu thi", 1],
    ["chợ", 1],
    ["benh vien", 1],
  ] as const)
    assert.equal(suggestPlaces(q).length, n);
  const r = parseQuery(
    "Gần UIT, dưới 3 triệu, cho nuôi mèo, thuê 10 tháng, có sân bóng",
  );
  assert.equal(r.patch.place, "uit");
  assert.equal(r.patch.budget, "3000000");
  assert.equal(r.patch.pets, true);
  assert.equal(r.patch.months, "10");
  assert.deepEqual(r.unknown, ["co san bong"]);
  assert.deepEqual(
    readQuery(new URLSearchParams(writeQuery({ ...defaultQuery, ...r.patch }))),
    { ...defaultQuery, ...r.patch },
  );
});
test("required search filters exclude rather than silently relax and preferences only rank", () => {
  const rooms = initialListings.filter((r) => r.status === "published");
  const r = filterListings(rooms, { ...defaultQuery, budget: "2000000" });
  assert.equal(r.exact.length, 1);
  assert.ok(
    r.exact.every((x) => cost(x, 2).complete && cost(x, 2).total <= 2000000),
  );
  assert.ok(r.nearby.some((x) => x.room.electricity === null));
  assert.equal(
    filterListings(rooms, { ...defaultQuery, people: 4 }).exact.length,
    0,
  );
  assert.equal(
    filterListings(rooms, { ...defaultQuery, pets: true }).exact.length,
    1,
  );
  assert.equal(
    filterListings(rooms, { ...defaultQuery, pets: true, petMode: "prefer" })
      .exact.length,
    3,
  );
  assert.equal(
    filterListings(rooms, { ...defaultQuery, months: "3" }).exact.length,
    0,
  );
});
test("mandatory compatibility checks both people, date and zero-width budgets", () => {
  const a = structuredClone(emptyProfile),
    b = structuredClone(people[0]);
  assert.equal(compatibility(a, { ...b, smoke: true }), null);
  assert.equal(compatibility({ ...a, smoke: true, noSmoke: false }, b), null);
  assert.equal(
    compatibility(a, { ...b, area: areas[1], areas: [areas[1]] }),
    null,
  );
  assert.equal(
    compatibility(a, { ...b, moveFrom: "2027-01-01", moveTo: "2027-02-01" }),
    null,
  );
  assert.ok(compatibility({ ...a, min: 2000000, max: 2000000 }, b));
  assert.equal(
    compatibility(
      { ...a, importance: { ...a.importance, noise: "must" } },
      { ...b, noise: 4 },
    ),
    null,
  );
  assert.equal(geometricScore(84, 64), 73);
});
test("directional scoring is asymmetric and handles zero denominator", () => {
  const a = structuredClone(emptyProfile),
    b = { ...structuredClone(people[0]), tidy: 1 };
  a.importance.tidy = "important";
  b.importance.tidy = "ignore";
  assert.notEqual(directionalScore(a, b), directionalScore(b, a));
  for (const key of Object.keys(a.importance) as (keyof typeof a.importance)[])
    a.importance[key] = "ignore";
  assert.equal(directionalScore(a, b), null);
  assert.equal(compatibility(a, b)?.score, null);
});
test("mutual match is unique, one-way like cannot chat, ended matches cannot reopen", () => {
  let s = createInitialState();
  s.status = "active";
  s.profile.visible = true;
  s = swipe(s, "vy", "like");
  assert.equal(s.conversations.length, 0);
  s = swipe(s, "linh", "like");
  assert.equal(s.conversations.length, 1);
  s = swipe(s, "linh", "like");
  s = swipe(s, "linh", "like");
  assert.equal(s.conversations.length, 1);
  s = sendMessage(s, "match-linh", "Xin chào", "msg-test");
  s = sendMessage(s, "match-linh", "Xin chào", "msg-test");
  assert.equal(
    s.conversations[0].messages.filter((m) => m.id === "msg-test").length,
    1,
  );
  s.conversations[0].ended = true;
  assert.throws(() => sendMessage(s, "match-linh", "Gửi tiếp", "msg-2"));
  assert.ok(!getDeck(s, "discover").some((x) => x.person.id === "linh"));
  assert.throws(() => swipe(s, "linh", "like"));
});
test("versioned storage rejects malformed nested data and keeps valid state", () => {
  const s = createInitialState();
  assert.ok(validState(s));
  assert.deepEqual(
    decodeState(JSON.stringify({ version: 2, data: s })).state,
    s,
  );
  for (const raw of [
    "{bad",
    JSON.stringify({ version: 1, data: s }),
    JSON.stringify({ version: 2, data: { ...s, listings: [{ id: "bad" }] } }),
    JSON.stringify({
      version: 2,
      data: { ...s, profile: { ...s.profile, importance: null } },
    }),
  ])
    assert.ok(decodeState(raw).notice);
});
test("contract findings reference exactly the source text, trust and benchmark are deterministic", () => {
  const findings = inspectContract(contractSample);
  assert.ok(
    findings.some(
      (f) => f.id.startsWith("increase") && f.severity === "attention",
    ),
  );
  assert.ok(findings.some((f) => f.id.startsWith("refund")));
  assert.ok(findings.some((f) => f.id.startsWith("termination")));
  for (const f of findings)
    assert.equal(contractSample.slice(f.start, f.end), f.excerpt);
  assert.equal(inspectContract("Không có điều khoản cần dò.").length, 0);
  assert.deepEqual(
    trustScore(initialListings[0]),
    trustScore(initialListings[0]),
  );
  assert.equal(priceBenchmark(areas[3]), null);
});
