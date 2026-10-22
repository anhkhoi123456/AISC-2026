# Đối chiếu AnTro 3.0 (22/10/2026)

Nguồn chính: [đặc tả hợp nhất](requirements/ANTRO-3.0.md), đọc toàn bộ mục 1–25. Công nghệ thực tế: Next.js 16 App Router, React 19, TypeScript, Tailwind/CSS; mock service + localStorage, không có API nghiệp vụ/backend. Giữ nguyên kiến trúc, không thêm dependency.

| Mục 25 | Trước khi sửa | Việc cần thực hiện |
|---|---|---|
| 1. Xác minh/duyệt trước công khai | Cần sửa | Kiểm tra điều kiện tại service, quyền chủ tin |
| 2. Trạng thái phí, chưa rõ | Đã có nền tảng | Thêm nơi đã gồm, tách khoản có điều kiện |
| 3. Cùng tổng chi phí | Đã có | Giữ calculator dùng chung, snapshot lượt ở |
| 4. Lọc bắt buộc đồng thời | Cần sửa | Nhiều điểm đến và bán kính độc lập |
| 5. Khoảng cách mẫu đúng phương pháp | Thiếu | Tọa độ mẫu + Haversine, thiếu tọa độ không là 0 |
| 6. RoomMatch hai chiều | Đã có | Kiểm tra thêm quyền tuyển và chỗ thực |
| 7. Một phía chưa mở chat | Đã có | Hồi quy |
| 8. Match không tạo thuê/giảm chỗ | Đã có | Service lượt ở riêng |
| 9. Quyền tuyển roommate | Thiếu | Chính sách và yêu cầu chủ phòng chấp thuận |
| 10. Bàn giao mới cập nhật cư dân | Thiếu | Hai phía xác nhận, chống lặp |
| 11. Hết chỗ dừng nhận khách | Thiếu | Tính từ lượt ở đang hoạt động + khách ngoài hệ thống |
| 12. Giá chào không sửa lượt ở | Thiếu | Phiên bản/snapshot bất biến, đề xuất riêng |
| 13. Đã đọc khác đồng ý | Thiếu | Thông báo và phản hồi đề xuất riêng |
| 14. Rời không xóa lịch sử | Thiếu | Yêu cầu rời, xác nhận/Admin xử lý |
| 15. Quyền review từ lượt ở | Thiếu | Tài khoản + phòng + lượt ở đủ điều kiện |
| 16. Chống lặp | Có ở Match | Áp dụng lượt ở, bàn giao, review, thông báo |
| 17. Chủ trọ không xóa review | Thiếu | Trả lời/kháng nghị, Admin có căn cứ/log |
| 18. Đăng lại giữ lịch sử | Thiếu | Mã phòng ổn định, đợt đăng mới |
| 19. Thiếu review không coi kém | Cần sửa | M/R/H, ít nhất 3 review từ các tài khoản/lượt ở khác nhau |
| 20. Luồng desktop/mobile | Có nền tảng | Nghiệm thu xuyên suốt các luồng mới |
| 21. Mô phỏng được ghi đúng | Đã có | Tiếp tục ghi rõ local, hai phía demo, không ký/thu tiền thật |

Các phần phát triển sau giữ ngoài đợt này: ngân hàng, eKYC/OTP/OAuth thật, AI trả phí, email/push/job nền, routing giao thông, nhóm nhiều người, sổ chi tiêu, lịch xem nâng cao, gói trả phí, PWA và hạ tầng production. Bộ lọc nâng cao chưa hỗ trợ phải ghi rõ; so sánh 3 phòng là bổ sung sau luồng chính.

## Đối chiếu sau triển khai

Các mục dưới đây được thực hiện ở mock service và UI dùng chung dữ liệu. Kiểm tra quyền cục bộ không phải phân quyền server.

| Mục 25 | Đã triển khai | Bằng chứng kiểm tra |
|---|---|---|
| 1 | Lưu nháp/gửi duyệt; service kiểm tra người quản lý, phí và xác minh mẫu; Admin mới công khai | Unit housing + E2E tạo tin/duyệt |
| 2–3 | Phí bốn trạng thái, nơi đã gồm, khoản có điều kiện; chi phí dùng chung; trả trước tránh cộng trùng | Unit số chuẩn 1.940.000đ/tháng, 3.440.000đ ban đầu + E2E tìm/chi tiết |
| 4–5 | Nhiều điểm đến áp AND, bán kính bắt buộc/ưu tiên; Haversine; thiếu tọa độ không thành 0 | Unit parser/URL/lọc; Admin đổi tọa độ và E2E kiểm tra lại khoảng cách |
| 6 | Lọc cứng hai phía, điểm trung bình nhân, lý do từ cùng tín hiệu; đã có phòng cần cư trú/quyền tuyển/chỗ thực | Unit review/roommatch + E2E hồ sơ |
| 7–8 | Quan tâm một phía không mở chat; Match riêng với lượt thuê và sức chứa | Unit mutual/unique/block + E2E Match/chat |
| 9 | Chính sách Không cho / Xin phép / Cho phép; cư dân xin phép, chủ phòng trả lời | Unit quyền tuyển + E2E mobile dark |
| 10–11 | Hai bên bàn giao cùng ngày, kiểm tra chỗ tại thời điểm xác nhận; đủ chỗ dừng nhận | Unit chuyển trạng thái/chỗ; E2E 390/1440 |
| 12–13 | Snapshot giá/phí/hợp đồng cố định, bảng phí theo điều kiện đã nhận; đề xuất giá riêng theo kỳ; đọc khác đồng ý | Unit snapshot/bill/proposal + E2E từ chối đề xuất |
| 14–15 | Yêu cầu rời và bàn giao lại; giữ lịch sử; quyền review theo lượt kết thúc đã xác nhận; đường Admin đối chiếu bằng chứng | Unit rời/cư trú Admin/review + E2E rời/review |
| 16 | Chống lặp yêu cầu thuê, bàn giao, bill theo kỳ, review gốc, Match, thông báo sự kiện và đề xuất giống nhau | Unit lặp/undo/mutual/notification |
| 17 | Chủ phòng chỉ trả lời/kháng nghị; report không tự ẩn; Admin phải có căn cứ/log | Unit quyền review/vụ việc; UI nhánh vụ việc |
| 18 | Mã phòng ổn định qua đợt đăng mới; lịch sử, review, cư dân và RoomMatch không bị mất liên kết | Unit đăng lại/RoomMatch + E2E đăng lại/duyệt/review |
| 19 | T/M/R/H, ngưỡng ít nhất ba tài khoản và lượt ở khác nhau; không có dữ liệu không gán thấp | Unit công thức/ngưỡng/report và E2E modal |
| 20 | Tìm, xác minh mẫu, chat, thuê–vào–rời–review–đăng lại; cọc tiền mặt và xử lý bất đồng; responsive | Bộ Playwright trên Chrome; xem ma trận bên dưới |
| 21 | Nhãn demo trên danh tính, tọa độ, hợp đồng, thanh toán, review và công cụ đổi phía | Kiểm tra nội dung/UI và kịch bản trình diễn |

