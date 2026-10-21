import Link from "next/link";
export default function NotFound() {
  return (
    <main className="container section">
      <div className="empty">
        <h1>Có lẽ bạn đã đi lạc một chút.</h1>
        <p>Trang này chưa có trên AnTro.</p>
        <Link className="btn primary" href="/">
          Về trang chủ
        </Link>
      </div>
    </main>
  );
}
