import type { DemoState, Listing } from "@/shared/lib/models";
import type {
  HousingState,
  Stay,
  PaymentStatus,
} from "@/features/housing/models";
import { cost } from "@/features/listings/lib/cost";
import {
  fee,
  feeKeys,
  feeLabels,
  feeStatusLabels,
} from "@/features/listings/lib/fees";
import { canSubmit, statusLabels } from "@/features/listings/lib/status";
export const TENANT = "tenant-demo",
  OWNER = "owner-demo",
  ADMIN = "admin-demo";
export const actorId = (s: DemoState) =>
  s.role === "admin" ? ADMIN : s.role === "landlord" ? OWNER : TENANT;
const now = () => new Date().toISOString();
const date = (v: string) =>
  /^\d{4}-\d{2}-\d{2}$/.test(v) &&
  Number.isFinite(Date.parse(v)) &&
  new Date(v).toISOString().slice(0, 10) === v;
function assert(ok: unknown, message: string): asserts ok {
  if (!ok) throw Error(message);
}
function access(s: DemoState) {
  assert(
    s.status === "active",
    "Hoàn tất đăng nhập và xác minh demo trước khi thao tác.",
  );
  return actorId(s);
}
export const physicalId = (r: Pick<Listing, "roomId" | "id">) =>
  r.roomId || r.id;
