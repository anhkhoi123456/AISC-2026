import { recruitingAllowed, physicalId, actorId, occupancy } from "./housing";
import type {
  Criterion,
  DemoState,
  Importance,
  Person,
  Profile,
} from "@/shared/lib/models";
import { people } from "@/features/roommatch/mocks/people";
import { feeAmount } from "@/features/listings/lib/fees";
import { cost } from "@/features/listings/lib/cost";
import { delay } from "./latency";
const weights: Record<Criterion, number> = {
  area: 20,
  budget: 20,
  lease: 10,
  sleep: 15,
  tidy: 10,
  smoking: 8,
  guests: 7,
  noise: 5,
  food: 3,
  pets: 2,
};
const labels: Record<Criterion, string> = {
  area: "Khu vực",
  budget: "Ngân sách",
  lease: "Thời hạn thuê",
  sleep: "Giờ ngủ",
  tidy: "Gọn gàng",
  smoking: "Hút thuốc",
  guests: "Khách đến chơi",
  noise: "Yên tĩnh",
  food: "Ăn uống",
  pets: "Thú cưng",
};
const multiplier: Record<Importance, number> = {
  must: 0,
  important: 1.5,
  normal: 1,
  ignore: 0,
};
export const geometricScore = (ab: number, ba: number) =>
  Math.round(Math.sqrt(ab * ba));
