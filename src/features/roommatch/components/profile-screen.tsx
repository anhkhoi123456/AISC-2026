"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { validateProfile } from "@/services/roommatch";
import type { Criterion, Importance } from "@/shared/lib/models";
import { useRouter } from "next/navigation";
import { useDemo } from "@/shared/lib/demo-store";
import { areas } from "@/features/listings/mocks/listings";
import { Guard, PageTitle } from "@/shared/components/ui";
import { Icon } from "@/shared/components/icon";
export function ProfileScreen() {
  return (
    <Guard>
      <ProfileForm />
    </Guard>
  );
}
function ProfileForm() {
  const { data, update, notify } = useDemo();
  const [p, setP] = useState({
    ...(data.draft ?? data.profile),
    name: data.name,
  });
  const [step, setStep] = useState(data.draftStep);
  const router = useRouter();
  useEffect(() => {
    update((s) => ({ ...s, draft: p, draftStep: step }));
  }, [p, step, update]);
  function save(visible = false) {
    if (visible)
      try {
        validateProfile(p, data);
      } catch (error) {
        notify((error as Error).message);
        return;
      }
    update((s) => ({
      ...s,
      profile: visible ? { ...p, visible } : s.profile,
      draft: visible ? null : p,
      draftStep: visible ? 0 : step,
    }));
    notify(visible ? "Đã bật hồ sơ RoomMatch demo." : "Đã lưu bản nháp hồ sơ.");
    if (visible) router.push("/roommatch");
  }
  return (
    <main className="container narrow section">
      <PageTitle
        eyebrow="HỒ SƠ ROOMMATCH"
        title="Kể một chút về bạn."
        description="Những điều nhỏ trong nhịp sống giúp chúng mình tìm người hợp hơn."
      />
      <div className="stepper">
        {["Nhu cầu", "Nhịp sống", "Xem lại"].map((s, i) => (
          <span key={s} className={step >= i ? "current" : ""}>
            <b>{i + 1}</b>
            {s}
          </span>
        ))}
      </div>
      <form
        className="panel"
        onSubmit={(e) => {
          e.preventDefault();
          if (p.min > p.max || p.moveFrom > p.moveTo) {
            notify("Khoảng ngân sách hoặc ngày vào ở chưa hợp lệ.");
            return;
          }
          if (p.scenario === "Đã có phòng" && !p.roomId) {
            notify("Hãy chọn phòng liên kết.");
            return;
          }
          if (step < 2) setStep(step + 1);
          else save(true);
        }}
      >
        {step === 0 ? (
          <>
            <h2>Bạn đang tìm điều gì?</h2>
            <div className="scenario-options">
              {["Chưa có phòng", "Đã có phòng"].map((s) => (
                <button
                  type="button"
                  className={p.scenario === s ? "selected" : ""}
                  onClick={() => setP({ ...p, scenario: s })}
                  key={s}
                >
                  <Icon
                    name={s === "Đã có phòng" ? "home" : "users"}
                    size={26}
                  />
                  <strong>{s}</strong>
                  <span>
                    {s === "Đã có phòng"
                      ? "Tìm thêm người ở chung"
                      : "Tìm bạn rồi cùng tìm phòng"}
                  </span>
                </button>
              ))}
            </div>
            {p.scenario === "Đã có phòng" && (
              <label>
                Phòng đang cần tìm bạn
                <select
                  required
                  value={p.roomId}
                  onChange={(e) => setP({ ...p, roomId: e.target.value })}
                >
                  <option value="">Chọn phòng mẫu</option>
                  {data.listings
                    .filter((r) => r.status === "published")
                    .map((r) => (
                      <option value={r.id} key={r.id}>
                        {r.title}
                      </option>
                    ))}
                </select>
              </label>
            )}
            <label>
              Khu vực mong muốn
              <select
                value={p.area}
                onChange={(e) => setP({ ...p, area: e.target.value })}
              >
                {areas.map((a) => (
                  <option key={a}>{a}</option>
                ))}
              </select>
            </label>
            <div className="form-grid">
              <label>
                Ngân sách tối thiểu / người
                <input
                  type="number"
                  min="0"
                  step="100000"
                  required
                  value={p.min}
                  onChange={(e) => setP({ ...p, min: Number(e.target.value) })}
                />
              </label>
              <label>
                Ngân sách tối đa / người
                <input
                  type="number"
                  min="100000"
                  step="100000"
                  required
                  value={p.max}
                  onChange={(e) => setP({ ...p, max: Number(e.target.value) })}
                />
              </label>
              <label>
                Ngày vào sớm nhất
                <input
                  type="date"
                  required
                  value={p.moveFrom}
                  onChange={(e) => setP({ ...p, moveFrom: e.target.value })}
                />
              </label>
              <label>
                Ngày vào muộn nhất
                <input
                  type="date"
                  required
                  value={p.moveTo}
                  onChange={(e) => setP({ ...p, moveTo: e.target.value })}
                />
              </label>
            </div>
            <label>
              Thời hạn mong muốn
              <select
                value={p.months}
                onChange={(e) => setP({ ...p, months: Number(e.target.value) })}
              >
                {[3, 6, 10, 12].map((n) => (
                  <option value={n} key={n}>
                    {n} tháng
                  </option>
                ))}
              </select>
            </label>
            <p className="fineprint">
              Demo dùng một khu vực chính và ngân sách tổng ước tính. Khu vực,
              ngân sách, ngày và thời hạn là điều kiện bắt buộc.
            </p>
          </>
        ) : step === 1 ? (
          <>
            <h2>Nhịp sống của bạn thế nào?</h2>
            <div className="form-grid">
              <label>
                Giới tính tự khai
                <select
                  value={p.gender}
                  onChange={(e) => setP({ ...p, gender: e.target.value })}
                >
                  <option>Nữ</option>
                  <option>Nam</option>
                </select>
              </label>
              <label>
                Giờ giấc
                <select
                  value={p.sleep}
                  onChange={(e) => setP({ ...p, sleep: e.target.value })}
                >
                  <option>Dậy sớm</option>
                  <option>Bình thường</option>
                  <option>Cú đêm</option>
                </select>
              </label>
            </div>
            <p className="fineprint">
              Demo mặc định ghép cùng giới tự khai. Dữ liệu này chưa được xác
              minh.
            </p>
            <label>
              Mức gọn gàng: {p.tidy}/5
              <input
                type="range"
                min="1"
                max="5"
                value={p.tidy}
                onChange={(e) => setP({ ...p, tidy: Number(e.target.value) })}
              />
            </label>
            {(
              [
                ["smoke", "Mình có hút thuốc"],
                ["noSmoke", "Bắt buộc bạn ở ghép không hút thuốc"],
                ["pets", "Mình có nuôi thú cưng"],
                ["acceptPets", "Mình có thể ở cùng thú cưng"],
              ] as const
            ).map(([key, text]) => (
              <label className="check-label" key={key}>
                <input
                  type="checkbox"
                  checked={p[key]}
                  onChange={(e) => setP({ ...p, [key]: e.target.checked })}
                />
                {text}
              </label>
            ))}
            <label className="check-label">
              <input
                type="checkbox"
                checked={p.quiet}
                onChange={(e) => setP({ ...p, quiet: e.target.checked })}
              />
              Mình cần không gian yên tĩnh
            </label>
            <div className="form-grid">
              <label>
                Mức tiếng ồn của mình
                <select
                  value={p.noise}
                  onChange={(e) =>
                    setP({ ...p, noise: Number(e.target.value) })
                  }
                >
                  {[1, 2, 3, 4].map((n) => (
                    <option value={n} key={n}>
                      {n} —{" "}
                      {
                        [
                          "Rất yên tĩnh",
                          "Thỉnh thoảng",
                          "Khá thường xuyên",
                          "Thường xuyên",
                        ][n - 1]
                      }
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Khách đến chơi
                <select
                  value={p.guests}
                  onChange={(e) =>
                    setP({ ...p, guests: Number(e.target.value) })
                  }
                >
                  {[1, 2, 3, 4].map((n) => (
                    <option value={n} key={n}>
                      {n} —{" "}
                      {
                        [
                          "Hiếm",
                          "Thỉnh thoảng",
                          "Khá thường xuyên",
                          "Thường xuyên",
                        ][n - 1]
                      }
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Đồ ăn
                <select
                  value={p.food}
                  onChange={(e) => setP({ ...p, food: e.target.value })}
                >
                  <option>Tách riêng</option>
                  <option>Chia sẻ</option>
                </select>
              </label>
            </div>
            <details className="importance-panel">
              <summary>Mức quan trọng của từng tiêu chí</summary>
              <p className="fineprint">
                Bắt buộc được kiểm tra từ cả hai phía; không tính lại vào điểm
                mềm. Không quan tâm có trọng số 0.
              </p>
              {(
                [
                  ["area", "Khu vực"],
                  ["budget", "Ngân sách"],
                  ["lease", "Thời hạn"],
                  ["sleep", "Giờ ngủ"],
                  ["tidy", "Gọn gàng"],
                  ["smoking", "Hút thuốc"],
                  ["guests", "Khách"],
                  ["noise", "Yên tĩnh"],
                  ["food", "Ăn uống"],
                  ["pets", "Thú cưng"],
                ] as [Criterion, string][]
              ).map(([key, label]) => (
                <label key={key}>
                  {label}
                  <select
                    value={p.importance[key]}
                    onChange={(e) =>
                      setP({
                        ...p,
                        importance: {
                          ...p.importance,
                          [key]: e.target.value as Importance,
                        },
                      })
                    }
                  >
                    {[
                      ["must", "Bắt buộc"],
                      ["important", "Quan trọng"],
                      ["normal", "Bình thường"],
                      ["ignore", "Không quan tâm"],
                    ].map(([value, text]) => (
                      <option value={value} key={value}>
                        {text}
                      </option>
                    ))}
                  </select>
                </label>
              ))}
            </details>
            <label>
              Đôi lời giới thiệu
              <textarea
                required
                minLength={10}
                maxLength={300}
                value={p.bio}
                onChange={(e) => setP({ ...p, bio: e.target.value })}
              />
              <small>{p.bio.length}/300 ký tự</small>
            </label>
          </>
        ) : (
          <>
            <h2>Sẵn sàng gặp người bạn mới?</h2>
            <div className="profile-preview">
              <span className="avatar large">{p.name[0]}</span>
              <h3>{p.name}</h3>
              <p>{p.bio}</p>
              <div className="tags">
                <span>{p.area}</span>
                <span>
                  {p.min / 1000000}–{p.max / 1000000} triệu / người
                </span>
                <span>{p.months} tháng</span>
                <span>{p.sleep}</span>
              </div>
            </div>
            <p className="info-note">
              Hồ sơ chỉ hiển thị trong dữ liệu demo của trình duyệt. Bạn có thể
              ẩn bất cứ lúc nào. Các ứng viên mẫu không phải người dùng thật.
            </p>
          </>
        )}
        <div className="form-actions">
          {step > 0 && (
            <button
              type="button"
              className="btn outline"
              onClick={() => setStep(step - 1)}
            >
              Quay lại
            </button>
          )}
          <button
            type="button"
            className="text-btn muted"
            onClick={() => save(false)}
          >
            Lưu nháp
          </button>
          <button className="btn primary">
            {step < 2 ? "Tiếp tục" : "Bật hiển thị hồ sơ"}
            <Icon name="arrow" size={16} />
          </button>
        </div>
      </form>
      <Link className="text-btn muted" href="/roommatch">
        Quay về RoomMatch
      </Link>
    </main>
  );
}