export function createHousing(listings: Listing[]): HousingState {
  const rooms = Array.from(
    new Map(
      listings.map((r) => [
        physicalId(r),
        {
          id: physicalId(r),
          managerId: r.ownerId || OWNER,
          capacity: r.capacity,
          externalResidents: 0,
          roommatePolicy: "approval" as const,
          allowedRecruiters: [],
        },
      ]),
    ).values(),
  );
  return {
    rooms,
    stays: [],
    bills: [],
    reviews: [],
    cases: [],
    events: [],
    versions: listings.map((r) => ({
      id: `initial-${r.id}`,
      roomId: physicalId(r),
      listingId: r.id,
      date: now(),
      snapshot: structuredClone(r),
    })),
    notifications: [],
    changes: [],
    permissions: [],
    follows: [],
    listingDrafts: {},
    trustAdjustments: [],
  };
}
export function occupancy(s: DemoState, roomId: string) {
  const room = s.housing.rooms.find((r) => r.id === roomId);
  const occupied =
    (room?.externalResidents || 0) +
    s.housing.stays.filter(
      (x) => x.roomId === roomId && ["active", "leaving"].includes(x.status),
    ).length;
  return {
    occupied,
    capacity: room?.capacity ?? 0,
    available: Math.max(0, (room?.capacity ?? 0) - occupied),
  };
}
export function canManage(s: DemoState, r: Listing) {
  return (
    actorId(s) ===
    (s.housing.rooms.find((x) => x.id === physicalId(r))?.managerId ||
      r.ownerId ||
      OWNER)
  );
}
function event(
  s: DemoState,
  id: string,
  roomId: string,
  kind: string,
  reason: string,
  before?: string,
  after?: string,
) {
  if (s.housing.events.some((e) => e.id === id)) return;
  s.housing.events.push({
    id,
    roomId,
    kind,
    reason,
    ...(before === undefined ? {} : { before }),
    ...(after === undefined ? {} : { after }),
    actor: actorId(s),
    date: now(),
  });
  s.logs.push(`${kind}: ${reason}`);
}
function notify(
  s: DemoState,
  id: string,
  recipients: string[],
  text: string,
  href = "/noi-o",
) {
  for (const recipient of new Set(recipients))
    if (!s.housing.notifications.some((n) => n.id === `${id}:${recipient}`))
      s.housing.notifications.push({
        id: `${id}:${recipient}`,
        recipient,
        text,
        href,
        date: now(),
        read: false,
      });
}
function roomAccess(s: DemoState, roomId: string) {
  const room = s.housing.rooms.find((r) => r.id === roomId);
  assert(room, "Không tìm thấy căn phòng.");
  return room;
}
function stayAccess(s: DemoState, id: string) {
  const a = access(s),
    stay = s.housing.stays.find((x) => x.id === id);
  assert(
    stay && [stay.tenantId, stay.ownerId].includes(a),
    "Bạn không có quyền với lượt ở này.",
  );
  return stay;
}
function syncCapacity(s: DemoState, roomId: string) {
  if (occupancy(s, roomId).available === 0)
    s.listings = s.listings.map((r) =>
      physicalId(r) === roomId && r.status === "published"
        ? { ...r, status: "rented" }
        : r,
    );
}
export function requestStay(
  state: DemoState,
  listingId: string,
  input: {
    plannedDate: string;
    sharers: number;
    mode: "paper" | "electronic";
    inventory: string;
    electricityMeter: number;
    waterMeter: number;
  },
) {
  const a = access(state),
    r = state.listings.find((x) => x.id === listingId);
  assert(r && r.status === "published", "Tin đã đóng hoặc chưa được duyệt.");
  assert(
    a === TENANT || canManage(state, r),
    "Không thể tạo yêu cầu cho người khác.",
  );
  assert(
    roomAccess(state, physicalId(r)).managerId !== TENANT,
    "Không tự tạo lượt thuê cho phòng do chính mình quản lý.",
  );
  assert(occupancy(state, physicalId(r)).available > 0, "Phòng đã đủ người.");
  assert(
    date(input.plannedDate) &&
      Number.isInteger(input.sharers) &&
      input.sharers >= 1 &&
      input.sharers <= r.capacity &&
      ["paper", "electronic"].includes(input.mode),
    "Ngày nhận, hình thức hoặc số người chia phí không hợp lệ.",
  );
  assert(
    input.inventory.trim().length >= 3 &&
      [input.electricityMeter, input.waterMeter].every(
        (x) => Number.isFinite(x) && x >= 0,
      ),
    "Cần ghi nhận tình trạng và chỉ số bàn giao mẫu hợp lệ.",
  );
  assert(
    cost(r, input.sharers).complete,
    "Chưa rõ phí. Hãy làm rõ chi phí trước khi thống nhất thuê.",
  );
  const duplicate = state.housing.stays.find(
    (x) =>
      x.roomId === physicalId(r) &&
      x.tenantId === TENANT &&
      !["ended", "rejected"].includes(x.status),
  );
  if (duplicate) return state;
  const s = structuredClone(state),
    id = crypto.randomUUID(),
    ownerId = roomAccess(s, physicalId(r)).managerId;
  const stay: Stay = {
    id,
    roomId: physicalId(r),
    listingId: r.id,
    tenantId: TENANT,
    ownerId,
    tenantName: s.name,
    plannedDate: input.plannedDate,
    status: "requested",
    accepted: [a],
    handover: [],
    exitConfirmed: [],
    snapshot: structuredClone(r),
    sharers: input.sharers,
    contract: {
      version: 1,
      mode: input.mode,
      text: `Bản thỏa thuận demo: ${r.title}; tiền phòng ${r.price}đ/tháng; ${input.sharers} người chia phí; thuê tối thiểu ${r.leaseMonths || 6} tháng. ${r.rules || "Chưa khai nội quy"}. Hoàn cọc: ${r.refundTerms || "Hai bên đối chiếu khi bàn giao lại"}. Không phải chữ ký hoặc hợp đồng có hiệu lực thật.`,
    },
    inventory: input.inventory,
    electricityMeter: input.electricityMeter,
    waterMeter: input.waterMeter,
    deposit: {
      amount: cost(r, input.sharers).deposit,
      payment: "unpaid",
      deduction: 0,
      reason: "",
      response: "none",
      refund: "pending",
    },
  };
  s.housing.stays.push(stay);
  event(
    s,
    `request:${id}`,
    stay.roomId,
    "Yêu cầu thuê",
    "Tạo thỏa thuận mẫu, chưa vào ở",
  );
  notify(
    s,
    `request:${id}`,
    [TENANT, ownerId],
    "Có yêu cầu thuê cần kiểm tra và thống nhất.",
  );
  return s;
}
export function agreeStay(state: DemoState, id: string) {
  const original = stayAccess(state, id);
  if (
    original.status === "handover" ||
    ["active", "leaving", "ended"].includes(original.status)
  )
    return state;
  assert(original.status === "requested", "Yêu cầu không còn chờ thống nhất.");
  const s = structuredClone(state),
    x = stayAccess(s, id),
    a = actorId(s);
  if (!x.accepted.includes(a)) x.accepted.push(a);
  if (x.accepted.includes(x.tenantId) && x.accepted.includes(x.ownerId)) {
    x.status = "handover";
    event(
      s,
      `agree:${id}`,
      x.roomId,
      "Thống nhất thuê",
      "Hai bên đồng ý phiên bản 1, chờ nhận phòng",
    );
    notify(
      s,
      `agree:${id}`,
      [x.tenantId, x.ownerId],
      "Đã thống nhất thuê. Cần xác nhận bàn giao hai bên.",
    );
  }
  return s;
}
export function handoverStay(state: DemoState, id: string, actualDate: string) {
  const o = stayAccess(state, id);
  if (["active", "leaving", "ended"].includes(o.status)) return state;
  assert(
    o.status === "handover" && date(actualDate),
    "Cần thống nhất thuê và khai ngày nhận thực tế.",
  );
  assert(
    occupancy(state, o.roomId).available > 0 &&
      o.sharers <= occupancy(state, o.roomId).capacity,
    "Phòng đã đủ người, không thể nhận thêm.",
  );
  const s = structuredClone(state),
    x = stayAccess(s, id),
    a = actorId(s);
  if (x.handover.length)
    assert(
      x.moveInDate === actualDate,
      "Hai bên cần xác nhận cùng ngày nhận thực tế.",
    );
  x.moveInDate = actualDate;
  if (!x.handover.includes(a)) x.handover.push(a);
  if (x.handover.includes(x.tenantId) && x.handover.includes(x.ownerId)) {
    x.status = "active";
    x.verificationSource = "two-sided";
    syncCapacity(s, x.roomId);
    event(
      s,
      `handover:${id}`,
      x.roomId,
      "Bàn giao",
      "Hai bên xác nhận nhận phòng thực tế (demo)",
    );
    notify(
      s,
      `handover:${id}`,
      [x.tenantId, x.ownerId],
      "Đã nhận phòng. Số người ở được cập nhật một lần.",
    );
  }
  return s;
}
export function requestExit(
  state: DemoState,
  id: string,
  actualDate: string,
  reason: string,
) {
  const o = stayAccess(state, id);
  if (["leaving", "ended"].includes(o.status)) return state;
  assert(
    o.status === "active" &&
      date(actualDate) &&
      actualDate >= (o.moveInDate || o.plannedDate) &&
      reason.trim(),
    "Ngày rời hoặc lý do chưa hợp lệ.",
  );
  const s = structuredClone(state),
    x = stayAccess(s, id);
  x.status = "leaving";
  x.moveOutDate = actualDate;
  x.exitReason = reason;
  x.exitConfirmed = [actorId(s)];
  notify(
    s,
    `exit:${id}`,
    [x.tenantId, x.ownerId],
    "Có yêu cầu trả phòng cần bên còn lại xác nhận.",
  );
  return s;
}
function endStay(s: DemoState, x: Stay) {
  x.status = "ended";
  roomAccess(s, x.roomId).allowedRecruiters = roomAccess(
    s,
    x.roomId,
  ).allowedRecruiters.filter((id) => id !== x.tenantId);
  event(
    s,
    `ended:${x.id}`,
    x.roomId,
    "Kết thúc lượt ở",
    x.exitReason || "Admin xác nhận bằng chứng rời phòng",
  );
  notify(
    s,
    `ended:${x.id}`,
    [x.tenantId, x.ownerId],
    "Lượt ở kết thúc, lịch sử được giữ. Người thuê có thể đánh giá; cọc đối chiếu riêng.",
  );
  if (
    s.profile.roomId === x.roomId ||
    s.listings.some(
      (r) => r.id === s.profile.roomId && physicalId(r) === x.roomId,
    )
  )
    s.profile.visible = false;
}
export function confirmExit(state: DemoState, id: string) {
  const o = stayAccess(state, id);
  if (o.status === "ended") return state;
  assert(o.status === "leaving", "Chưa có yêu cầu rời phòng.");
  const s = structuredClone(state),
    x = stayAccess(s, id),
    a = actorId(s);
  if (!x.exitConfirmed.includes(a)) x.exitConfirmed.push(a);
  if (
    x.exitConfirmed.includes(x.tenantId) &&
    x.exitConfirmed.includes(x.ownerId)
  )
    endStay(s, x);
  return s;
}
export function recruitingAllowed(
  s: DemoState,
  roomId: string,
  accountId = TENANT,
) {
  const r = s.housing.rooms.find((x) => x.id === roomId);
  return (
    !!r &&
    r.capacity > 1 &&
    occupancy(s, roomId).available > 0 &&
    s.housing.stays.some(
      (x) =>
        x.roomId === roomId &&
        x.tenantId === accountId &&
        x.status === "active",
    ) &&
    (r.roommatePolicy === "open" || r.allowedRecruiters.includes(accountId))
  );
}
export function requestRecruiting(state: DemoState, roomId: string) {
  const a = access(state);
  assert(
    state.housing.stays.some(
      (x) => x.roomId === roomId && x.tenantId === a && x.status === "active",
    ),
    "Chỉ người đang ở đã xác nhận được yêu cầu tuyển thêm.",
  );
  assert(
    occupancy(state, roomId).available > 0 &&
      roomAccess(state, roomId).capacity > 1,
    "Phòng đã đủ hoặc chỉ có một chỗ.",
  );
  const stay = state.housing.stays.find(
    (x) => x.roomId === roomId && x.tenantId === a && x.status === "active",
  )!;
  if (
    state.housing.permissions.some(
      (p) =>
        p.roomId === roomId &&
        p.stayId === stay.id &&
        p.tenantId === a &&
        p.status !== "rejected",
    )
  )
    return state;
  const s = structuredClone(state),
    id = crypto.randomUUID();
  s.housing.permissions.push({
    id,
    roomId,
    tenantId: a,
    stayId: stay.id,
    status: "pending",
  });
  notify(
    s,
    `permission:${id}`,
    [roomAccess(s, roomId).managerId],
    "Người đang ở xin phép tuyển roommate.",
  );
  return s;
}
export function decideRecruiting(
  state: DemoState,
  id: string,
  accept: boolean,
) {
  const a = access(state),
    p = state.housing.permissions.find((x) => x.id === id);
  assert(
    p && roomAccess(state, p.roomId).managerId === a,
    "Chỉ người quản lý phòng quyết định yêu cầu này.",
  );
  if (p.status !== "pending") return state;
  assert(
    !accept ||
      (occupancy(state, p.roomId).available > 0 &&
        state.housing.stays.some(
          (x) =>
            x.id === p.stayId &&
            x.roomId === p.roomId &&
            x.tenantId === p.tenantId &&
            x.status === "active",
        )),
    "Không còn chỗ hoặc người yêu cầu đã rời.",
  );
  const s = structuredClone(state),
    q = s.housing.permissions.find((x) => x.id === id)!;
  q.status = accept ? "accepted" : "rejected";
  if (accept) roomAccess(s, q.roomId).allowedRecruiters.push(q.tenantId);
  event(
    s,
    `permission:${id}`,
    q.roomId,
    "Quyền ở ghép",
    accept
      ? "Đồng ý tuyển thêm trong phạm vi chỗ trống"
      : "Không đồng ý tuyển thêm",
  );
  notify(
    s,
    `permission:${id}`,
    [q.tenantId],
    accept
      ? "Đã được phép mở tìm roommate."
      : "Yêu cầu tuyển roommate chưa được chấp thuận.",
  );
  return s;
}
export function setRoomPolicy(
  state: DemoState,
  id: string,
  policy: "closed" | "approval" | "open",
  external: number,
) {
  const a = access(state),
    r = roomAccess(state, id);
  assert(
    r.managerId === a && ["closed", "approval", "open"].includes(policy),
    "Không có quyền quản lý phòng.",
  );
  assert(
    Number.isInteger(external) &&
      external >= 0 &&
      external + occupancy(state, id).occupied - r.externalResidents <=
        r.capacity,
    "Số người ngoài hệ thống vượt sức chứa.",
  );
  const s = structuredClone(state),
    x = roomAccess(s, id);
  x.roommatePolicy = policy;
  x.externalResidents = external;
  if (policy === "closed") x.allowedRecruiters = [];
  syncCapacity(s, id);
  event(
    s,
    crypto.randomUUID(),
    id,
    "Cập nhật chỗ",
    `Chính sách ${{ closed: "chưa cho mở tìm", approval: "xin phép từng lần", open: "cho phép mở tìm khi còn chỗ" }[policy]}; ${external} khách ngoài hệ thống (không cấp review)`,
  );
  return s;
}
export function relistRoom(state: DemoState, id: string) {
  const a = access(state),
    old = state.listings.find((r) => r.id === id);
  assert(old && canManage(state, old), "Chỉ người quản lý được đăng lại.");
  assert(
    !["draft", "pending"].includes(old.status),
    "Hoàn tất đợt nháp/chờ duyệt hiện tại trước khi tạo đợt khác.",
  );
  assert(occupancy(state, physicalId(old)).available > 0, "Phòng đã đủ người.");
  assert(
    !state.listings.some(
      (r) =>
        r.id !== id &&
        physicalId(r) === physicalId(old) &&
        ["published", "pending", "draft"].includes(r.status),
    ),
    "Căn phòng đang có một đợt tuyển hoặc bản nháp khác.",
  );
  const s = structuredClone(state);
  s.listings = s.listings.map((r) =>
    physicalId(r) === physicalId(old) ? { ...r, status: "hidden" } : r,
  );
  const next = {
    ...structuredClone(old),
    id: crypto.randomUUID(),
    roomId: physicalId(old),
    ownerId: a,
    status: "draft" as const,
    updated: new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Ho_Chi_Minh",
    }).format(new Date()),
  };
  s.listings.push(next);
  event(
    s,
    `relist:${next.id}`,
    physicalId(old),
    "Đăng lại",
    "Tạo đợt mới, giữ mã phòng, lượt ở và review",
  );
  return s;
}
function important(r: Listing) {
  return JSON.stringify([
    r.price,
    r.feeStates,
    r.rules,
    r.capacity,
    r.amenities,
    r.leaseMonths,
    r.location,
    r.depositMonths,
    r.advanceMonths,
    r.refundTerms,
    r.conditionalFees,
    r.kind,
    r.floor,
    r.view,
    r.roomNoise,
    r.image,
  ]);
}
function listingSummary(r: Listing) {
  return `Giá phòng ${r.price.toLocaleString("vi-VN")}đ/tháng; sức chứa ${r.capacity} người; thuê tối thiểu ${r.leaseMonths || "chưa rõ"} tháng; cọc ${r.depositMonths ?? 1} tháng; trả trước ${r.advanceMonths ?? 1} tháng. Tiện nghi: ${r.amenities.join(", ") || "chưa khai"}. Nội quy: ${r.rules || "chưa khai"}. Phí: ${feeKeys
    .map((k) => {
      const f = fee(r, k);
      return `${feeLabels[k]}: ${feeStatusLabels[f.status]}${f.status === "charged" ? " " + f.amount + "đ" : f.status === "included" ? " trong " + (f.includedIn || "chưa rõ khoản") : ""}`;
    })
    .join("; ")}.`;
}
export function saveListing(state: DemoState, listing: Listing) {
  const a = access(state),
    old = state.listings.find((r) => r.id === listing.id);
  assert(!old || canManage(state, old), "Bạn không có quyền sửa tin này.");
  assert(a !== ADMIN, "Admin duyệt tin, không sửa thay nội dung người đăng.");
  assert(
    listing.status === "draft" || listing.status === "pending",
    "Gửi tin qua bước nháp hoặc chờ duyệt.",
  );
  if (listing.status === "pending")
    assert(
      canSubmit(listing),
      "Tin còn thiếu thông tin tối thiểu hoặc trạng thái phí.",
    );
  if (old && important(old) !== important(listing))
    assert(listing.note?.trim(), "Thay đổi quan trọng cần ghi lý do cập nhật.");
  assert(
    Number.isFinite(listing.price) &&
      Number.isFinite(listing.size) &&
      (listing.depositMonths ?? 0) >= 0,
    "Bản nháp chấp nhận thiếu thông tin nhưng số tiền/diện tích phải là số hợp lệ, cọc không âm.",
  );
  const s = structuredClone(state),
    r = {
      ...structuredClone(listing),
      roomId: old ? physicalId(old) : listing.id,
      ownerId: old?.ownerId || a,
      updated: new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Ho_Chi_Minh",
      }).format(new Date()),
      verification: old?.verification || {
        contact: !!state.identity?.otp,
        identity: !!state.identity?.verified,
        rentalRight: false,
        checkedAt: now(),
      },
    };
  if (!s.housing.rooms.some((x) => x.id === physicalId(r)))
    s.housing.rooms.push({
      id: physicalId(r),
      managerId: a,
      capacity: r.capacity,
      externalResidents: 0,
      roommatePolicy: "approval",
      allowedRecruiters: [],
    });
  const physical = roomAccess(s, physicalId(r));
  assert(
    r.capacity >= occupancy(s, physical.id).occupied,
    "Không thể giảm sức chứa dưới số người đang ở.",
  );
  physical.capacity = r.capacity;
  s.listings = old
    ? s.listings.map((x) => (x.id === r.id ? r : x))
    : [...s.listings, r];
  if (!old || important(old) !== important(r)) {
    const version = crypto.randomUUID();
    s.housing.versions.push({
      id: version,
      listingId: r.id,
      roomId: physical.id,
      date: now(),
      snapshot: structuredClone(r),
    });
    event(
      s,
      version,
      physical.id,
      "Đổi thông tin tin đăng",
      r.note?.trim() ||
        "Cập nhật giá chào/thông tin; không thay điều kiện lượt ở",
      old ? listingSummary(old) : undefined,
      listingSummary(r),
    );
    notify(
      s,
      version,
      [
        ...s.housing.stays
          .filter(
            (x) =>
              x.roomId === physical.id &&
              ["active", "leaving"].includes(x.status),
          )
          .map((x) => x.tenantId),
        ...s.housing.follows
          .filter((x) => x.roomId === physical.id)
          .map((x) => x.accountId),
        ...(s.saved.includes(r.id) ? [TENANT] : []),
      ],
      `Tin phòng thay đổi: giá chào ${r.price}đ. Giá lượt ở đã thống nhất không tự đổi.`,
      "/phong/" + r.id,
    );
  }
  delete s.housing.listingDrafts[a];
  return s;
}
export function publishListing(state: DemoState, id: string, reason: string) {
  assert(access(state) === ADMIN, "Chỉ Admin demo được duyệt.");
  const r = state.listings.find((x) => x.id === id);
  assert(
    r &&
      r.status === "pending" &&
      canSubmit(r) &&
      r.verification?.contact &&
      r.verification?.identity &&
      reason.trim(),
    "Cần tin chờ duyệt đủ thông tin, xác minh mẫu và lý do duyệt.",
  );
  assert(occupancy(state, physicalId(r)).available > 0, "Phòng đã đủ người.");
  const s = structuredClone(state),
    x = s.listings.find((x) => x.id === id)!;
  x.status = "published";
  x.note = reason;
  x.verification = { ...x.verification!, rentalRight: true, checkedAt: now() };
  event(
    s,
    `publish:${id}:${s.housing.versions.filter((v) => v.listingId === id).length}`,
    physicalId(x),
    "Duyệt mẫu",
    reason,
  );
  return s;
}
export function followRoom(state: DemoState, roomId: string) {
  const a = access(state),
    s = structuredClone(state);
  const found = s.housing.follows.some(
    (f) => f.roomId === roomId && f.accountId === a,
  );
  s.housing.follows = found
    ? s.housing.follows.filter((f) => f.roomId !== roomId || f.accountId !== a)
    : [...s.housing.follows, { roomId, accountId: a }];
  return s;
}
export function readNotice(state: DemoState, id: string) {
  const a = access(state);
  const s = structuredClone(state);
  s.housing.notifications = s.housing.notifications.map((n) =>
    n.id === id && n.recipient === a ? { ...n, read: true } : n,
  );
  return s;
}
export function proposeChange(
  state: DemoState,
  id: string,
  price: number,
  effective: string,
  reason: string,
) {
  const x = stayAccess(state, id);
  assert(
    actorId(state) === x.ownerId &&
      x.status === "active" &&
      price >= 100000 &&
      Number.isFinite(price) &&
      date(effective) &&
      effective >= (x.moveInDate || x.plannedDate) &&
      reason.trim(),
    "Đề xuất cần chủ phòng, giá, ngày áp dụng và lý do hợp lệ.",
  );
  if (
    state.housing.changes.some(
      (c) =>
        c.stayId === id &&
        c.price === price &&
        c.date === effective &&
        c.reason.trim() === reason.trim() &&
        c.status !== "rejected",
    )
  )
    return state;
  const s = structuredClone(state),
    changeId = crypto.randomUUID();
  s.housing.changes.push({
    id: changeId,
    stayId: id,
    price,
    date: effective,
    reason,
    status: "proposed",
  });
  notify(
    s,
    changeId,
    [x.tenantId],
    "Có đề xuất thay giá lượt ở. Đã đọc không có nghĩa đồng ý.",
  );
  return s;
}
export function respondChange(state: DemoState, id: string, agree: boolean) {
  const c = state.housing.changes.find((x) => x.id === id);
  assert(c, "Không tìm thấy đề xuất.");
  const x = stayAccess(state, c.stayId);
  assert(
    actorId(state) === x.tenantId && x.status === "active",
    "Chỉ người đang ở phản hồi đề xuất.",
  );
  if (c.status !== "proposed") return state;
  const s = structuredClone(state);
  s.housing.changes.find((x) => x.id === id)!.status = agree
    ? "accepted"
    : "rejected";
  event(
    s,
    `change:${id}`,
    x.roomId,
    "Phản hồi thay đổi",
    `${agree ? "Đồng ý" : "Không đồng ý"}: ${c.reason}; từ ${c.date}`,
    String(x.snapshot.price),
    String(c.price),
  );
  notify(
    s,
    id,
    [x.ownerId],
    agree
      ? "Người thuê đồng ý đề xuất giá."
      : "Người thuê chưa đồng ý đề xuất giá.",
  );
  return s;
}
export function termsFor(s: DemoState, x: Stay, period: string) {
  const c = s.housing.changes
    .filter(
      (c) =>
        c.stayId === x.id &&
        c.status === "accepted" &&
        c.date <= period + "-01",
    )
    .sort((a, b) => b.date.localeCompare(a.date))[0];
  return {
    ...structuredClone(x.snapshot),
    price: c?.price ?? x.snapshot.price,
  };
}
export function createBill(
  state: DemoState,
  id: string,
  period: string,
  kwh: number,
  vehicles: number,
  adjustment: number,
  reason: string,
  due: string,
) {
  const x = stayAccess(state, id);
  assert(
    actorId(state) === x.ownerId &&
      ["active", "leaving"].includes(x.status) &&
      /^\d{4}-(0[1-9]|1[0-2])$/.test(period) &&
      date(due),
    "Chủ phòng lập bảng phí cho lượt đang ở với kỳ và hạn trả hợp lệ.",
  );
  assert(
    period >= (x.moveInDate || x.plannedDate).slice(0, 7),
    "Kỳ phí không trước ngày vào ở.",
  );
  assert(
    Number.isFinite(adjustment) && (!adjustment || reason.trim()),
    "Điều chỉnh cần số tiền và lý do.",
  );
  if (state.housing.bills.some((b) => b.stayId === id && b.period === period))
    return state;
  const terms = termsFor(state, x, period),
    total = cost(terms, x.sharers, kwh, vehicles).total + adjustment;
  assert(total >= 0, "Tổng kỳ phí không thể âm.");
  const s = structuredClone(state),
    billId = `bill:${id}:${period}`;
  s.housing.bills.push({
    id: billId,
    stayId: id,
    period,
    due,
    total,
    kwh,
    vehicles,
    adjustment,
    reason,
    terms,
    status: "unpaid",
  });
  notify(s, billId, [x.tenantId], `Có bảng phí tháng ${period} cần kiểm tra.`);
  return s;
}
export function setPayment(
  state: DemoState,
  id: string,
  target: "bill" | "deposit",
  status: PaymentStatus,
  method = "Chuyển khoản mẫu",
) {
  const bill =
    target === "bill"
      ? state.housing.bills.find((b) => b.id === id)
      : undefined;
  const x = stayAccess(state, bill?.stayId || id),
    a = actorId(state);
  assert(target !== "bill" || bill, "Không tìm thấy bảng phí.");
  const current = bill?.status || x.deposit.payment;
  if (current === status) return state;
  assert(
    (a === x.tenantId &&
      ["unpaid", "disputed"].includes(current) &&
      status === "declared") ||
      (a === x.ownerId &&
        ["declared", "checking"].includes(current) &&
        ["checking", "received", "disputed"].includes(status)),
    "Không có quyền hoặc bước thanh toán chưa hợp lệ.",
  );
  assert(
    ["Chuyển khoản mẫu", "Tiền mặt mẫu"].includes(method),
    "Chọn phương thức mẫu hợp lệ.",
  );
  const actualMethod =
    a === x.ownerId ? bill?.method || x.deposit.method || method : method;
  const s = structuredClone(state);
  if (bill) {
    const b = s.housing.bills.find((b) => b.id === id)!;
    b.status = status;
    b.method = actualMethod;
  } else {
    const d = s.housing.stays.find((v) => v.id === x.id)!.deposit;
    d.payment = status;
    d.method = actualMethod;
  }
  notify(
    s,
    `payment:${target}:${id}:${status}`,
    [x.tenantId, x.ownerId],
    `Thanh toán mẫu: ${{ unpaid: "chưa thanh toán", declared: "người thuê khai đã trả", checking: "chờ xác nhận/đối chiếu", received: "người nhận xác nhận", disputed: "có bất đồng" }[status]}. Không có xác nhận ngân hàng.`,
  );
  return s;
}
export function proposeDeduction(
  state: DemoState,
  id: string,
  amount: number,
  reason: string,
) {
  const x = stayAccess(state, id);
  assert(
    actorId(state) === x.ownerId &&
      ["leaving", "ended"].includes(x.status) &&
      x.deposit.payment === "received" &&
      x.deposit.refund === "pending" &&
      Number.isFinite(amount) &&
      amount >= 0 &&
      amount <= x.deposit.amount &&
      reason.trim(),
    "Khấu trừ cần cọc đã nhận, số tiền trong hạn, lý do và chưa khai hoàn tiền.",
  );
  const s = structuredClone(state),
    d = s.housing.stays.find((x) => x.id === id)!.deposit;
  d.deduction = amount;
  d.reason = reason;
  d.response = "none";
  notify(
    s,
    `deduction:${id}:${amount}:${reason}`,
    [x.tenantId],
    "Có đề xuất đối chiếu cọc, cần phản hồi.",
  );
  return s;
}
export function respondDeposit(state: DemoState, id: string, agree: boolean) {
  const x = stayAccess(state, id);
  assert(
    actorId(state) === x.tenantId &&
      x.deposit.reason &&
      x.deposit.refund === "pending",
    "Chỉ người thuê phản hồi đề xuất cọc.",
  );
  const s = structuredClone(state);
  s.housing.stays.find((x) => x.id === id)!.deposit.response = agree
    ? "accepted"
    : "disputed";
  return s;
}
export function refundDeposit(state: DemoState, id: string) {
  const x = stayAccess(state, id),
    a = actorId(state);
  assert(
    x.status === "ended" && x.deposit.response === "accepted",
    "Cần kết thúc lượt ở và thống nhất đối chiếu cọc.",
  );
  if (x.deposit.refund === "received") return state;
  assert(
    (a === x.ownerId && x.deposit.refund === "pending") ||
      (a === x.tenantId && x.deposit.refund === "declared"),
    "Chủ phòng khai hoàn, người thuê xác nhận đã nhận.",
  );
  const s = structuredClone(state);
  s.housing.stays.find((x) => x.id === id)!.deposit.refund =
    a === x.ownerId ? "declared" : "received";
  return s;
}
export function saveReview(
  state: DemoState,
  id: string,
  stars: number,
  criteria: number[],
  text: string,
) {
  const x = stayAccess(state, id);
  assert(
    actorId(state) === x.tenantId &&
      x.status === "ended" &&
      ((x.handover.includes(x.tenantId) && x.handover.includes(x.ownerId)) ||
        x.verificationSource === "admin-sample"),
    "Chỉ người có lượt ở đã xác nhận và kết thúc được đánh giá.",
  );
  assert(
    Number.isInteger(stars) &&
      stars >= 1 &&
      stars <= 5 &&
      criteria.length === 4 &&
      criteria.every((x) => Number.isInteger(x) && x >= 1 && x <= 5) &&
      text.trim().length >= 10 &&
      text.length <= 1500,
    "Đánh giá cần 1–5 sao, bốn tiêu chí và nhận xét 10–1500 ký tự.",
  );
  const s = structuredClone(state),
    old = s.housing.reviews.find(
      (r) => r.stayId === id && r.tenantId === x.tenantId,
    );
  if (old) {
    if (
      old.text === text &&
      old.stars === stars &&
      JSON.stringify(old.criteria) === JSON.stringify(criteria)
    )
      return state;
    old.stars = stars;
    old.criteria = criteria;
    old.text = text;
    old.edits++;
    old.date = now();
  } else
    s.housing.reviews.push({
      id: `review:${id}:${x.tenantId}`,
      roomId: x.roomId,
      stayId: id,
      tenantId: x.tenantId,
      name: x.tenantName,
      stars,
      criteria,
      text,
      date: now(),
      reply: "",
      hidden: false,
      edits: 0,
    });
  event(
    s,
    `review:${id}:${old?.edits || 0}`,
    x.roomId,
    "Đánh giá",
    old
      ? "Cập nhật nhận xét, không tăng số lượt"
      : "Đánh giá từ lượt ở đã kết thúc",
  );
  return s;
}
export function replyReview(state: DemoState, id: string, text: string) {
  const a = access(state),
    r = state.housing.reviews.find((x) => x.id === id);
  assert(
    r &&
      roomAccess(state, r.roomId).managerId === a &&
      text.trim().length >= 5 &&
      text.length <= 1000,
    "Chỉ người quản lý trả lời, không sửa/xóa review.",
  );
  const s = structuredClone(state);
  s.housing.reviews.find((x) => x.id === id)!.reply = text;
  return s;
}
export function createCase(
  state: DemoState,
  type: HousingState["cases"][number]["type"],
  target: string,
  evidence: string,
) {
  const a = access(state);
  assert(
    evidence.trim().length >= 10 && evidence.length <= 2000,
    "Cần mô tả và bằng chứng mẫu ít nhất 10 ký tự, không nhập giấy tờ thật.",
  );
  assert(
    (type === "review" && state.housing.reviews.some((r) => r.id === target)) ||
      (type === "trust" && state.housing.rooms.some((r) => r.id === target)) ||
      (["residency", "exit", "deposit"].includes(type) &&
        state.housing.stays.some(
          (x) => x.id === target && [x.tenantId, x.ownerId].includes(a),
        )),
    "Đối tượng vụ việc không hợp lệ hoặc không thuộc quyền của bạn.",
  );
  if (
    state.housing.cases.some(
      (c) =>
        c.type === type &&
        c.target === target &&
        c.requester === a &&
        ["new", "more"].includes(c.status),
    )
  )
    return state;
  const s = structuredClone(state),
    id = crypto.randomUUID();
  s.housing.cases.push({
    id,
    type,
    target,
    evidence,
    requester: a,
    status: "new",
    reason: "",
  });
  notify(s, id, [ADMIN], "Có vụ việc demo cần xem xét bằng chứng.", "/admin");
  return s;
}
export function decideCase(
  state: DemoState,
  id: string,
  decision: "more" | "accepted" | "rejected",
  reason: string,
  resolution?: { amount?: number; from?: string; to?: string },
) {
  assert(
    access(state) === ADMIN && reason.trim().length >= 5,
    "Chỉ Admin, cần lý do cụ thể.",
  );
  const o = state.housing.cases.find((c) => c.id === id);
  assert(
    o && ["new", "more"].includes(o.status),
    "Vụ việc đã đóng hoặc không tồn tại.",
  );
  const s = structuredClone(state),
    c = s.housing.cases.find((c) => c.id === id)!;
  c.status = decision;
  c.reason = reason;
  c.reviewer = ADMIN;
  c.decidedAt = now();
  let roomId = "";
  if (decision === "accepted") {
    if (c.type === "review") {
      const r = s.housing.reviews.find((r) => r.id === c.target)!;
      r.hidden = !r.hidden;
      roomId = r.roomId;
    } else if (c.type === "trust") {
      roomId = c.target;
      const amount = resolution?.amount;
      assert(
        Number.isInteger(amount) && Math.abs(amount!) <= 30,
        "Cần mức điều chỉnh H từ −30 đến 30, theo bằng chứng mẫu.",
      );
      s.housing.trustAdjustments.push({
        caseId: id,
        roomId,
        amount: amount!,
        reason,
      });
    } else {
      const x = s.housing.stays.find((x) => x.id === c.target)!;
      roomId = x.roomId;
      if (c.type === "deposit") {
        const amount = resolution?.amount;
        assert(
          Number.isFinite(amount) &&
            amount! >= 0 &&
            amount! <= x.deposit.amount &&
            x.deposit.refund === "pending",
          "Cần mức khấu trừ hợp lệ, trước khi khai hoàn cọc.",
        );
        x.deposit.deduction = amount!;
        x.deposit.reason = reason;
        x.deposit.response = "accepted";
      } else if (c.type === "exit") {
        assert(
          ["active", "leaving"].includes(x.status) &&
            date(resolution?.to || "") &&
            resolution!.to! >= (x.moveInDate || x.plannedDate),
          "Cần lượt ở hoạt động và ngày rời hợp lệ theo bằng chứng.",
        );
        x.moveOutDate = resolution!.to;
        x.exitReason = reason;
        endStay(s, x);
      } else {
        assert(
          ["requested", "handover"].includes(x.status) &&
            date(resolution?.from || "") &&
            date(resolution?.to || "") &&
            resolution!.from! <= resolution!.to!,
          "Cần ngày vào/rời theo bằng chứng và lượt cần đối chiếu.",
        );
        x.verificationSource = "admin-sample";
        x.moveInDate = resolution!.from;
        x.moveOutDate = resolution!.to;
        x.exitReason = reason;
        endStay(s, x);
      }
    }
  }
  event(
    s,
    `case:${id}:${decision}`,
    roomId,
    "Quyết định Admin",
    `${c.type}: ${reason}`,
  );
  notify(
    s,
    `case:${id}:${decision}`,
    [c.requester],
    `Kết quả xem xét: ${{ more: "cần bổ sung", accepted: "có căn cứ", rejected: "chưa đủ căn cứ" }[decision]}. ${reason}`,
  );
  return s;
}
export function supplementCase(state: DemoState, id: string, evidence: string) {
  const a = access(state),
    c = state.housing.cases.find((c) => c.id === id);
  assert(
    c &&
      c.requester === a &&
      c.status === "more" &&
      evidence.trim().length >= 10,
    "Chỉ người yêu cầu bổ sung bằng chứng cho vụ việc đang cần thêm thông tin.",
  );
  const s = structuredClone(state),
    x = s.housing.cases.find((c) => c.id === id)!;
  x.evidence += `\nBổ sung ${now()}: ${evidence}`;
  x.status = "new";
  notify(
    s,
    `supplement:${id}:${x.evidence.length}`,
    [ADMIN],
    "Vụ việc đã được bổ sung bằng chứng mẫu.",
    "/admin",
  );
  return s;
}

