"use client";
import { useDemo } from "@/shared/lib/demo-store";
export function DemoActors() {
  const { data, update, busy } = useDemo();
  if (data.status !== "active") return null;
  return (
    <details className="actor-demo">
      <summary>Đổi người thao tác mẫu</summary>
      <p>
        Ba phía dùng chung dữ liệu của trình duyệt để diễn thử phản hồi. Không
        phải đăng nhập nhiều tài khoản hoặc quyền quản trị thật.
      </p>
      <div className="inline-actions">
        {(
          [
            ["tenant", "Người thuê mẫu"],
            ["landlord", "Người đăng mẫu"],
            ["admin", "Admin mẫu"],
          ] as const
        ).map(([role, label]) => (
          <button
            key={role}
            className={data.role === role ? "btn soft" : "btn outline"}
            aria-pressed={data.role === role}
            disabled={busy}
            onClick={() => update((s) => ({ ...s, role }))}
          >
            {label}
          </button>
        ))}
      </div>
    </details>
  );
}
