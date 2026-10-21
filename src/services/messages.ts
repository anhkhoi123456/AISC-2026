import type { DemoState } from "@/shared/lib/models";
import { people } from "@/features/roommatch/mocks/people";
export function assertCanChat(s: DemoState, chatId: string) {
  const chat = s.conversations.find((c) => c.id === chatId);
  if (
    s.status !== "active" ||
    !chat ||
    chat.ended ||
    s.blocked.includes(chatId) ||
    s.blocked.includes(chatId.replace("match-", ""))
  )
    throw Error("Kết nối không còn quyền gửi tin.");
  if (
    chat.type === "roommatch" &&
    (!people.some((p) => p.id === chatId.replace("match-", "") && p.likesYou) ||
      !s.likes.includes(chatId.replace("match-", "")) ||
      s.blocked.includes(chatId.replace("match-", "")) ||
      s.hiddenProfiles.includes(chatId.replace("match-", "")))
  )
    throw Error("Kết nối RoomMatch đã bị giới hạn.");
  return chat;
}
export function sendMessage(
  s: DemoState,
  chatId: string,
  text: string,
  id: string,
): DemoState {
  const chat = assertCanChat(s, chatId);
  if (!text.trim() || text.length > 2000)
    throw Error("Tin nhắn cần từ 1 đến 2.000 ký tự.");
  if (chat.messages.some((m) => m.id === id)) return s;
  return {
    ...s,
    conversations: s.conversations.map((c) =>
      c.id === chatId
        ? {
            ...c,
            messages: [
              ...c.messages,
              {
                id,
                text: text.trim(),
                mine: true,
                time: new Intl.DateTimeFormat("vi-VN", {
                  hour: "2-digit",
                  minute: "2-digit",
                  timeZone: "Asia/Ho_Chi_Minh",
                }).format(new Date()),
              },
            ],
          }
        : c,
    ),
  };
}
