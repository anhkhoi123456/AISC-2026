"use client";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { useDemo } from "@/shared/lib/demo-store";
import {
  PageTitle,
  Guard,
  Empty,
  Modal,
  ReportButton,
} from "@/shared/components/ui";
import { Icon } from "@/shared/components/icon";
import {
  roommatchService,
  swipe,
  undoSwipe,
  type getDeck,
} from "@/services/roommatch";
import { userTrustScore } from "@/services/user-trust";
import { money } from "@/features/listings/lib/cost";
export function RoommatchScreen() {
  return (
    <Guard>
      <Explore />
    </Guard>
  );
}
function Explore() {
  const { data, update, command, notify } = useDemo();
  const [tab, setTab] = useState("discover"),
    [matched, setMatched] = useState(""),
    [busy, setBusy] = useState(false),
    [loading, setLoading] = useState(false),
    [error, setError] = useState(""),
    [retry, setRetry] = useState(0);
  const [deck, setDeck] = useState<ReturnType<typeof getDeck>>([]);
  useEffect(() => {
    let current = true;
    if (!data.profile.visible && tab !== "matches") return;
    setLoading(true);
    setError("");
    roommatchService
      .deck(data, tab)
      .then((r) => {
        if (current) {
          setDeck(r);
          setLoading(false);
        }
      })
      .catch(() => {
        if (current) {
          setError("Không tải được gợi ý. Thử lại nhé.");
          setLoading(false);
        }
      });
    return () => {
      current = false;
    };
  }, [data, tab, retry]);
  async function interact(id: string, action: "like" | "pass") {
    setBusy(true);
    const p = deck.find((x) => x.person.id === id)?.person;
    const unliking = data.likes.includes(id);
    const result = await command((s) => swipe(s, id, action));
    if (result) {
      if (action === "like" && !unliking && p?.likesYou) setMatched(p.name);
      else
        notify(
          action === "pass"
            ? "Đã bỏ qua hồ sơ."
            : unliking
              ? "Lượt quan tâm đã được lưu trước đó."
              : "Đã lưu quan tâm một chiều, chưa mở chat.",
        );
    }
    setBusy(false);
  }
  const touch = useRef<{ x: number; y: number } | null>(null);
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (
        busy ||
        loading ||
        matched ||
        tab !== "discover" ||
        !data.profile.visible ||
        document.querySelector('[role="dialog"]') ||
        (e.target instanceof Element &&
          e.target.closest('input,textarea,select,[contenteditable="true"]'))
      )
        return;
      if (e.key === "ArrowRight" && deck[0]) {
        e.preventDefault();
        void interact(deck[0].person.id, "like");
      }
      if (e.key === "ArrowLeft" && deck[0]) {
        e.preventDefault();
        void interact(deck[0].person.id, "pass");
      }
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  });
  return (
    <main className="container section">
      <PageTitle
        title="Tìm bạn ở ghép"
        description="Chọn khu vực, ngân sách và thói quen. Xem lý do tương thích trước khi quan tâm."
        action={
          <Link href="/roommatch/ho-so" className="btn outline">
            <Icon name="sliders" size={17} />
            {data.profile.visible ? "Sửa hồ sơ" : "Tạo hồ sơ"}
          </Link>
        }
      />
      <div className="tabs">
        {[
          ["discover", "Khám phá"],
          ["likes", "Đã quan tâm"],
          ["matches", "Đã kết nối"],
        ].map(([key, label]) => (
          <button
            key={key}
            className={tab === key ? "active" : ""}
            onClick={() => setTab(key)}
          >
            {label}
          </button>
        ))}
        <span className="tabs-end">
          Hồ sơ {data.profile.visible ? "đang hiển thị" : "đang ẩn"}
          <span className="live-dot" />
        </span>
      </div>
      {data.profile.visible && (
        <div className="deck-toolbar">
          <p>
            ← / vuốt trái: bỏ qua · → / vuốt phải: quan tâm. {deck.length} hồ sơ
            trong nhóm.
          </p>
          <button
            className="btn outline"
            disabled={!data.lastSwipe || busy}
            onClick={() => command(undoSwipe)}
          >
            Hoàn tác lượt gần nhất
          </button>
        </div>
      )}
      {!data.profile.visible && tab !== "matches" ? (
        <Empty
          title="Tạo hồ sơ để xem gợi ý"
          description="Nhập nhu cầu thuê và thói quen để lọc hồ sơ mẫu."
          action={
            <Link href="/roommatch/ho-so" className="btn primary">
              Tạo hồ sơ RoomMatch <Icon name="arrow" size={17} />
            </Link>
          }
        />
      ) : loading ? (
        <div role="status" className="loading-panel">
          Đang so khớp điều kiện hai chiều…
        </div>
      ) : error ? (
        <div role="alert" className="empty">
          <p>{error}</p>
          <button className="btn outline" onClick={() => setRetry(retry + 1)}>
            Thử lại
          </button>
        </div>
      ) : (
        <div className="match-layout">
          <div>
            {deck.length ? (
              (tab === "discover" ? deck.slice(0, 1) : deck).map(
                ({ person: p, result }) => {
                  const conversation = data.conversations.find(
                    (c) => c.id === "match-" + p.id,
                  );
                  return (
                    <article
                      className={`person-card ${tab === "discover" ? "stack-card" : ""}`}
                      key={p.id}
                      onPointerDown={(e) => {
                        if (
                          e.target instanceof Element &&
                          e.target.closest(
                            "a,button,input,select,textarea,summary",
                          )
                        )
                          return;
                        touch.current = { x: e.clientX, y: e.clientY };
                      }}
                      onPointerUp={(e) => {
                        if (
                          e.target instanceof Element &&
                          e.target.closest(
                            "a,button,input,select,textarea,summary",
                          )
                        ) {
                          touch.current = null;
                          return;
                        }
                        const start = touch.current;
                        touch.current = null;
                        if (!start || busy || tab !== "discover") return;
                        const dx = e.clientX - start.x,
                          dy = e.clientY - start.y;
                        if (
                          Math.abs(dx) > 80 &&
                          Math.abs(dx) > Math.abs(dy) * 1.5
                        )
                          void interact(p.id, dx > 0 ? "like" : "pass");
                      }}
                      onPointerCancel={() => {
                        touch.current = null;
                      }}
                    >
                      {tab === "discover" && deck.length > 1 && (
                        <div className="stack-hint">
                          {deck.length - 1} hồ sơ phía sau
                        </div>
                      )}
                      <div className="person-image">
                        <img
                          src={p.avatar}
                          alt={`${p.name} — nhân vật minh họa`}
                        />
                        <span className="image-badge">
                          Danh tính mẫu · Mô phỏng
                        </span>
                        <div className="person-image-name">
                          <h2>{p.name}</h2>
                          <p>{p.school}</p>
                        </div>
                      </div>
                      <div className="person-content">
                        <div className="match-score">
                          <span>
                            <Icon name="leaf" size={18} />
                            <strong>
                              {result.score ?? "—"}
                              <small>/100</small>
                            </strong>
                          </span>
                          <div>
                            <b>
                              {!result.qualifies
                                ? "Nhu cầu đã thay đổi"
                                : result.score === null
                                  ? "Đạt điều kiện"
                                  : result.score >= 80
                                    ? "Rất hợp"
                                    : result.score >= 65
                                      ? "Hợp"
                                      : "Cần trao đổi thêm"}
                            </b>
                            <small>
                              {!result.qualifies
                                ? "Kết nối cũ · Trao đổi lại nhu cầu"
                                : result.score === null
                                  ? "Chưa có tiêu chí mềm để chấm điểm"
                                  : "Điểm phù hợp hai chiều · Demo"}
                            </small>
                          </div>
                        </div>
                        <p className="user-trust">
                          User Trust:{" "}
                          {
                            userTrustScore({
                              otp: true,
                              verified: true,
                              bio: !!p.bio,
                              profileComplete: true,
                            }).score
                          }
                          /100 · Giả lập
                        </p>
                        <p>
                          Khu vực giao nhau: {result.sharedAreas.join(" · ")}
                        </p>
                        {p.scenario === "Đã có phòng" && (
                          <Link
                            href={"/phong/" + p.roomId}
                            className="text-btn"
                          >
                            Xem phòng đang có · {p.vacancies} chỗ trống
                          </Link>
                        )}
                        <p className="person-bio">{p.bio}</p>
                        <div className="tags">
                          <span>{p.scenario}</span>
                          <span>
                            {money(p.min)}–{money(p.max)} / người
                          </span>
                          <span>{p.months} tháng</span>
                          <span>{p.sleep}</span>
                          {p.quiet && <span>Cần yên tĩnh</span>}
                        </div>
                        <div className="why-match">
                          <h4>
                            {result.qualifies
                              ? "Vì sao có thể hợp?"
                              : "Trạng thái nhu cầu"}
                          </h4>
                          {result.good.map((g) => (
                            <p key={g}>
                              <Icon name="check" size={15} />
                              {g}
                            </p>
                          ))}
                          {result.different.map((g) => (
                            <p key={g} className="warning-text">
                              {g}
                            </p>
                          ))}
                          {result.ab !== null && result.ba !== null && (
                            <details>
                              <summary>Cách tính điểm</summary>
                              <p>
                                A→B: {result.ab.toFixed(1)} · B→A:{" "}
                                {result.ba.toFixed(1)}
                                <br />
                                Làm tròn √(A→B × B→A) = {result.score}. Trọng số
                                theo đặc tả, mức quan trọng do mỗi bên chọn.
                              </p>
                            </details>
                          )}
                        </div>
                        {conversation && !conversation.ended ? (
                          <Link
                            className="btn primary full"
                            href={"/tin-nhan?chat=match-" + p.id}
                          >
                            <Icon name="chat" size={18} />
                            Nhắn tin
                          </Link>
                        ) : (
                          <div className="person-actions">
                            <button
                              disabled={busy}
                              className="btn outline"
                              onClick={() => interact(p.id, "pass")}
                            >
                              <Icon name="close" size={18} />
                              Bỏ qua
                            </button>
                            <button
                              disabled={busy || data.likes.includes(p.id)}
                              className="btn primary"
                              onClick={() => interact(p.id, "like")}
                            >
                              <Icon name="heart" size={18} />
                              {data.likes.includes(p.id)
                                ? "Đã quan tâm"
                                : "Quan tâm"}
                            </button>
                          </div>
                        )}
                        <div className="person-footer">
                          <ReportButton target={"profile-" + p.id} />
                          <button
                            className="text-btn muted"
                            onClick={() => {
                              update((s) => ({
                                ...s,
                                blocked: [...new Set([...s.blocked, p.id])],
                                conversations: s.conversations.map((c) =>
                                  c.id === "match-" + p.id
                                    ? { ...c, ended: true }
                                    : c,
                                ),
                              }));
                              notify("Đã chặn và đóng quyền gửi tin.");
                            }}
                          >
                            Chặn hồ sơ
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                },
              )
            ) : (
              <Empty
                title="Chưa có thêm hồ sơ đạt điều kiện."
                description="Bộ dữ liệu mẫu được giữ gọn. AnTro không nới điều kiện bắt buộc khi hết thẻ."
                action={
                  <button
                    className="btn outline"
                    onClick={() => update((s) => ({ ...s, passed: [] }))}
                  >
                    Xem lại hồ sơ đã bỏ qua
                  </button>
                }
              />
            )}
          </div>
          <aside className="match-sidebar">
            <div className="match-guidance">
              <h3>Điều kiện kết nối</h3>
              <p className="muted">
                Quan tâm hai chiều mới mở chat. Hãy trao đổi về giờ giấc, chi
                phí và những khác biệt.
              </p>
              <ul className="simple-list">
                <li>Kiểm tra bắt buộc từ cả hai bên.</li>
                <li>Không mở lại Match đã kết thúc.</li>
                <li>Hồ sơ và ảnh đều là minh họa.</li>
              </ul>
              <button
                className="text-btn"
                onClick={() =>
                  update((s) => ({
                    ...s,
                    profile: { ...s.profile, visible: false },
                  }))
                }
              >
                Ẩn hồ sơ của tôi
              </button>
            </div>
            <p className="fineprint">
              Ngọc Linh đã quan tâm bạn trong kịch bản mẫu. Điểm phù hợp không
              phải xác suất sống chung thành công. Giới tính từ danh tính mẫu,
              mặc định cùng giới là giả định demo. Thời gian đi lại là số phút
              mẫu do người dùng khai, không phải đo bản đồ.
            </p>
          </aside>
        </div>
      )}
      {matched && (
        <Modal title="Có một kết nối mới!" onClose={() => setMatched("")}>
          <div className="result-screen">
            <span className="match-celebration">
              <Icon name="users" size={45} />
            </span>
            <h2>
              Bạn và {matched}
              <br />
              đều muốn kết nối.
            </h2>
            <p>Bắt đầu bằng câu chuyện về nơi ở tiếp theo.</p>
            <Link className="btn primary full" href="/tin-nhan">
              Gửi lời chào đầu tiên <Icon name="chat" size={18} />
            </Link>
            <button className="text-btn" onClick={() => setMatched("")}>
              Tiếp tục khám phá
            </button>
          </div>
        </Modal>
      )}
    </main>
  );
}
