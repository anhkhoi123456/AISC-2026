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
  const [deleting, setDeleting] = useState(false);
  const [confirm, setConfirm] = useState(false);
  if (data.status === "guest")
    return (
      <main className="container section">
        <Empty
          title="Tài khoản"
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
        description="Xem trạng thái xác minh, hồ sơ ở ghép và dữ liệu demo đã lưu."
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
                hoạt động. Điểm User Trust được tính từ bằng chứng mẫu, không
                phải uy tín của người thật. Xác minh danh tính không bảo đảm
                quyền cho thuê hoặc hành vi của người dùng.
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
            <p>
              Công cụ mô phỏng trạng thái nằm ở nút Công cụ demo trên header.
              Xác minh thực hiện theo luồng OTP và danh tính mẫu.
            </p>
            <hr />
            {deleting ? (
              <div>
                <p>
                  Xóa tài khoản, hồ sơ, hội thoại và bản sao lưu demo trong
                  trình duyệt này? Thao tác không tác động máy người khác.
                </p>
                <button
                  className="btn danger-btn"
                  onClick={() => {
                    for (const key of Object.keys(localStorage))
                      if (key.startsWith("antro-demo"))
                        localStorage.removeItem(key);
                    reset();
                    setDeleting(false);
                    notify(
                      "Đã xóa dữ liệu tài khoản demo và bản sao lưu cục bộ; khởi tạo lại seed khách.",
                    );
                  }}
                >
                  Xác nhận xóa dữ liệu tài khoản
                </button>
                <button
                  className="btn outline"
                  onClick={() => setDeleting(false)}
                >
                  Hủy xóa
                </button>
              </div>
            ) : (
              <button
                className="btn danger-btn"
                onClick={() => setDeleting(true)}
              >
                Xóa dữ liệu tài khoản demo
              </button>
            )}
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
