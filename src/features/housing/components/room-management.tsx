"use client";
import Link from "next/link";
import { useDemo } from "@/shared/lib/demo-store";
import {
  actorId,
  occupancy,
  setRoomPolicy,
  relistRoom,
  physicalId,
  OWNER,
} from "@/services/housing";
export function RoomManagement() {
  const { data, command } = useDemo();
  const rooms = data.housing.rooms.filter((r) => r.managerId === actorId(data));
  return (
    <details className="room-management">
      <summary>Quản lý căn phòng, chỗ ở và tuyển lại</summary>
      <Link className="text-btn" href="/noi-o">
        Xem yêu cầu thuê và bàn giao
      </Link>
      {rooms.map((r) => {
        const counts = occupancy(data, r.id),
          listing = [...data.listings]
            .reverse()
            .find((x) => physicalId(x) === r.id);
        return (
          <section key={r.id}>
            <h3>{listing?.title || r.id}</h3>
            <p>
              Mã phòng {r.id} · {counts.occupied}/{r.capacity} đang ở ·{" "}
              {counts.available} chỗ còn lại.
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const f = new FormData(e.currentTarget);
                command((s) =>
                  setRoomPolicy(
                    s,
                    r.id,
                    String(f.get("policy")) as "closed" | "approval" | "open",
                    Number(f.get("external")),
                  ),
                );
              }}
            >
              <label>
                Quyền tuyển roommate
                <select name="policy" defaultValue={r.roommatePolicy}>
                  <option value="closed">Không cho mở tìm</option>
                  <option value="approval">Xin phép từng lần</option>
                  <option value="open">Cho phép mở tìm khi còn chỗ</option>
                </select>
              </label>
              <label>
                Khách ngoài hệ thống được khai báo
                <input
                  name="external"
                  type="number"
                  min="0"
                  max={r.capacity}
                  defaultValue={r.externalResidents}
                />
              </label>
              <p className="fineprint">
                Chỉ cập nhật sức chứa, không cấp tài khoản hoặc quyền đánh giá
                cho khách ngoài AnTro.
              </p>
              <button className="btn outline">Lưu chính sách và chỗ ở</button>
            </form>
            {listing && (
              <button
                className="text-btn"
                disabled={!counts.available}
                onClick={() => command((s) => relistRoom(s, listing.id))}
              >
                Đăng lại phòng này
              </button>
            )}
          </section>
        );
      })}
      {actorId(data) !== OWNER && (
        <p>
          Tài khoản cũng có thể đăng tin cho phòng của mình; quyền sửa vẫn gắn
          đúng người quản lý từng phòng.
        </p>
      )}
    </details>
  );
}
