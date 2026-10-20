"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDemo } from "@/shared/lib/demo-store";
import { Icon } from "@/shared/components/icon";
import { LoginScreen } from "./login-screen";
export function AuthScreen({ verify = false }: { verify?: boolean }) {
  const { data, update, notify } = useDemo();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [outcome, setOutcome] = useState("active");
  const [otp, setOtp] = useState("");
  const destination = () => {
    const n = new URLSearchParams(window.location.search).get("next");
    return n?.startsWith("/") && !n.startsWith("//") ? n : "/tai-khoan";
  };
  if (!verify) return <LoginScreen />;
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
      <h1>Xác minh tài khoản demo</h1>
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
              if (otp === "123456") {
                update((s) => ({
                  ...s,
                  identity: { ...s.identity!, otp: true },
                }));
                setStep(1);
              } else notify("Mã demo là 123456. Bạn hãy thử lại.");
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
            <div className="identity-sample">
              <img
                src="/images/person-1.jpg"
                width="80"
                height="80"
                alt="Chân dung mẫu, không phải người cần xác minh"
              />
              <p>THẺ DANH TÍNH MẪU · Không phải CCCD thật</p>
              <p>
                {data.identity?.name} · {data.identity?.gender} ·{" "}
                {data.identity?.birthYear} · {data.identity?.occupation}
              </p>
              <p>
                Mã mẫu: DEMO-****. Không camera, không tải giấy tờ. Kết quả là
                giả lập.
              </p>
            </div>
            <fieldset>
              <legend>Kịch bản kiểm tra mẫu</legend>
              {[
                ["active", "Mẫu hợp lệ"],
                ["review", "Mẫu cần xem xét"],
                ["rejected", "Mẫu không khớp"],
              ].map(([v, t]) => (
                <button
                  key={v}
                  type="button"
                  className={outcome === v ? "btn primary" : "btn outline"}
                  aria-pressed={outcome === v}
                  onClick={() => setOutcome(v)}
                >
                  {t}
                </button>
              ))}
            </fieldset>
            <button
              className="btn primary full"
              onClick={() => {
                update((s) => ({
                  ...s,
                  status: outcome as typeof s.status,
                  identity: { ...s.identity!, verified: outcome === "active" },
                  profile: {
                    ...s.profile,
                    name: s.identity?.name ?? s.profile.name,
                    gender: s.identity?.gender ?? s.profile.gender,
                  },
                }));
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
                Tiếp tục sử dụng demo <Icon name="arrow" size={17} />
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
