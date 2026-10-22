"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDemo } from "@/shared/lib/demo-store";
import { Icon } from "@/shared/components/icon";
import { Modal } from "@/shared/components/ui";
export function LoginScreen() {
  const { data, update } = useDemo();
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
      role:
        s.role === "guest" ||
        (s.role === "admin" && process.env.NODE_ENV !== "development")
          ? "tenant"
          : s.role,
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
            <p className="eyebrow">AnTro</p>
            <h1>Lưu phòng và trao đổi với người đăng.</h1>
            <p>Xem lại những phòng đã lưu và các cuộc trò chuyện của bạn.</p>
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
          aria-label={register ? "Đăng ký" : "Đăng nhập"}
        >
          <div className="login-card">
            <p className="eyebrow">Tài khoản</p>
            <h2>{register ? "Đăng ký" : "Đăng nhập"}</h2>
            <p className="login-intro">
              {register
                ? "Lưu phòng và quản lý hồ sơ ở ghép của bạn."
                : "Đăng nhập để lưu phòng và kết nối bạn ở ghép."}
            </p>
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
                Email
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ban@example.com"
                  autoComplete="email"
                />
              </label>
              <label htmlFor="login-password">Mật khẩu</label>
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
                  placeholder="Ít nhất 6 ký tự"
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
                <span>Chỉ lưu trên thiết bị này</span>
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
                {register ? "Đăng ký" : "Đăng nhập"}
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
            <p className="login-privacy">
              <Icon name="shield" size={15} />
              Tài khoản chỉ lưu trên thiết bị này, chưa có xác thực từ máy chủ.
              Không dùng mật khẩu thật.
            </p>
            <Link className="login-guest text-btn" href="/tim-phong">
              Xem phòng với tư cách khách <Icon name="arrow" size={16} />
            </Link>
          </div>
        </section>
      </div>
      {forgot && (
        <Modal title="Hỗ trợ đăng nhập" onClose={() => setForgot(false)}>
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
              <button className="btn primary full">Xem hướng dẫn</button>
            </form>
          ) : (
            <div className="result-screen">
              <p>
                Bạn có thể dùng <strong>Antro123!</strong> cho tài khoản cục bộ.
                Không có email nào được gửi.
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
