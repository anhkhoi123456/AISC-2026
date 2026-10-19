"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Icon } from "@/shared/components/icon";
import { useDemo } from "@/shared/lib/demo-store";
import { areas } from "@/features/listings/mocks/listings";
import { RoomCard } from "@/features/listings/components/room-card";
export function HomeScreen() {
  const { data } = useDemo();
  const router = useRouter();
  const [area, setArea] = useState("");
  const [budget, setBudget] = useState("");
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
                Khám phá phòng <Icon name="arrow" size={18} />
              </Link>
              <Link className="btn ghost" href="/roommatch">
                <Icon name="users" size={18} />
                Tìm bạn ở ghép
              </Link>
            </div>
            <div className="hero-note">
              <span className="stacked-avatars">
                {[1, 2, 3].map((i) => (
                  <img
                    key={i}
                    src={`/images/person-${i}.jpg`}
                    alt="Nhân vật minh họa"
                  />
                ))}
              </span>
              <div>
                <strong>Ở cùng nhau, bắt đầu tốt hơn.</strong>
                <span>Kết nối theo nhu cầu & thói quen sống</span>
              </div>
            </div>
          </div>
          <div className="hero-visual">
            <img
              className="hero-room"
              src="/images/room-1.jpg"
              alt="Không gian phòng sáng với nội thất gỗ và cây xanh"
            />
            <div className="photo-caption">
              <Icon name="sun" size={16} /> Một góc nhỏ. Một cuộc sống mới.
            </div>
            <div className="floating-match">
              <span className="match-symbol">
                <Icon name="users" size={25} />
              </span>
              <div>
                <strong>Không chỉ tìm phòng</strong>
                <span>Tìm người cùng bạn gọi đó là nhà.</span>
              </div>
              <span className="sparkle">✳</span>
            </div>
            <span className="vertical-caption">
              YOUR NEXT CHAPTER STARTS HERE
            </span>
          </div>
        </div>
      </section>
      <section className="container search-section">
        <form
          className="home-search"
          onSubmit={(e) => {
            e.preventDefault();
            router.push(
              `/tim-phong?area=${encodeURIComponent(area)}&budget=${budget}`,
            );
          }}
        >
          <label>
            <span>
              <Icon name="pin" size={17} />
              Bạn muốn ở đâu?
            </span>
            <select value={area} onChange={(e) => setArea(e.target.value)}>
              <option value="">Quanh Làng Đại học</option>
              {areas.map((a) => (
                <option key={a}>{a}</option>
              ))}
            </select>
          </label>
          <label>
            <span>
              <Icon name="home" size={17} />
              Ngân sách mỗi người
            </span>
            <select value={budget} onChange={(e) => setBudget(e.target.value)}>
              <option value="">Khoảng chi phí phù hợp</option>
              <option value="1500000">Dưới 1,5 triệu / tháng</option>
              <option value="2000000">Dưới 2 triệu / tháng</option>
              <option value="3000000">Dưới 3 triệu / tháng</option>
            </select>
          </label>
          <button className="btn primary">
            <Icon name="search" size={19} />
            Tìm căn phòng của bạn
          </button>
        </form>
        <p className="search-footnote">
          <Icon name="shield" size={14} /> Chi phí minh bạch <span>•</span> Kết
          nối đúng nhu cầu <span>•</span> Ưu tiên không gian sống phù hợp
        </p>
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
