"use client";
import Link from "next/link";
import { TrustCard } from "@/shared/components/trust-card";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useDemo, uid } from "@/shared/lib/demo-store";
import { Icon } from "@/shared/components/icon";
import { Empty, ReportButton } from "@/shared/components/ui";
import { fee, feeKeys, feeLabels, feeStatusLabels } from "../lib/fees";
import { cost, money } from "../lib/cost";
export function DetailScreen({ id }: { id: string }) {
  const { data, update } = useDemo();
  const router = useRouter();
  const room = data.listings.find((r) => r.id === id);
  const [people, setPeople] = useState(2);
  const [kwh, setKwh] = useState(120);
  const [vehicles, setVehicles] = useState(1);
  if (!room)
    return (
      <main className="container section">
        <Empty
          title="Không tìm thấy phòng"
          description="Tin có thể đã được gỡ hoặc đường dẫn chưa đúng."
          action={
            <Link href="/tim-phong" className="btn primary">
              Tìm phòng khác
            </Link>
          }
        />
      </main>
    );
  const n = Math.min(people, room.capacity);
  const c = cost(room, n, kwh, vehicles);
  const saved = data.saved.includes(id);
  function contact() {
    if (data.status !== "active") {
      router.push(`/dang-nhap?next=${encodeURIComponent("/phong/" + id)}`);
      return;
    }
    update((s) =>
      s.conversations.some((x) => x.id === "listing-" + id)
        ? s
        : {
            ...s,
            conversations: [
              ...s.conversations,
              {
                id: "listing-" + id,
                name: room!.owner,
                avatar: room!.image,
                type: "listing",
                ended: false,
                messages: [
                  {
                    id: uid(),
                    mine: false,
                    text: "Xin chào! Đây là hội thoại demo với người đăng tin. Bạn có thể thử gửi tin và đề nghị lịch xem phòng.",
                    time: "09:30",
                  },
                ],
              },
            ],
          },
    );
    router.push("/tin-nhan?chat=listing-" + id);
  }
  return (
    <main className="container section">
      <div className="breadcrumb">
        <Link href="/tim-phong">Tìm phòng</Link>
        <Icon name="chevron" size={13} />
        <span>{room.area}</span>
      </div>
      <div className="detail-title">
        <div>
          <p className="eyebrow">MỘT KHÔNG GIAN ĐỂ BẮT ĐẦU</p>
          <h1>{room.title}</h1>
          <p className="muted">
            <Icon name="pin" size={16} /> {room.address}
          </p>
        </div>
        <button
          className={`btn ${saved ? "soft" : "outline"}`}
          onClick={() => {
            if (data.status !== "active") {
              router.push(
                "/dang-nhap?next=" + encodeURIComponent("/phong/" + id),
              );
              return;
            }
            update((s) => ({
              ...s,
              saved: saved ? s.saved.filter((x) => x !== id) : [...s.saved, id],
            }));
          }}
        >
          <Icon name="heart" size={17} />
          {saved ? "Đã lưu tin" : "Lưu tin"}
        </button>
      </div>
      <div className="detail-gallery">
        <img src={room.image} alt={room.title} />
        <div>
          <img src="/images/room-3.jpg" alt="Ảnh không gian bổ sung minh họa" />
          <img src="/images/room-4.jpg" alt="Ảnh nội thất bổ sung minh họa" />
        </div>
        <span className="gallery-label">Ảnh minh họa · Dữ liệu demo</span>
      </div>
      <div className="detail-layout">
        <div>
          <div className="detail-specs">
            <span>
              <Icon name="area" />
              {room.size} m²
            </span>
            <span>
              <Icon name="users" />
              Tối đa {room.capacity} người
            </span>
            <span>
              <Icon name="sun" />
              Ánh sáng tự nhiên
            </span>
          </div>
          <section className="detail-section">
            <h2>Chút thông tin về căn phòng</h2>
            <p>
              Một không gian thoải mái cho việc học và những ngày nghỉ ngơi.
              Phòng nằm trong cụm địa danh mẫu quanh Làng Đại học, phù hợp cho
              sinh viên và người đi làm tìm nơi ở lâu dài.
            </p>
            <div className="amenity-grid">
              {room.amenities.map((a) => (
                <span key={a}>
                  <Icon name="check" size={17} />
                  {a}
                </span>
              ))}
              <span>
                <Icon name={room.pets ? "check" : "close"} size={17} />
                {room.pets
                  ? "Được nuôi: " +
                    (room.allowedPets ?? [])
                      .map((x) => (x === "cat" ? "mèo" : "chó"))
                      .join(", ")
                  : "Không nuôi thú cưng"}
              </span>
            </div>
          </section>
          <TrustCard room={room} />
          <section className="detail-section" id="chi-phi">
            <div className="section-heading">
              <div>
                <p className="eyebrow">KHÔNG BỎ SÓT KHOẢN NÀO</p>
                <h2>Chi phí được kể rõ.</h2>
              </div>
              <span className="pill">Ước tính</span>
            </div>
            <div className="cost-inputs">
              <label>
                Số người
                <select
                  value={n}
                  onChange={(e) => setPeople(Number(e.target.value))}
                >
                  {Array.from({ length: room.capacity }, (_, i) => (
                    <option key={i} value={i + 1}>
                      {i + 1} người
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Điện cả phòng / tháng
                <input
                  type="number"
                  min="0"
                  max="2000"
                  value={kwh}
                  onChange={(e) =>
                    setKwh(Math.max(0, Math.min(2000, Number(e.target.value))))
                  }
                />
                <small>kWh / phòng</small>
              </label>
              <label>
                Xe của bạn
                <select
                  value={vehicles}
                  onChange={(e) => setVehicles(Number(e.target.value))}
                >
                  {[0, 1, 2].map((n) => (
                    <option key={n} value={n}>
                      {n} xe
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="cost-table">
              <div>
                <span>
                  Tiền phòng<small>{money(room.price)} / phòng</small>
                </span>
                <strong>{money(room.price / n)}</strong>
              </div>
              {feeKeys.map((k) => {
                const f = fee(room, k);
                return (
                  <div key={k}>
                    <span>
                      {feeLabels[k]}
                      <small>
                        {feeStatusLabels[f.status]}
                        {f.status === "charged"
                          ? " · " + money(f.amount ?? 0)
                          : ""}
                      </small>
                    </span>
                    <strong>
                      {f.status === "unknown"
                        ? "Chưa rõ"
                        : k === "transfer"
                          ? "Một lần"
                          : k === "electricity"
                            ? c.electric === null
                              ? "Chưa rõ"
                              : money(c.electric)
                            : f.status === "charged"
                              ? money(
                                  ((f.amount ?? 0) /
                                    ([
                                      "internet",
                                      "cleaning",
                                      "management",
                                    ].includes(k)
                                      ? n
                                      : 1)) *
                                    (k === "parking" ? vehicles : 1),
                                )
                              : feeStatusLabels[f.status]}
                    </strong>
                  </div>
                );
              })}
              <div className="cost-total">
                <span>
                  {c.complete ? "Tổng ước tính" : "Tổng các khoản đã biết"}
                  <small>Mỗi người / tháng</small>
                </span>
                <strong>{money(c.total)}</strong>
              </div>
            </div>
            {!c.complete && (
              <p className="warning">
                Chưa đủ dữ liệu tính tổng. Cần hỏi rõ các khoản:{" "}
                {c.unknown.map((k) => feeLabels[k]).join(", ")}.
              </p>
            )}
            <div className="deposit-note">
              <Icon name="shield" />
              <p>
                <strong>Cọc dự kiến: {money(c.deposit)} / người</strong>
                <br />
                Cọc bằng {room.depositMonths ?? 1} tháng tiền phòng, trình bày
                riêng. Tháng đầu và cọc: {money(c.total + c.deposit)}
                {!c.complete ? " + khoản chưa rõ" : ""}. Điều kiện hoàn cọc cần
                thống nhất với người đăng.
              </p>
            </div>
          </section>
          <section className="detail-section">
            <h2>Những điều nên hỏi trước</h2>
            <div className="info-note">
              Thời hạn thuê mẫu: tối thiểu {room.leaseMonths ?? 6} tháng. Hỏi rõ
              giờ giấc, khách ở lại, mức sử dụng điện nước và điều kiện chuyển
              đi sớm. Xem trạng thái giá tham khảo trong khối Listing Trust phía
              trên.
            </div>
            <ReportButton target={id} />
          </section>
        </div>
        <aside className="contact-card">
          <p className="muted">Giá thuê phòng</p>
          <h2>
            {money(room.price)}
            <small> / tháng</small>
          </h2>
          <div className="contact-total">
            <span>
              {c.complete ? "Tổng ước tính" : "Khoản đã biết"} / người
            </span>
            <strong>
              {money(c.total)}
              <small>/ tháng</small>
            </strong>
          </div>
          {room.status === "published" ? (
            <button className="btn primary full" onClick={contact}>
              <Icon name="chat" size={18} />
              Liên hệ người đăng
            </button>
          ) : (
            <p className="warning">
              Tin hiện{" "}
              {
                (
                  {
                    rented: "đã cho thuê",
                    hidden: "tạm ẩn",
                    pending: "chờ duyệt",
                    draft: "là bản nháp",
                    changes: "cần bổ sung",
                    rejected: "bị từ chối",
                  } as Record<string, string>
                )[room.status]
              }
              . Chưa thể liên hệ mới.
            </p>
          )}
          <p className="fineprint">
            Chat demo · Không thực hiện đặt cọc trên AnTro
          </p>
          <div className="owner">
            <span className="avatar">{room.owner[0]}</span>
            <div>
              <strong>{room.owner}</strong>
              <span>Người đăng tin mẫu</span>
            </div>
            <Icon name="shield" />
          </div>
          <div className="trust-preview">
            <strong>Minh bạch thông tin</strong>
            <p>
              Các nhãn xác minh và Trust Score là minh họa. Chưa kiểm chứng danh
              tính hoặc quyền cho thuê.
            </p>
            <Link href="/tai-khoan">
              Tìm hiểu về xác minh <Icon name="arrow" size={14} />
            </Link>
          </div>
        </aside>
      </div>
    </main>
  );
}
