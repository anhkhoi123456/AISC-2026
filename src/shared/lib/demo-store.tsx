"use client";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  useCallback,
  type ReactNode,
} from "react";
import type { DemoState } from "./models";
import { delay } from "@/services/latency";
import { createInitialState, demoDataService } from "@/services/demo-data";
type Store = {
  data: DemoState;
  ready: boolean;
  busy: boolean;
  update: (fn: (s: DemoState) => DemoState) => void;
  notify: (s: string) => void;
  toast: string;
  reset: () => void;
  storageError: string;
  command: (fn: (s: DemoState) => DemoState) => Promise<boolean>;
};
const Context = createContext<Store | null>(null);
export function DemoProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState(createInitialState);
  const current = useRef(data);
  const [ready, setReady] = useState(false);
  const [pendingCommands, setPendingCommands] = useState(0);
  const [toast, setToast] = useState("");
  const [storageError, setStorageError] = useState("");
  useEffect(() => {
    let active = true;
    demoDataService.load().then(({ state, notice }) => {
      if (active) {
        current.current = state;
        setData(state);
        setToast(notice);
        setReady(true);
      }
    });
    return () => {
      active = false;
    };
  }, []);
  useEffect(() => {
    if (ready)
      try {
        demoDataService.save(data);
      } catch {
        setStorageError(
          "Không lưu được vào trình duyệt. Thay đổi chỉ còn trong phiên này.",
        );
      }
  }, [data, ready]);
  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(""), 6000);
    return () => clearTimeout(id);
  }, [toast]);
  const update = useCallback((fn: (s: DemoState) => DemoState) => {
    const next = fn(current.current);
    current.current = next;
    setData(next);
  }, []);
  const command = async (fn: (s: DemoState) => DemoState) => {
    setPendingCommands((n) => n + 1);
    try {
      await delay();
      update(fn);
      return true;
    } catch (error) {
      setToast(
        error instanceof Error
          ? error.message
          : "Không hoàn tất được thao tác demo.",
      );
      return false;
    } finally {
      setPendingCommands((n) => n - 1);
    }
  };
  return (
    <Context.Provider
      value={{
        data,
        ready,
        busy: pendingCommands > 0,
        update,
        command,
        notify: setToast,
        toast,
        storageError,
        reset: () => {
          update(() => createInitialState());
          setToast("Đã đặt lại dữ liệu demo.");
        },
      }}
    >
      {children}
    </Context.Provider>
  );
}
export function useDemo() {
  const value = useContext(Context);
  if (!value) throw Error("DemoProvider required");
  return value;
}
export const uid = () => crypto.randomUUID();
