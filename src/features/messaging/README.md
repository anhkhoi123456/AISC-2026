# messaging

Hội thoại mẫu và gửi tin local tại `components/messages-screen.tsx`. Kết nối đã kết thúc không gửi được tin mới. Không có chat đa người dùng hoặc WebSocket.

Trạng thái được cung cấp qua `shared/lib/demo-store.tsx`; route nằm trong `src/app`.

Quyền gửi nằm trong `services/messages.ts`; consent và che nội dung nằm trong `services/chat-safety.ts`. Chỉ mở liên hệ khi cả hai đồng ý; phản hồi nhân vật mẫu được điều khiển riêng trong Công cụ demo. Tin và preview cùng dùng hàm hiển thị, kể cả sau reload. Nội dung gốc vẫn còn trong localStorage: đây không phải cơ chế bảo mật backend.
