"use client";
import { useState } from "react";
import type { Place } from "@/features/search/mocks/places";
import { areas } from "@/features/listings/mocks/listings";
import { destinationCatalog, saveDestination } from "@/services/destinations";
import { useDemo } from "@/shared/lib/demo-store";
export function DestinationAdmin() {
  const { data, command, busy } = useDemo();
  const catalog = destinationCatalog(data);
  const [selected, setSelected] = useState("uit");
  const [draft, setDraft] = useState<Place>(() =>
    structuredClone(catalog.find((p) => p.id === "uit")!),
  );
  const [message, setMessage] = useState("");
  return (
    <details className="detail-section">
      <summary>Quản lý điểm đến mẫu</summary>
      <p className="fineprint">
        Chỉ chỉnh dữ liệu giả lập trong trình duyệt. Tìm kiếm và khoảng cách
        trên trang phòng tính lại theo danh mục này; không phải cập nhật bản đồ
        thật.
      </p>
      <label>
        Điểm cần chỉnh
        <select
          value={selected}
          onChange={(e) => {
            setSelected(e.target.value);
            setMessage("");
            setDraft(
              e.target.value
                ? structuredClone(catalog.find((p) => p.id === e.target.value)!)
                : {
                    id: "demo-" + crypto.randomUUID(),
                    name: "",
                    kind: "Chợ",
                    area: areas[0],
                    aliases: [],
                    location: { lat: 10.87, lng: 106.8 },
                  },
            );
          }}
        >
          {catalog.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
          <option value="">Thêm điểm mới</option>
        </select>
      </label>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          const ok = await command((s) => saveDestination(s, draft));
          if (ok) {
            setSelected(draft.id);
            setMessage(
              "Đã lưu điểm đến mẫu. Khoảng cách được tính từ tọa độ mới.",
            );
          }
        }}
      >
        <fieldset disabled={busy} className="form-grid">
          <label>
            Tên điểm đến
            <input
              required
              maxLength={120}
              value={draft.name}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
            />
          </label>
          <label>
            Loại điểm đến
            <select
              value={draft.kind}
              onChange={(e) =>
                setDraft({ ...draft, kind: e.target.value as Place["kind"] })
              }
            >
              {[
                "Trường",
                "Metro",
                "Siêu thị",
                "Chợ",
                "Bệnh viện",
                "Cây xăng",
              ].map((k) => (
                <option key={k}>{k}</option>
              ))}
            </select>
          </label>
          <label>
            Khu vực điểm đến
            <select
              value={draft.area}
              onChange={(e) => setDraft({ ...draft, area: e.target.value })}
            >
              {areas.map((a) => (
                <option key={a}>{a}</option>
              ))}
            </select>
          </label>
          <label>
            Tên gọi khác (phân cách bằng dấu phẩy)
            <input
              value={draft.aliases.join(",")}
              onChange={(e) =>
                setDraft({ ...draft, aliases: e.target.value.split(",") })
              }
            />
          </label>
          <label>
            Vĩ độ điểm đến mẫu
            <input
              type="number"
              required
              step="any"
              min={-90}
              max={90}
              value={draft.location?.lat ?? ""}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  location: {
                    lat: Number(e.target.value),
                    lng: draft.location?.lng ?? 0,
                  },
                })
              }
            />
          </label>
          <label>
            Kinh độ điểm đến mẫu
            <input
              type="number"
              required
              step="any"
              min={-180}
              max={180}
              value={draft.location?.lng ?? ""}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  location: {
                    lat: draft.location?.lat ?? 0,
                    lng: Number(e.target.value),
                  },
                })
              }
            />
          </label>
          <button className="btn btn-primary">Lưu điểm đến mẫu</button>
        </fieldset>
      </form>
      {message && <p role="status">{message}</p>}
    </details>
  );
}
