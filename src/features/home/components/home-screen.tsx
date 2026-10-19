"use client";
import Link from "next/link";
import { Icon } from "@/shared/components/icon";
import { useDemo } from "@/shared/lib/demo-store";
import { HeroSearch } from "./hero-search";
import { RoomCard } from "@/features/listings/components/room-card";
export function HomeScreen() {
  const { data } = useDemo();
  return (
    <main>
      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-copy">
            <p className="eyebrow">
              <span className="live-dot" /> MỘT KHỞI ĐẦU MỚI Ở LÀNG ĐẠI HỌC
            </p>
            <h1>
              Tìm nơi ở.
              <br />
              Gặp người <em>hợp.</em>
            </h1>
            <p className="hero-description">
              Một căn phòng vừa ý, một người bạn cùng nhịp sống.
              <br className="desktop-only" /> AnTro giúp bạn tìm thấy cả hai,
              nhẹ nhàng hơn.
            </p>
            <div className="hero-cta">
              <Link className="btn primary" href="/tim-phong">
                Tìm phòng <Icon name="arrow" size={18} />
              </Link>
              <Link className="btn ghost" href="/roommatch">
                <Icon name="users" size={18} />
                Tìm bạn ở ghép
              </Link>
            </div>
          </div>
          <div className="hero-visual">
            <img
              className="hero-room"
              src="/images/student-room.jpg"
              alt="Phòng ngủ nhỏ với giường gỗ, bàn cạnh giường và đèn đọc sách"
            />
            <p className="hero-image-note">
              Góc nhỏ vừa đủ cho những ngày tự lập.
              <span>Ảnh không gian sống minh họa</span>
            </p>
          </div>
        </div>
        <div className="container hero-search-container">
          <HeroSearch />
        </div>
      </section>
      <section className="container section">
        <p className="landlord-entry">
          Bạn có phòng muốn cho thuê?{" "}
          <Link className="text-btn" href="/quan-ly-tin">
            Đăng tin và tìm người phù hợp <Icon name="arrow" size={15} />
          </Link>
        </p>
        <div className="section-heading">
          <div>
            <p className="eyebrow">CHỌN MỘT NƠI ĐỂ BẮT ĐẦU</p>
            <h2>Góc nhỏ, nhiều điều mới.</h2>
            <p>Những căn phòng mẫu quanh trường, với chi phí được kể rõ.</p>
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
      <section className="container">
        <div className="roommatch-banner">
          <div className="banner-art">
            <span className="orbit orbit-one" />
            <span className="orbit orbit-two" />
            <img src="/images/person-1.jpg" alt="Nhân vật RoomMatch minh họa" />
            <img src="/images/person-2.jpg" alt="Nhân vật RoomMatch minh họa" />
            <span className="compatibility-label">
              <Icon name="leaf" size={17} /> Cùng nhịp sống
            </span>
          </div>
          <div>
            <p className="eyebrow">GẶP ROOMMATCH</p>
            <h2>Ở ghép, nhưng không ở đại.</h2>
            <p>
              Bạn dậy sớm hay là một cú đêm? Thích yên tĩnh hay thích chuyện
              trò? Tìm một người hiểu những điều nhỏ của bạn.
            </p>
            <Link className="btn primary" href="/roommatch">
              Tìm người hợp với bạn <Icon name="arrow" size={17} />
            </Link>
          </div>
        </div>
      </section>
      <section className="container section">
        <div className="section-heading center">
          <p className="eyebrow">NHẸ NHÀNG HƠN CÙNG ANTRO</p>
          <h2>Chuyện tìm trọ, bớt những lăn tăn.</h2>
        </div>
        <div className="values-grid">
          {[
            [
              "home",
              "Đúng căn phòng bạn cần",
              "Lọc theo nơi học, ngân sách và những tiện nghi thực sự quan trọng.",
            ],
            [
              "users",
              "Hợp người, hợp nhịp sống",
              "Hiểu thói quen của nhau trước khi cùng chia sẻ một mái nhà.",
            ],
            [
              "shield",
              "Rõ ràng từ khoản phí nhỏ",
              "Nhìn đủ tiền phòng, điện nước và chi phí để chuẩn bị cho tháng mới.",
            ],
          ].map(([icon, title, desc], i) => (
            <div className="value-card" key={title}>
              <span className="value-icon">
                <Icon name={icon} size={26} />
              </span>
              <small>0{i + 1}</small>
              <h3>{title}</h3>
              <p>{desc}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
