"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/shared/components/icon";
import { suggestPlaces, parseQuery } from "@/features/search/lib/query";
import type { Place } from "@/features/search/mocks/places";
export function HeroSearch() {
  const router = useRouter();
  const [query, setQuery] = useState(""),
    [budget, setBudget] = useState(""),
    [place, setPlace] = useState<Place | null>(null),
    [open, setOpen] = useState(false),
    [active, setActive] = useState(-1);
  const suggestions = suggestPlaces(query);
  function choose(p: Place) {
    setPlace(p);
    setQuery(p.name);
    setOpen(false);
    setActive(-1);
  }
  function search() {
    const p = new URLSearchParams();
    const parsed = parseQuery(query);
    if (place) {
      p.set("place", place.id);
      p.set("area", place.area);
    } else
      for (const [key, value] of Object.entries(parsed.patch))
        p.set(key, value === true ? "1" : String(value));
    if (query.trim() && !place && !Object.keys(parsed.patch).length)
      p.set("q", query.trim());
    if (query.trim()) p.set("q", query.trim());
    if (budget) p.set("budget", budget);
    router.push("/tim-phong" + (p.size ? "?" + p.toString() : ""));
  }
  return (
    <div className="hero-search-wrap">
      <form
        className="hero-search-form"
        onSubmit={(e) => {
          e.preventDefault();
          if (open && active >= 0 && suggestions[active])
            choose(suggestions[active]);
          else search();
        }}
      >
        <div
          className="hero-search-field autocomplete"
          onBlurCapture={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false);
          }}
        >
          <label htmlFor="hero-location">
            <Icon name="pin" size={18} />
            Bạn muốn ở đâu?
          </label>
          <input
            id="hero-location"
            role="combobox"
            aria-expanded={open && suggestions.length > 0}
            aria-autocomplete="list"
            aria-controls="hero-suggestions"
            aria-activedescendant={
              open && active >= 0 && suggestions[active]
                ? "hero-option-" + active
                : undefined
            }
            autoComplete="off"
            placeholder="Tên trường, metro hoặc khu vực…"
            value={query}
            onFocus={() => setOpen(true)}
            onChange={(e) => {
              setQuery(e.target.value);
              setPlace(null);
              setActive(-1);
              setOpen(true);
            }}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown" && suggestions.length) {
                e.preventDefault();
                setOpen(true);
                setActive((i) => Math.min(i + 1, suggestions.length - 1));
              }
              if (e.key === "ArrowUp" && suggestions.length) {
                e.preventDefault();
                setActive((i) => Math.max(0, i - 1));
              }
              if (e.key === "Escape") setOpen(false);
            }}
          />
          {open && suggestions.length > 0 && (
            <ul className="suggestions" role="listbox" id="hero-suggestions">
              {suggestions.map((p, i) => (
                <li
                  role="option"
                  id={"hero-option-" + i}
                  aria-selected={i === active}
                  key={p.id}
                >
                  <button
                    type="button"
                    className={active === i ? "active" : ""}
                    onClick={() => choose(p)}
                  >
                    <Icon name="pin" size={17} />
                    <span>
                      {p.name}
                      <small>{p.kind} · Địa điểm mẫu</small>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="hero-budget-field">
          <label htmlFor="hero-budget">Ngân sách / người</label>
          <select
            id="hero-budget"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
          >
            <option value="">Chọn mức phù hợp</option>
            <option value="1500000">Dưới 1,5 triệu</option>
            <option value="2000000">Dưới 2 triệu</option>
            <option value="3000000">Dưới 3 triệu</option>
          </select>
        </div>
        <button className="btn primary" type="submit">
          <Icon name="search" size={20} />
          Tìm phòng
        </button>
      </form>
      <div className="quick-places">
        <span>Thử tìm:</span>
        {[
          ["Gần trường", "Trường", "home"],
          ["Gần metro", "Metro", "train"],
          ["Gần tiện ích", "Siêu thị", "store"],
        ].map(([label, value, icon]) => (
          <button
            key={label}
            type="button"
            aria-pressed={query === value}
            onClick={() => {
              setQuery(value);
              setPlace(null);
              setOpen(true);
              setActive(-1);
              document.getElementById("hero-location")?.focus();
            }}
          >
            <Icon name={icon} size={16} />
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
