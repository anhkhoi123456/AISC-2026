"use client";
import Link from "next/link";
import { useState } from "react";
import { useDemo, uid } from "@/shared/lib/demo-store";
import { Guard, PageTitle, Empty } from "@/shared/components/ui";
import { Icon } from "@/shared/components/icon";
import { areas, roomImages } from "../mocks/listings";
import { money } from "../lib/cost";
import type { Listing, ListingStatus } from "@/shared/lib/models";
import { statusLabels, canSubmit } from "../lib/status";
export function ManageScreen() {
  return (
    <Guard>
      <Manage />
    </Guard>
  );
}
function Manage() {
  const { data, update, notify } = useDemo();
  const [filter, setFilter] = useState("all");
  const rooms = data.listings.filter(
    (r) => r.owner === "Bạn" && (filter === "all" || r.status === filter),
  );
  function status(id: string, status: ListingStatus) {
    const room = data.listings.find((r) => r.id === id);
    if (status === "pending" && room && !canSubmit(room)) {
      notify(
        "Hãy chỉnh sửa và điền đủ thông tin bắt buộc trước khi gửi duyệt.",
      );
      return;
    }
    update((s) => ({
      ...s,
      listings: s.listings.map((r) => (r.id === id ? { ...r, status } : r)),
    }));
    notify("Đã cập nhật trạng thái tin demo.");
  }
  return (
    <main className="container section">
      <PageTitle
        eyebrow="KHÔNG GIAN NGƯỜI ĐĂNG"
        title="Quản lý những căn phòng."
        description="Giữ thông tin rõ ràng, cập nhật và đúng với tình trạng phòng."
        action={
          <Link className="btn primary" href="/dang-tin">
            <Icon name="plus" size={18} />
            Đăng tin mới
          </Link>
        }
      />
      <div className="stats-grid">
        {[
          [
            "Tin của bạn",
            data.listings.filter((r) => r.owner === "Bạn").length,
          ],
          [
            "Đang hiển thị",
            data.listings.filter(
              (r) => r.owner === "Bạn" && r.status === "published",
            ).length,
          ],
          [
            "Chờ duyệt",
            data.listings.filter(
              (r) => r.owner === "Bạn" && r.status === "pending",
            ).length,
          ],
        ].map(([t, n]) => (
          <div className="stat" key={t}>
            <span>{t}</span>
            <strong>{n}</strong>
          </div>
        ))}
      </div>
      <div className="results-toolbar">
        <h3>Tất cả tin phòng</h3>
        <select
          aria-label="Lọc trạng thái tin"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">Tất cả trạng thái</option>
          {Object.entries(statusLabels).map(([v, l]) => (
            <option value={v} key={v}>
              {l}
            </option>
          ))}
        </select>
      </div>
      {rooms.length ? (
        <div className="manage-list">
          {rooms.map((r) => (
            <article key={r.id} className="manage-card">
              <img src={r.image} alt={r.title} />
              <div>
                <span className={`status status-${r.status}`}>
                  {statusLabels[r.status]}
                </span>
                <h3>{r.title}</h3>
                <p className="muted">
                  {r.area} · {r.size} m²
                </p>
                <strong>
                  {money(r.price)} <small>/ tháng</small>
                </strong>
                {r.note && (
                  <p className="warning-text">Ghi chú duyệt: {r.note}</p>
                )}
                <small className="muted">Xác nhận gần nhất: {r.updated}</small>
              </div>
              <div className="manage-actions">
                <Link className="text-btn" href={"/phong/" + r.id}>
                  Xem tin <Icon name="arrow" size={15} />
                </Link>
                <Link className="btn outline" href={"/dang-tin?edit=" + r.id}>
                  Chỉnh sửa
                </Link>
                {r.status === "published" ? (
                  <>
                    <button
                      className="btn soft"
                      onClick={() => {
                        update((s) => ({
                          ...s,
                          listings: s.listings.map((x) =>
                            x.id === r.id
                              ? {
                                  ...x,
                                  updated: new Intl.DateTimeFormat("en-CA", {
                                    timeZone: "Asia/Ho_Chi_Minh",
                                  }).format(new Date()),
                                }
                              : x,
                          ),
                        }));
                        notify("Đã xác nhận phòng vẫn còn trống.");
                      }}
                    >
                      Xác nhận còn phòng
                    </button>
                    <button
                      className="text-btn muted"
                      onClick={() => status(r.id, "rented")}
                    >
                      Đã cho thuê
                    </button>
                    <button
                      className="text-btn muted"
                      onClick={() => status(r.id, "hidden")}
                    >
                      Tạm ẩn
                    </button>
                  </>
                ) : (
                  ["draft", "changes", "hidden", "rejected"].includes(
                    r.status,
                  ) && (
                    <button
                      className="btn soft"
                      onClick={() => status(r.id, "pending")}
                    >
                      Gửi duyệt lại
                    </button>
                  )
                )}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <Empty
          title="Chưa có tin ở trạng thái này"
          description="Tạo một tin mới và kể rõ mọi thông tin về căn phòng của bạn."
          action={
            <Link className="btn primary" href="/dang-tin">
              Tạo tin mới
            </Link>
          }
        />
      )}
      <p className="info-note">
        Tin gửi duyệt chưa xuất hiện trong tìm kiếm. Bạn có thể thử duyệt tại{" "}
        <Link href="/admin">không gian vận hành demo</Link>. Lịch nhắc sau 7
        ngày và tự ẩn sau 14 ngày chưa chạy trong frontend.
      </p>
    </main>
  );
}
export function ListingFormScreen() {
  return (
    <Guard>
      <ListingForm />
    </Guard>
  );
}
function ListingForm() {
  const { data, update, notify } = useDemo();
  const [id] = useState(() =>
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("edit")
      : null,
  );
  const existing = data.listings.find((r) => r.id === id && r.owner === "Bạn");
  const [image, setImage] = useState(existing?.image ?? roomImages[0]);
  const [submitted, setSubmitted] = useState(false);
  function save(form: HTMLFormElement, status: ListingStatus) {
    const f = new FormData(form);
    const listing: Listing = {
      id: existing?.id ?? uid(),
      title: String(f.get("title")),
      area: String(f.get("area")),
      address: String(f.get("address")),
      image,
      price: Number(f.get("price")),
      size: Number(f.get("size")),
      capacity: Number(f.get("capacity")),
      internet: Number(f.get("internet")),
      cleaning: Number(f.get("cleaning")),
      electricity:
        f.get("electricity") === "" ? null : Number(f.get("electricity")),
      water: Number(f.get("water")),
      parking: Number(f.get("parking")),
      pets: f.get("pets") === "on",
      amenities: f.getAll("amenities").map(String),
      status,
      owner: "Bạn",
      updated: "2026-10-19",
      demo: true,
      kind: String(f.get("kind") ?? "Phòng trọ"),
      leaseMonths: Number(f.get("leaseMonths") ?? 6),
      rules: String(f.get("rules") ?? "Giữ yên tĩnh sau 22h."),
    };
    update((s) => ({
      ...s,
      listings: existing
        ? s.listings.map((r) => (r.id === existing.id ? listing : r))
        : [...s.listings, listing],
      logs: [
        ...s.logs,
        `${status === "draft" ? "Lưu nháp" : "Gửi duyệt"}: ${listing.title}`,
      ],
    }));
    setSubmitted(true);
    notify(
      status === "draft"
        ? "Đã lưu bản nháp demo."
        : "Đã gửi tin vào hàng đợi duyệt demo.",
    );
  }
  if (submitted)
    return (
      <main className="container narrow section">
        <Empty
          title="Tin phòng đã được lưu."
          description="Bạn có thể xem trạng thái tại trang quản lý. Tin chờ duyệt chỉ công khai sau khi được chấp thuận trong demo."
          action={
            <Link className="btn primary" href="/quan-ly-tin">
              Về quản lý tin
            </Link>
          }
        />
      </main>
    );
  return (
    <main className="container narrow section">
      <PageTitle
        eyebrow="CHIA SẺ MỘT KHÔNG GIAN"
        title={
          existing ? "Cập nhật tin phòng." : "Một căn phòng, một cơ hội mới."
        }
        description="Càng rõ thông tin, người thuê càng dễ tìm thấy nơi phù hợp."
      />
      <form
        className="panel"
        onSubmit={(e) => {
          e.preventDefault();
          const submitter = (e.nativeEvent as SubmitEvent)
            .submitter as HTMLButtonElement;
          save(
            e.currentTarget,
            submitter?.value === "draft" ? "draft" : "pending",
          );
        }}
      >
        <h2>Thông tin căn phòng</h2>
        <label>
          Tiêu đề
          <input
            name="title"
            required
            minLength={10}
            maxLength={100}
            defaultValue={existing?.title}
            placeholder="Ví dụ: Phòng sáng, có ban công gần UIT"
          />
        </label>
        <label>
          Khu vực phục vụ
          <select name="area" defaultValue={existing?.area}>
            {areas.map((a) => (
              <option key={a}>{a}</option>
            ))}
          </select>
        </label>
        <label>
          Địa chỉ mô tả mẫu
          <input
            name="address"
            required
            defaultValue={existing?.address}
            placeholder="Dùng địa chỉ mẫu, không nhập thông tin riêng tư"
          />
        </label>
        <div className="form-grid">
          <label>
            Giá phòng / tháng (VNĐ)
            <input
              type="number"
              name="price"
              required
              min="100000"
              step="10000"
              defaultValue={existing?.price ?? 3000000}
            />
          </label>
          <label>
            Diện tích (m²)
            <input
              type="number"
              name="size"
              required
              min="5"
              max="500"
              defaultValue={existing?.size ?? 25}
            />
          </label>
          <label>
            Số người tối đa
            <input
              type="number"
              name="capacity"
              required
              min="1"
              max="10"
              defaultValue={existing?.capacity ?? 2}
            />
          </label>
        </div>
        <hr />
        <div className="form-grid">
          <label>
            Loại phòng
            <select name="kind" defaultValue={existing?.kind ?? "Phòng trọ"}>
              {["Phòng trọ", "Studio", "Ở ghép"].map((v) => (
                <option key={v}>{v}</option>
              ))}
            </select>
          </label>
          <label>
            Thời hạn tối thiểu
            <select
              name="leaseMonths"
              defaultValue={existing?.leaseMonths ?? 6}
            >
              {[3, 6, 10, 12].map((n) => (
                <option value={n} key={n}>
                  {n} tháng
                </option>
              ))}
            </select>
          </label>
        </div>
        <label>
          Nội quy
          <textarea
            name="rules"
            defaultValue={
              existing?.rules ??
              "Giữ yên tĩnh sau 22h. Khách ở lại cần thống nhất trước."
            }
          />
        </label>
        <h2>Từng khoản phí, từng đơn vị</h2>
        <p className="muted">
          Giá 0 nghĩa là đã gồm/không thu thêm. Riêng điện để trống nghĩa là
          chưa rõ. Cọc mẫu bằng một tháng tiền phòng.
        </p>
        <div className="form-grid">
          {(
            [
              ["internet", "Internet / phòng / tháng", 100000],
              ["cleaning", "Vệ sinh / phòng / tháng", 40000],
              ["electricity", "Điện / kWh (được để trống)", 3500],
              ["water", "Nước / người / tháng", 60000],
              ["parking", "Giữ xe / xe / tháng", 100000],
            ] as const
          ).map(([name, label, value]) => (
            <label key={name}>
              {label}
              <input
                type="number"
                name={name}
                min="0"
                required={name !== "electricity"}
                defaultValue={existing ? (existing[name] ?? "") : value}
              />
            </label>
          ))}
        </div>
        <label className="check-label">
          <input name="pets" type="checkbox" defaultChecked={existing?.pets} />
          Cho phép nuôi thú cưng
        </label>
        <div className="amenity-checks">
          {[
            "Máy lạnh",
            "WC riêng",
            "Ban công",
            "Bếp riêng",
            "Nội thất",
            "Chỗ để xe",
          ].map((a) => (
            <label className="check-label" key={a}>
              <input
                name="amenities"
                value={a}
                type="checkbox"
                defaultChecked={existing?.amenities.includes(a)}
              />
              {a}
            </label>
          ))}
        </div>
        <hr />
        <h2>Ảnh minh họa</h2>
        <p className="muted">
          Chọn ảnh mẫu có sẵn cho demo; chưa tải file lên hệ thống.
        </p>
        <div className="photo-options">
          {roomImages.map((img) => (
            <button
              className={image === img ? "selected" : ""}
              type="button"
              key={img}
              aria-label={"Chọn ảnh mẫu " + (roomImages.indexOf(img) + 1)}
              aria-pressed={image === img}
              onClick={() => setImage(img)}
            >
              <img src={img} alt="Ảnh phòng mẫu" />
            </button>
          ))}
        </div>
        <p className="info-note">
          Mọi chỉnh sửa trong demo sẽ tạo lại yêu cầu duyệt. Bản frontend chưa
          lưu lịch sử revision độc lập hoặc chạy kiểm tra ảnh/AI.
        </p>
        <div className="form-actions">
          <Link className="btn outline" href="/quan-ly-tin">
            Quay lại
          </Link>
          <button
            className="btn outline"
            name="action"
            value="draft"
            formNoValidate
          >
            Lưu nháp
          </button>
          <button className="btn primary" name="action" value="pending">
            Gửi duyệt <Icon name="arrow" size={17} />
          </button>
        </div>
      </form>
    </main>
  );
}
