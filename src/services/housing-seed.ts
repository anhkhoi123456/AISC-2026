import type { Listing } from "@/shared/lib/models";
import type { Stay } from "@/features/housing/models";
import { createHousing, OWNER, physicalId } from "./housing";
export function seedHousing(listings: Listing[]) {
  const h = createHousing(listings),
    r = listings.find((r) => r.id === "phong-ban-cong");
  if (!r) return h;
  for (let i = 1; i <= 3; i++) {
    const id = `past-stay-${i}`,
      tenantId = `past-tenant-${i}`;
    const x: Stay = {
      id,
      roomId: physicalId(r),
      listingId: r.id,
      tenantId,
      ownerId: OWNER,
      tenantName: `Người ở mẫu ${i}`,
      plannedDate: "2026-01-01",
      moveInDate: "2026-01-01",
      moveOutDate: "2026-09-01",
      status: "ended",
      accepted: [tenantId, OWNER],
      handover: [tenantId, OWNER],
      exitConfirmed: [tenantId, OWNER],
      snapshot: structuredClone(r),
      sharers: 2,
      contract: {
        version: 1,
        mode: "paper",
        text: "Hồ sơ lịch sử giả lập dùng trình diễn quyền đánh giá; không phải hợp đồng thật.",
      },
      inventory: "Bàn giao mẫu đầy đủ",
      electricityMeter: 100,
      waterMeter: 10,
      deposit: {
        amount: r.price / 2,
        payment: "received",
        deduction: 0,
        reason: "Không khấu trừ mẫu",
        response: "accepted",
        refund: "received",
      },
    };
    h.stays.push(x);
    h.reviews.push({
      id: `past-review-${i}`,
      roomId: x.roomId,
      stayId: id,
      tenantId,
      name: x.tenantName,
      stars: i === 3 ? 5 : 4,
      criteria: [4, 4, 4, 4],
      text: [
        "Chi phí trong hồ sơ mẫu khớp khoản đã thống nhất. Đã nhận lại cọc theo ghi nhận mô phỏng.",
        "Phòng có cửa sổ và chỗ để xe theo dữ liệu mẫu. Cần trao đổi rõ giờ giấc trước khi ở.",
        "Bản ghi trải nghiệm mẫu từ lượt ở đã kết thúc; không phải phản hồi khách hàng thật.",
      ][i - 1],
      date: "2026-09-02",
      reply: "",
      hidden: false,
      edits: 0,
    });
  }
  // The existing RoomMatch character has a real modelled sample stay, never inferred from a Match.
  h.stays.push({
    ...structuredClone(h.stays[0]),
    id: "an-current-stay",
    tenantId: "an",
    tenantName: "Khánh An",
    status: "active",
    plannedDate: "2026-10-01",
    moveInDate: "2026-10-01",
    moveOutDate: undefined,
    accepted: ["an", OWNER],
    handover: ["an", OWNER],
    exitConfirmed: [],
  });
  const current = h.stays.at(-1)!;
  delete current.moveOutDate;
  current.deposit = {
    ...current.deposit,
    reason: "",
    response: "none",
    refund: "pending",
  };
  h.rooms.find((x) => x.id === r.id)!.allowedRecruiters = ["an"];
  return h;
}
