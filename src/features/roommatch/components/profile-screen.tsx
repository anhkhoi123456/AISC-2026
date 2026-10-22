"use client";
import { presentListing } from "@/features/listings/lib/presentation";
import Link from "next/link";
import { physicalId } from "@/services/housing";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { Profile, Criterion, Importance } from "@/shared/lib/models";
import { validateProfile } from "@/services/roommatch";
import { useDemo } from "@/shared/lib/demo-store";
import { areas } from "@/features/listings/mocks/listings";
import { places } from "@/features/search/mocks/places";
import { Guard, PageTitle } from "@/shared/components/ui";
export function ProfileScreen() {
  return (
    <Guard>
      <ProfileForm />
    </Guard>
  );
}
function ProfileForm() {
  const { data, update, notify } = useDemo(),
    router = useRouter();
  const [p, setP] = useState<Profile>({
    ...data.profile,
    ...(data.draft ?? {}),
    name: data.identity?.name ?? data.name,
    gender: data.identity?.gender ?? data.profile.gender,
  });
  const [step, setStep] = useState(Math.min(data.draftStep, 4));
  const set = <K extends keyof Profile>(k: K, v: Profile[K]) =>
    setP((x) => ({ ...x, [k]: v }));
  useEffect(() => {
    update((s) => ({ ...s, draft: p, draftStep: step }));
  }, [p, step, update]);
  const num = (key: keyof Profile, label: string, min = 0, max = 10000000) => (
    <label key={key}>
      {label}
      <input
        type="number"
        required
        min={min}
        max={max}
        value={p[key] as number}
        onChange={(e) => set(key, Number(e.target.value) as never)}
      />
    </label>
  );
  const select = (key: keyof Profile, label: string, values: string[]) => (
    <label key={key}>
      {label}
      <select
        value={String(p[key])}
        onChange={(e) => set(key, e.target.value as never)}
      >
        {values.map((v) => (
          <option key={v} value={v}>
            {v || "Không yêu cầu"}
          </option>
        ))}
      </select>
    </label>
  );
  const check = (key: keyof Profile, label: string) => (
    <label className="check-label" key={key}>
      <input
        type="checkbox"
        checked={Boolean(p[key])}
        onChange={(e) => set(key, e.target.checked as never)}
      />
      {label}
    </label>
  );
  function save(visible: boolean) {
    try {
      if (visible) validateProfile(p, data);
      update((s) => ({
        ...s,
        profile: visible ? { ...p, visible: true } : s.profile,
        draft: visible ? null : p,
        draftStep: visible ? 0 : step,
        lastSwipe: undefined,
      }));
      notify(
        visible ? "Đã bật hồ sơ RoomMatch demo." : "Đã lưu bản nháp hồ sơ.",
      );
      if (visible) router.push("/roommatch");
    } catch (e) {
      notify((e as Error).message);
    }
  }
  return (
    <main className="container narrow section">
      <PageTitle
        title="Hồ sơ ở ghép"
        description="Nhu cầu phòng và thói quen cá nhân được khai riêng. Tất cả là dữ liệu mô phỏng."
      />
      <div className="stepper">
        {["Nhu cầu", "Phòng & chi phí", "Nhịp sống", "Ưu tiên", "Xem lại"].map(
          (s, i) => (
            <span key={s} className={step >= i ? "current" : ""}>
              {i + 1}. {s}
            </span>
          ),
        )}
      </div>
      <form
        className="panel"
        onSubmit={(e) => {
          e.preventDefault();
          if (step < 4) setStep(step + 1);
          else save(true);
        }}
      >
        {step === 0 ? (
          <>
            <h2>Nhu cầu thuê</h2>
            <p className="info-note">
              Danh tính mẫu đã xác minh (chỉ đọc): {p.name} · {p.gender} ·{" "}
              {data.identity?.birthYear} · {data.identity?.occupation}. Chỉ thay
              mẫu trong Công cụ demo; không dùng giấy tờ thật.
            </p>
            <div className="scenario-options">
              {["Chưa có phòng", "Đã có phòng"].map((v) => (
                <button
                  type="button"
                  key={v}
                  className={p.scenario === v ? "selected" : ""}
                  onClick={() => set("scenario", v)}
                >
                  {v}
                </button>
              ))}
            </div>
            {p.scenario === "Đã có phòng" && (
              <>
                <label>
                  Phòng đang cần tìm bạn
                  <select
                    required
                    value={
                      data.listings.find((r) => r.id === p.roomId)?.roomId ??
                      p.roomId
                    }
                    onChange={(e) => set("roomId", e.target.value)}
                  >
                    <option value="">Chọn phòng mẫu</option>
                    {data.listings
                      .filter((r) => r.status === "published" && r.capacity > 1)
                      .map((r) => (
                        <option key={r.id} value={physicalId(r)}>
                          {presentListing(r).title}
                        </option>
                      ))}
                  </select>
                </label>
                {num("vacancies", "Số chỗ còn trống", 1, 9)}
              </>
            )}
            <label>
              Trường / nơi làm việc (điểm neo)
              <select
                value={p.anchor}
                onChange={(e) => set("anchor", e.target.value)}
              >
                <option value="">Chưa chọn</option>
                {places.map((x) => (
                  <option value={x.id} key={x.id}>
                    {x.name}
                  </option>
                ))}
              </select>
            </label>
            <p className="fineprint">
              Điểm neo không tự chọn khu vực thuê. Thời gian dưới đây do bạn
              nhập để minh họa, không phải đo bằng bản đồ.
            </p>
            <fieldset>
              <legend>Khu vực mong muốn — tối đa 5, theo thứ tự ưu tiên</legend>
              {areas.map((a) => (
                <label className="check-label" key={a}>
                  <input
                    type="checkbox"
                    checked={p.areas.includes(a)}
                    disabled={!p.areas.includes(a) && p.areas.length >= 5}
                    onChange={(e) => {
                      const next = e.target.checked
                        ? [...p.areas, a]
                        : p.areas.filter((x) => x !== a);
                      setP({
                        ...p,
                        areas: next,
                        area: next[0] ?? "",
                        commuteSamples: {
                          ...p.commuteSamples,
                          [a]: p.commuteSamples[a] ?? 30,
                        },
                      });
                    }}
                  />
                  {a}
                </label>
              ))}
              {p.areas.map((a, i) => (
                <div className="area-priority" key={a}>
                  <span>
                    {i + 1}. {a}
                  </span>
                  <button
                    type="button"
                    className="text-btn"
                    disabled={i === 0}
                    aria-label={"Ưu tiên cao hơn " + a}
                    onClick={() => {
                      const next = [...p.areas];
                      [next[i - 1], next[i]] = [next[i], next[i - 1]];
                      setP({ ...p, areas: next, area: next[0] });
                    }}
                  >
                    ↑
                  </button>
                  <label>
                    Phút di chuyển mẫu — {a}
                    <input
                      type="number"
                      min={0}
                      max={180}
                      required
                      value={p.commuteSamples[a] ?? 30}
                      onChange={(e) =>
                        set("commuteSamples", {
                          ...p.commuteSamples,
                          [a]: Number(e.target.value),
                        })
                      }
                    />
                  </label>
                </div>
              ))}
            </fieldset>
            <label>
              Di chuyển tối đa
              <select
                value={p.commuteMax}
                onChange={(e) => set("commuteMax", Number(e.target.value))}
              >
                {[15, 30, 45, 60].map((n) => (
                  <option key={n} value={n}>
                    {n} phút
                  </option>
                ))}
              </select>
            </label>
            <div className="form-grid">
              {num("min", "Ngân sách tối thiểu / người")}
              {num("max", "Ngân sách tối đa / người", 1)}
              {["moveFrom", "moveTo"].map((k, i) => (
                <label key={k}>
                  {i ? "Ngày vào muộn nhất" : "Ngày vào sớm nhất"}
                  <input
                    type="date"
                    required
                    value={p[k as "moveFrom"]}
                    onChange={(e) => set(k as "moveFrom", e.target.value)}
                  />
                </label>
              ))}
              {num("months", "Thời hạn tối thiểu (tháng)", 1, 60)}
              {num("monthsMax", "Thời hạn tối đa (tháng)", 1, 60)}
            </div>
          </>
        ) : step === 1 ? (
          <>
            <h2>Phòng và chi phí chấp nhận được</h2>
            <p className="fineprint">
              Khi cả hai chưa có phòng, các điều kiện này dùng để cùng tìm
              phòng; không khẳng định phòng chưa biết đã đáp ứng.
            </p>
            <div className="form-grid">
              {num("floorMin", "Tầng thấp nhất", 0, 30)}
              {num("floorMax", "Tầng cao nhất", 0, 30)}
              {select("view", "View mong muốn", [
                "",
                "Ban công",
                "Cửa sổ",
                "Trong hẻm",
                "Nội khu",
              ])}
              {num("roomNoiseMax", "Mức ồn phòng tối đa (1–4)", 1, 4)}
              {num("maxDepositMonths", "Số tháng cọc tối đa", 0, 12)}
              {num("maxElectricity", "Giá điện tối đa / kWh", 0, 20000)}
              {num(
                "maxExtraFees",
                "Tổng phí ngoài tiền thuê tối đa / người",
                0,
              )}
            </div>
            {check("elevator", "Bắt buộc có thang máy")}
            <fieldset>
              <legend>Tiện ích phòng bắt buộc</legend>
              {[
                "Máy lạnh",
                "WC riêng",
                "Ban công",
                "Bếp riêng",
                "Nội thất",
                "Chỗ để xe",
                "Cửa sổ",
              ].map((a) => (
                <label className="check-label" key={a}>
                  <input
                    type="checkbox"
                    checked={p.requiredAmenities.includes(a)}
                    onChange={(e) =>
                      set(
                        "requiredAmenities",
                        e.target.checked
                          ? [...p.requiredAmenities, a]
                          : p.requiredAmenities.filter((x) => x !== a),
                      )
                    }
                  />
                  {a}
                </label>
              ))}
            </fieldset>
          </>
        ) : step === 2 ? (
          <>
            <h2>Thói quen sinh hoạt</h2>
            <p className="fineprint">
              Nấu ăn, chế độ ăn, chia việc, ca đêm, tính cách và sở thích dùng
              để trao đổi; chưa có trọng số riêng nên không tự kết luận phù hợp
              từ các mục này.
            </p>
            <div className="form-grid">
              {select("sleep", "Giờ giấc", [
                "Bình thường",
                "Dậy sớm",
                "Cú đêm",
              ])}
              {num("tidy", "Gọn gàng (1–5)", 1, 5)}
              {num("noise", "Mức tiếng ồn của mình (1–4)", 1, 4)}
              {num("guests", "Khách đến chơi (1–4)", 1, 4)}
              {num(
                "guestsMax",
                "Chấp nhận khách của bạn cùng phòng tối đa (1–4)",
                1,
                4,
              )}
              {select("food", "Đồ ăn", ["Tách riêng", "Chia sẻ"])}
              {select("cooking", "Nấu ăn", ["Tự nấu", "Ăn ngoài", "Linh hoạt"])}
              {select("diet", "Chế độ ăn", [
                "Không yêu cầu",
                "Ăn chay",
                "Khác",
              ])}
              {select("chores", "Chia việc dọn dẹp", [
                "Luân phiên",
                "Cùng làm",
                "Thỏa thuận",
              ])}
              {num("alcohol", "Rượu bia của mình (1–4)", 1, 4)}
              {num("alcoholMax", "Chấp nhận rượu bia tối đa (1–4)", 1, 4)}
              {select("personality", "Tính cách tùy chọn", [
                "Tùy chọn",
                "Hướng nội",
                "Hướng ngoại",
                "Linh hoạt",
              ])}
            </div>
            {check("nightShift", "Mình làm ca đêm")}
            {check("smoke", "Mình hút thuốc")}
            {check("noSmoke", "Không ở cùng người hút thuốc")}
            {check("pets", "Mình có thú cưng")}
            {p.pets && (
              <label>
                Loại thú cưng của mình
                <select
                  value={p.petType}
                  onChange={(e) =>
                    set("petType", e.target.value as "cat" | "dog")
                  }
                >
                  <option value="cat">Mèo</option>
                  <option value="dog">Chó</option>
                </select>
              </label>
            )}
            {check("acceptPets", "Chấp nhận bạn có thú cưng")}
            {check("quiet", "Mình cần không gian yên tĩnh")}
            <label>
              Sở thích (tối đa 5, ngăn bằng dấu phẩy)
              <input
                value={p.interests.join(", ")}
                onChange={(e) =>
                  set(
                    "interests",
                    e.target.value
                      .split(",")
                      .map((x) => x.trim())
                      .slice(0, 5),
                  )
                }
              />
            </label>
            <label>
              Đôi lời giới thiệu
              <textarea
                required
                minLength={10}
                maxLength={300}
                value={p.bio}
                onChange={(e) => set("bio", e.target.value)}
              />
            </label>
          </>
        ) : step === 3 ? (
          <>
            <h2>Mức quan trọng của từng tiêu chí</h2>
            <p>
              Bắt buộc được kiểm tra hai chiều, không tính lại vào điểm mềm. Các
              khoảng khu vực/ngân sách/ngày/thời hạn luôn cần giao nhau.
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
            ).map(([k, label]) => (
              <label key={k}>
                {label}
                <select
                  value={p.importance[k]}
                  onChange={(e) =>
                    set("importance", {
                      ...p.importance,
                      [k]: e.target.value as Importance,
                    })
                  }
                >
                  {[
                    ["must", "Bắt buộc"],
                    ["important", "Quan trọng"],
                    ["normal", "Bình thường"],
                    ["ignore", "Không quan tâm"],
                  ].map(([v, t]) => (
                    <option value={v} key={v}>
                      {t}
                    </option>
                  ))}
                </select>
              </label>
            ))}
          </>
        ) : (
          <>
            <h2>Xem lại hồ sơ</h2>
            <div className="profile-preview">
              <h3>{p.name}</h3>
              <p>{p.bio}</p>
              <p>
                {p.scenario} · {p.areas.join(" → ")}
              </p>
              <p>
                {p.min.toLocaleString()}–{p.max.toLocaleString()} đ/người/tháng
                · {p.months}–{p.monthsMax} tháng
              </p>
              <p>
                {p.moveFrom}–{p.moveTo} · {p.sleep}
              </p>
              <p>
                Điểm neo:{" "}
                {places.find((x) => x.id === p.anchor)?.name ?? "Chưa chọn"} ·
                di chuyển tối đa {p.commuteMax} phút mẫu
              </p>
            </div>
            <p className="info-note">
              Danh tính và dữ liệu là mẫu mô phỏng, không phải kiểm tra người
              thật. Hồ sơ chỉ lưu trên trình duyệt này.
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
            className="text-btn"
            onClick={() => save(false)}
          >
            Lưu nháp
          </button>
          <button className="btn primary">
            {step < 4 ? "Tiếp tục" : "Bật hiển thị hồ sơ"}
          </button>
        </div>
      </form>
      <Link className="text-btn" href="/roommatch">
        Quay về RoomMatch
      </Link>
    </main>
  );
}
