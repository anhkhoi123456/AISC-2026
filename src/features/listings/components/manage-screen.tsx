"use client";
import { presentListing } from "@/features/listings/lib/presentation";
import { DemoActors } from "@/features/housing/components/housing-screen";
import {
  canManage,
  relistRoom,
  setListingStatus,
  confirmAvailability,
} from "@/services/housing";
import { RoomManagement } from "@/features/housing/components/room-management";
import Link from "next/link";
import { useState } from "react";
import { useDemo } from "@/shared/lib/demo-store";
import { Guard, PageTitle, Empty } from "@/shared/components/ui";
import { Icon } from "@/shared/components/icon";
import { money } from "../lib/cost";
import type { ListingStatus } from "@/shared/lib/models";
import { statusLabels } from "../lib/status";
export function ManageScreen() {
  return (
    <Guard>
      <Manage />
    </Guard>
  );
}
function Manage() {
  const { data, command } = useDemo();
  const [filter, setFilter] = useState("all");
  const rooms = data.listings.filter(
    (r) => canManage(data, r) && (filter === "all" || r.status === filter),
  );
  function status(id: string, status: ListingStatus) {
    if (["pending", "hidden", "closed"].includes(status))
      command((s) =>
        setListingStatus(
          s,
          id,
          status as "pending" | "hidden" | "closed",
          status === "pending"
            ? "Gửi thông tin để Admin duyệt mẫu"
            : "Người quản lý chủ động đổi trạng thái đợt tuyển mẫu",
        ),
      );
  }
  return (
    <main className="container section">
      <PageTitle
        title="Quản lý tin phòng"
        description="Giữ thông tin rõ ràng, cập nhật và đúng với tình trạng phòng."
        action={
          <Link className="btn primary" href="/dang-tin">
            <Icon name="plus" size={18} />
            Đăng tin mới
          </Link>
        }
      />
      <DemoActors />
      <RoomManagement />
      <div className="stats-grid">
        {[
          [
            "Tin của bạn",
            data.listings.filter((r) => canManage(data, r)).length,
          ],
          [
            "Đang hiển thị",
            data.listings.filter(
              (r) => canManage(data, r) && r.status === "published",
            ).length,
          ],
          [
            "Chờ duyệt",
            data.listings.filter(
              (r) => canManage(data, r) && r.status === "pending",
            ).length,
          ],
        ].map(([t, n]) => (
          <div className="stat" key={t}>
            <span>{t}</span>
            <strong>{n}</strong>
          </div>
        ))}
      </div>
      <div className="results-toolbar">
        <h3>Tất cả tin phòng</h3>
        <select
          aria-label="Lọc trạng thái tin"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">Tất cả trạng thái</option>
          {Object.entries(statusLabels).map(([v, l]) => (
            <option value={v} key={v}>
              {l}
            </option>
          ))}
        </select>
      </div>
      {rooms.length ? (
        <div className="manage-list">
          {rooms.map((r) => (
            <article key={r.id} className="manage-card">
              <img
                src={presentListing(r).image}
                alt={presentListing(r).title}
              />
              <div>
                <span className={`status status-${r.status}`}>
                  {statusLabels[r.status]}
                </span>
                <h3>{presentListing(r).title}</h3>
                <p className="muted">
                  {r.area} · {r.size} m²
                </p>
                <strong>
                  {money(r.price)} <small>/ tháng</small>
                </strong>
                {r.note && (
                  <p className="warning-text">Ghi chú duyệt: {r.note}</p>
                )}
                <small className="muted">Xác nhận gần nhất: {r.updated}</small>
              </div>
              <div className="manage-actions">
                <button
                  className="text-btn"
                  onClick={() => command((s) => relistRoom(s, r.id))}
                >
                  Đăng lại phòng này
                </button>
                <Link className="text-btn" href={"/phong/" + r.id}>
                  Xem tin <Icon name="arrow" size={15} />
                </Link>
                <Link className="btn outline" href={"/dang-tin?edit=" + r.id}>
                  Chỉnh sửa
                </Link>
                {r.status === "published" ? (
                  <>
                    <button
                      className="btn soft"
                      onClick={() =>
                        command((s) => confirmAvailability(s, r.id))
                      }
                    >
                      Xác nhận còn phòng
                    </button>
                    <button
                      className="text-btn muted"
                      onClick={() => status(r.id, "closed")}
                    >
                      Đóng đợt tuyển
                    </button>
                    <button
                      className="text-btn muted"
                      onClick={() => status(r.id, "hidden")}
                    >
                      Tạm ẩn
                    </button>
                  </>
                ) : (
                  ["draft", "changes", "hidden", "rejected"].includes(
                    r.status,
                  ) && (
                    <button
                      className="btn soft"
                      onClick={() => status(r.id, "pending")}
                    >
                      Gửi duyệt lại
                    </button>
                  )
                )}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <Empty
          title="Chưa có tin ở trạng thái này"
          description="Nhập thông tin phòng, các khoản phí và điều kiện thuê."
          action={
            <Link className="btn primary" href="/dang-tin">
              Tạo tin mới
            </Link>
          }
        />
      )}
      <p className="fineprint">Tin chờ duyệt chưa hiển thị trong tìm kiếm.</p>
    </main>
  );
}
export { ListingWizard as ListingFormScreen } from "./listing-wizard";
