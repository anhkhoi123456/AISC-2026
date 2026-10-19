"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { DemoProvider, useDemo } from "@/shared/lib/demo-store";
import { Icon } from "./icon";
import { DemoTools } from "./demo-tools";
import { ThemePicker } from "./theme-picker";
const nav = [
  ["/tim-phong", "Tìm phòng", "home"],
  ["/roommatch", "RoomMatch", "users"],
  ["/tin-nhan", "Tin nhắn", "chat"],
];
function Navigation({ children }: { children: ReactNode }) {
  const path = usePathname();
  const { data, toast, ready } = useDemo();
  const [open, setOpen] = useState(false);
  return (
    <>
      <div className="demo-strip">
        BẢN TRẢI NGHIỆM{" "}
        <span>
          • Dữ liệu mẫu, xác minh và hội thoại được mô phỏng trên trình duyệt
        </span>
      </div>
      <header className="site-header">
        <div className="nav-inner">
          <Link href="/" className="brand" aria-label="AnTro trang chủ">
            <span className="brand-symbol">
              <img className="brand-house" src="/images/logo.jpg" alt="" />
            </span>
            AnTro<span className="brand-dot">.</span>
          </Link>
          <nav className="desktop-nav">
            {nav.map(([href, label]) => (
              <Link
                key={href}
                className={path.startsWith(href) ? "active" : ""}
                href={href}
              >
                {label}
                {label === "RoomMatch" && (
                  <span className="tiny-new">Kết nối</span>
                )}
              </Link>
            ))}
          </nav>
          <div className="nav-actions">
            <ThemePicker />
            <DemoTools />
            <Link
              href="/yeu-thich"
              className="icon-btn favorite-nav"
              aria-label="Tin yêu thích"
            >
              <Icon name="heart" />
              {data.saved.length > 0 && (
                <span className="count">{data.saved.length}</span>
              )}
            </Link>
            <Link className="post-link" href="/quan-ly-tin">
              <Icon name="plus" size={17} /> Đăng tin
            </Link>
            <Link
              className="account-link"
              aria-label={data.status === "guest" ? "Đăng nhập" : "Tài khoản"}
              href={data.status === "guest" ? "/dang-nhap" : "/tai-khoan"}
            >
              {data.status === "guest" ? (
                <>
                  <Icon name="user" size={18} />
                  <span>Đăng nhập</span>
                </>
              ) : (
                <>
                  <span className="avatar tiny">{data.name[0]}</span>
                  <span>{data.name}</span>
                </>
              )}
            </Link>
            <button
              className="icon-btn mobile-menu"
              aria-label="Mở điều hướng"
              aria-expanded={open}
              onClick={() => setOpen(!open)}
            >
              <Icon name="menu" />
            </button>
          </div>
        </div>
        {open && (
          <nav className="mobile-dropdown">
            {[
              ...nav,
              ["/quan-ly-tin", "Quản lý tin"],
              ["/tai-khoan", "Tài khoản"],
              ["/yeu-thich", "Yêu thích"],
            ].map(([href, label]) => (
              <Link key={href} href={href} onClick={() => setOpen(false)}>
                {label}
              </Link>
            ))}
          </nav>
        )}
      </header>
      {!ready ? (
        <main className="container section">
          <p>Đang chuẩn bị trải nghiệm…</p>
        </main>
      ) : (
        children
      )}
      <footer className="site-footer">
        <div className="container footer-inner">
          <div>
            <Link className="brand" href="/" aria-label="AnTro trang chủ">
              <span className="brand-symbol">
                <img className="brand-house" src="/images/logo.jpg" alt="" />
              </span>
              AnTro<span className="brand-dot">.</span>
            </Link>
            <p>Một căn phòng phù hợp. Một người bạn đồng hành.</p>
          </div>
          <div>
            <Link href="/tim-phong">Tìm nơi ở</Link>
            <Link href="/roommatch">Tìm bạn ở ghép</Link>
            <Link href="/hop-dong">Đọc hợp đồng mẫu</Link>
          </div>
          <small>© 2026 AnTro · Dành cho những khởi đầu mới.</small>
        </div>
      </footer>
      <nav className="bottom-nav">
        {[...nav, ["/tai-khoan", "Tài khoản", "grid"]].map(
          ([href, label, icon]) => (
            <Link
              key={href}
              href={href}
              className={path.startsWith(href) ? "active" : ""}
            >
              <Icon name={icon} />
              <span>{label}</span>
            </Link>
          ),
        )}
      </nav>
      {toast && (
        <div role="status" className="toast">
          <Icon name="check" />
          {toast}
        </div>
      )}
    </>
  );
}
export function Shell({ children }: { children: ReactNode }) {
  return (
    <DemoProvider>
      <Navigation>{children}</Navigation>
    </DemoProvider>
  );
}
