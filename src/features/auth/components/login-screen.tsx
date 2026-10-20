"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDemo } from "@/shared/lib/demo-store";
import { Icon } from "@/shared/components/icon";
import { Modal } from "@/shared/components/ui";
export function LoginScreen() {
  const { data, update, notify } = useDemo();
  const router = useRouter();
  const [register, setRegister] = useState(false),
    [name, setName] = useState(data.name),
    [email, setEmail] = useState(""),
    [password, setPassword] = useState(""),
    [show, setShow] = useState(false),
    [forgot, setForgot] = useState(false),
    [resetSent, setResetSent] = useState(false),
    [resetEmail, setResetEmail] = useState("");
  function startDemo() {
    const raw = new URLSearchParams(window.location.search).get("next");
    const destination =
      raw?.startsWith("/") && !raw.startsWith("//") ? raw : "/tai-khoan";
    update((s) => ({
      ...s,
      name: name.trim() || "Minh Anh",
      role: s.role === "guest" ? "tenant" : s.role,
      status: s.status === "active" ? "active" : "pending",
    }));
    if (data.status === "active") router.push(destination);
    else router.push("/xac-minh?next=" + encodeURIComponent(destination));
  }
  return (
    <main className="login-page">
      <div className="login-layout">
        <section className="login-story">
          <Link
            className="brand login-brand"
            href="/"
            aria-label="AnTro trang chủ"
          >
            <span className="brand-symbol">
              <img className="brand-house" src="/images/logo.jpg" alt="" />
            </span>
            AnTro<span className="brand-dot">.</span>
          </Link>
          <div className="login-story-copy">
            <p className="eyebrow">ANTRO · DEMO</p>
            <h1>Lưu phòng và trao đổi với người đăng.</h1>
            <p>
              Bạn cũng có thể tạo hồ sơ ở ghép, xem ngân sách và thói quen của
              các hồ sơ mẫu.
            </p>
          </div>
          <figure className="login-story-image">
            <img
              src="/images/student-room.jpg"
              alt="Góc phòng ngủ gọn gàng với ánh đèn đọc sách ấm áp"
            />
            <figcaption>Ảnh không gian sống minh họa</figcaption>
          </figure>
        </section>
        <section
          className="login-form-side"
          aria-label={register ? "Đăng ký demo" : "Đăng nhập demo"}
        >
          <div className="login-card">
            <p className="eyebrow">TÀI KHOẢN DEMO</p>
            <h2>{register ? "Đăng ký demo" : "Đăng nhập"}</h2>
            <p className="login-intro">
              {register
                ? "Tạo tài khoản mẫu để lưu phòng và dùng RoomMatch."
                : "Đăng nhập để lưu phòng và kết nối bạn ở ghép."}
            </p>
            {data.role === "admin" ? (
              <p className="info-note">
                Vai trò vận hành đã được chọn trong Công cụ demo.
              </p>
            ) : (
              <>
                <label>
                  Vai trò đăng nhập
                  <select
                    value={data.role === "guest" ? "tenant" : data.role}
                    onChange={(e) =>
                      update((s) => ({
                        ...s,
                        role: e.target.value as "tenant" | "landlord" | "admin",
                      }))
                    }
                  >
                    <option value="tenant">Người thuê</option>
                    <option value="landlord">Chủ trọ</option>
                  </select>
                </label>
              </>
            )}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                startDemo();
              }}
            >
              {register && (
                <label>
                  Tên hiển thị
                  <input
                    required
                    minLength={2}
                    maxLength={40}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoComplete="nickname"
                    placeholder="Bạn muốn được gọi là gì?"
                  />
                </label>
              )}
              <label>
                Email dùng trong demo
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ban@example.com"
                  autoComplete="email"
                />
              </label>
              <label htmlFor="login-password">Mật khẩu mẫu</label>
              <div className="password-field">
                <input
                  id="login-password"
                  type={show ? "text" : "password"}
                  required
                  minLength={6}
                  maxLength={80}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  placeholder="Ít nhất 6 ký tự, không dùng mật khẩu thật"
                />
                <button
                  type="button"
                  className="icon-btn"
                  aria-label={show ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  aria-pressed={show}
                  onClick={() => setShow(!show)}
                >
                  <Icon name={show ? "eyeOff" : "eye"} size={20} />
                </button>
              </div>
              <div className="login-form-meta">
                <span>Chỉ dành cho trải nghiệm mẫu</span>
                {!register && (
                  <button
                    className="text-btn"
                    type="button"
                    onClick={() => {
                      setForgot(true);
                      setResetSent(false);
                      setResetEmail(email);
                    }}
                  >
                    Quên mật khẩu?
                  </button>
                )}
              </div>
              <button className="btn primary full login-submit">
                {register ? "Đăng ký demo" : "Đăng nhập demo"}
                <Icon name="arrow" size={18} />
              </button>
            </form>
            <p className="login-switch">
              {register ? "Đã có tài khoản?" : "Bạn mới đến AnTro?"}{" "}
              <button
                className="text-btn"
                onClick={() => setRegister(!register)}
              >
                {register ? "Đăng nhập" : "Đăng ký"}
              </button>
            </p>
            <details className="login-demo">
              <summary>
                <Icon name="sliders" size={17} />
                Trải nghiệm demo
                <Icon name="chevron" size={15} />
              </summary>
              <div>
                <p>
                  Chưa có tài khoản? Dùng hồ sơ mẫu bên dưới. Không gửi thông
                  tin tới máy chủ.
                </p>
                {!register && (
                  <label>
                    Tên hiển thị
                    <input
                      value={name}
                      maxLength={40}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Minh Anh"
                    />
                  </label>
                )}
                <p className="demo-credentials">
                  Email: <strong>demo@antro.vn</strong>
                  <br />
                  Mật khẩu mẫu: <strong>Antro123!</strong>
                  <br />
                  OTP mô phỏng: <strong>123456</strong>
                </p>
                <button className="btn outline full" onClick={startDemo}>
                  Tiếp tục với tài khoản demo
                </button>
                <button
                  className="text-btn"
                  onClick={() => {
                    setEmail("demo@antro.vn");
                    setPassword("Antro123!");
                    notify("Đã điền thông tin mẫu. Bạn có thể đăng nhập demo.");
                  }}
                >
                  Điền vào form đăng nhập
                </button>
              </div>
            </details>
            <p className="login-privacy">
              <Icon name="shield" size={15} />
              Đăng nhập và xác minh đều mô phỏng. Không dùng mật khẩu hoặc giấy
              tờ thật.
            </p>
            <Link className="login-guest text-btn" href="/tim-phong">
              Xem phòng với tư cách khách <Icon name="arrow" size={16} />
            </Link>
          </div>
        </section>
      </div>
      {forgot && (
        <Modal title="Hỗ trợ mật khẩu demo" onClose={() => setForgot(false)}>
          {!resetSent ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setResetSent(true);
              }}
            >
              <p className="muted">
                Bản thử nghiệm không gửi email hoặc quản lý mật khẩu thật. Bạn
                có thể dùng mật khẩu mẫu để tiếp tục.
              </p>
              <label>
                Email mẫu
                <input
                  type="email"
                  required
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="demo@antro.vn"
                />
              </label>
              <button className="btn primary full">Xem hướng dẫn demo</button>
            </form>
          ) : (
            <div className="result-screen">
              <p>
                Mật khẩu mẫu là <strong>Antro123!</strong>. Không có email nào
                được gửi.
              </p>
              <button
                className="btn primary full"
                onClick={() => {
                  setEmail(resetEmail);
                  setPassword("Antro123!");
                  setForgot(false);
                }}
              >
                Điền thông tin và quay lại
              </button>
            </div>
          )}
        </Modal>
      )}
    </main>
  );
}
