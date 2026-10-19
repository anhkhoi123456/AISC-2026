"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Listing } from "@/shared/lib/models";
import { useDemo } from "@/shared/lib/demo-store";
import { Icon } from "@/shared/components/icon";
import { cost, money } from "../lib/cost";
export function RoomCard({
  room,
  people = 2,
  reason,
}: {
  room: Listing;
  people?: number;
  reason?: string;
}) {
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
        <span className="image-badge">
          <span className="live-dot" />{" "}
          {room.electricity === null ? "Cần hỏi thêm" : "Chi phí rõ ràng"}
        </span>
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
            notify(
              saved ? "Đã bỏ lưu tin." : "Đã lưu vào góc yêu thích của bạn.",
            );
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
        {reason && <p className="warning-text">{reason}</p>}
      </div>
    </article>
  );
}
