import type {
  Criterion,
  DemoState,
  Importance,
  Person,
  Profile,
} from "@/shared/lib/models";
import { people } from "@/features/roommatch/mocks/people";
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
function signals(a: Profile, b: Profile): Record<Criterion, number> {
  const overlap = Math.max(0, Math.min(a.max, b.max) - Math.max(a.min, b.min));
  const width = Math.min(a.max - a.min, b.max - b.min);
  return {
    area: a.area === b.area ? 1 : 0,
    budget:
      width === 0
        ? a.min <= b.max && b.min <= a.max
          ? 1
          : 0
        : overlap / width,
    lease: a.months === b.months ? 1 : 0.5,
    sleep:
      a.sleep === b.sleep
        ? 1
        : [a.sleep, b.sleep].includes("Bình thường")
          ? 0.8
          : 0.1,
    tidy: 1 - Math.abs(a.tidy - b.tidy) / 4,
    smoking: a.noSmoke && b.smoke ? 0 : 1,
    guests: 1 - Math.abs(a.guests - b.guests) / 3,
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
  if (a.gender !== b.gender) reasons.push("Khác giới tính tự khai");
  if (a.area !== b.area) reasons.push("Không giao khu vực");
  if (a.min > b.max || b.min > a.max) reasons.push("Không giao ngân sách");
  if (a.moveFrom > b.moveTo || b.moveFrom > a.moveTo)
    reasons.push("Không giao ngày vào ở");
  if (a.months !== b.months) reasons.push("Không khớp thời hạn");
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
      (a.importance[key] === "must" && ab[key] < 1) ||
      (b.importance[key] === "must" && ba[key] < 1)
    )
      reasons.push("Không đạt bắt buộc: " + labels[key]);
  return reasons;
}
export function compatibility(a: Profile, b: Profile) {
  if (incompatibilities(a, b).length) return null;
  const ab = directionalScore(a, b),
    ba = directionalScore(b, a);
  const scores = signals(a, b);
  const good = (Object.keys(scores) as Criterion[])
    .filter((k) => scores[k] >= 0.8)
    .sort((x, y) => weights[y] - weights[x])
    .slice(0, 3)
    .map((k) => labels[k] + ": phù hợp");
  const different = (Object.keys(scores) as Criterion[])
    .filter((k) => scores[k] < 0.8)
    .sort((x, y) => scores[x] - scores[y])
    .slice(0, 2)
    .map((k) => labels[k] + ": cần trao đổi thêm");
  return {
    score: ab === null || ba === null ? null : geometricScore(ab, ba),
    ab,
    ba,
    good,
    different,
  };
}
export function validateProfile(p: Profile, state?: DemoState) {
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
    p.moveFrom > p.moveTo
  )
    throw new Error("Khoảng ngày vào ở chưa hợp lệ.");
  if (
    p.scenario === "Đã có phòng" &&
    (!p.roomId ||
      !state?.listings.some(
        (r) => r.id === p.roomId && r.status === "published",
      ))
  )
    throw new Error("Hãy liên kết một phòng đang hiển thị.");
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
      (r) => r.id === owner.roomId && r.status === "published",
    );
    const seeker = owner === p ? state.profile : p;
    if (!room || room.capacity < 2) return false;
    const total = cost(room, room.capacity);
    if (
      !total.complete ||
      total.total > seeker.max ||
      (!room.pets && seeker.pets)
    )
      return false;
  }
  return true;
}
export function getDeck(state: DemoState, tab: string) {
  validateProfile(state.profile, state);
  return people
    .filter(
      (p) =>
        eligible(state, p) &&
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
      result: compatibility(state.profile, person)!,
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
  if (action === "pass")
    return { ...state, passed: [...new Set([...state.passed, id])] };
  if (state.likes.includes(id))
    return { ...state, likes: state.likes.filter((x) => x !== id) };
  const matchId = "match-" + id;
  return {
    ...state,
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
