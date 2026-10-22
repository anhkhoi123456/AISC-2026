"use client";
import { MyHousingCases } from "./housing-admin";
import { DemoActors } from "./demo-actors";
export { DemoActors } from "./demo-actors";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useDemo } from "@/shared/lib/demo-store";
import { PageTitle, Empty } from "@/shared/components/ui";
import type { DemoState } from "@/shared/lib/models";
import type { Stay } from "../models";
import { money, cost } from "@/features/listings/lib/cost";
import * as h from "@/services/housing";
const paymentLabels = {
  unpaid: "Chưa thanh toán",
  declared: "Người thuê khai đã trả",
  checking: "Chờ xác nhận/đối chiếu",
  received: "Người nhận xác nhận",
  disputed: "Có bất đồng",
};
const stayLabels = {
  requested: "Chờ thống nhất thuê",
  handover: "Chờ nhận phòng",
  active: "Đang ở",
  leaving: "Chờ xác nhận rời phòng",
  ended: "Đã kết thúc",
  rejected: "Đã từ chối",
};
const formData = (e: FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  return new FormData(e.currentTarget);
};
const text = (f: FormData, k: string) => String(f.get(k) || "");
const num = (f: FormData, k: string) => Number(f.get(k));
export function HousingScreen() {
  const { data, ready } = useDemo();
  const [selected, setSelected] = useState("");
  if (!ready)
    return (
      <main className="container section" role="status">
        Đang tải hồ sơ nơi ở…
      </main>
    );
  const a = h.actorId(data),
    stays = data.housing.stays.filter((x) =>
      [x.tenantId, x.ownerId].includes(a),
    );
  return (
    <main className="container section">
      <PageTitle
        title="Nơi ở của tôi"
        description="Hồ sơ lưu trên thiết bị này, chưa có ký kết hoặc thanh toán thật."
      />
      <DemoActors />
      {data.status !== "active" ? (
        <Empty
          title="Đăng nhập để quản lý lượt ở"
          description="Hoàn tất hồ sơ trước khi gửi yêu cầu thuê."
          action={
            <Link href="/dang-nhap?next=%2Fnoi-o" className="btn primary">
              Đăng nhập
            </Link>
          }
        />
      ) : (
        <>
          <div className="inline-actions">
            <Link href="/tim-phong" className="text-btn">
              Tìm phòng
            </Link>
            <Link href="/quan-ly-tin" className="text-btn">
              Không gian người đăng
            </Link>
            <Link href="/thong-bao" className="text-btn">
              Thông báo
            </Link>
          </div>
          {!stays.length && (
            <p className="empty-state">
              Bạn chưa có lượt thuê. Mở trang phòng để gửi yêu cầu.
            </p>
          )}
          <label>
            Chọn lượt thuê
            <select
              value={selected}
              onChange={(e) => setSelected(e.target.value)}
            >
              <option value="">Tất cả lượt thuộc quyền</option>
              {stays.map((x) => (
                <option key={x.id} value={x.id}>
                  {x.snapshot.title} · {x.tenantName} · {stayLabels[x.status]}
                </option>
              ))}
            </select>
          </label>
          <MyHousingCases />
          <div className="stay-list">
            {stays
              .filter(
                (x) =>
                  !selected ||
                  !stays.some((y) => y.id === selected) ||
                  x.id === selected,
              )
              .map((x) => (
                <StayCard key={x.id} stay={x} />
              ))}
          </div>
        </>
      )}
    </main>
  );
}
function StayCard({ stay: x }: { stay: Stay }) {
  const { data, command } = useDemo(),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const actor = h.actorId(data),
    owner = actor === x.ownerId,
    counts = h.occupancy(data, x.roomId);
  async function act(fn: (s: DemoState) => DemoState) {
    setBusy(true);
    setError("");
    try {
      const ok = await command(fn);
      if (!ok)
        setError(
          "Chưa hoàn tất. Xem lý do thông báo và kiểm tra trạng thái trước khi thử lại.",
        );
    } finally {
      setBusy(false);
    }
  }
  const bills = data.housing.bills.filter((b) => b.stayId === x.id),
    review = data.housing.reviews.find(
      (r) => r.stayId === x.id && r.tenantId === x.tenantId,
    );
  return (
    <article className="stay-card" aria-label={`Lượt ở ${x.snapshot.title}`}>
      <header>
        <h2>{x.snapshot.title}</h2>
        <strong>{stayLabels[x.status]}</strong>
        <p>
          {x.tenantName} · {counts.occupied}/{counts.capacity} người đã ghi nhận
          · Mã phòng {x.roomId}
        </p>
      </header>
      {error && (
        <p role="alert" className="warning">
          {error}
        </p>
      )}
      <fieldset disabled={busy}>
        <legend className="sr-only">Thao tác lượt ở</legend>
        <p>
          Giá đã ghi nhận: <b>{money(x.snapshot.price)}/phòng/tháng</b> ·{" "}
          {x.sharers} người chia phí. Ngày dự kiến: {x.plannedDate}.{" "}
          {x.moveInDate && `Nhận thực tế: ${x.moveInDate}.`}{" "}
          {x.moveOutDate && `Rời: ${x.moveOutDate}.`}
        </p>
        <details>
          <summary>Hồ sơ và bàn giao · phiên bản {x.contract.version}</summary>
          <p>
            {x.contract.mode === "paper"
              ? "Tóm tắt hợp đồng giấy mẫu"
              : "Bản xác nhận điện tử mô phỏng"}
          </p>
          <p>{x.contract.text}</p>
          <p>
            Tình trạng: {x.inventory} · Điện {x.electricityMeter} · Nước{" "}
            {x.waterMeter}
          </p>
          <p>
            {x.verificationSource === "admin-sample"
              ? "Lượt ở do Admin đối chiếu bằng chứng mẫu."
              : `Xác nhận thỏa thuận: ${x.accepted.length}/2; nhận phòng: ${x.handover.length}/2.`}{" "}
            Mỗi thành viên cần một lượt ở riêng.
          </p>
          <button
            className="text-btn"
            onClick={() => {
              const blob = new Blob([JSON.stringify(x, null, 2)], {
                type: "application/json",
              });
              const url = URL.createObjectURL(blob),
                a = document.createElement("a");
              a.href = url;
              a.download = `antro-luot-o-${x.id}.json`;
              a.click();
              URL.revokeObjectURL(url);
            }}
          >
            Tải hồ sơ lượt ở
          </button>
        </details>
        {x.status === "requested" && (
          <button
            className="btn primary"
            disabled={x.accepted.includes(actor)}
            onClick={() => act((s) => h.agreeStay(s, x.id))}
          >
            Đồng ý thông tin thuê
          </button>
        )}
        {["requested", "handover"].includes(x.status) && (
          <details>
            <summary>Hủy yêu cầu trước khi nhận phòng</summary>
            <form
              onSubmit={(e) => {
                const f = formData(e);
                act((s) => h.cancelStay(s, x.id, text(f, "reason")));
              }}
            >
              <label>
                Lý do hủy
                <input name="reason" required />
              </label>
              <button className="btn outline">Hủy yêu cầu thuê</button>
            </form>
          </details>
        )}
        {x.status === "handover" && (
          <form
            onSubmit={(e) => {
              const f = formData(e);
              act((s) => h.handoverStay(s, x.id, text(f, "actual")));
            }}
          >
            <label>
              Ngày nhận phòng thực tế
              <input
                type="date"
                name="actual"
                required
                defaultValue={x.moveInDate || x.plannedDate}
              />
            </label>
            <button
              className="btn primary"
              disabled={x.handover.includes(actor)}
            >
              Xác nhận bàn giao nhận phòng
            </button>
            <p className="fineprint">
              Xác nhận bên còn lại mới chuyển Đang ở và cập nhật chỗ.
            </p>
          </form>
        )}
        {x.status === "active" && (
          <>
            <section>
              <h3>Ở ghép và chỗ trống</h3>
              <p>
                Còn {counts.available} chỗ ·{" "}
                {h.recruitingAllowed(data, x.roomId, x.tenantId)
                  ? "Được phép mở tìm trong phạm vi chỗ trống"
                  : "Chưa đủ điều kiện hoặc chưa được phép tuyển thêm"}
                .
              </p>
              {!owner && (
                <button
                  className="btn outline"
                  disabled={
                    !counts.available ||
                    data.housing.permissions.some(
                      (p) =>
                        p.stayId === x.id &&
                        p.roomId === x.roomId &&
                        p.tenantId === actor &&
                        p.status !== "rejected",
                    )
                  }
                  onClick={() => act((s) => h.requestRecruiting(s, x.roomId))}
                >
                  Xin phép tìm roommate
                </button>
              )}
              <Link className="text-btn" href="/roommatch/ho-so">
                Mở hồ sơ ở ghép
              </Link>
              {owner &&
                data.housing.permissions
                  .filter(
                    (p) => p.roomId === x.roomId && p.status === "pending",
                  )
                  .map((p) => (
                    <div key={p.id}>
                      <p>Người đang ở xin phép tuyển thêm.</p>
                      <button
                        className="btn outline"
                        onClick={() =>
                          act((s) => h.decideRecruiting(s, p.id, true))
                        }
                      >
                        Cho phép tuyển roommate
                      </button>
                      <button
                        className="text-btn"
                        onClick={() =>
                          act((s) => h.decideRecruiting(s, p.id, false))
                        }
                      >
                        Không chấp thuận
                      </button>
                    </div>
                  ))}
            </section>
            <details>
              <summary>Yêu cầu rời phòng</summary>
              <form
                onSubmit={(e) => {
                  const f = formData(e);
                  act((s) =>
                    h.requestExit(s, x.id, text(f, "leave"), text(f, "reason")),
                  );
                }}
              >
                <label>
                  Ngày rời dự kiến
                  <input
                    name="leave"
                    type="date"
                    required
                    min={x.moveInDate || x.plannedDate}
                    defaultValue={x.moveInDate || x.plannedDate}
                  />
                </label>
                <label>
                  Lý do trả phòng
                  <input
                    name="reason"
                    required
                    placeholder="Ví dụ: kết thúc thời hạn thuê"
                  />
                </label>
                <button className="btn outline">Gửi yêu cầu rời phòng</button>
              </form>
            </details>
          </>
        )}
        {x.status === "leaving" && (
          <section>
            <h3>Bàn giao trả phòng</h3>
            <p>
              {x.exitReason} · {x.moveOutDate}. Cọc xử lý riêng, không khóa
              quyền đánh giá khi đã xác nhận kết thúc.
            </p>
            <button
              className="btn primary"
              disabled={x.exitConfirmed.includes(actor)}
              onClick={() => act((s) => h.confirmExit(s, x.id))}
            >
              Xác nhận đã bàn giao trả phòng
            </button>
          </section>
        )}
        {owner && ["active", "leaving"].includes(x.status) && (
          <details>
            <summary>Lập bảng phí kỳ thuê</summary>
            <form
              onSubmit={(e) => {
                const f = formData(e);
                act((s) =>
                  h.createBill(
                    s,
                    x.id,
                    text(f, "period"),
                    num(f, "kwh"),
                    num(f, "vehicles"),
                    num(f, "adjustment"),
                    text(f, "reason"),
                    text(f, "due"),
                  ),
                );
              }}
            >
              <div className="form-grid">
                <label>
                  Kỳ thuê
                  <input
                    name="period"
                    type="month"
                    required
                    defaultValue={x.plannedDate.slice(0, 7)}
                  />
                </label>
                <label>
                  Hạn trả
                  <input
                    name="due"
                    type="date"
                    required
                    defaultValue={x.plannedDate}
                  />
                </label>
                <label>
                  Điện phòng (kWh)
                  <input
                    name="kwh"
                    type="number"
                    min="0"
                    defaultValue="120"
                    required
                  />
                </label>
                <label>
                  Xe của người thuê
                  <input
                    name="vehicles"
                    type="number"
                    min="0"
                    max="10"
                    defaultValue="1"
                    required
                  />
                </label>
                <label>
                  Điều chỉnh (VNĐ)
                  <input
                    name="adjustment"
                    type="number"
                    defaultValue="0"
                    required
                  />
                </label>
                <label>
                  Lý do điều chỉnh
                  <input name="reason" />
                </label>
              </div>
              <button className="btn outline">Lập bảng phí</button>
            </form>
          </details>
        )}
        {bills.map((b) => (
          <section key={b.id}>
            <h3>
              Chi phí tháng {b.period}: {money(b.total)}
            </h3>
            <p>
              Hạn {b.due} · {paymentLabels[b.status]} ·{" "}
              {b.method || "Chưa khai phương thức"}
            </p>
            <details>
              <summary>Cách tính và điều kiện kỳ này</summary>
              <p>
                Tiền phòng {money(b.terms.price)}, {x.sharers} người chia; điện{" "}
                {b.kwh} kWh/phòng, {b.vehicles} xe; khoản thường kỳ{" "}
                {money(cost(b.terms, x.sharers, b.kwh, b.vehicles).total)}; điều
                chỉnh {money(b.adjustment)} ({b.reason || "không điều chỉnh"}).
                Giá lấy từ điều kiện lượt ở, không lấy tin mới.
              </p>
            </details>
            <PaymentActions
              owner={owner}
              status={b.status}
              onAction={(status, method) =>
                act((s) => h.setPayment(s, b.id, "bill", status, method))
              }
            />
          </section>
        ))}
        <section>
          <h3>Tiền cọc: {money(x.deposit.amount)}</h3>
          <p>
            {paymentLabels[x.deposit.payment]}
            {x.deposit.method
              ? ` · ${x.deposit.method.replace(" mẫu", "")}`
              : ""}{" "}
            · Hoàn cọc:{" "}
            {x.deposit.refund === "received"
              ? "Người thuê xác nhận đã nhận"
              : x.deposit.refund === "declared"
                ? "Chủ phòng khai đã hoàn"
                : "Chưa hoàn"}
            .
          </p>
          <PaymentActions
            owner={owner}
            status={x.deposit.payment}
            onAction={(status, method) =>
              act((s) => h.setPayment(s, x.id, "deposit", status, method))
            }
          />
          {["leaving", "ended"].includes(x.status) && (
            <>
              <p>
                Khấu trừ dự kiến {money(x.deposit.deduction)}; dự kiến hoàn{" "}
                {money(x.deposit.amount - x.deposit.deduction)}.{" "}
                {x.deposit.reason} ·{" "}
                {x.deposit.response === "disputed"
                  ? "Có bất đồng"
                  : x.deposit.response === "accepted"
                    ? "Đã thống nhất"
                    : "Chưa thống nhất đối chiếu"}
                .
              </p>
              {owner &&
                x.deposit.payment === "received" &&
                x.deposit.refund === "pending" && (
                  <form
                    onSubmit={(e) => {
                      const f = formData(e);
                      act((s) =>
                        h.proposeDeduction(
                          s,
                          x.id,
                          num(f, "amount"),
                          text(f, "reason"),
                        ),
                      );
                    }}
                  >
                    <label>
                      Khấu trừ cọc (VNĐ)
                      <input
                        name="amount"
                        type="number"
                        required
                        min="0"
                        max={x.deposit.amount}
                        defaultValue="0"
                      />
                    </label>
                    <label>
                      Lý do đối chiếu cọc
                      <input
                        name="reason"
                        required
                        placeholder="Không khấu trừ theo bàn giao mẫu"
                      />
                    </label>
                    <button className="btn outline">Gửi đối chiếu cọc</button>
                  </form>
                )}
              {!owner && x.deposit.reason && x.deposit.refund === "pending" && (
                <div className="inline-actions">
                  <button
                    className="btn outline"
                    onClick={() => act((s) => h.respondDeposit(s, x.id, true))}
                  >
                    Đồng ý đối chiếu cọc
                  </button>
                  <button
                    className="text-btn"
                    onClick={() => act((s) => h.respondDeposit(s, x.id, false))}
                  >
                    Chưa đồng ý khoản cọc
                  </button>
                </div>
              )}
              {x.status === "ended" &&
                x.deposit.response === "accepted" &&
                ((owner && x.deposit.refund === "pending") ||
                  (!owner && x.deposit.refund === "declared")) && (
                  <button
                    className="btn outline"
                    onClick={() => act((s) => h.refundDeposit(s, x.id))}
                  >
                    {owner ? "Khai đã hoàn cọc" : "Xác nhận đã nhận lại cọc"}
                  </button>
                )}
            </>
          )}
        </section>
        {owner && x.status === "active" && (
          <details>
            <summary>Đề xuất thay đổi cho lượt ở hiện tại</summary>
            <p>
              Độc lập với giá chào; chỉ áp dụng kỳ mới từ ngày hiệu lực sau khi
              người thuê đồng ý.
            </p>
            <form
              onSubmit={(e) => {
                const f = formData(e);
                act((s) =>
                  h.proposeChange(
                    s,
                    x.id,
                    num(f, "price"),
                    text(f, "date"),
                    text(f, "reason"),
                  ),
                );
              }}
            >
              <label>
                Giá phòng đề xuất
                <input
                  name="price"
                  type="number"
                  min="100000"
                  required
                  defaultValue={x.snapshot.price + 100000}
                />
              </label>
              <label>
                Ngày dự kiến áp dụng
                <input
                  name="date"
                  type="date"
                  required
                  defaultValue={x.plannedDate}
                />
              </label>
              <label>
                Lý do thay đổi
                <input name="reason" required />
              </label>
              <button className="btn outline">Gửi đề xuất thay đổi</button>
            </form>
          </details>
        )}
        {data.housing.changes
          .filter((c) => c.stayId === x.id)
          .map((c) => (
            <section key={c.id}>
              <h3>
                Đề xuất giá {money(c.price)} từ {c.date}
              </h3>
              <p>
                {c.reason} ·{" "}
                {c.status === "proposed"
                  ? "Chưa đồng ý"
                  : c.status === "accepted"
                    ? "Đã đồng ý"
                    : "Không đồng ý"}
              </p>
              {!owner && c.status === "proposed" && x.status === "active" && (
                <div className="inline-actions">
                  <button
                    className="btn outline"
                    onClick={() => act((s) => h.respondChange(s, c.id, true))}
                  >
                    Đồng ý đề xuất
                  </button>
                  <button
                    className="text-btn"
                    onClick={() => act((s) => h.respondChange(s, c.id, false))}
                  >
                    Không đồng ý đề xuất
                  </button>
                </div>
              )}
            </section>
          ))}
        {x.status === "ended" && !owner && (
          <section>
            <h3>Đánh giá lượt ở</h3>
            <form
              onSubmit={(e) => {
                const f = formData(e);
                act((s) =>
                  h.saveReview(
                    s,
                    x.id,
                    num(f, "stars"),
                    [0, 1, 2, 3].map((i) => num(f, `c${i}`)),
                    text(f, "review"),
                  ),
                );
              }}
            >
              <Stars name="stars" label="Số sao chung" value={review?.stars} />
              {[
                "Chi phí khớp khai báo",
                "Tình trạng phòng",
                "Tiếng ồn và tiện ích",
                "Trải nghiệm người quản lý",
              ].map((label, i) => (
                <Stars
                  key={i}
                  label={label}
                  name={`c${i}`}
                  value={review?.criteria[i]}
                />
              ))}
              <label>
                Nhận xét
                <textarea
                  name="review"
                  required
                  minLength={10}
                  maxLength={1500}
                  defaultValue={review?.text}
                  placeholder="Mô tả trải nghiệm của bạn; không đăng thông tin riêng tư."
                />
              </label>
              <button className="btn primary">
                {review ? "Cập nhật đánh giá" : "Gửi đánh giá"}
              </button>
            </form>
          </section>
        )}
        <details>
          <summary>Yêu cầu xem xét</summary>
          <form
            onSubmit={(e) => {
              const f = formData(e);
              act((s) =>
                h.createCase(
                  s,
                  text(f, "type") as "exit" | "deposit" | "residency",
                  x.id,
                  text(f, "evidence"),
                ),
              );
            }}
          >
            <label>
              Loại yêu cầu
              <select name="type">
                <option value="exit">Bất đồng rời phòng</option>
                <option value="deposit">Bất đồng tiền cọc</option>
                <option value="residency">
                  Đối chiếu lượt ở bằng bằng chứng mẫu
                </option>
              </select>
            </label>
            <label>
              Thông tin và bằng chứng
              <textarea
                name="evidence"
                required
                minLength={10}
                maxLength={2000}
              />
            </label>
            <p className="fineprint">
              Không gửi CCCD, ảnh hợp đồng hoặc liên hệ thật. Admin quyết định
              có căn cứ, mã nhập không tự cấp review.
            </p>
            <button className="btn outline">Gửi yêu cầu xem xét</button>
          </form>
        </details>
      </fieldset>
    </article>
  );
}
function Stars({
  name,
  label,
  value = 4,
}: {
  name: string;
  label: string;
  value?: number;
}) {
  return (
    <label>
      {label}
      <select name={name} defaultValue={value}>
        {[1, 2, 3, 4, 5].map((n) => (
          <option key={n} value={n}>
            {n} sao
          </option>
        ))}
      </select>
    </label>
  );
}
function PaymentActions({
  owner,
  status,
  onAction,
}: {
  owner: boolean;
  status: import("../models").PaymentStatus;
  onAction: (s: import("../models").PaymentStatus, method: string) => void;
}) {
  const [method, setMethod] = useState("Chuyển khoản mẫu");
  return (
    <div>
      {!owner && ["unpaid", "disputed"].includes(status) && (
        <>
          <label>
            Phương thức thanh toán
            <select value={method} onChange={(e) => setMethod(e.target.value)}>
              <option value="Chuyển khoản mẫu">Chuyển khoản</option>
              <option value="Tiền mặt mẫu">Tiền mặt</option>
            </select>
          </label>
          <button
            className="btn outline"
            onClick={() => onAction("declared", method)}
          >
            Khai đã thanh toán
          </button>
        </>
      )}
      {owner && ["declared", "checking"].includes(status) && (
        <div className="inline-actions">
          <button
            className="btn outline"
            onClick={() => onAction("received", method)}
          >
            Xác nhận đã nhận tiền
          </button>
          <button
            className="text-btn"
            onClick={() => onAction("checking", method)}
          >
            Đưa vào đối chiếu
          </button>
          <button
            className="text-btn"
            onClick={() => onAction("disputed", method)}
          >
            Có bất đồng thanh toán
          </button>
        </div>
      )}
      <p className="fineprint">
        Chỉ ghi nhận trạng thái, không chuyển tiền hoặc đối soát ngân hàng.
      </p>
    </div>
  );
}
export function NotificationsScreen() {
  const { data, command, ready } = useDemo();
  const notices = data.housing.notifications.filter(
    (n) => n.recipient === h.actorId(data),
  );
  return (
    <main className="container section">
      <PageTitle
        title="Thông báo"
        description="Đã đọc chỉ ghi nhận việc xem, không chấp nhận đề xuất hoặc xác nhận thanh toán."
      />
      <DemoActors />
      {!ready ? (
        <p role="status">Đang tải…</p>
      ) : !notices.length ? (
        <p className="empty-state">Bạn chưa có thông báo.</p>
      ) : (
        <ul className="notice-list">
          {[...notices].reverse().map((n) => (
            <li key={n.id}>
              <p>{n.text}</p>
              <small>
                {new Date(n.date).toLocaleString("vi-VN", {
                  timeZone: "Asia/Ho_Chi_Minh",
                })}{" "}
                · {n.read ? "Đã đọc" : "Chưa đọc"}
              </small>
              <div className="inline-actions">
                <Link className="text-btn" href={n.href}>
                  Xem nội dung
                </Link>
                {!n.read && (
                  <button
                    className="text-btn"
                    onClick={() => command((s) => h.readNotice(s, n.id))}
                  >
                    Đánh dấu đã đọc
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
