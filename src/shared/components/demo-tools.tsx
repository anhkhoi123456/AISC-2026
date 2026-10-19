"use client";
import Link from "next/link";
import { consentContact } from "@/services/chat-safety";
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
                  status: role === "guest" ? "guest" : "pending",
                  identity: s.identity
                    ? { ...s.identity, otp: false, verified: false }
                    : s.identity,
                }));
                setOpen(false);
                router.push(
                  {
                    guest: "/",
                    tenant: "/dang-nhap",
                    landlord: "/dang-nhap?next=%2Fquan-ly-tin",
                    admin: "/dang-nhap?next=%2Fadmin",
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
          <p>
            Chọn vai trò rồi hoàn tất đăng nhập → OTP → danh tính mẫu. Không có
            chuyển trực tiếp sang đã xác minh.
          </p>
          <details>
            <summary>Thay dữ liệu danh tính mẫu</summary>
            <p>Thay mẫu sẽ yêu cầu xác minh lại và ẩn hồ sơ.</p>
            <label>
              Tên danh tính mẫu
              <input
                value={data.identity?.name ?? data.name}
                onChange={(e) =>
                  update((s) => ({
                    ...s,
                    status: "pending",
                    identity: {
                      ...s.identity!,
                      name: e.target.value,
                      verified: false,
                    },
                    profile: {
                      ...s.profile,
                      name: e.target.value,
                      visible: false,
                    },
                  }))
                }
              />
            </label>
            <label>
              Giới tính mẫu
              <select
                value={data.identity?.gender ?? "Nữ"}
                onChange={(e) =>
                  update((s) => ({
                    ...s,
                    status: "pending",
                    identity: {
                      ...s.identity!,
                      gender: e.target.value,
                      verified: false,
                    },
                    profile: {
                      ...s.profile,
                      gender: e.target.value,
                      visible: false,
                    },
                    draft: null,
                  }))
                }
              >
                <option>Nữ</option>
                <option>Nam</option>
              </select>
            </label>
          </details>
          <Link
            className="text-btn"
            href="/admin"
            onClick={() => setOpen(false)}
          >
            Mở không gian vận hành demo
          </Link>
          <details>
            <summary>Mô phỏng phản hồi chia sẻ liên hệ</summary>
            <p>Chỉ áp dụng cho hội thoại mẫu đang hoạt động.</p>
            {data.conversations
              .filter((c) => !c.ended)
              .map((c) => (
                <div key={c.id}>
                  <span>{c.name}</span>
                  <button
                    className="btn outline"
                    onClick={() =>
                      update((s) => consentContact(s, c.id, "theirs", true))
                    }
                  >
                    Đối phương đồng ý · {c.name}
                  </button>
                  <button
                    className="text-btn"
                    onClick={() =>
                      update((s) => consentContact(s, c.id, "theirs", false))
                    }
                  >
                    Đối phương thu hồi · {c.name}
                  </button>
                </div>
              ))}
          </details>
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
