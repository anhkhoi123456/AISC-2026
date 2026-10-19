"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDemo } from "@/shared/lib/demo-store";
import { Icon } from "@/shared/components/icon";
export function AuthScreen({ verify = false }: { verify?: boolean }) {
  const { data, update, notify } = useDemo();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [name, setName] = useState(data.name);
  const [outcome, setOutcome] = useState("active");
  const [otp, setOtp] = useState("");
  const destination = () => {
    const n = new URLSearchParams(window.location.search).get("next");
    return n?.startsWith("/") && !n.startsWith("//") ? n : "/tai-khoan";
  };
  if (!verify)
    return (
      <main className="auth-layout">
        <div className="auth-visual">
          <img src="/images/room-2.jpg" alt="Không gian sống ấm áp" />
          <div>
            <p className="eyebrow">MỖI KHỞI ĐẦU ĐỀU CẦN MỘT NƠI</p>
            <h1>
              Một nơi để ở.
              <br />
              Một nơi thuộc về.
            </h1>
            <p>Căn phòng tiếp theo và người bạn mới có thể đang chờ bạn.</p>
          </div>
        </div>
        <div className="auth-content">
          <span className="auth-icon">
            <Icon name="leaf" size={30} />
          </span>
          <p className="eyebrow">CHÀO BẠN ĐẾN VỚI ANTRO</p>
          <h1>Bắt đầu câu chuyện mới.</h1>
          <p className="muted">
            Dùng tài khoản mẫu để khám phá toàn bộ hành trình.
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              update((s) => ({
                ...s,
                name: name.trim(),
                role: "tenant",
                status: s.status === "active" ? "active" : "pending",
              }));
              if (data.status === "active") router.push(destination());
              else
                router.push(
                  "/xac-minh?next=" + encodeURIComponent(destination()),
                );
            }}
          >
            <label>
              Tên hiển thị
              <input
                required
                minLength={2}
                maxLength={40}
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                placeholder="Bạn tên là gì?"
              />
            </label>
            <label>
              Email dùng trong demo
              <input
                type="email"
                required
                placeholder="ban@example.com"
                autoComplete="email"
              />
            </label>
            <button className="btn primary full">
              Tiếp tục với tài khoản demo <Icon name="arrow" size={17} />
            </button>
          </form>
          <div className="info-note small">
            <Icon name="shield" size={20} />
            <p>
              Đăng nhập chỉ được mô phỏng trong trình duyệt. Không dùng mật khẩu
              hoặc thông tin cá nhân thật.
            </p>
          </div>
          <Link href="/tim-phong" className="text-btn muted">
            Tiếp tục xem phòng với tư cách khách <Icon name="arrow" size={15} />
          </Link>
        </div>
      </main>
    );
  if (data.status === "guest")
    return (
      <main className="container section">
        <div className="empty">
          <h1>Hãy đăng nhập trước nhé.</h1>
          <Link className="btn primary" href="/dang-nhap">
            Đăng nhập demo
          </Link>
        </div>
      </main>
    );
  return (
    <main className="container narrow section">
      <p className="eyebrow">XÁC MINH MÔ PHỎNG</p>
      <h1>Một cộng đồng bắt đầu từ tin cậy.</h1>
      <p className="muted">
        Trải nghiệm luồng OTP và eKYC với dữ liệu mẫu. Không nhập giấy tờ thật.
      </p>
      <div className="stepper">
        {["Số điện thoại", "Danh tính", "Kết quả"].map((s, i) => (
          <span key={s} className={step >= i ? "current" : ""}>
            <b>{i + 1}</b>
            {s}
          </span>
        ))}
      </div>
      <div className="panel">
        {step === 0 ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (otp === "123456") setStep(1);
              else notify("Mã demo là 123456. Bạn hãy thử lại.");
            }}
          >
            <h2>Xác nhận số điện thoại</h2>
            <p>
              Hệ thống không gửi SMS. Sử dụng mã <strong>123456</strong> để thử
              luồng.
            </p>
            <label>
              Số điện thoại mẫu
              <input value="090 000 0000" readOnly />
            </label>
            <label>
              Mã OTP demo
              <input
                required
                inputMode="numeric"
                pattern="[0-9]{6}"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="123456"
              />
            </label>
            <button className="btn primary full">
              Xác nhận và tiếp tục <Icon name="arrow" size={17} />
            </button>
          </form>
        ) : step === 1 ? (
          <div>
            <span className="empty-icon">
              <Icon name="shield" size={35} />
            </span>
            <h2>Xác minh danh tính mẫu</h2>
            <p className="muted">
              Sử dụng bộ kết quả giả lập, không mở camera hoặc thu CCCD.
            </p>
            <label>
              Tình huống muốn trải nghiệm
              <select
                value={outcome}
                onChange={(e) => setOutcome(e.target.value)}
              >
                <option value="active">Đạt — kích hoạt tài khoản demo</option>
                <option value="pending">Ảnh chưa rõ — cần thử lại</option>
                <option value="review">Cần đội vận hành duyệt thủ công</option>
                <option value="rejected">
                  Từ chối — thông tin mẫu không khớp
                </option>
              </select>
            </label>
            <button
              className="btn primary full"
              onClick={() => {
                update((s) => ({ ...s, status: outcome as typeof s.status }));
                setStep(2);
              }}
            >
              Xem kết quả mô phỏng
            </button>
          </div>
        ) : (
          <div className="result-screen">
            <span className="empty-icon">
              <Icon
                name={outcome === "active" ? "check" : "shield"}
                size={35}
              />
            </span>
            <h2>
              {outcome === "active"
                ? "Bạn đã sẵn sàng!"
                : outcome === "review"
                  ? "Đang chờ duyệt thủ công"
                  : outcome === "rejected"
                    ? "Chưa thể xác minh"
                    : "Cần bổ sung thông tin"}
            </h2>
            <p className="muted">
              {outcome === "active"
                ? "Tài khoản demo đã kích hoạt. Bạn có thể lưu tin, kết nối và chat."
                : outcome === "review"
                  ? "Yêu cầu mẫu đã chuyển vào khu vực vận hành. Bạn vẫn có thể xem phòng."
                  : "Kết quả mô phỏng chưa đạt. Bạn có thể chọn thử lại với dữ liệu mẫu khác."}
            </p>
            {outcome === "active" ? (
              <button
                className="btn primary"
                onClick={() => router.push(destination())}
              >
                Tiếp tục hành trình <Icon name="arrow" size={17} />
              </button>
            ) : (
              <>
                <button className="btn primary" onClick={() => setStep(1)}>
                  Thử lại mô phỏng
                </button>
                <Link className="btn outline" href="/tim-phong">
                  Xem phòng
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
