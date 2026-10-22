"use client";
import { useDemo } from "@/shared/lib/demo-store";
import { destinationCatalog } from "@/services/destinations";
import type { Destination } from "./lib/query";
import { destinationName } from "@/services/geography";
export function DestinationFilters({
  value,
  onChange,
}: {
  value: Destination[];
  onChange: (v: Destination[]) => void;
}) {
  const { data } = useDemo();
  const places = destinationCatalog(data);
  return (
    <fieldset className="destination-filters">
      <legend>Điểm đến và bán kính</legend>
      <p className="fineprint">
        Tọa độ mẫu · Haversine đường chim bay; không suy ra thời gian đi đường.
      </p>
      {value.map((d, i) => (
        <div className="destination-row" key={i}>
          <label>
            Điểm đến {i + 1}
            <select
              value={d.placeId}
              onChange={(e) =>
                onChange(
                  value.map((x, n) =>
                    n === i ? { ...x, placeId: e.target.value } : x,
                  ),
                )
              }
            >
              <option value="nearest-metro">Ga metro gần nhất</option>
              {places.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Bán kính {i + 1} (km)
            <input
              type="number"
              min="0.1"
              max="50"
              step="0.1"
              value={d.radiusKm}
              onChange={(e) => {
                const n = Number(e.target.value);
                if (n > 0 && n <= 50)
                  onChange(
                    value.map((x, k) => (k === i ? { ...x, radiusKm: n } : x)),
                  );
              }}
            />
          </label>
          <label>
            Mức yêu cầu {i + 1}
            <select
              value={d.mode}
              onChange={(e) =>
                onChange(
                  value.map((x, n) =>
                    n === i
                      ? { ...x, mode: e.target.value as Destination["mode"] }
                      : x,
                  ),
                )
              }
            >
              <option value="must">Bắt buộc</option>
              <option value="prefer">Ưu tiên</option>
            </select>
          </label>
          <button
            type="button"
            className="text-btn"
            onClick={() => onChange(value.filter((_, n) => n !== i))}
            aria-label={`Xóa ${destinationName(d.placeId, places)}`}
          >
            Xóa điểm đến
          </button>
        </div>
      ))}
      <button
        type="button"
        className="text-btn"
        disabled={value.length >= 5}
        onClick={() =>
          onChange([...value, { placeId: "uit", radiusKm: 2, mode: "must" }])
        }
      >
        Thêm điểm đến
      </button>
      <p className="fineprint">
        Bộ lọc hiện hỗ trợ vị trí, chi phí, loại phòng, thời hạn, thú cưng và
        tiện nghi. Các bộ lọc nâng cao về giờ giấc, ngày vào và xác minh chưa áp
        dụng tự động.
      </p>
    </fieldset>
  );
}