## Kết quả thực chạy

- `npm run lint`: đạt.
- `npm run typecheck`: đạt.
- `npm run build`: đạt với Next.js webpack production; `/phong/[id]` giữ route động, thêm `/noi-o` và `/thong-bao`.
- `npm run test:unit`: **32/32 đạt**.
- Playwright production: **27/27 bài khác nhau đã đạt qua hai lượt** trên cùng production build. Nhóm `demo/enhancements/hosting` 14 bài đạt; nhóm `housing/redesign/review` chạy lại riêng **13/13 đạt** sau khi sửa bộ chọn link ảnh/tiêu đề và bước mở lại công cụ Admin sau refresh trong test. Không ghi nhận một lượt full-suite 27/27 liên tục; các lượt full trước đã dừng để sửa test.
- Đã tự mở xem ảnh chụp: trang chủ Light desktop/mobile, đăng nhập Light mobile/Dark desktop, thẻ RoomMatch Dark mobile, chi tiết tin đăng lại, Admin và hoàn cọc Dark mobile. Các ảnh còn lại do Playwright chụp/kiểm tra layout tự động. Bằng chứng ở `test-results/` (ignored); chưa có kiểm tra thiết bị vật lý.
- Đã giữ nguyên nội dung `next-env.d.ts` có sẵn trước đợt sửa; chạy typecheck lại sau khi khôi phục file này vẫn đạt. Các thay đổi chưa commit không bị reset.
- `git diff --check`: đạt.

Ma trận trình duyệt: Chrome thật qua Playwright; 390×900 và 1440×900, Light/Dark cho trang chủ, đăng nhập, danh sách, chi tiết, RoomMatch; các bài khác có quản lý tin, Admin, tài khoản, hợp đồng và xác minh. Hành trình thuê–bàn giao–bill–đề xuất–rời–review–đăng lại chạy cả 390/1440; nhánh xin phép tuyển, cọc tiền mặt, bất đồng Admin và hoàn cọc chạy mobile Dark. Đây là mô phỏng kích thước màn hình trong Chrome, chưa kiểm tra Safari/iOS hoặc thiết bị vật lý.

## Giả định và giới hạn

- H khởi điểm 70, +2 mỗi bàn giao đã xác nhận (tối đa +20), −10 mỗi report được xác nhận; sửa sai theo vụ việc có căn cứ với điều chỉnh H rõ từ −30 đến 30. Đây là giả định demo, không hiệu chỉnh thực nghiệm. Tính từ ID sự kiện/vụ việc, không từ số lần nhấn.
- Thời điểm tháng 11–12/2026 và lịch sử ban đầu đều giả lập. Bên đổi vai trò thao tác dùng chung một localStorage; không có cư trú/giấy tờ, thu tiền, đối soát, ký thật hay chống thông đồng production.
- Danh mục điểm đến cho Admin thêm/chỉnh tên, alias, loại và tọa độ mẫu; tìm kiếm và chi tiết dùng cùng danh mục. Không có tích hợp bản đồ hay routing; thời gian di chuyển trong hồ sơ RoomMatch là số khai báo mẫu riêng, không suy từ Haversine.
- Có thể tải JSON hồ sơ lượt ở; chưa upload/lưu bản chụp hợp đồng thật. Đề xuất cho người đang ở hiện cho thay giá theo ngày; các thay đổi phí/nội quy được ghi ở phiên bản tin và **không** tự áp lên lượt ở. Phụ lục phức tạp chưa có.
- Bộ lọc nâng cao triển khai dần theo mục 7.2: các tiêu chí đang hỗ trợ được ghi ngay trong UI. Chưa có lọc tự động ngày vào/giờ giấc/loại xác minh hoặc so sánh ba phòng bổ sung.
- Giữ envelope localStorage version 4, migration v2/v3 có thông báo và bản sao trước chuyển đổi; không tạo lượt ở/review giả cho dữ liệu cũ. localStorage đầy/chặn có cảnh báo; không bảo đảm khôi phục như server production.
- Không push, deploy hoặc bổ sung backend. SSR/SEO sản phẩm, xác thực/kiểm tra quyền ở server, bảo mật và phục hồi dữ liệu là việc phát triển sản phẩm thật.

