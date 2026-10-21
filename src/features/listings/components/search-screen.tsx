"use client";
import { Suspense, useEffect, useMemo, useState, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useDemo } from "@/shared/lib/demo-store";
import { PageTitle, Empty } from "@/shared/components/ui";
import { Icon } from "@/shared/components/icon";
import { areas } from "../mocks/listings";
import { RoomCard } from "./room-card";
import {
  defaultQuery,
  parseQuery,
  readQuery,
  suggestPlaces,
  writeQuery,
  type SearchQuery,
} from "@/features/search/lib/query";
import { places, type Place } from "@/features/search/mocks/places";
import { searchService } from "@/services/search";
export function SearchScreen(props: { favorites?: boolean }) {
  return (
    <Suspense
      fallback={<main className="container section">Đang đọc bộ lọc…</main>}
    >
      <SearchContent {...props} />
    </Suspense>
  );
}
function SearchContent({ favorites = false }: { favorites?: boolean }) {
  const { data } = useDemo();
  const router = useRouter(),
    pathname = usePathname(),
    params = useSearchParams();
  const serialized = params.toString();
  const q = useMemo(
    () => readQuery(new URLSearchParams(serialized)),
    [serialized],
  );
  const [query, setQuery] = useState("");
  const [note, setNote] = useState("");
  const [unknown, setUnknown] = useState<string[]>([]);
  const [open, setOpen] = useState(false),
    [active, setActive] = useState(-1);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [result, setResult] = useState<Awaited<
    ReturnType<typeof searchService.search>
  > | null>(null);
  const [loading, setLoading] = useState(true),
    [error, setError] = useState(""),
    [retry, setRetry] = useState(0);
  const filterRef = useRef<HTMLElement>(null);
  const sourceQuery = params.get("q") ?? "";
  useEffect(() => {
    if (sourceQuery) {
      setQuery(sourceQuery);
      const parsed = parseQuery(sourceQuery);
      setUnknown(parsed.unknown);
      if (parsed.unknown.length)
        setNote(
          "Một phần nhu cầu chưa được hiểu. Hãy chỉnh bằng bộ lọc bên dưới.",
        );
    }
  }, [sourceQuery]);
  const suggestions = suggestPlaces(query);
  const listings = useMemo(
    () => data.listings.filter((r) => !favorites || data.saved.includes(r.id)),
    [data.listings, data.saved, favorites],
  );
  useEffect(() => {
    let current = true;
    setLoading(true);
    setError("");
    searchService
      .search(listings, q)
      .then((r) => {
        if (current) {
          setResult(r);
          setLoading(false);
        }
      })
      .catch(() => {
        if (current) {
          setError("Không tải được kết quả demo. Hãy thử lại.");
          setLoading(false);
        }
      });
    return () => {
      current = false;
    };
  }, [listings, q, retry]);
  function change(patch: Partial<SearchQuery>) {
    const next = { ...q, ...patch };
    const qs = writeQuery(next);
    router.push(pathname + (qs ? "?" + qs : ""), { scroll: false });
  }
  function choose(p: Place) {
    change({ place: p.id, area: p.area });
    setQuery(p.name);
    setOpen(false);
    setActive(-1);
    setNote(
      "Địa điểm đã được chọn từ dữ liệu mẫu. Vị trí tìm theo cụm; chưa đo khoảng cách thực tế.",
    );
  }
  function edit(id: string) {
    setFiltersOpen(true);
    requestAnimationFrame(() => {
      const field = filterRef.current?.querySelector<HTMLElement>("#" + id);
      field?.focus();
      field?.scrollIntoView({ block: "center", behavior: "smooth" });
    });
  }
  const anchor = places.find((p) => p.id === q.place);
  const chips: {
    key: string;
    label: string;
    clear: Partial<SearchQuery>;
    field: string;
  }[] = [];
  if (anchor)
    chips.push({
      key: "place",
      label: anchor.name,
      clear: { place: "", area: "" },
      field: "area-filter",
    });
  else if (q.area)
    chips.push({
      key: "area",
      label: q.area,
      clear: { area: "" },
      field: "area-filter",
    });
  if (q.budget)
    chips.push({
      key: "budget",
      label: "Ngân sách ≤ " + Number(q.budget) / 1000000 + " triệu",
      clear: { budget: "" },
      field: "budget-filter",
    });
  if (q.pets)
    chips.push({
      key: "pets",
      label:
        (q.petType === "cat"
          ? "Mèo"
          : q.petType === "dog"
            ? "Chó"
            : "Thú cưng") +
        " · " +
        (q.petMode === "must" ? "Bắt buộc" : "Ưu tiên"),
      clear: { pets: false, petType: "any" },
      field: "pets-filter",
    });
  if (q.months)
    chips.push({
      key: "months",
      label: "Thuê " + q.months + " tháng",
      clear: { months: "" },
      field: "months-filter",
    });
  if (q.kind)
    chips.push({
      key: "kind",
      label: q.kind,
      clear: { kind: "" },
      field: "kind-filter",
    });
  if (q.amenity)
    chips.push({
      key: "amenity",
      label:
        q.amenity + " · " + (q.amenityMode === "must" ? "Bắt buộc" : "Ưu tiên"),
      clear: { amenity: "" },
      field: "amenity-filter",
    });
  return (
    <main className="container section">
      <PageTitle
        title={favorites ? "Tin đã lưu" : "Tìm phòng"}
        description="Lọc theo khu vực, ngân sách và điều kiện ở. Tin và địa điểm trong bản này là dữ liệu mẫu."
      />
      {!favorites && (
        <form
          className="natural-search"
          onSubmit={(e) => {
            e.preventDefault();
            if (open && active >= 0 && suggestions[active]) {
              choose(suggestions[active]);
              return;
            }
            const parsed = parseQuery(query);
            change(parsed.patch);
            setUnknown(parsed.unknown);
            setOpen(false);
            setNote(
              Object.keys(parsed.patch).length
                ? "Đã chuyển câu tìm kiếm thành bộ lọc bằng quy tắc demo. Hãy xem lại các chip."
                : "Chưa hiểu điều kiện. Hãy chọn gợi ý hoặc dùng bộ lọc bên dưới.",
            );
          }}
        >
          <span className="search-spark">✳</span>
          <div
            className="autocomplete"
            onBlurCapture={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false);
            }}
          >
            <input
              role="combobox"
              aria-label="Mô tả nhu cầu tìm phòng"
              aria-autocomplete="list"
              aria-expanded={open && suggestions.length > 0}
              aria-controls="place-suggestions"
              aria-activedescendant={
                open && active >= 0 ? "place-option-" + active : undefined
              }
              autoComplete="off"
              value={query}
              placeholder="UIT, trường, metro, chợ… hoặc mô tả nhu cầu"
              onFocus={() => setOpen(true)}
              onChange={(e) => {
                setQuery(e.target.value);
                setOpen(true);
                setActive(-1);
              }}
              onKeyDown={(e) => {
                if (e.key === "ArrowDown") {
                  e.preventDefault();
                  setOpen(true);
                  setActive((i) => Math.min(i + 1, suggestions.length - 1));
                }
                if (e.key === "ArrowUp") {
                  e.preventDefault();
                  setActive((i) => Math.max(0, i - 1));
                }
                if (e.key === "Escape") {
                  setOpen(false);
                  setActive(-1);
                }
              }}
            />
            {open && suggestions.length > 0 && (
              <ul role="listbox" id="place-suggestions" className="suggestions">
                {suggestions.map((p, i) => (
                  <li
                    key={p.id}
                    role="option"
                    id={"place-option-" + i}
                    aria-selected={i === active}
                  >
                    <button
                      type="button"
                      onClick={() => choose(p)}
                      className={i === active ? "active" : ""}
                    >
                      <Icon name="pin" size={17} />
                      <span>
                        {p.name}
                        <small>{p.kind} · Địa danh mẫu</small>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <button className="btn soft" disabled={!query.trim()}>
            Gợi ý bộ lọc <Icon name="arrow" size={16} />
          </button>
        </form>
      )}
      {note && (
        <p role="status" className="info-note">
          {note}
        </p>
      )}
      {unknown.length > 0 && (
        <p className="warning">
          Chưa hiểu: {unknown.join(" · ")}. Hãy chỉnh bằng bộ lọc, AnTro không
          tự suy đoán.
        </p>
      )}
      <div className="search-layout">
        <aside
          ref={filterRef}
          className={"filter-panel " + (filtersOpen ? "is-open" : "")}
        >
          <div className="filter-heading">
            <h3>
              <Icon name="sliders" size={18} />
              Bộ lọc của bạn
            </h3>
            <button
              className="text-btn"
              onClick={() => {
                router.push(pathname, { scroll: false });
                setQuery("");
                setNote("");
                setUnknown([]);
              }}
            >
              Đặt lại
            </button>
          </div>
          <label>
            Khu vực (bắt buộc)
            <select
              id="area-filter"
              value={q.area}
              onChange={(e) => change({ area: e.target.value, place: "" })}
            >
              <option value="">Tất cả khu vực mẫu</option>
              {areas.map((a) => (
                <option key={a}>{a}</option>
              ))}
            </select>
          </label>
          <label>
            Tổng ước tính / người / tháng
            <select
              id="budget-filter"
              value={q.budget}
              onChange={(e) => change({ budget: e.target.value })}
            >
              <option value="">Không giới hạn</option>
              {["1500000", "2000000", "2500000", "3000000"].map((n) => (
                <option key={n} value={n}>
                  Dưới {Number(n) / 1000000} triệu
                </option>
              ))}
              {q.budget &&
                !["1500000", "2000000", "2500000", "3000000"].includes(
                  q.budget,
                ) && (
                  <option value={q.budget}>
                    Dưới {Number(q.budget) / 1000000} triệu
                  </option>
                )}
            </select>
          </label>
          <label>
            Số người cùng ở
            <select
              value={q.people}
              onChange={(e) => change({ people: Number(e.target.value) })}
            >
              {[1, 2, 3, 4].map((n) => (
                <option key={n} value={n}>
                  {n} người
                </option>
              ))}
            </select>
          </label>
          <label>
            Thời hạn muốn thuê
            <select
              id="months-filter"
              value={q.months}
              onChange={(e) => change({ months: e.target.value })}
            >
              <option value="">Chưa chọn</option>
              {[3, 6, 10, 12].map((n) => (
                <option key={n} value={n}>
                  {n} tháng
                </option>
              ))}
            </select>
          </label>
          <label>
            Loại phòng
            <select
              id="kind-filter"
              value={q.kind}
              onChange={(e) => change({ kind: e.target.value })}
            >
              <option value="">Tất cả</option>
              {["Phòng trọ", "Studio", "Ở ghép"].map((v) => (
                <option key={v}>{v}</option>
              ))}
            </select>
          </label>
          <label>
            Tiện nghi cần có
            <select
              id="amenity-filter"
              value={q.amenity}
              onChange={(e) => change({ amenity: e.target.value })}
            >
              <option value="">Tất cả tiện nghi</option>
              {[
                "Máy lạnh",
                "WC riêng",
                "Ban công",
                "Bếp riêng",
                "Nội thất",
                "Chỗ để xe",
                "Cửa sổ",
              ].map((a) => (
                <option key={a}>{a}</option>
              ))}
            </select>
          </label>
          {q.amenity && (
            <label>
              Mức quan trọng tiện nghi
              <select
                value={q.amenityMode}
                onChange={(e) =>
                  change({ amenityMode: e.target.value as "must" | "prefer" })
                }
              >
                <option value="must">Bắt buộc</option>
                <option value="prefer">Ưu tiên</option>
              </select>
            </label>
          )}
          <label className="check-label">
            <input
              id="pets-filter"
              type="checkbox"
              checked={q.pets}
              onChange={(e) => change({ pets: e.target.checked })}
            />
            Cho nuôi thú cưng
          </label>
          {q.pets && (
            <label>
              Loại thú cưng
              <select
                value={q.petType}
                onChange={(e) =>
                  change({ petType: e.target.value as "any" | "cat" | "dog" })
                }
              >
                <option value="any">Thú cưng chung</option>
                <option value="cat">Mèo</option>
                <option value="dog">Chó</option>
              </select>
            </label>
          )}
          {q.pets && (
            <label>
              Mức quan trọng thú cưng
              <select
                value={q.petMode}
                onChange={(e) =>
                  change({ petMode: e.target.value as "must" | "prefer" })
                }
              >
                <option value="must">Bắt buộc</option>
                <option value="prefer">Ưu tiên</option>
              </select>
            </label>
          )}
          <div className="filter-tip">
            <Icon name="leaf" size={23} />
            <h4>Điều kiện tìm phòng</h4>
            <p>
              Điều kiện bắt buộc lọc nhóm chính. Điều kiện ưu tiên chỉ tăng thứ
              tự. Chi phí dùng 120 kWh/phòng/tháng và 1 xe/người.
            </p>
          </div>
        </aside>
        <div className="search-results">
          <div className="results-toolbar">
            <span>
              <strong>{result?.exact.length ?? 0} căn phòng</strong> phù hợp với
              bạn
            </span>
            <button
              className="btn soft mobile-filter"
              onClick={() => setFiltersOpen(!filtersOpen)}
            >
              <Icon name="sliders" size={16} />
              Bộ lọc
            </button>
            <select
              aria-label="Sắp xếp"
              value={q.sort}
              onChange={(e) => change({ sort: e.target.value })}
            >
              <option value="new">Mới cập nhật</option>
              <option value="price">Chi phí thấp nhất</option>
              <option value="trust">Điểm minh họa cao nhất</option>
            </select>
          </div>
          {chips.length > 0 && (
            <div className="chips editable-chips">
              {chips.map((c) => (
                <span key={c.key}>
                  <button
                    aria-label={"Sửa " + c.label}
                    onClick={() => edit(c.field)}
                  >
                    {c.label}
                  </button>
                  <button
                    aria-label={"Xóa " + c.label}
                    onClick={() => change(c.clear)}
                  >
                    <Icon name="close" size={13} />
                  </button>
                </span>
              ))}
            </div>
          )}
          {loading ? (
            <div className="loading-panel" role="status">
              Đang tìm những căn phòng phù hợp…
            </div>
          ) : error ? (
            <div className="empty" role="alert">
              <p>{error}</p>
              <button
                className="btn outline"
                onClick={() => setRetry(retry + 1)}
              >
                Thử lại
              </button>
            </div>
          ) : (
            <>
              {result?.exact.length ? (
                <div className="room-grid two">
                  {result.exact.map((r) => (
                    <RoomCard key={r.id} room={r} people={q.people} />
                  ))}
                </div>
              ) : (
                <Empty
                  title={
                    favorites
                      ? "Chưa có căn phòng nào ở đây"
                      : "Chưa tìm thấy căn phòng vừa ý"
                  }
                  description="Bạn có thể sửa điều kiện. AnTro không tự nới ngân sách hoặc yêu cầu bắt buộc."
                  action={
                    <button
                      className="btn primary"
                      onClick={() => change(defaultQuery)}
                    >
                      Xóa bộ lọc
                    </button>
                  }
                />
              )}
              {!!result?.nearby.length && (
                <section className="section">
                  <h3>Cần cân nhắc thêm</h3>
                  <p className="muted">
                    Các tin dưới đây chưa đạt điều kiện bắt buộc, được trình bày
                    riêng.
                  </p>
                  <div className="room-grid two">
                    {result.nearby.map(({ room, reason }) => (
                      <RoomCard
                        key={room.id}
                        room={room}
                        people={q.people}
                        reason={reason}
                      />
                    ))}
                  </div>
                </section>
              )}
            </>
          )}
        </div>
      </div>
    </main>
  );
}
