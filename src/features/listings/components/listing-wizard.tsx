"use client";
import Link from "next/link";
import { useState } from "react";
import type { Fee, Listing } from "@/shared/lib/models";
import { useDemo } from "@/shared/lib/demo-store";
import { Guard, PageTitle } from "@/shared/components/ui";
import { areas, initialListings, roomImages } from "../mocks/listings";
import { feeKeys, feeLabels, feeStatusLabels, fee } from "../lib/fees";
import { RoomCard } from "./room-card";
import { actorId, canManage, saveListing } from "@/services/housing";
export function ListingWizard() {
  return (
    <Guard>
      <Wizard />
    </Guard>
  );
}
function Wizard() {
  const { data, update, command } = useDemo(),
    [edit] = useState(() =>
      new URLSearchParams(
        typeof window !== "undefined" ? window.location.search : "",
      ).get("edit"),
    );
  const existing = data.listings.find((r) => r.id === edit),
    key = actorId(data) + ":" + (edit || "new"),
    draft = data.housing.listingDrafts[key];
  const [listing, setListing] = useState<Listing>(
    () =>
      draft?.listing ||
      existing || {
        ...structuredClone(initialListings[0]),
        id: crypto.randomUUID(),
        roomId: undefined,
        ownerId: undefined,
        title: "",
        address: "",
        status: "draft",
        owner: "Bạn",
        verification: undefined,
        locationConfirmed: false,
        capacity: 2,
        price: 3000000,
        feeStates: Object.fromEntries(
          feeKeys.map((k) => [k, { status: "unknown", amount: null }]),
        ),
      },
  );
  const [step, setStep] = useState(draft?.step || 0),
    [done, setDone] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  function patch(p: Partial<Listing>) {
    const next = { ...listing, ...p };
    setListing(next);
    update((s) => ({
      ...s,
      housing: {
        ...s.housing,
        listingDrafts: {
          ...s.housing.listingDrafts,
          [key]: { listing: next, step },
        },
      },
    }));
  }
  function next(n: number) {
    setStep(n);
    update((s) => ({
      ...s,
      housing: {
        ...s.housing,
        listingDrafts: {
          ...s.housing.listingDrafts,
          [key]: { listing, step: n },
        },
      },
    }));
  }
  async function save(status: "draft" | "pending") {
    setBusy(true);
    setError("");
    const ok = await command((s) => {
      const result = saveListing(s, { ...listing, status });
      delete result.housing.listingDrafts[key];
      return result;
    });
    setBusy(false);
    if (ok) setDone(true);
    else
      setError(
        "Chưa lưu được. Kiểm tra nội dung và lý do thông báo, rồi thử lại.",
      );
  }
  if (existing && !canManage(data, existing))
    return (
      <main className="container section">
        <h1>Không có quyền sửa tin này</h1>
        <Link href="/quan-ly-tin">Về quản lý tin</Link>
      </main>
    );
  if (done)
    return (
      <main className="container narrow section">
        <h1>Tin phòng đã được lưu.</h1>
        <p>Tin chỉ hiển thị sau khi hồ sơ mẫu và nội dung được duyệt.</p>
        <Link className="btn primary" href="/quan-ly-tin">
          Về quản lý tin
        </Link>
      </main>
    );
  function field(
    k:
      | "title"
      | "address"
      | "rules"
      | "note"
      | "refundTerms"
      | "conditionalFees",
    label: string,
    required = false,
  ) {
    return (
      <label>
        {label}
        <input
          name={k}
          value={listing[k] || ""}
          required={required}
          minLength={k === "title" ? 10 : undefined}
          maxLength={k === "title" ? 100 : 1000}
          onChange={(e) => patch({ [k]: e.target.value })}
        />
      </label>
    );
  }
  function numeric(
    k:
      | "price"
      | "size"
      | "capacity"
      | "floor"
      | "leaseMonths"
      | "depositMonths"
      | "advanceMonths"
      | "roomNoise",
    label: string,
    min: number,
    max: number,
  ) {
    return (
      <label>
        {label}
        <input
          name={k}
          type="number"
          required
          min={min}
          max={max}
          step={1}
          value={listing[k] ?? min}
          onChange={(e) => patch({ [k]: Number(e.target.value) })}
        />
      </label>
    );
  }
  return (
    <main className="container narrow section">
      <PageTitle
        title={edit ? "Sửa tin phòng" : "Đăng tin phòng"}
        description="Bản nháp được lưu trên thiết bị sau mỗi bước."
      />
      <ol className="wizard-steps">
        {["Phòng và vị trí", "Chi phí", "Điều kiện và ảnh", "Xem trước"].map(
          (s, i) => (
            <li key={s} aria-current={i === step ? "step" : undefined}>
              {i + 1}. {s}
            </li>
          ),
        )}
      </ol>
      {error && (
        <p role="alert" className="warning">
          {error}
        </p>
      )}
      <form
        className="panel"
        onSubmit={(e) => {
          e.preventDefault();
          if (step < 3) next(step + 1);
          else save("pending");
        }}
      >
        <fieldset disabled={busy}>
          <legend className="sr-only">Bước {step + 1}</legend>
          {step === 0 ? (
            <>
              <h2>Phòng và vị trí</h2>
              <label>
                Tư cách người đăng
                <select
                  value={listing.posterCapacity || ""}
                  onChange={(e) => patch({ posterCapacity: e.target.value })}
                >
                  <option value="">Chưa khai tư cách</option>
                  <option value="Chủ sở hữu (khai báo mẫu)">Chủ sở hữu</option>
                  <option value="Người có quyền cho thuê lại (mẫu)">Người có quyền cho thuê lại</option>
                  <option value="Người đang thuê tìm bạn (mẫu)">Người đang thuê tìm bạn</option>
                </select>
              </label>
              <p>
                Mã căn phòng {listing.roomId || listing.id}. Đăng lại từ trang
                quản lý để giữ mã phòng cũ; không tự gộp theo địa chỉ.
              </p>
              {field("title", "Tiêu đề", true)}
              <label>
                Khu vực phục vụ
                <select
                  name="area"
                  value={listing.area}
                  onChange={(e) => patch({ area: e.target.value })}
                >
                  {areas.map((a) => (
                    <option key={a}>{a}</option>
                  ))}
                </select>
              </label>
              {field("address", "Địa chỉ phòng", true)}
              <div className="form-grid">
                {numeric("size", "Diện tích (m²)", 5, 500)}
                {numeric("capacity", "Số người tối đa", 1, 10)}
                <label>
                  Loại phòng
                  <select
                    name="kind"
                    value={listing.kind}
                    onChange={(e) => patch({ kind: e.target.value })}
                  >
                    <option>Phòng trọ</option>
                    <option>Studio</option>
                  </select>
                </label>
                <label>
                  Vĩ độ mẫu
                  <input
                    name="lat"
                    type="number"
                    step="any"
                    min="-90"
                    max="90"
                    value={listing.location?.lat ?? ""}
                    onChange={(e) =>
                      patch({
                        location: e.target.value
                          ? {
                              lat: Number(e.target.value),
                              lng: listing.location?.lng || 0,
                            }
                          : undefined,
                      })
                    }
                  />
                </label>
                <label>
                  Kinh độ mẫu
                  <input
                    name="lng"
                    type="number"
                    step="any"
                    min="-180"
                    max="180"
                    value={listing.location?.lng ?? ""}
                    onChange={(e) =>
                      patch({
                        location: e.target.value
                          ? {
                              lng: Number(e.target.value),
                              lat: listing.location?.lat || 0,
                            }
                          : undefined,
                      })
                    }
                  />
                </label>
              </div>
              <label className="check-row">
                <input
                  type="checkbox"
                  required={!!listing.location}
                  checked={listing.locationConfirmed || false}
                  onChange={(e) =>
                    patch({ locationConfirmed: e.target.checked })
                  }
                />
                Xác nhận vị trí đã khai báo
              </label>
              <p className="fineprint">
                Có thể để trống vị trí. Không có tọa độ sẽ không tính khoảng
                cách, không mặc định 0 km.
              </p>
            </>
          ) : step === 1 ? (
            <>
              <h2>Chi phí và tiền cọc</h2>
              {numeric("price", "Giá phòng / tháng (VNĐ)", 100000, 100000000)}
              <button
                type="button"
                className="text-btn"
                onClick={() =>
                  patch({
                    feeStates: structuredClone(initialListings[0].feeStates),
                    internet: 100000,
                    cleaning: 40000,
                    electricity: 3500,
                    water: 60000,
                    parking: 100000,
                  })
                }
              >
                Điền bảng phí tham khảo
              </button>
              {feeKeys.map((k) => {
                const f = fee(listing, k);
                return (
                  <div className="fee-field" key={k}>
                    <label>
                      {feeLabels[k]} — trạng thái
                      <select
                        value={f.status}
                        onChange={(e) => {
                          const status = e.target.value as Fee["status"];
                          patch({
                            feeStates: {
                              ...listing.feeStates,
                              [k]: {
                                status,
                                amount: status === "charged" ? 100000 : null,
                                includedIn:
                                  status === "included"
                                    ? "Tiền thuê phòng"
                                    : undefined,
                              },
                            },
                            ...([
                              "internet",
                              "cleaning",
                              "electricity",
                              "water",
                              "parking",
                            ].includes(k)
                              ? {
                                  [k]:
                                    status === "charged"
                                      ? 100000
                                      : status === "unknown" &&
                                          k === "electricity"
                                        ? null
                                        : 0,
                                }
                              : {}),
                          });
                        }}
                      >
                        {Object.entries(feeStatusLabels).map(([v, label]) => (
                          <option key={v} value={v}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </label>
                    {f.status === "charged" && (
                      <label>
                        {feeLabels[k]} — số tiền
                        <input
                          name={k}
                          type="number"
                          required
                          min="1"
                          value={f.amount ?? ""}
                          onChange={(e) => {
                            const amount = Number(e.target.value);
                            patch({
                              feeStates: {
                                ...listing.feeStates,
                                [k]: { ...f, amount },
                              },
                              ...([
                                "internet",
                                "cleaning",
                                "electricity",
                                "water",
                                "parking",
                              ].includes(k)
                                ? { [k]: amount }
                                : {}),
                            });
                          }}
                        />
                      </label>
                    )}
                    {f.status === "included" && (
                      <label>
                        Đã gồm ở đâu ({k})
                        <input
                          required
                          value={f.includedIn || ""}
                          onChange={(e) =>
                            patch({
                              feeStates: {
                                ...listing.feeStates,
                                [k]: { ...f, includedIn: e.target.value },
                              },
                            })
                          }
                        />
                      </label>
                    )}
                  </div>
                );
              })}
              <div className="form-grid">
                {numeric("depositMonths", "Số tháng cọc", 0, 12)}
                {numeric(
                  "advanceMonths",
                  "Số tháng tiền thuê trả ban đầu",
                  1,
                  12,
                )}
              </div>
              {field("refundTerms", "Điều kiện hoàn cọc", true)}
              {field(
                "conditionalFees",
                "Phí có điều kiện và tình huống áp dụng",
              )}
              <p>
                Khách ở lại/chuyển nhượng là khoản có điều kiện, không cộng vào
                tháng bình thường. Khoản trả trước gồm tháng đầu, không cộng
                tháng đầu hai lần.
              </p>
            </>
          ) : step === 2 ? (
            <>
              <h2>Điều kiện và ảnh</h2>
              <div className="form-grid">
                {numeric("leaseMonths", "Thuê tối thiểu (tháng)", 1, 60)}
                {numeric("floor", "Tầng", 0, 30)}
                {numeric("roomNoise", "Mức ồn (1 yên tĩnh – 5 ồn)", 1, 5)}
                <label>
                  Cửa sổ / view
                  <select
                    value={listing.view}
                    onChange={(e) => patch({ view: e.target.value })}
                  >
                    <option value="">Chưa rõ</option>
                    <option>Cửa sổ</option>
                    <option>Ban công</option>
                  </select>
                </label>
              </div>
              <label className="check-row">
                <input
                  type="checkbox"
                  checked={!!listing.elevator}
                  onChange={(e) => patch({ elevator: e.target.checked })}
                />
                Có thang máy
              </label>
              <fieldset>
                <legend>Thú cưng được nhận</legend>
                {(["cat", "dog"] as const).map((p) => (
                  <label className="check-row" key={p}>
                    <input
                      type="checkbox"
                      checked={listing.allowedPets?.includes(p) || false}
                      onChange={(e) => {
                        const allowed = e.target.checked
                          ? [...(listing.allowedPets || []), p]
                          : (listing.allowedPets || []).filter((x) => x !== p);
                        patch({
                          allowedPets: allowed,
                          pets: allowed.length > 0,
                        });
                      }}
                    />
                    {p === "cat" ? "Mèo" : "Chó"}
                  </label>
                ))}
              </fieldset>
              <fieldset>
                <legend>Tiện nghi đã khai báo</legend>
                {[
                  "WC riêng",
                  "Bếp riêng",
                  "Máy lạnh",
                  "Nội thất",
                  "Chỗ để xe",
                  "Cửa sổ",
                  "Ban công",
                ].map((a) => (
                  <label className="check-row" key={a}>
                    <input
                      type="checkbox"
                      checked={listing.amenities.includes(a)}
                      onChange={(e) =>
                        patch({
                          amenities: e.target.checked
                            ? [...listing.amenities, a]
                            : listing.amenities.filter((x) => x !== a),
                        })
                      }
                    />
                    {a}
                  </label>
                ))}
              </fieldset>
              {field("rules", "Nội quy", true)}
              {field(
                "note",
                "Lý do cập nhật (hiện trong lịch sử nếu đổi thông tin quan trọng)",
              )}
              <h3>Chọn ảnh minh họa</h3>
              <div className="image-picker">
                {roomImages.map((img) => (
                  <button
                    type="button"
                    key={img}
                    aria-pressed={listing.image === img}
                    className={listing.image === img ? "selected" : ""}
                    onClick={() => patch({ image: img })}
                  >
                    <img src={img} alt="Ảnh phòng mẫu" />
                  </button>
                ))}
              </div>
              <p>
                Ảnh mẫu chưa được kiểm chứng. Chỗ đang ở và quyền tìm roommate
                được quản lý riêng trong Không gian người đăng.
              </p>
            </>
          ) : (
            <>
              <h2>Xem trước tin phòng</h2>
              <RoomCard room={listing} preview />
              <p>
                {listing.address} · {listing.rules}
              </p>
              <p>
                Chưa rõ phí vẫn được gửi để làm rõ, không được trình bày như
                miễn phí hoặc chắc chắn đạt ngân sách. Xác minh liên hệ/danh
                tính mẫu cần đạt trước khi Admin công khai tin.
              </p>
            </>
          )}
          <div className="form-actions">
            {step > 0 && (
              <button
                type="button"
                className="btn outline"
                onClick={() => next(step - 1)}
              >
                Quay lại bước trước
              </button>
            )}
            <button
              className="btn outline"
              type="button"
              onClick={() => save("draft")}
            >
              Lưu nháp
            </button>
            <button className="btn primary">
              {step === 3 ? "Gửi duyệt" : "Tiếp tục"}
            </button>
          </div>
        </fieldset>
      </form>
    </main>
  );
}
