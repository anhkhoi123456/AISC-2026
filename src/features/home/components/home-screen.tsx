"use client";
import Link from "next/link";
import { Icon } from "@/shared/components/icon";
import { useDemo } from "@/shared/lib/demo-store";
import { HeroSearch } from "./hero-search";
import { RoomCard } from "@/features/listings/components/room-card";
export function HomeScreen() {
  const { data } = useDemo();
  return (
    <main className="task-home">
      <section className="search-hero" aria-labelledby="home-title">
        <div className="search-hero-photo" aria-hidden="true">
          <img src="/images/room-2.jpg" alt="" fetchPriority="high" />
        </div>
        <div className="container search-hero-content">
          <div className="search-hero-copy">
            <h1 id="home-title">Tìm phòng gần trường, vừa túi tiền</h1>
            <p>Phòng trọ và bạn ở ghép quanh Làng Đại học.</p>
          </div>
          <HeroSearch />
          <Link className="hero-roommatch-link" href="/roommatch">
            Bạn đang tìm người ở cùng?{" "}
            <span>
              Tìm bạn ở ghép <Icon name="arrow" size={17} />
            </span>
          </Link>
          <p className="hero-image-note">
            Ảnh minh họa · Tin và địa điểm trong bản trải nghiệm là dữ liệu mẫu.
          </p>
        </div>
      </section>
      <section className="container section home-rooms">
        <div className="section-heading">
          <div>
            <h2>Phòng quanh trường</h2>
            <p>Xem giá thuê và chi phí ước tính cho 2 người.</p>
          </div>
          <Link href="/tim-phong" className="text-btn">
            Xem tất cả phòng <Icon name="arrow" size={17} />
          </Link>
        </div>
        <div className="room-grid">
          {data.listings
            .filter((r) => r.status === "published")
            .slice(0, 3)
            .map((r) => (
              <RoomCard key={r.id} room={r} />
            ))}
        </div>
      </section>
      <section className="container home-next">
        <div>
          <h2>Tìm bạn ở ghép</h2>
          <p>Chọn khu vực, ngân sách và thói quen để tìm người ở cùng.</p>
          <Link className="text-btn" href="/roommatch">
            Xem hồ sơ ở ghép <Icon name="arrow" size={17} />
          </Link>
        </div>
        <div>
          <h2>Bạn có phòng cho thuê?</h2>
          <p>
            Thêm ảnh, giá thuê và các khoản phí. Bạn có thể lưu nháp trước khi
            gửi duyệt.
          </p>
          <Link className="text-btn" href="/dang-tin">
            Đăng tin phòng <Icon name="arrow" size={17} />
          </Link>
        </div>
      </section>
    </main>
  );
}
