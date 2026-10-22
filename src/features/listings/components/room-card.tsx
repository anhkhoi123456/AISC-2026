"use client";
import { occupancy, physicalId } from "@/services/housing";
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
  preview = false,
}: {
  room: Listing;
  people?: number;
  reason?: string;
  preview?: boolean;
}) {
  const room = presentListing(storedRoom),
    { data, update, notify } = useDemo(),
    router = useRouter();
  const saved = data.saved.includes(room.id),
    sharers = Math.min(people, room.capacity),
    c = cost(room, sharers),
    places = occupancy(data, physicalId(room));
  return (
    <article className="room-card">
      <div className="room-photo">
        {preview ? (
          <img src={room.image} alt="Ảnh minh họa xem trước" />
        ) : (
          <Link
            href={`/phong/${room.id}`}
            aria-label={`Xem phòng: ${room.title}`}
            tabIndex={-1}
          >
            <img src={room.image} alt="" loading="lazy" />
          </Link>
        )}
        {room.demo && <span className="room-photo-caption">Ảnh minh họa</span>}
        <button
          type="button"
          disabled={preview}
          aria-label={saved ? "Bỏ lưu phòng" : "Lưu phòng"}
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
            notify(saved ? "Đã bỏ lưu phòng." : "Đã lưu phòng.");
          }}
        >
          <Icon name="heart" size={20} />
        </button>
      </div>
      <div className="room-content">
        <h3>
          {preview ? (
            room.title
          ) : (
            <Link href={`/phong/${room.id}`}>{room.title}</Link>
          )}
        </h3>
        <p className="room-location">
          <Icon name="pin" size={15} />
          {room.area}
        </p>
        <div className="room-price">
          <div>
            <strong>{money(room.price)}</strong>
            <span> / tháng</span>
          </div>
          <p>
            {c.complete ? "Tổng ước tính" : "Khoản đã biết"}{" "}
            <b className="money">{money(c.total)}</b>
            <span> / người</span>
          </p>
        </div>
        <div className="room-specs">
          <span>{room.size} m²</span>
          <span>Tối đa {room.capacity} người</span>
          {room.amenities[0] && <span>{room.amenities[0]}</span>}
        </div>
        <p className="room-conditions">
          {room.leaseMonths
            ? `Thuê từ ${room.leaseMonths} tháng`
            : "Chưa rõ thời hạn thuê"}{" "}
          ·{" "}
          {room.pets
            ? "Cho nuôi thú cưng, xem điều kiện"
            : "Không nuôi thú cưng"}
        </p>
        {!preview && (
          <p className="room-data-note">
            Còn {places.available}/{places.capacity} chỗ theo hồ sơ hiện tại
          </p>
        )}
        <details className="cost-assumptions">
          <summary>Cách tính chi phí</summary>
          <p>
            {sharers} người chia phòng · 120 kWh/phòng · 1 xe/người. Khoản có
            điều kiện xem trong chi tiết phòng.
          </p>
        </details>
        {!c.complete && (
          <p className="warning-text">
            Còn phí chưa rõ. Tổng trên chưa bao gồm các khoản này.
          </p>
        )}
        {reason && <p className="warning-text">{reason}</p>}
      </div>
    </article>
  );
}
