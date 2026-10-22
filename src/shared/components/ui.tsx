"use client";
import Link from "next/link";
import { useEffect, useRef, useState, useId, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { useDemo, uid } from "@/shared/lib/demo-store";
import { Icon } from "./icon";
export function PageTitle({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="page-title">
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {action}
    </div>
  );
}
export function Empty({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="empty">
      <h3>{title}</h3>
      <p>{description}</p>
      {action}
    </div>
  );
}
export function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  useEffect(() => {
    const d = ref.current;
    d?.showModal();
    return () => d?.close();
  }, []);
  return (
    <dialog
      ref={ref}
      className="modal"
      aria-labelledby={titleId}
      onCancel={onClose}
      onClick={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        if (
          e.target === e.currentTarget &&
          (e.clientX < r.left ||
            e.clientX > r.right ||
            e.clientY < r.top ||
            e.clientY > r.bottom)
        )
          onClose();
      }}
    >
      <div className="modal-head">
        <h2 id={titleId}>{title}</h2>
        <button className="icon-btn" onClick={onClose} aria-label="Đóng">
          <Icon name="close" />
        </button>
      </div>
      {children}
    </dialog>
  );
}
export function Guard({ children }: { children: ReactNode }) {
  const { data } = useDemo();
  const path = usePathname();
  if (data.status === "active") return children;
  return (
    <main className="container section">
      <Empty
        title={
          data.status === "blocked"
            ? "Tài khoản đang bị hạn chế"
            : "Đăng nhập để tiếp tục"
        }
        description={
          data.status === "blocked"
            ? "Bạn có thể xem trạng thái và gửi giải trình tại trang tài khoản."
            : "Đăng nhập và hoàn tất hồ sơ trước khi thực hiện thao tác này."
        }
        action={
          <Link
            className="btn primary"
            href={
              data.status === "guest"
                ? `/dang-nhap?next=${encodeURIComponent(path)}`
                : "/tai-khoan"
            }
          >
            {data.status === "guest"
              ? "Đăng nhập để tiếp tục"
              : "Xem tài khoản"}
            <Icon name="arrow" size={17} />
          </Link>
        }
      />
    </main>
  );
}
export function ReportButton({ target }: { target: string }) {
  const [open, setOpen] = useState(false);
  const { data, update, notify } = useDemo();
  return (
    <>
      <button
        className="text-btn muted"
        onClick={() => {
          if (data.status !== "active") {
            notify("Hãy đăng nhập và hoàn tất hồ sơ để gửi báo cáo.");
            return;
          }
          setOpen(true);
        }}
      >
        <Icon name="flag" size={15} /> Báo cáo
      </button>
      {open && (
        <Modal title="Bạn muốn báo cáo điều gì?" onClose={() => setOpen(false)}>
          <p className="muted">
            Báo cáo được lưu trên thiết bị để xem xét; chưa gửi đến đội hỗ trợ.
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget);
              update((s) => ({
                ...s,
                reports: [
                  ...s.reports,
                  {
                    id: uid(),
                    target,
                    reason: String(f.get("reason")),
                    detail: String(f.get("detail")),
                    status: "new",
                  },
                ],
              }));
              setOpen(false);
              notify("Đã lưu báo cáo trên thiết bị.");
            }}
          >
            <label>
              Lý do
              <select name="reason">
                <option>Thông tin không chính xác</option>
                <option>Chi phí không rõ ràng</option>
                <option>Nghi ngờ lừa đảo</option>
                <option>Quấy rối hoặc nội dung không phù hợp</option>
              </select>
            </label>
            <label>
              Mô tả và bằng chứng liên quan
              <textarea
                name="detail"
                required
                minLength={10}
                placeholder="Hãy mô tả cụ thể (ít nhất 10 ký tự)…"
              />
            </label>
            <button className="btn primary full">Gửi báo cáo</button>
          </form>
        </Modal>
      )}
    </>
  );
}
