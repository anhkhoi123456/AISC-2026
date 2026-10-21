"use client";
import { presentListing } from "@/features/listings/lib/presentation";
import { setListingReportDecision } from "@/services/listing-trust";
import { useState } from "react";
import { useDemo } from "@/shared/lib/demo-store";
import { PageTitle, Empty, Modal } from "@/shared/components/ui";
import { Icon } from "@/shared/components/icon";
import { statusLabels, canSubmit } from "@/features/listings/lib/status";
import type { ListingStatus } from "@/shared/lib/models";
export function AdminScreen() {
  const { data, update, notify } = useDemo();
  const [entered, setEntered] = useState(false);
  const [tab, setTab] = useState("listings");
  const [decision, setDecision] = useState<{
    id: string;
    type: string;
    action: string;
  } | null>(null);
  const [reason, setReason] = useState("");
  const [appeal, setAppeal] = useState("");
  if (!entered)
    return (
      <main className="container narrow section">
        <div className="panel result-screen">
          <span className="empty-icon">
            <Icon name="shield" size={32} />
          </span>
          <p className="eyebrow">KHÔNG GIAN VẬN HÀNH</p>
          <h1>Công cụ vận hành demo</h1>
          <p className="muted">
            Đây là giao diện Admin mô phỏng, dùng chung dữ liệu local của bản
            demo. Chế độ này không cấp quyền quản trị thật và không phải cơ chế
            phân quyền sản phẩm.
          </p>
          <button className="btn primary" onClick={() => setEntered(true)}>
            Mở bảng vận hành demo <Icon name="arrow" size={17} />
          </button>
        </div>
      </main>
    );
  const pending = data.listings.filter((r) =>
    ["pending", "changes", "rejected"].includes(r.status),
  );
  function commit() {
    if (!decision || !reason.trim()) return;
    const d = decision;
    const room = data.listings.find((r) => r.id === d.id);
    if (
      d.type === "listing" &&
      d.action === "published" &&
      room &&
      !canSubmit(room)
    ) {
      notify("Tin còn thiếu thông tin bắt buộc, hãy yêu cầu bổ sung.");
      return;
    }
    const report = data.reports.find((r) => r.id === d.id);
    const target = report?.target;
    const restore = d.type === "report" && d.action === "no-evidence";
    const profileId = target?.startsWith("profile-")
      ? target.replace("profile-", "")
      : "";
    const hideProfile =
      d.type === "report" &&
      d.action === "violation" &&
      target?.startsWith("profile-")
        ? target.replace("profile-", "")
        : "";

    update((s) => ({
      ...s,
      hiddenProfiles: hideProfile
        ? [...new Set([...s.hiddenProfiles, hideProfile])]
        : restore && profileId && report?.previousProfileHidden === false
          ? s.hiddenProfiles.filter((id) => id !== profileId)
          : s.hiddenProfiles,
      conversations:
        d.type === "report" && d.action === "violation"
          ? s.conversations.map((c) =>
              c.id === target ||
              (hideProfile && c.id === "match-" + hideProfile)
                ? { ...c, ended: true }
                : c,
            )
          : s.conversations,
      listings:
        d.type === "listing"
          ? s.listings.map((r) =>
              r.id === d.id
                ? { ...r, status: d.action as ListingStatus, note: reason }
                : r,
            )
          : d.type === "report" && d.action === "violation"
            ? s.listings.map((r) =>
                r.id === s.reports.find((x) => x.id === d.id)?.target
                  ? {
                      ...setListingReportDecision(r, d.id, true),
                      status: "hidden",
                      note: reason,
                    }
                  : r,
              )
            : restore && report?.previousStatus
              ? s.listings.map((r) =>
                  r.id === target
                    ? {
                        ...setListingReportDecision(r, d.id, false),
                        status:
                          r.status === "hidden"
                            ? report.previousStatus!
                            : r.status,
                        note: reason,
                      }
                    : r,
                )
              : s.listings,
      reports:
        d.type === "report"
          ? s.reports.map((r) =>
              r.id === d.id
                ? {
                    ...r,
                    status: d.action === "more" ? "needs-info" : "closed",
                    decision: reason,
                    previousStatus:
                      d.action === "violation"
                        ? (r.previousStatus ??
                          s.listings.find((listing) => listing.id === target)
                            ?.status)
                        : r.previousStatus,
                    previousProfileHidden:
                      d.action === "violation" && profileId
                        ? (r.previousProfileHidden ??
                          s.hiddenProfiles.includes(profileId))
                        : r.previousProfileHidden,
                  }
                : r,
            )
          : s.reports,
      logs: [
        ...s.logs,
        `${new Date().toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })} · Vận hành demo · ${d.type} ${d.id} · ${d.action}: ${reason}`,
      ],
    }));
    setDecision(null);
    setReason("");
    notify("Đã lưu quyết định và nhật ký demo.");
  }
  return (
    <main className="container section">
      <PageTitle
        eyebrow="ANTRO / VẬN HÀNH DEMO"
        title="Duyệt tin và báo cáo"
        description="Kiểm tra thông tin trước khi ra quyết định. Cảnh báo chưa phải kết luận vi phạm."
        action={
          <button className="btn outline" onClick={() => setEntered(false)}>
            Thoát chế độ vận hành
          </button>
        }
      />
      <div className="stats-grid">
        {[
          ["Tin cần xem xét", pending.length],
          [
            "Báo cáo đang mở",
            data.reports.filter((r) => r.status !== "closed").length,
          ],
          ["Yêu cầu xác minh", data.status === "review" ? 1 : 0],
        ].map(([t, n]) => (
          <div className="stat" key={t}>
            <span>{t}</span>
            <strong>{n}</strong>
          </div>
        ))}
      </div>
      <div className="tabs">
        {[
          ["listings", "Duyệt tin phòng"],
          ["reports", "Báo cáo & khiếu nại"],
          ["verification", "Xác minh"],
          ["logs", "Nhật ký"],
        ].map(([key, label]) => (
          <button
            key={key}
            className={tab === key ? "active" : ""}
            onClick={() => setTab(key)}
          >
            {label}
          </button>
        ))}
      </div>
      {tab === "listings" &&
        (pending.length ? (
          <div className="admin-table">
            <div className="table-header">
              <span>Tin phòng</span>
              <span>Kiểm tra mẫu</span>
              <span>Quyết định</span>
            </div>
            {pending.map((r) => (
              <div className="table-row" key={r.id}>
                <div>
                  <strong>{presentListing(r).title}</strong>
                  <p className="muted">{r.area}</p>
                  <span className="pill">{statusLabels[r.status]}</span>
                </div>
                <div>
                  <span
                    className={
                      r.electricity === null ? "warning-text" : "success-text"
                    }
                  >
                    {r.electricity === null
                      ? "Thiếu giá điện"
                      : "Đã có các khoản phí chính"}
                  </span>
                  <p className="fineprint">
                    Ảnh minh họa. Chưa chạy kiểm tra AI hoặc quyền cho thuê.
                  </p>
                </div>
                <div className="inline-actions">
                  {[
                    ["published", "Duyệt"],
                    ["changes", "Bổ sung"],
                    ["rejected", "Từ chối"],
                  ].map(([action, label]) => (
                    <button
                      className={`btn ${action === "published" ? "primary" : "outline"}`}
                      key={action}
                      onClick={() => {
                        setReason("");
                        setDecision({ id: r.id, type: "listing", action });
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <Empty
            title="Đã xem hết các tin cần duyệt"
            description="Tin gửi mới sẽ xuất hiện tại đây trong bản demo."
          />
        ))}
      {tab === "reports" && (
        <div className="reports-list">
          {data.reports.map((r) => (
            <article className="panel" key={r.id}>
              <div className="section-heading">
                <div>
                  <span className="pill">
                    {
                      {
                        new: "Mới nhận",
                        review: "Đang xem xét",
                        closed: "Đã xử lý",
                        "needs-info": "Cần bổ sung",
                      }[r.status]
                    }
                  </span>
                  <h3>{r.reason}</h3>
                  <p className="fineprint">Đối tượng: {r.target}</p>
                </div>
                <Icon name="flag" />
              </div>
              <p>{r.detail}</p>
              {r.decision && <p className="info-note">Kết quả: {r.decision}</p>}
              {r.appeal && (
                <p className="warning">Giải trình demo: {r.appeal}</p>
              )}
              <div className="inline-actions">
                {r.status !== "closed" && (
                  <button
                    className="btn outline"
                    onClick={() =>
                      update((s) => ({
                        ...s,
                        reports: s.reports.map((x) =>
                          x.id === r.id ? { ...x, status: "review" } : x,
                        ),
                      }))
                    }
                  >
                    Đang xem xét
                  </button>
                )}
                {[
                  ["violation", "Có vi phạm"],
                  ["no-evidence", "Không đủ cơ sở"],
                  ["more", "Cần thêm thông tin"],
                ].map(([action, label]) => (
                  <button
                    key={action}
                    className="btn outline"
                    onClick={() => {
                      setReason("");
                      setDecision({ id: r.id, type: "report", action });
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
              {r.status === "closed" && (
                <details className="trust-details">
                  <summary>Thử gửi giải trình cho báo cáo này</summary>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      update((s) => ({
                        ...s,
                        reports: s.reports.map((x) =>
                          x.id === r.id
                            ? { ...x, appeal, status: "review" }
                            : x,
                        ),
                        logs: [
                          ...s.logs,
                          `Nhận giải trình báo cáo ${r.id}: ${appeal}`,
                        ],
                      }));
                      setAppeal("");
                      notify("Đã chuyển giải trình về hàng đợi xem xét.");
                    }}
                  >
                    <label>
                      Giải trình mẫu
                      <textarea
                        value={appeal}
                        minLength={10}
                        required
                        onChange={(e) => setAppeal(e.target.value)}
                      />
                    </label>
                    <button className="btn soft">Gửi giải trình demo</button>
                  </form>
                </details>
              )}
            </article>
          ))}
        </div>
      )}
      {tab === "verification" && (
        <div className="panel">
          <h2>Yêu cầu xác minh mẫu</h2>
          <p>
            Trạng thái tài khoản hiện tại: <strong>{data.status}</strong>
          </p>
          <p className="muted">
            Không có giấy tờ thật. Duyệt ở đây chỉ thay đổi trạng thái demo.
          </p>
          <div className="inline-actions">
            {(["active", "pending", "rejected", "blocked"] as const).map(
              (s, i) => (
                <button
                  className="btn outline"
                  key={s}
                  onClick={() => {
                    update((d) => ({
                      ...d,
                      status: s,
                      logs: [
                        ...d.logs,
                        `Vận hành demo: đổi trạng thái tài khoản sang ${s}`,
                      ],
                    }));
                    notify("Đã cập nhật tài khoản mẫu.");
                  }}
                >
                  {["Chấp thuận", "Yêu cầu bổ sung", "Từ chối", "Hạn chế"][i]}
                </button>
              ),
            )}
          </div>
        </div>
      )}
      {tab === "logs" && (
        <div className="panel">
          <h2>Lịch sử thao tác</h2>
          {data.logs.length ? (
            <ol className="audit-list">
              {[...data.logs].reverse().map((log, i) => (
                <li key={i}>{log}</li>
              ))}
            </ol>
          ) : (
            <p className="muted">Chưa có thao tác cần ghi nhật ký.</p>
          )}
        </div>
      )}
      {decision && (
        <Modal title="Ghi nhận quyết định" onClose={() => setDecision(null)}>
          <p className="muted">
            Nêu rõ căn cứ và hướng xử lý. Thao tác sẽ lưu vào nhật ký demo.
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              commit();
            }}
          >
            <label>
              Lý do quyết định
              <textarea
                required
                minLength={10}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Ít nhất 10 ký tự…"
              />
            </label>
            <button className="btn primary full">Lưu quyết định</button>
          </form>
        </Modal>
      )}
    </main>
  );
}
