# AnTro 3.0 — frontend demo

Website tìm phòng, tìm bạn ở ghép và theo dõi lượt thuê quanh Làng Đại học. **Next.js 16 App Router, React 19, TypeScript 6, Tailwind/CSS, Lucide**. Giữ codebase hiện tại, không thêm dependency. Next.js quản lý route; công cụ đọc hợp đồng cũ dùng fragment cho hai bước nội bộ.

Nguồn chính: [đặc tả hợp nhất 22/10/2026](docs/requirements/ANTRO-3.0.md). [Checklist mục 25 và kết quả nghiệm thu](docs/ANTRO-3-CHECKLIST.md). Tài liệu rà soát 2.x trong `docs/PROTOTYPE-REVIEW.md` và `docs/CONTENT-REVIEW.md` là lịch sử, không thay quy tắc 3.0.

## Chạy

Node.js **24.x**, npm. Không cần `.env`, API key, database hoặc dịch vụ trả phí.

```sh
cd /Users/giabinhne/Documents/AISC/AnTro
npm ci
npm run dev
```

Mở http://localhost:3000. Bản production cục bộ:

```sh
npm run build
npm start
```

Có thể dùng cổng riêng: `npm start -- --hostname 127.0.0.1 --port 3100`. Không có deploy mới. Hướng dẫn hosting riêng cho team: [HOSTING.md](docs/HOSTING.md), cần cấu hình bảo vệ truy cập trên tài khoản hosting trước khi chia sẻ.

## Giới hạn cần nói rõ

Đây là **một trình duyệt dùng mock service + localStorage**, không phải nhiều tài khoản trao đổi qua server. Mọi ảnh, tọa độ, danh tính, bằng chứng, hợp đồng và review ban đầu đều là mẫu. Không nhận tiền, giữ cọc, ký điện tử thật, gọi ngân hàng, OTP/eKYC/OAuth thật hoặc AI trả phí. Che liên hệ và kiểm tra quyền ở frontend không tạo bảo mật backend.

Sau khi hoàn tất đăng nhập mẫu, vùng **Đổi người thao tác mẫu** cho diễn phản hồi Người thuê / Người đăng / Admin trên cùng bộ dữ liệu. Người đăng mẫu quản lý danh mục phòng được gán cho `owner-demo`; tài khoản người thuê vẫn có thể đăng tin riêng của mình, quyền sửa gắn mã người quản lý từng phòng. Không dùng việc đổi vai trò làm bằng chứng phân quyền thật.

Login: mở **Trải nghiệm demo** → **Tiếp tục với tài khoản demo** → OTP **123456** → **Xác nhận và tiếp tục** → **Xem kết quả mô phỏng** → **Tiếp tục sử dụng demo**. Form cũng có email `demo@antro.vn`, mật khẩu mẫu `Antro123!`; không dùng mật khẩu hoặc giấy tờ thật.

## Các trang và hành vi

| URL | Nội dung |
|---|---|
| `/`, `/tim-phong` | Tìm theo tọa độ mẫu, nhiều điểm đến/bán kính; điều kiện bắt buộc áp đồng thời; nhóm gần phù hợp giải thích riêng |
| `/phong/[id]` | Chi phí dùng chung calculator, trạng thái phí, tiền ban đầu, xác minh theo loại, yêu cầu thuê, review và lịch sử căn phòng |
| `/roommatch/ho-so`, `/roommatch` | Hồ sơ nhiều bước, lọc hai chiều, trung bình nhân, lý do cùng nguồn tính, quan tâm/bỏ qua/vuốt/phím/hoàn tác |
| `/tin-nhan` | Chat tin phòng hoặc mutual Match; consent liên hệ hai phía, cảnh báo theo ngữ cảnh, chặn/kết thúc |
| `/noi-o` | Thỏa thuận thuê, hai phía bàn giao, hồ sơ/phiên bản hợp đồng mẫu, bảng phí kỳ thuê, khai trả/nhận, cọc, đề xuất giá, rời phòng và review |
| `/thong-bao` | Thông báo theo phía có liên quan; đã đọc không thành đồng ý |
| `/dang-tin`, `/quan-ly-tin` | Wizard 4 bước có nháp, phí, xem trước, quản lý quyền tuyển roommate/chỗ, đóng/ẩn/đăng lại |
| `/admin` | Duyệt tin đủ điều kiện mẫu; báo cáo, bất đồng lượt ở/cọc, review, điểm; lý do và log |
| `/tai-khoan`, `/yeu-thich` | Hồ sơ, tin lưu, xóa dữ liệu demo cục bộ có xác nhận |
| `/hop-dong` | Công cụ phụ dò từ khóa, không phải tư vấn hoặc kết luận pháp lý |

**Địa điểm:** Haversine đường chim bay từ tọa độ giả lập của phòng và điểm đến. Không có tọa độ thì chưa tính được, không gán 0 km; không suy ra phút đi đường. Trường/nơi làm việc trong RoomMatch độc lập với khu vực muốn thuê. Các thời gian di chuyển RoomMatch là khai báo mẫu riêng, không tính từ Haversine.

