import type { Conversation, DemoState } from "@/shared/lib/models";
import { normalize } from "@/features/search/lib/text";
import { assertCanChat } from "./messages";
const contactPattern =
  /[\w.+-]+@[\w.-]+\.[a-z]{2,}|(?:\+?84|0)[\d .()-]{7,17}\d/gi;
export function contactShared(c: Conversation) {
  return !c.ended && c.sharing?.mine === true && c.sharing.theirs === true;
}
export function displayMessage(c: Conversation, text: string) {
  return contactShared(c)
    ? text
    : text.replace(contactPattern, "[Liên hệ đã che]");
}
export function safetyWarnings(text: string) {
  const q = normalize(text),
    warnings: string[] = [];
  if (
    /(chuyen|gui|dong|tra).{0,28}(coc|giu cho)|(?:coc|chuyen tien).{0,30}(truoc|ngay|gap|chua xem)/.test(
      q,
    )
  )
    warnings.push(
      "Tin có nội dung về chuyển cọc trước hoặc gấp. Hãy xem phòng, kiểm tra quyền cho thuê và thỏa thuận trước khi quyết định; quy tắc không kết luận lừa đảo.",
    );
  if (
    contactPattern.test(text) ||
    /(?:qua|sang|ket ban|nhan|lien he).{0,15}(zalo|telegram|whatsapp)/.test(q)
  )
    warnings.push(
      "Bạn đang trao đổi liên hệ ngoài AnTro. Chỉ mở thông tin sau khi cả hai đồng ý; cân nhắc giữ trao đổi quan trọng trong hội thoại.",
    );
  contactPattern.lastIndex = 0;
  if (/https?:\/\/|www\./i.test(text))
    warnings.push(
      "Tin có đường dẫn ngoài. Kiểm tra tên miền trước khi mở; không cung cấp OTP hoặc thông tin thanh toán qua link lạ.",
    );
  return warnings;
}
export function consentContact(
  s: DemoState,
  id: string,
  side: "mine" | "theirs",
  agree = true,
): DemoState {
  const c = assertCanChat(s, id);
  if (
    s.status !== "active" ||
    !c ||
    c.ended ||
    s.blocked.includes(id.replace("match-", ""))
  )
    throw Error("Hội thoại không còn quyền chia sẻ liên hệ.");
  return {
    ...s,
    conversations: s.conversations.map((c) =>
      c.id === id
        ? {
            ...c,
            sharing: {
              mine: c.sharing?.mine ?? false,
              theirs: c.sharing?.theirs ?? false,
              [side]: agree,
            },
          }
        : c,
    ),
  };
}
