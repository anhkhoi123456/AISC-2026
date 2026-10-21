"use client";
import { useEffect, useRef, useSyncExternalStore } from "react";
import {
  applyTheme,
  readTheme,
  THEME_KEY,
  type Theme,
} from "@/shared/lib/theme";
import { Icon } from "./icon";
function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener("antro-theme-change", onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener("antro-theme-change", onChange);
  };
}
export function ThemePicker() {
  const theme = useSyncExternalStore(
    subscribe,
    readTheme,
    () => "system" as Theme,
  );
  const ref = useRef<HTMLDetailsElement>(null);
  useEffect(() => {
    applyTheme(theme);
    const media = matchMedia("(prefers-color-scheme: dark)");
    const sync = () => applyTheme(theme);
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, [theme]);
  useEffect(() => {
    const close = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        ref.current.open = false;
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, []);
  return (
    <details ref={ref} className="theme-picker">
      <summary aria-label="Chọn giao diện" title="Giao diện sáng / tối">
        <Icon
          name={
            theme === "dark" ? "moon" : theme === "light" ? "sun" : "monitor"
          }
          size={20}
        />
      </summary>
      <div className="theme-options" role="group" aria-label="Giao diện">
        <p>Giao diện</p>
        {(
          [
            ["light", "Sáng", "sun"],
            ["dark", "Tối", "moon"],
            ["system", "Theo hệ thống", "monitor"],
          ] as const
        ).map(([value, label, icon]) => (
          <button
            key={value}
            type="button"
            aria-pressed={theme === value}
            onClick={() => {
              try {
                localStorage.setItem(THEME_KEY, value);
              } catch {}
              applyTheme(value);
              window.dispatchEvent(new Event("antro-theme-change"));
              if (ref.current) ref.current.open = false;
            }}
          >
            <Icon name={icon} size={17} />
            {label}
            {theme === value && <Icon name="check" size={16} />}
          </button>
        ))}
      </div>
    </details>
  );
}
