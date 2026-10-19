"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { sendMessage } from "@/services/messages";
import { useDemo, uid } from "@/shared/lib/demo-store";
import {
  Guard,
  PageTitle,
  Empty,
  ReportButton,
  Modal,
} from "@/shared/components/ui";
import { Icon } from "@/shared/components/icon";
export function MessagesScreen() {
  return (
    <Guard>
      <Messages />
    </Guard>
  );
}
function Messages() {
  const { data, update, notify, command } = useDemo();
  const [selected, setSelected] = useState("");
  const [text, setText] = useState("");
  const [action, setAction] = useState("");
  const [sending, setSending] = useState(false);
  useEffect(() => {
    setSelected(new URLSearchParams(window.location.search).get("chat") ?? "");
  }, []);
  const chat =
    data.conversations.find((c) => c.id === selected) ?? data.conversations[0];
  async function send(value: string) {
    if (!chat || sending || !value.trim()) return;
    setSending(true);
    const ok = await command((s) => sendMessage(s, chat.id, value, uid()));
    if (ok) setText("");
    setSending(false);
  }
  return (
    <main className="container section">
      <PageTitle
        eyebrow="NHỮNG CUỘC TRÒ CHUYỆN MỚI"
        title="Bắt đầu bằng một lời chào."
        description="Nơi cùng trao đổi về căn phòng và nhịp sống sắp tới."
      />
      {!chat ? (
        <Empty
          title="Chưa có cuộc trò chuyện nào"
          description="Kết nối qua RoomMatch hoặc liên hệ một tin phòng để bắt đầu."
          action={
            <Link href="/roommatch" className="btn primary">
              Khám phá RoomMatch
            </Link>
          }
        />
      ) : (
        <div className="messages-layout">
          <aside className="conversation-list">
            <h3>
              Tin nhắn <span>{data.conversations.length}</span>
            </h3>
            {data.conversations.map((c) => (
              <button
                key={c.id}
                className={chat.id === c.id ? "selected" : ""}
                onClick={() => {
                  setSelected(c.id);
                  setText("");
                }}
              >
                <img src={c.avatar} alt="" />
                <span>
                  <strong>{c.name}</strong>
                  <small>
                    {c.ended
                      ? "Kết nối đã kết thúc"
                      : c.type === "roommatch"
                        ? "Kết nối RoomMatch"
                        : "Trao đổi về phòng"}
                  </small>
                </span>
                <Icon name="chevron" size={15} />
              </button>
            ))}
          </aside>
          <section className="chat-panel">
            <div className="chat-head">
              <img src={chat.avatar} alt="" />
              <div>
                <strong>{chat.name}</strong>
                <small>
                  {chat.ended
                    ? "Đã kết thúc"
                    : "Hội thoại demo · Không gửi tới người thật"}
                </small>
              </div>
              <button
                className="text-btn muted"
                onClick={() => setAction("end")}
                disabled={chat.ended}
              >
                Kết thúc
              </button>
              <button
                className="text-btn danger"
                onClick={() => setAction("block")}
                disabled={chat.ended}
              >
                Chặn
              </button>
            </div>
            <div className="chat-safety">
              <Icon name="shield" size={16} />
              Hỏi rõ chi phí, xem phòng và kiểm tra thông tin trước khi quyết
              định đặt cọc.
            </div>
            <div className="chat-messages" aria-live="polite">
              {chat.messages.map((m) => (
                <div className={`message ${m.mine ? "mine" : ""}`} key={m.id}>
                  <p>{m.text}</p>
                  <small>
                    {m.time}
                    {m.mine ? " · Đã lưu demo" : ""}
                  </small>
                </div>
              ))}
            </div>
            {!chat.ended && (
              <div className="chat-suggestions">
                {(chat.type === "listing"
                  ? [
                      "Mình muốn hẹn xem phòng vào cuối tuần.",
                      "Bạn cho mình hỏi thêm về tiền điện và cọc nhé.",
                    ]
                  : [
                      "Bạn thường đi ngủ lúc mấy giờ?",
                      "Chúng mình cùng xem vài phòng gần trường nhé?",
                    ]
                ).map((t) => (
                  <button key={t} onClick={() => setText(t)}>
                    {t}
                  </button>
                ))}
              </div>
            )}
            {chat.ended ? (
              <div className="chat-ended">
                Kết nối đã kết thúc. Không thể gửi tin mới.
              </div>
            ) : (
              <form
                className="chat-compose"
                onSubmit={(e) => {
                  e.preventDefault();
                  send(text);
                }}
              >
                <input
                  aria-label="Nội dung tin nhắn"
                  placeholder="Viết lời nhắn của bạn…"
                  maxLength={2000}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                />
                <button
                  className="btn primary"
                  disabled={!text.trim() || sending}
                  aria-label="Gửi tin nhắn"
                >
                  <Icon name="send" size={19} />
                </button>
              </form>
            )}
            <div className="chat-report">
              <ReportButton target={chat.id} />
              <span>Tin nhắn chỉ lưu trên trình duyệt này.</span>
            </div>
          </section>
        </div>
      )}
      {action && chat && (
        <Modal
          title={
            action === "block"
              ? "Chặn kết nối này?"
              : "Kết thúc cuộc trò chuyện?"
          }
          onClose={() => setAction("")}
        >
          <p>
            Tin nhắn cũ vẫn được lưu trong demo. Quyền gửi tin mới sẽ đóng; bỏ
            chặn không tự mở lại kết nối.
          </p>
          <div className="form-actions">
            <button className="btn outline" onClick={() => setAction("")}>
              Quay lại
            </button>
            <button
              className="btn danger-btn"
              onClick={() => {
                update((s) => ({
                  ...s,
                  blocked:
                    action === "block"
                      ? [...s.blocked, chat.id.replace("match-", "")]
                      : s.blocked,
                  conversations: s.conversations.map((c) =>
                    c.id === chat.id ? { ...c, ended: true } : c,
                  ),
                }));
                setAction("");
                notify("Đã kết thúc kết nối demo.");
              }}
            >
              Xác nhận
            </button>
          </div>
        </Modal>
      )}
    </main>
  );
}
