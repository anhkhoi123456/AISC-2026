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
      <section className="hero">
        <div className="container home-intro">
          <div>
            <p className="home-scope">
              Phòng trọ quanh Làng Đại học · Bản demo
            </p>
            <h1>Tìm nơi ở, gặp người hợp.</h1>
            <p className="hero-description">
              Chọn khu vực và ngân sách để xem tiền phòng cùng các khoản phí mỗi
              tháng.
            </p>
          </div>
          <Link className="btn outline" href="/roommatch">
            Tìm bạn ở ghép <Icon name="arrow" size={18} />
          </Link>
        </div>
        <div className="container hero-search-container">
          <HeroSearch />
        </div>
      </section>
      <section className="container section home-rooms">
        <div className="section-heading">
          <div>
            <h2>Phòng quanh trường</h2>
            <p>
              Dữ liệu demo, ảnh minh họa. Chi phí trên thẻ tính cho 2 người,
              theo mức dùng mẫu.
            </p>
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
          <p>
            So sánh khu vực muốn thuê, ngân sách và thói quen sinh hoạt. Mỗi gợi
            ý có lý do hợp và điểm cần trao đổi.
          </p>
          <Link className="text-btn" href="/roommatch">
            Xem hồ sơ ở ghép <Icon name="arrow" size={17} />
          </Link>
        </div>
        <div>
          <h2>Bạn có phòng cho thuê?</h2>
          <p>
            Nhập giá thuê, từng khoản phí và điều kiện ở trước khi gửi tin demo
            để duyệt.
          </p>
          <Link className="text-btn" href="/dang-tin">
            Đăng tin phòng <Icon name="arrow" size={17} />
          </Link>
        </div>
      </section>
    </main>
  );
}