export function sharedAreas(a: Profile, b: Profile) {
  return a.areas.filter((x) => b.areas.includes(x));
}
function signals(a: Profile, b: Profile): Record<Criterion, number> {
  const overlap = Math.max(0, Math.min(a.max, b.max) - Math.max(a.min, b.min));
  const width = Math.min(a.max - a.min, b.max - b.min);
  return {
    area: sharedAreas(a, b).length / Math.max(1, a.areas.length),
    budget:
      width === 0
        ? a.min <= b.max && b.min <= a.max
          ? 1
          : 0
        : overlap / width,
    lease: a.months === b.months && a.monthsMax === b.monthsMax ? 1 : 0.5,
    sleep:
      a.sleep === b.sleep
        ? 1
        : [a.sleep, b.sleep].includes("Bình thường")
          ? 0.8
          : 0.1,
    tidy: 1 - Math.abs(a.tidy - b.tidy) / 4,
    smoking: a.noSmoke && b.smoke ? 0 : 1,
    guests: b.guests <= a.guestsMax ? 1 : 0,
    noise: a.quiet ? (b.noise === 1 ? 1 : b.noise === 2 ? 0.5 : 0) : 1,
    food: a.food === b.food ? 1 : 0.5,
    pets: !a.acceptPets && b.pets ? 0 : 1,
  };
}
export function directionalScore(a: Profile, b: Profile) {
  const values = signals(a, b);
  let numerator = 0,
    denominator = 0;
  for (const key of Object.keys(weights) as Criterion[]) {
    const w = weights[key] * multiplier[a.importance[key]];
    denominator += w;
    numerator += w * values[key];
  }
  return denominator === 0 ? null : (100 * numerator) / denominator;
}
export function incompatibilities(a: Profile, b: Profile) {
  const reasons: string[] = [];
  if (a.gender !== b.gender) reasons.push("Khác giới tính danh tính mẫu");
  if (!sharedAreas(a, b).length) reasons.push("Không giao khu vực");
  if (
    !sharedAreas(a, b).some(
      (x) =>
        a.commuteSamples[x] !== undefined &&
        b.commuteSamples[x] !== undefined &&
        a.commuteSamples[x] <= a.commuteMax &&
        b.commuteSamples[x] <= b.commuteMax,
    )
  )
    reasons.push("Không có cụm đạt giới hạn đi lại mẫu của cả hai");
  if (a.view && b.view && a.view !== b.view) reasons.push("Khác view bắt buộc");
  if (a.min > b.max || b.min > a.max) reasons.push("Không giao ngân sách");
  if (a.moveFrom > b.moveTo || b.moveFrom > a.moveTo)
    reasons.push("Không giao ngày vào ở");
  if (a.months > b.monthsMax || b.months > a.monthsMax)
    reasons.push("Không giao thời hạn");
  if (a.alcohol > b.alcoholMax || b.alcohol > a.alcoholMax)
    reasons.push("Vượt mức chấp nhận rượu bia");
  if (a.floorMin > b.floorMax || b.floorMin > a.floorMax)
    reasons.push("Không giao khoảng tầng mong muốn");
  if (a.scenario === "Đã có phòng" && b.scenario === "Đã có phòng")
    reasons.push("Cả hai đã có phòng");
  if ((a.noSmoke && b.smoke) || (b.noSmoke && a.smoke))
    reasons.push("Xung đột yêu cầu không hút thuốc");
  if ((!a.acceptPets && b.pets) || (!b.acceptPets && a.pets))
    reasons.push("Xung đột yêu cầu thú cưng");
  const ab = signals(a, b),
    ba = signals(b, a);
  for (const key of Object.keys(weights) as Criterion[])
    if (
      (a.importance[key] === "must" &&
        (key === "budget"
          ? false
          : key === "area" || key === "lease"
            ? ab[key] <= 0
            : ab[key] < 1)) ||
      (b.importance[key] === "must" &&
        (key === "budget"
          ? false
          : key === "area" || key === "lease"
            ? ba[key] <= 0
            : ba[key] < 1))
    )
      reasons.push("Không đạt bắt buộc: " + labels[key]);
  return reasons;
}
export function compatibility(a: Profile, b: Profile) {
  if (incompatibilities(a, b).length) return null;
  const ab = directionalScore(a, b),
    ba = directionalScore(b, a);
  const scores = signals(a, b);
  const reverse = signals(b, a);
  const detail = (k: Criterion) => {
    const text =
      k === "area"
        ? `giao ${sharedAreas(a, b).join(", ")}; ưu tiên A: ${a.areas.join(" → ")}; B: ${b.areas.join(" → ")}`
        : k === "sleep"
          ? `${a.sleep} ↔ ${b.sleep}`
          : k === "budget"
            ? `${Math.max(a.min, b.min)}–${Math.min(a.max, b.max)} đ/người`
            : k === "lease"
              ? `${Math.max(a.months, b.months)}–${Math.min(a.monthsMax, b.monthsMax)} tháng`
              : k === "tidy"
                ? `${a.tidy}/5 ↔ ${b.tidy}/5`
                : k === "guests"
                  ? `tần suất ${a.guests}/${b.guests}; chấp nhận ${a.guestsMax}/${b.guestsMax}`
                  : k === "noise"
                    ? `mức ồn ${a.noise}/${b.noise}; cần yên tĩnh ${a.quiet ? "có" : "không"}/${b.quiet ? "có" : "không"}`
                    : k === "smoking"
                      ? `hút thuốc ${a.smoke ? "có" : "không"}/${b.smoke ? "có" : "không"}`
                      : k === "food"
                        ? `${a.food} ↔ ${b.food}`
                        : `nuôi thú ${a.pets ? "có" : "không"}/${b.pets ? "có" : "không"}`;
    return `${labels[k]}: ${text} · A→B ${Math.round(scores[k] * 100)}%, B→A ${Math.round(reverse[k] * 100)}%`;
  };
  const keys = Object.keys(scores) as Criterion[];
  const good = keys
    .filter((k) => Math.min(scores[k], reverse[k]) === 1)
    .sort((x, y) => weights[y] - weights[x])
    .slice(0, 3)
    .map(detail);
  const different = keys
    .filter((k) => Math.min(scores[k], reverse[k]) < 1)
    .sort(
      (x, y) =>
        Math.min(scores[x], reverse[x]) - Math.min(scores[y], reverse[y]),
    )
    .slice(0, 2)
    .map(detail);
  return {
    qualifies: true,
    score: ab === null || ba === null ? null : geometricScore(ab, ba),
    ab,
    ba,
    good,
    different,
    sharedAreas: sharedAreas(a, b),
    signals: scores,
    reverseSignals: reverse,
  };
}
export function validateProfile(p: Profile, state?: DemoState) {
  if (
    !p.areas.length ||
    p.areas.length > 5 ||
    new Set(p.areas).size !== p.areas.length
  )
    throw new Error("Chọn từ 1 đến 5 khu vực khác nhau.");
  if (
    p.months < 1 ||
    p.monthsMax < p.months ||
    p.floorMin > p.floorMax ||
    ![15, 30, 45, 60].includes(p.commuteMax)
  )
    throw new Error("Thời hạn, tầng hoặc thời gian di chuyển chưa hợp lệ.");
  if (
    p.areas.some(
      (x) => !Number.isFinite(p.commuteSamples[x]) || p.commuteSamples[x] < 0,
    )
  )
    throw new Error("Hãy khai thời gian di chuyển mẫu cho từng khu vực.");
  if (
    !["Đã có phòng", "Chưa có phòng"].includes(p.scenario) ||
    !["Nữ", "Nam"].includes(p.gender) ||
    !Number.isInteger(p.vacancies) ||
    p.vacancies < 1 ||
    !Number.isInteger(p.months) ||
    !Number.isInteger(p.monthsMax) ||
    p.monthsMax > 60 ||
    p.maxDepositMonths < 0 ||
    p.maxElectricity < 0 ||
    p.maxExtraFees < 0 ||
    p.interests.length > 5 ||
    p.bio.length > 300 ||
    [
      p.tidy,
      p.noise,
      p.guests,
      p.guestsMax,
      p.alcohol,
      p.alcoholMax,
      p.roomNoiseMax,
    ].some((x) => !Number.isInteger(x) || x < 1 || x > 5)
  )
    throw new Error("Các mức lựa chọn của hồ sơ chưa hợp lệ.");
  if (!p.name.trim() || !p.area || !p.gender || p.bio.trim().length < 10)
    throw new Error("Hãy điền đủ thông tin bắt buộc.");
  if (
    !Number.isSafeInteger(p.min) ||
    !Number.isSafeInteger(p.max) ||
    p.min < 0 ||
    p.max <= 0 ||
    p.min > p.max
  )
    throw new Error("Khoảng ngân sách chưa hợp lệ.");
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(p.moveFrom) ||
    !/^\d{4}-\d{2}-\d{2}$/.test(p.moveTo) ||
    Number.isNaN(Date.parse(p.moveFrom)) ||
    Number.isNaN(Date.parse(p.moveTo)) ||
    new Date(p.moveFrom).toISOString().slice(0, 10) !== p.moveFrom ||
    new Date(p.moveTo).toISOString().slice(0, 10) !== p.moveTo ||
    p.moveFrom > p.moveTo
  )
    throw new Error("Khoảng ngày vào ở chưa hợp lệ.");
  if (
    state?.identity?.verified &&
    (p.gender !== state.identity.gender || p.name !== state.identity.name)
  )
    throw new Error("Danh tính mẫu đã xác minh là chỉ đọc.");
  if (
    p.scenario === "Đã có phòng" &&
    (!p.roomId ||
      !state?.listings.some(
        (r) =>
          (physicalId(r) === p.roomId || r.id === p.roomId) &&
          r.status === "published",
      ))
  )
    throw new Error("Hãy liên kết một phòng đang hiển thị.");
  if (p.scenario === "Đã có phòng" && state) {
    const room = state.listings.find(
      (r) =>
        (physicalId(r) === p.roomId || r.id === p.roomId) &&
        r.status === "published",
    )!;
    if (!recruitingAllowed(state, physicalId(room), actorId(state)))
      throw Error(
        "Cần lượt ở đang hoạt động, chỗ trống và quyền tuyển roommate của phòng.",
      );
    if (!p.areas.includes(room.area))
      throw Error("Khu vực muốn ở phải chứa khu vực phòng liên kết.");
    if (
      p.vacancies >= room.capacity ||
      p.vacancies > occupancy(state, physicalId(room)).available
    )
      throw Error("Số chỗ tuyển không được vượt chỗ trống thực tế của phòng.");
  }
}
function eligible(state: DemoState, p: Person) {
  if (
    !p.visible ||
    state.blocked.includes(p.id) ||
    state.hiddenProfiles.includes(p.id) ||
    state.conversations.some((c) => c.id === "match-" + p.id && c.ended) ||
    !compatibility(state.profile, p)
  )
    return false;
  const owner =
    state.profile.scenario === "Đã có phòng"
      ? state.profile
      : p.scenario === "Đã có phòng"
        ? p
        : null;
  if (owner) {
    const room = state.listings.find(
      (r) =>
        (physicalId(r) === owner.roomId || r.id === owner.roomId) &&
        r.status === "published",
    );
    const seeker = owner === p ? state.profile : p;
    if (
      !room ||
      !recruitingAllowed(
        state,
        physicalId(room),
        owner === p ? p.id : actorId(state),
      ) ||
      room.capacity < 2 ||
      owner.vacancies < 1 ||
      owner.vacancies >= room.capacity ||
      owner.vacancies > occupancy(state, physicalId(room)).available
    )
      return false;
    if (
      !seeker.areas.includes(room.area) ||
      !owner.areas.includes(room.area) ||
      !sharedAreas(owner, seeker).includes(room.area)
    )
      return false;
    if (
      owner.commuteSamples[room.area] > owner.commuteMax ||
      seeker.commuteSamples[room.area] > seeker.commuteMax
    )
      return false;
    for (const requirements of [owner, seeker]) {
      if (
        room.floor === undefined ||
        room.floor < requirements.floorMin ||
        room.floor > requirements.floorMax ||
        (requirements.elevator && !room.elevator) ||
        (requirements.view && room.view !== requirements.view) ||
        room.roomNoise === undefined ||
        room.roomNoise > requirements.roomNoiseMax ||
        requirements.requiredAmenities.some(
          (x) => !room.amenities.includes(x),
        ) ||
        (room.depositMonths ?? 1) > requirements.maxDepositMonths ||
        (feeAmount(room, "electricity") ?? Infinity) >
          requirements.maxElectricity
      )
        return false;
    }
    if ((room.leaseMonths ?? 6) > Math.min(owner.monthsMax, seeker.monthsMax))
      return false;
    const total = cost(room, room.capacity - owner.vacancies + 1);
    if (
      !total.complete ||
      total.total > owner.max ||
      total.total < owner.min ||
      total.extras > owner.maxExtraFees ||
      total.total > seeker.max ||
      total.total < seeker.min ||
      total.extras > seeker.maxExtraFees ||
      (seeker.pets &&
        !(room.allowedPets ?? (room.pets ? ["cat", "dog"] : [])).includes(
          seeker.petType,
        ))
    )
      return false;
  }
  return true;
}
export function getDeck(state: DemoState, tab: string) {
  if (tab !== "matches") validateProfile(state.profile, state);
  return people
    .filter(
      (p) =>
        (tab === "matches"
          ? !state.blocked.includes(p.id) &&
            !state.hiddenProfiles.includes(p.id)
          : eligible(state, p)) &&
        (tab === "likes"
          ? state.likes.includes(p.id)
          : tab === "matches"
            ? state.conversations.some(
                (c) => c.id === "match-" + p.id && !c.ended,
              )
            : !state.passed.includes(p.id) && !state.likes.includes(p.id)),
    )
    .map((person) => ({
      person,
      result: compatibility(state.profile, person) ?? {
        qualifies: false,
        score: null,
        ab: null,
        ba: null,
        good: [],
        different: [
          "Nhu cầu hiện tại đã thay đổi; kết nối cũ được giữ để trao đổi lại.",
        ],
        sharedAreas: sharedAreas(state.profile, person),
        signals: signals(state.profile, person),
        reverseSignals: signals(person, state.profile),
      },
    }))
    .sort((a, b) => (b.result.score ?? 0) - (a.result.score ?? 0));
}
export function swipe(
  state: DemoState,
  id: string,
  action: "like" | "pass",
): DemoState {
  const p = people.find((p) => p.id === id);
  if (
    state.status !== "active" ||
    !state.profile.visible ||
    !p ||
    !eligible(state, p)
  )
    throw new Error("Hồ sơ không còn đáp ứng điều kiện kết nối.");
  const lastSwipe = {
    id,
    likes: [...state.likes],
    passed: [...state.passed],
    conversationIds: state.conversations.map((c) => c.id),
  };
  if (
    action === "pass" &&
    state.conversations.some((c) => c.id === "match-" + id && !c.ended)
  )
    throw new Error(
      "Hãy hủy Match trong hội thoại; bỏ qua không kết thúc một kết nối đang hoạt động.",
    );
  if (action === "pass")
    return {
      ...state,
      lastSwipe,
      likes: state.likes.filter((x) => x !== id),
      passed: [...new Set([...state.passed, id])],
    };
  if (state.likes.includes(id)) return state;
  const matchId = "match-" + id;
  return {
    ...state,
    lastSwipe,
    likes: [...state.likes, id],
    conversations:
      p.likesYou && !state.conversations.some((c) => c.id === matchId)
        ? [
            ...state.conversations,
            {
              id: matchId,
              name: p.name,
              avatar: p.avatar,
              type: "roommatch",
              ended: false,
              messages: [
                {
                  id: "hello-" + id,
                  text: "Chào bạn! Chúng mình cùng tìm hiểu về nơi ở tiếp theo nhé? (Tin nhắn mẫu)",
                  mine: false,
                  time: "09:30",
                },
              ],
            },
          ]
        : state.conversations,
  };
}
export function undoSwipe(s: DemoState): DemoState {
  const last = s.lastSwipe;
  if (!last) throw new Error("Không có lượt gần nhất để hoàn tác.");
  if (
    s.blocked.includes(last.id) ||
    s.conversations.some(
      (c) =>
        c.id === "match-" + last.id &&
        (c.ended || c.messages.some((m) => m.mine)),
    )
  )
    throw new Error("Không hoàn tác kết nối đã kết thúc hoặc đã gửi tin.");
  return {
    ...s,
    likes: last.likes,
    passed: last.passed,
    conversations: s.conversations.filter(
      (c) => last.conversationIds.includes(c.id) || c.id !== "match-" + last.id,
    ),
    lastSwipe: undefined,
  };
}
export const roommatchService = {
  async deck(s: DemoState, tab: string) {
    await delay();
    return getDeck(s, tab);
  },
  async interact(s: DemoState, id: string, action: "like" | "pass") {
    await delay();
    return swipe(s, id, action);
  },
};
