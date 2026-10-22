"use client";
import Link from "next/link";
import { useState } from "react";
import { useDemo } from "@/shared/lib/demo-store";
import type { Listing } from "@/shared/lib/models";
import { cost, money } from "@/features/listings/lib/cost";
import { destinationCatalog } from "@/services/destinations";
import { distanceTo } from "@/services/geography";
import { validReviews } from "@/services/room-trust";
import * as h from "@/services/housing";
export const publicText = (text: string) =>
  text.replace(
    /[\w.+-]+@[\w.-]+\.[a-z]{2,}|(?:\+?84|0)[\d .()-]{7,17}\d/gi,
    "[liên hệ đã che]",
  );
export function RentalRequest({ room }: { room: Listing }) {
  const { data, command } = useDemo(),
    [done, setDone] = useState(false),
    [busy, setBusy] = useState(false);
  const counts = h.occupancy(data, h.physicalId(room));
  return (
    <section className="detail-section">
      <h2>Yêu cầu thuê và nhận phòng</h2>
      <p>
        {counts.available}/{counts.capacity} chỗ còn có thể tiếp nhận. Yêu cầu
        thuê chưa giữ chỗ.
      </p>
      {room.status !== "published" || !counts.available ? (
        <p className="warning">
          Tin đang{" "}
          {room.status === "rented" ? "đủ chỗ" : "không nhận khách mới"}. Link
          và lịch sử được giữ.
        </p>
      ) : data.status !== "active" ? (
        <Link
          className="btn outline"
          href={`/dang-nhap?next=${encodeURIComponent("/phong/" + room.id)}`}
        >
          Đăng nhập để tạo yêu cầu thuê
        </Link>
      ) : done ? (
        <p role="status">
          Đã lưu yêu cầu.{" "}
          <Link className="text-btn" href="/noi-o">
            Xem yêu cầu thuê
          </Link>
        </p>
      ) : (
        <details>
          <summary>Xem thông tin thuê</summary>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget);
              setBusy(true);
              const ok = await command((s) =>
                h.requestStay(s, room.id, {
                  plannedDate: String(f.get("date")),
                  sharers: Number(f.get("people")),
                  mode: String(f.get("mode")) as "paper" | "electronic",
                  inventory: String(f.get("inventory")),
                  electricityMeter: Number(f.get("electric")),
                  waterMeter: Number(f.get("water")),
                }),
              );
              setBusy(false);
              if (ok) setDone(true);
            }}
          >
            <p>
              Giá chào {money(room.price)}/phòng/tháng; bản phí và nội quy lúc
              gửi sẽ được giữ riêng. Chưa rõ phí thì cần làm rõ trước khi thống
              nhất.
            </p>
            <div className="form-grid">
              <label>
                Ngày nhận dự kiến
                <input
                  name="date"
                  type="date"
                  required
                  defaultValue="2026-11-01"
                />
              </label>
              <label>
                Số người chia phí
                <select name="people" defaultValue={Math.min(2, room.capacity)}>
                  {Array.from({ length: room.capacity }, (_, i) => (
                    <option key={i} value={i + 1}>
                      {i + 1} người · {money(cost(room, i + 1).total)}/người
                      (khoản đã biết)
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Hồ sơ hợp đồng mẫu
                <select name="mode">
                  <option value="paper">Đã ký giấy · bản tóm tắt mẫu</option>
                  <option value="electronic">Xác nhận điện tử mô phỏng</option>
                </select>
              </label>
              <label>
                Tình trạng và đồ dùng
                <input
                  name="inventory"
                  required
                  minLength={3}
                  defaultValue="Phòng, cửa sổ và thiết bị được ghi nhận theo mẫu"
                />
              </label>
              <label>
                Chỉ số điện khi nhận phòng
                <input
                  name="electric"
                  type="number"
                  required
                  min="0"
                  defaultValue="100"
                />
              </label>
              <label>
                Chỉ số nước khi nhận phòng
                <input
                  name="water"
                  type="number"
                  required
                  min="0"
                  defaultValue="10"
                />
              </label>
            </div>
            <p className="fineprint">
              Mỗi tài khoản chỉ được ghi nhận cho chính mình, không cấp lượt ở
              hoặc review cho cả nhóm. Hai phía sẽ kiểm tra lại ngày thực tế và
              bản bàn giao.
            </p>
            <button className="btn primary" disabled={busy}>
              Tạo yêu cầu thuê
            </button>
          </form>
        </details>
      )}
      <div className="inline-actions">
        <Link href="/noi-o" className="text-btn">
          Nơi ở của tôi
        </Link>
        {data.status === "active" && (
          <button
            className="text-btn"
            onClick={() => command((s) => h.followRoom(s, h.physicalId(room)))}
          >
            {data.housing.follows.some(
              (f) =>
                f.roomId === h.physicalId(room) &&
                f.accountId === h.actorId(data),
            )
              ? "Ngừng theo dõi thay đổi"
              : "Theo dõi thay đổi phòng"}
          </button>
        )}
      </div>
    </section>
  );
}
export function RoomHistory({ room }: { room: Listing }) {
  const { data, command } = useDemo(),
    reviews = validReviews(data, h.physicalId(room));
  return (
    <>
      <section className="detail-section">
        <h2>Điểm đến quanh phòng</h2>
        <p className="fineprint">
          Khoảng cách đường chim bay từ tọa độ mẫu, không phải quãng đường đi
          thực tế.
        </p>
        <ul className="simple-list">
          {destinationCatalog(data).map((p) => {
            const km = distanceTo(room, p.id, destinationCatalog(data));
            return (
              <li key={p.id}>
                {p.name}:{" "}
                {km === null
                  ? "Chưa có tọa độ để tính"
                  : `${km.toFixed(2)} km (mẫu)`}
              </li>
            );
          })}
        </ul>
      </section>
      <section className="detail-section">
        <h2>Đánh giá từ lượt ở đã kết thúc</h2>
        <p>
          {reviews.length} đánh giá từ hồ sơ mẫu; chưa phải phản hồi khách hàng
          thật.
        </p>
        {reviews.length === 0 ? (
          <p>Chưa có đánh giá đủ điều kiện.</p>
        ) : (
          reviews.map((r) => (
            <article className="public-review" key={r.id}>
              <h3>
                {publicText(r.name)} · {r.stars}/5 sao
              </h3>
              <p>{publicText(r.text)}</p>
              <small>
                {new Date(r.date).toLocaleDateString("vi-VN", {
                  timeZone: "Asia/Ho_Chi_Minh",
                })}{" "}
                ·{" "}
                {r.edits
                  ? `Đã chỉnh ${r.edits} lần, vẫn một lượt đánh giá`
                  : "Từ lượt ở đã xác nhận"}
              </small>
              {r.reply && <p>Người quản lý trả lời: {publicText(r.reply)}</p>}
              {data.status === "active" && (
                <details>
                  <summary>
                    {h.canManage(data, room)
                      ? "Trả lời hoặc kháng nghị"
                      : "Báo cáo đánh giá"}
                  </summary>
                  {h.canManage(data, room) && (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        const f = new FormData(e.currentTarget);
                        command((s) =>
                          h.replyReview(s, r.id, String(f.get("reply"))),
                        );
                      }}
                    >
                      <label>
                        Nội dung trả lời
                        <textarea
                          name="reply"
                          required
                          minLength={5}
                          maxLength={1000}
                          defaultValue={r.reply}
                        />
                      </label>
                      <button className="btn outline">
                        Lưu phản hồi của người quản lý
                      </button>
                    </form>
                  )}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const f = new FormData(e.currentTarget);
                      command((s) =>
                        h.createCase(
                          s,
                          "review",
                          r.id,
                          String(f.get("evidence")),
                        ),
                      );
                    }}
                  >
                    <label>
                      Căn cứ báo cáo/kháng nghị
                      <textarea
                        name="evidence"
                        minLength={10}
                        maxLength={2000}
                        required
                      />
                    </label>
                    <p>
                      Báo cáo không tự ẩn hoặc xóa review. Admin cần quyết định
                      có lý do.
                    </p>
                    <button className="text-btn">
                      Gửi Admin xem xét review
                    </button>
                  </form>
                </details>
              )}
            </article>
          ))
        )}
      </section>
      <section className="detail-section">
        <h2>Lịch sử căn phòng</h2>
        <p>
          Mã phòng: {h.physicalId(room)} ·{" "}
          {
            data.listings.filter((r) => h.physicalId(r) === h.physicalId(room))
              .length
          }{" "}
          đợt đăng. Không công khai hợp đồng, liên hệ hoặc danh sách cư dân.
        </p>
        <ol className="history-list">
          {data.housing.events
            .filter(
              (e) =>
                e.roomId === h.physicalId(room) &&
                [
                  "Đổi thông tin tin đăng",
                  "Đăng lại",
                  "Duyệt mẫu",
                  "Kết thúc lượt ở",
                  "Cập nhật chỗ",
                  "Trạng thái đợt tuyển",
                  "Xác nhận còn chỗ",
                ].includes(e.kind),
            )
            .map((e) => (
              <li key={e.id}>
                <b>{e.kind}</b> ·{" "}
                {new Date(e.date).toLocaleDateString("vi-VN", {
                  timeZone: "Asia/Ho_Chi_Minh",
                })}
                <p>{publicText(e.reason)}</p>
                {e.before && (
                  <details>
                    <summary>Trước / sau</summary>
                    <p>{publicText(e.before)}</p>
                    <p>{publicText(e.after || "")}</p>
                  </details>
                )}
              </li>
            ))}
        </ol>
      </section>
    </>
  );
}