export function setListingStatus(
  state: DemoState,
  id: string,
  status: "pending" | "hidden" | "closed",
  reason: string,
) {
  const a = access(state),
    r = state.listings.find((x) => x.id === id);
  assert(
    r && canManage(state, r) && a !== ADMIN && reason.trim(),
    "Chỉ người quản lý thay trạng thái tin, cần lý do.",
  );
  if (r.status === status) return state;
  if (status === "pending")
    assert(canSubmit(r), "Cần đủ thông tin trước khi gửi duyệt.");
  const s = structuredClone(state);
  s.listings = s.listings.map((x) =>
    x.id === id ? { ...x, status, note: reason } : x,
  );
  event(
    s,
    `status:${id}:${status}:${s.housing.events.length}`,
    physicalId(r),
    "Trạng thái đợt tuyển",
    reason,
    statusLabels[r.status],
    statusLabels[status],
  );
  notify(
    s,
    `status:${id}:${status}:${s.housing.events.length}`,
    s.housing.follows
      .filter((f) => f.roomId === physicalId(r))
      .map((f) => f.accountId),
    `Đợt tuyển đã đổi trạng thái: ${status}.`,
    "/phong/" + id,
  );
  return s;
}
export function confirmAvailability(state: DemoState, id: string) {
  access(state);
  const r = state.listings.find((r) => r.id === id);
  assert(
    r &&
      canManage(state, r) &&
      r.status === "published" &&
      occupancy(state, physicalId(r)).available > 0,
    "Cần tin thuộc quyền, đang hiển thị và còn chỗ.",
  );
  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Ho_Chi_Minh",
  }).format(new Date());
  if (state.housing.events.some((e) => e.id === `availability:${id}:${today}`))
    return state;
  const s = structuredClone(state);
  s.listings = s.listings.map((x) =>
    x.id === id ? { ...x, updated: today } : x,
  );
  event(
    s,
    `availability:${id}:${today}`,
    physicalId(r),
    "Xác nhận còn chỗ",
    "Người quản lý xác nhận dữ liệu chỗ trên AnTro; không xác minh ngoài đời",
  );
  return s;
}
export function cancelStay(state: DemoState, id: string, reason: string) {
  const x = stayAccess(state, id);
  if (x.status === "rejected") return state;
  assert(
    ["requested", "handover"].includes(x.status) && reason.trim(),
    "Chỉ hủy trước nhận phòng, cần lý do.",
  );
  const s = structuredClone(state);
  s.housing.stays.find((x) => x.id === id)!.status = "rejected";
  event(s, `cancel:${id}`, x.roomId, "Hủy yêu cầu thuê", reason);
  notify(
    s,
    `cancel:${id}`,
    [x.tenantId, x.ownerId],
    `Yêu cầu thuê đã hủy trước khi vào ở. ${reason}`,
  );
  return s;
}
