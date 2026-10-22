"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  consentContact,
  contactShared,
  displayMessage,
  safetyWarnings,
} from "@/services/chat-safety";
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
      <PageTitle title="Tin nhắn" description="" />
      {!chat ? (
        <Empty
          title="Chưa có cuộc trò chuyện nào"
          description="Kết nối qua RoomMatch hoặc liên hệ một tin phòng để bắt đầu."
          action={
            <Link href="/roommatch" className="btn primary">
              Tìm bạn ở ghép
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
                    {c.messages.length > 0 && (
                      <span>
                        {displayMessage(
                          c,
                          c.messages[c.messages.length - 1].text,
                        ).slice(0, 70)}
                      </span>
                    )}
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
                  {chat.ended ? "Đã kết thúc" : "Chỉ lưu trên thiết bị này"}
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
                  <p>{displayMessage(chat, m.text)}</p>
                  {safetyWarnings(m.text).map((w) => (
                    <div className="chat-rule-warning" role="note" key={w}>
                      {w}
                    </div>
                  ))}
                  <small>
                    {m.time}
                    {m.mine ? " · Đã lưu" : ""}
                  </small>
                </div>
              ))}
            </div>
            {!chat.ended && (
              <div className="chat-safety contact-consent">
                <button
                  className="btn outline"
                  onClick={() => setAction("share")}
                >
                  Chia sẻ liên hệ
                </button>
                <span>
                  {contactShared(chat)
                    ? "Cả hai đã đồng ý; có thể thu hồi."
                    : chat.sharing?.mine
                      ? "Bạn đã đồng ý; đang chờ đối phương."
                      : "Liên hệ được che đến khi cả hai đồng ý."}
                </span>
                {chat.sharing?.mine && (
                  <button
                    className="text-btn"
                    onClick={() =>
                      command((s) => consentContact(s, chat.id, "mine", false))
                    }
                  >
                    Thu hồi đồng ý
                  </button>
                )}
              </div>
            )}
            {text &&
              safetyWarnings(text).map((w) => (
                <p role="status" className="warning" key={w}>
                  {w}
                </p>
              ))}
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
            action === "share"
              ? "Đồng ý chia sẻ liên hệ?"
              : action === "block"
                ? "Chặn kết nối này?"
                : "Kết thúc cuộc trò chuyện?"
          }
          onClose={() => setAction("")}
        >
          {action === "share" ? (
            <p>
              Thông tin liên hệ chỉ hiện khi cả hai đồng ý. Hội thoại hiện dùng
              người dùng mẫu nên chưa thể nhận sự đồng ý từ người thật. Dữ liệu
              chỉ được che khi hiển thị, vẫn được lưu trên thiết bị.
            </p>
          ) : (
            <p>
              Tin nhắn cũ được giữ lại. Bạn sẽ không gửi được tin mới; bỏ chặn
              không tự mở lại kết nối.
            </p>
          )}
          <div className="form-actions">
            <button className="btn outline" onClick={() => setAction("")}>
              Quay lại
            </button>
            <button
              className="btn danger-btn"
              onClick={() => {
                if (action === "share") {
                  command((s) => consentContact(s, chat.id, "mine"));
                  setAction("");
                  return;
                }
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
                notify("Đã kết thúc kết nối.");
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
