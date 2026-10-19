"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDemo } from "@/shared/lib/demo-store";
import type { Role } from "@/shared/lib/models";
import { Modal } from "./ui";
import { Icon } from "./icon";
export function DemoTools() {
  const { data, update, reset, storageError } = useDemo();
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const router = useRouter();
  return (
    <>
      <button
        className="demo-tools-toggle"
        title="Công cụ demo"
        aria-label={`Vai trò demo: ${{ guest: "Khách", tenant: "Người thuê", landlord: "Chủ trọ", admin: "Admin" }[data.role]}`}
        onClick={() => setOpen(true)}
      >
        <Icon name="sliders" size={14} />
        <span className="sr-only">Công cụ demo</span>
      </button>
      {storageError && (
        <p role="alert" className="warning storage-warning">
          {storageError}
        </p>
      )}
      {open && (
        <Modal title="Điều khiển bản demo" onClose={() => setOpen(false)}>
          <p className="muted">
            Vai trò chỉ thay đổi giao diện và dữ liệu mô phỏng. Đây không phải
            phân quyền bảo mật.
          </p>
          <label>
            Vai trò demo
            <select
              value={data.role}
              onChange={(e) => {
                const role = e.target.value as Role;
                update((s) => ({
                  ...s,
                  role,
                  status: role === "guest" ? "guest" : "active",
                }));
                setOpen(false);
                router.push(
                  {
                    guest: "/",
                    tenant: "/tim-phong",
                    landlord: "/quan-ly-tin",
                    admin: "/admin",
                  }[role],
                );
              }}
            >
              <option value="guest">Khách</option>
              <option value="tenant">Người thuê</option>
              <option value="landlord">Chủ trọ</option>
              <option value="admin">Admin</option>
            </select>
          </label>
          <label>
            Xác minh mô phỏng
            <select
              value={data.status}
              onChange={(e) =>
                update((s) => ({
                  ...s,
                  status: e.target.value as typeof s.status,
                }))
              }
            >
              <option value="guest">Khách</option>
              <option value="pending">Chưa xác minh</option>
              <option value="active">Đã xác minh mẫu</option>
              <option value="review">Chờ kiểm tra</option>
              <option value="blocked">Bị hạn chế</option>
              <option value="rejected">Chưa đạt</option>
            </select>
          </label>
          {confirm ? (
            <div className="inline-actions">
              <p>Xóa tiến trình hiện tại?</p>
              <button
                className="btn danger-btn"
                onClick={() => {
                  reset();
                  setConfirm(false);
                  setOpen(false);
                  router.push("/");
                }}
              >
                Xác nhận đặt lại
              </button>
              <button className="btn outline" onClick={() => setConfirm(false)}>
                Hủy
              </button>
            </div>
          ) : (
            <button className="btn outline" onClick={() => setConfirm(true)}>
              Đặt lại dữ liệu demo
            </button>
          )}
        </Modal>
      )}
    </>
  );
}