**Phí:** Có phí / Đã gồm (nêu ở đâu) / Không thu / Chưa rõ. Internet/vệ sinh/quản lý theo phòng được chia người; nước theo người; điện theo kWh/phòng; xe theo số xe cá nhân. Phụ thu khách và chuyển nhượng là khoản có điều kiện, không cộng vào tháng thường. Trả trước tính cả tháng đầu, không cộng trùng. Ví dụ chuẩn 3 triệu, 2 người, 120 kWh, 1 xe/người: **1.940.000đ/người/tháng**, cọc **1.500.000đ/người**, ban đầu **3.440.000đ/người**. Tin đầu seed giá 3,2 triệu nên tổng tương ứng là **2.040.000đ**.

**Lượt ở:** Match/quan tâm/chat không tạo thuê hoặc giảm chỗ. Mỗi tài khoản có một bản ghi riêng. Chỉ sau hai bên bàn giao hoặc Admin đối chiếu bằng chứng mẫu hợp lệ mới có căn cứ cư trú. Số người từ lượt đang ở + khách ngoài hệ thống được khai báo; khách ngoài không tự có quyền review. Hết chỗ ngừng tiếp nhận; kết thúc giữ lịch sử và cần chủ động mở đợt tuyển mới.

**Trust 3.0:** M là mức rõ thông tin/chi phí/điều kiện hiện tại. R = 25 × (sao trung bình − 1), chỉ từ review hợp lệ chưa bị ẩn. H khởi điểm giả định 70, bàn giao được ghi nhận +2/lượt tối đa +20, mỗi report đã xác nhận −10; đính chính Admin có căn cứ được lưu riêng. T = làm tròn(0,4 M + 0,4 R + 0,2 H), chỉ có tổng khi đủ ít nhất ba tài khoản/lượt ở khác nhau. Không có mẫu thì **Chưa đủ dữ liệu**, không gán kém. Công thức cũ 30/25/20/15/10 không dùng để hiển thị Trust 3.0; helper cũ còn để kiểm thử tính tương thích lịch sử. User Trust cũ chỉ là thông tin mẫu, không dùng để chặn cơ hội thuê hoặc cấp quyền review.

## Dữ liệu và lưu trữ

Giữ key `antro-demo-v2`, envelope hiện là **version 4**. Migration v2/v3 giữ tin, hồ sơ, chat và lượt quan tâm, thêm mô hình căn phòng/đợt đăng; **không biến dữ liệu cũ thành lượt ở đã xác nhận**. Có thông báo và bản sao trước chuyển đổi `antro-demo-before-v4` (giữ backup v3 cũ). Chỗ/phòng dùng mã riêng, snapshot thuê không bị sửa bởi giá chào. Lượt ở, bill, review, quyết định và thông báo được lưu qua refresh. Dữ liệu housing hỏng được cô lập, giữ dữ liệu lõi và sao lưu nguyên bản; đầy/chặn bộ nhớ có cảnh báo, thay đổi còn trong phiên.

Seed mới: 3 tin công khai, 1 chờ duyệt, 3 hồ sơ RoomMatch; phòng đầu có Khánh An đang ở mẫu và ba lượt lịch sử với ba review đủ điều kiện để trình diễn ngưỡng điểm. Phòng KTX thiếu điện và review, thể hiện đúng thông tin chưa đủ. Không cần tăng số mẫu. Bản dữ liệu cũ giữ nguyên, nên có thể chưa có lịch sử mẫu mới; muốn diễn seed mới, tải JSON hồ sơ lượt ở cần giữ (trong mục Hợp đồng và bàn giao mẫu) hoặc lưu bản sao localStorage trước rồi chủ động reset có xác nhận trong Công cụ demo. Không tự reset.

Màu **Sáng / Tối / Theo hệ thống** dùng key `antro-theme` riêng, áp dụng từ head tránh nháy sáng. Ảnh không đảo màu; [nguồn ảnh](public/images/SOURCES.md). Khi xóa dữ liệu trình duyệt có thể mất tiến trình; đây không phải sao lưu production.

## Kịch bản 5–7 phút

Xem [DEMO-3.0.md](docs/DEMO-3.0.md) để có đúng nút, dữ liệu nhập và nhánh bị chặn. Dùng seed mới trong profile trình duyệt thử nghiệm; không reset dữ liệu đang dùng của team để diễn.

## Kiểm tra

```sh
npm run lint
npm run typecheck
npm run test:unit
npm run build
npm start -- --hostname 127.0.0.1 --port 3100
# Terminal khác:
PLAYWRIGHT_BASE_URL=http://127.0.0.1:3100 npm run test:e2e
```

Playwright hiện dùng Chrome có sẵn trên macOS theo `playwright.config.ts`; máy khác cần chỉnh executable/cài browser phù hợp. Test bao gồm quy tắc tiền, quyền hai chiều, chuyển trạng thái, chống lặp, migration, công thức điểm và các hành trình desktop/mobile. Ảnh/trace ở `test-results/` (ignored). Kết quả: lint, typecheck, production build và 32 unit test đạt; 27 bài trình duyệt đã đạt qua hai lượt kiểm tra. Chi tiết thực chạy và giới hạn nằm ở checklist nghiệm thu.

Chưa làm: backend/API/phân quyền server, cư trú/giấy tờ thật, ký/thu tiền/đối soát thật, ảnh upload, routing giao thông, AI, email/push/job 7/14 ngày, chống thông đồng, nhóm nhiều người, so sánh phòng bổ sung, bộ lọc nâng cao chưa ghi hỗ trợ, PWA, mở vùng và hạ tầng phục hồi production. Không có nút giả cho các phần này.
