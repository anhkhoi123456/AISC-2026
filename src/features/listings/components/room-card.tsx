"use client";
import { presentListing } from "../lib/presentation";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Listing } from "@/shared/lib/models";
import { useDemo } from "@/shared/lib/demo-store";
import { Icon } from "@/shared/components/icon";
import { cost, money } from "../lib/cost";
export function RoomCard({
  room: storedRoom,
  people = 2,
  reason,
}: {
  room: Listing;
  people?: number;
  reason?: string;
}) {
  const room = presentListing(storedRoom);
  const { data, update, notify } = useDemo();
  const router = useRouter();
  const saved = data.saved.includes(room.id);
  const c = cost(room, Math.min(people, room.capacity));
  return (
    <article className="room-card">
      <div className="room-photo">
        <Link href={`/phong/${room.id}`} tabIndex={-1}>
          <img src={room.image} alt={room.title} />
        </Link>

        <button
          aria-label={saved ? "Bỏ lưu tin" : "Lưu tin"}
          aria-pressed={saved}
          className={`save-btn ${saved ? "saved" : ""}`}
          onClick={() => {
            if (data.status !== "active") {
              router.push(
                `/dang-nhap?next=${encodeURIComponent("/phong/" + room.id)}`,
              );
              return;
            }
            update((s) => ({
              ...s,
              saved: saved
                ? s.saved.filter((id) => id !== room.id)
                : [...s.saved, room.id],
            }));
            notify(saved ? "Đã bỏ lưu tin." : "Đã thêm vào tin đã lưu.");
          }}
        >
          <Icon name="heart" size={19} />
        </button>
      </div>
      <div className="room-content">
        <p className="room-location">
          <Icon name="pin" size={13} />
          {room.area}
        </p>
        <h3>
          <Link href={`/phong/${room.id}`}>{room.title}</Link>
        </h3>
        <div className="room-specs">
          <span>
            <Icon name="area" size={15} />
            {room.size} m²
          </span>
          <span>
            <Icon name="users" size={15} />
            {room.capacity} người
          </span>
          <span>{room.amenities[0]}</span>
        </div>
        <div className="room-price">
          <div>
            <strong>{money(room.price)}</strong>
            <span> / phòng / tháng</span>
          </div>
          <p>
            {c.complete ? "Tổng ước tính" : "Khoản đã biết"}{" "}
            <b>{money(c.total)}</b>
            <span> / người</span>
          </p>
        </div>
        <p className="room-conditions">
          {room.leaseMonths
            ? `Thuê từ ${room.leaseMonths} tháng`
            : "Chưa khai báo thời hạn"}{" "}
          ·{" "}
          {room.pets
            ? "Có nhận thú cưng, xem điều kiện"
            : "Không nuôi thú cưng"}
        </p>
        <p className="room-data-note">
          {Math.min(people, room.capacity)} người · 120 kWh/phòng · 1 xe/người ·{" "}
          {room.demo ? "Demo, ảnh minh họa" : "Ảnh do người đăng cung cấp"}
        </p>
        {!c.complete && (
          <p className="warning-text">
            Còn khoản phí chưa khai báo. Xem chi tiết trước khi so sánh.
          </p>
        )}
        {reason && <p className="warning-text">{reason}</p>}
      </div>
    </article>
  );
}
