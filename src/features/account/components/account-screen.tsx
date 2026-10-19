"use client";
import Link from "next/link";
import { useState } from "react";
import { useDemo } from "@/shared/lib/demo-store";
import { PageTitle, Empty } from "@/shared/components/ui";
import { Icon } from "@/shared/components/icon";
const statuses = {
  guest: "Khách",
  pending: "Chưa hoàn tất xác minh",
  active: "Đã kích hoạt demo",
  review: "Chờ duyệt thủ công",
  rejected: "Xác minh chưa đạt",
  blocked: "Đang bị hạn chế",
};
export function AccountScreen() {
  const { data, update, notify, reset } = useDemo();
  const [confirm, setConfirm] = useState(false);
  if (data.status === "guest")
    return (
      <main className="container section">
        <Empty
          title="Góc nhỏ dành riêng cho bạn"
          description="Đăng nhập để quản lý hồ sơ, tin đã lưu và các kết nối."
          action={
            <Link className="btn primary" href="/dang-nhap">
              Đăng nhập demo
            </Link>
          }
        />
      </main>
    );
  return (
    <main className="container section">
      <PageTitle
        eyebrow="TÀI KHOẢN CỦA BẠN"
        title={`Chào ${data.name},`}
        description="Quản lý hồ sơ và những bước tiếp theo trong hành trình của bạn."
      />
      <div className="account-grid">
        <section className="panel">
          <div className="account-person">
            <span className="avatar large">{data.name[0]}</span>
            <div>
              <h2>{data.name}</h2>
              <span className="pill">{statuses[data.status]}</span>
            </div>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget);
              update((s) => ({ ...s, name: String(f.get("name")) }));
              notify("Đã cập nhật tên hiển thị.");
            }}
          >
            <label>
              Tên hiển thị
              <input
                name="name"
                required
                minLength={2}
                maxLength={40}
                defaultValue={data.name}
              />
            </label>
            <button className="btn outline">Lưu thay đổi</button>
          </form>
          <div className="account-links">
            {[
              ["/yeu-thich", `Tin đã lưu (${data.saved.length})`, "heart"],
              ["/roommatch/ho-so", "Hồ sơ RoomMatch", "users"],
              ["/quan-ly-tin", "Quản lý tin phòng", "home"],
              ["/tin-nhan", "Tin nhắn của bạn", "chat"],
            ].map(([href, title, icon]) => (
              <Link key={href} href={href}>
                <Icon name={icon} />
                {title}
                <Icon name="chevron" size={17} />
              </Link>
            ))}
          </div>
          <button
            className="text-btn danger"
            onClick={() => {
              update((s) => ({ ...s, status: "guest", role: "guest" }));
              notify("Đã đăng xuất tài khoản demo.");
            }}
          >
            <Icon name="logout" size={17} />
            Đăng xuất
          </button>
        </section>
        <div>
          <section className="panel">
            <span className="feature-icon">
              <Icon name="shield" size={28} />
            </span>
            <h2>Xác minh & độ tin cậy</h2>
            <p className="muted">
              Từng bước xác minh mang một ý nghĩa riêng. Trong demo, toàn bộ kết
              quả dưới đây chỉ là minh họa.
            </p>
            <div className="trust-rows">
              {[
                [
                  "Số điện thoại",
                  data.status === "active"
                    ? "Đã xác nhận mẫu"
                    : "Chưa xác nhận",
                ],
                [
                  "Danh tính eKYC",
                  data.status === "active"
                    ? "Đã xác minh mẫu"
                    : "Chưa xác minh",
                ],
                ["Quyền cho thuê", "Chưa kiểm tra"],
              ].map(([label, value]) => (
                <div key={label}>
                  <span>{label}</span>
                  <span>{value}</span>
                </div>
              ))}
            </div>
            {data.status !== "active" && (
              <Link href="/xac-minh" className="btn primary">
                Tiếp tục xác minh mô phỏng <Icon name="arrow" size={16} />
              </Link>
            )}
            <details className="trust-details">
              <summary>Vì sao Trust Score là thông tin tham khảo?</summary>
              <p>
                Điểm tin cậy minh họa gồm xác minh, chất lượng hồ sơ và lịch sử
                hoạt động. Chưa có điểm thực được tính trong demo. Xác minh danh
                tính không bảo đảm quyền cho thuê hoặc hành vi của người dùng.
              </p>
            </details>
            {data.status === "blocked" && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const f = new FormData(e.currentTarget);
                  update((s) => ({
                    ...s,
                    logs: [
                      ...s.logs,
                      `Giải trình tài khoản: ${String(f.get("appeal"))}`,
                    ],
                  }));
                  notify("Đã lưu giải trình demo vào nhật ký vận hành.");
                  e.currentTarget.reset();
                }}
              >
                <label>
                  Giải trình về hạn chế
                  <textarea name="appeal" required minLength={10} />
                </label>
                <button className="btn outline">Gửi giải trình</button>
              </form>
            )}
          </section>
          <section className="panel demo-controls">
            <h3>Điều khiển bản demo</h3>
            <p className="muted">
              Chỉ thay đổi trạng thái mô phỏng tại trình duyệt này.
            </p>
            <label>
              Trạng thái tài khoản
              <select
                value={data.status}
                onChange={(e) =>
                  update((s) => ({
                    ...s,
                    status: e.target.value as typeof s.status,
                  }))
                }
              >
                {Object.entries(statuses)
                  .filter(([k]) => k !== "guest")
                  .map(([k, v]) => (
                    <option key={k} value={k}>
                      {v}
                    </option>
                  ))}
              </select>
            </label>
            <Link className="text-btn" href="/admin">
              Mở không gian vận hành demo <Icon name="arrow" size={16} />
            </Link>
            <hr />
            {confirm ? (
              <div className="inline-actions">
                <span>Xóa toàn bộ tiến trình demo?</span>
                <button
                  className="btn danger-btn"
                  onClick={() => {
                    reset();
                    setConfirm(false);
                  }}
                >
                  Đặt lại
                </button>
                <button
                  className="btn outline"
                  onClick={() => setConfirm(false)}
                >
                  Hủy
                </button>
              </div>
            ) : (
              <button
                className="text-btn muted"
                onClick={() => setConfirm(true)}
              >
                Đặt lại dữ liệu demo
              </button>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
