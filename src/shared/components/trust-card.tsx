"use client";
import { useState } from "react";
import type { Listing } from "@/shared/lib/models";
import { useDemo } from "@/shared/lib/demo-store";
import { roomTrust } from "@/services/room-trust";
import { priceBenchmark } from "@/services/trust";
import { physicalId, createCase } from "@/services/housing";
import { money } from "@/features/listings/lib/cost";
import { Modal } from "./ui";
export function TrustCard({ room }: { room: Listing }) {
  const { data, command } = useDemo(),
    [open, setOpen] = useState(false),
    trust = roomTrust(data, room),
    price = priceBenchmark(room.area);
  return (
    <section className="trust-panel">
      <div className="trust-summary">
        <span className="trust-number">
          {trust.score ?? "—"}
          <small>/100</small>
        </span>
        <div>
          <strong>Trust Score căn phòng · Demo</strong>
          <p>
            {trust.score === null
              ? "Chưa đủ dữ liệu"
              : `${trust.count} review từ ${trust.accounts} tài khoản mẫu`}
          </p>
          <button className="text-btn" onClick={() => setOpen(true)}>
            Vì sao điểm này?
          </button>
        </div>
      </div>
      <p>
        Điểm minh bạch tin hiện tại: <b>{trust.M}/100</b>. Huy hiệu xác minh và
        trải nghiệm người từng ở là các thông tin riêng.
      </p>
      <div className="price-benchmark">
        <strong>Khoảng giá tham khảo · Demo</strong>
        <p>
          {price
            ? `${money(price.min)} – ${money(price.max)} / phòng / tháng`
            : "Chưa đủ dữ liệu giá khu vực"}
        </p>
        {price && (
          <small>
            {price.samples} quan sát giả lập · Cùng cụm · Không phải giá thị
            trường thật
          </small>
        )}
      </div>
      {open && (
        <Modal
          title="Điểm căn phòng được tính thế nào?"
          onClose={() => setOpen(false)}
        >
          <p>
            T = làm tròn(0,4 M + 0,4 R + 0,2 H). Chỉ hiện tổng khi có ít nhất 3
            review hợp lệ từ các tài khoản và lượt ở khác nhau.
          </p>
          <div className="trust-rows">
            <div>
              <span>M · Thông tin, chi phí và điều kiện</span>
              <b>{trust.M}/100</b>
            </div>
            <div>
              <span>R · 25 × (sao trung bình − 1)</span>
              <b>{trust.R === null ? "Chưa có" : trust.R.toFixed(2)}</b>
            </div>
            <div>
              <span>H · Sự kiện vận hành đã xác nhận</span>
              <b>{trust.H}/100</b>
            </div>
          </div>
          <p>
            H khởi điểm giả định 70; mỗi lần bàn giao xác nhận hợp lệ +2, tối đa
            +20; mỗi vụ vi phạm đã xác nhận −10. Không dùng số report chưa xử
            lý, không thưởng lặp hoặc trừ vì tăng giá đúng quy trình.
          </p>
          <p>
            Tổng:{" "}
            {trust.score === null ? "Chưa đủ dữ liệu" : trust.score + "/100"}.{" "}
            {trust.count} mẫu · cập nhật{" "}
            {new Date(trust.at).toLocaleDateString("vi-VN", {
              timeZone: "Asia/Ho_Chi_Minh",
            })}
            . Công thức demo chưa hiệu chỉnh thực nghiệm, không bảo đảm an toàn.
          </p>
          {data.status === "active" && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const f = new FormData(e.currentTarget);
                command((s) =>
                  createCase(
                    s,
                    "trust",
                    physicalId(room),
                    String(f.get("reason")),
                  ),
                );
              }}
            >
              <label>
                Căn cứ yêu cầu xem lại điểm
                <textarea name="reason" required minLength={10} />
              </label>
              <button className="btn outline">Gửi yêu cầu xem lại điểm</button>
            </form>
          )}
        </Modal>
      )}
    </section>
  );
}
