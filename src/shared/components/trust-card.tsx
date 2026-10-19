"use client";
import { useState } from "react";
import type { Listing } from "@/shared/lib/models";
import { trustScore, priceBenchmark } from "@/services/trust";
import { money } from "@/features/listings/lib/cost";
import { Modal } from "./ui";
import { Icon } from "./icon";
export function TrustCard({ room }: { room: Listing }) {
  const [open, setOpen] = useState(false);
  const trust = trustScore(room),
    price = priceBenchmark(room.area);
  return (
    <section className="trust-panel">
      <div className="trust-summary">
        <span className="trust-number">
          {trust.score}
          <small>/100</small>
        </span>
        <div>
          <strong>Trust Score minh họa</strong>
          <button className="text-btn" onClick={() => setOpen(true)}>
            Vì sao điểm này? <Icon name="arrow" size={14} />
          </button>
        </div>
      </div>
      <p>
        Điểm từ dữ liệu mẫu, không chứng minh danh tính, quyền cho thuê hoặc độ
        an toàn.
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
          title="Điểm minh họa được tính thế nào?"
          onClose={() => setOpen(false)}
        >
          <p>
            Công thức demo v1, chỉ dùng trường dữ liệu mẫu. Không cộng điểm vì
            “AI đã kiểm tra ảnh”.
          </p>
          <div className="trust-rows">
            {trust.components.map((c) => (
              <div key={c.label}>
                <span>{c.label}</span>
                <strong>
                  {c.score}/{c.max}
                </strong>
              </div>
            ))}
          </div>
          <p className="fineprint">
            Ảnh có sẵn chỉ là tín hiệu dữ liệu được cung cấp, chưa kiểm tra độ
            xác thực. Điểm không thay thế việc xem phòng và kiểm tra thông tin.
          </p>
        </Modal>
      )}
    </section>
  );
}
