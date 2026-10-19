# AnTro — prototype frontend

Website tiếng Việt tìm phòng và bạn ở ghép quanh Làng Đại học Quốc gia. Next.js App Router + React + TypeScript + Tailwind CSS + Lucide Icons. Giữ framework của repository; React Router (`HashRouter`) điều hướng hai bước trong công cụ đọc hợp đồng bằng fragment `#/ket-qua`, hỗ trợ Back và tải lại kết quả; Next.js vẫn quản lý đường dẫn trang.

## Cài và chạy

Yêu cầu Node.js >=22 và npm. Không cần API key hoặc dịch vụ backend.

```sh
cd "/Users/giabinhne/Documents/AISC/AnTro"
npm ci
npm run dev
```

Mở http://localhost:3000. Dừng bằng Ctrl+C. Bản production:

```sh
npm run build
npm start
```

Webpack được chọn cho dev/build vì Turbopack không bind được tiến trình xử lý CSS trong môi trường sandbox thử nghiệm. TypeScript 6 được dùng để tương thích bộ lint.

## Chuyển vai trò và xác minh

Nút **Vai trò demo** dưới thanh điều hướng mở công cụ chuyển Khách / Người thuê / Chủ trọ / Admin. Chọn một vai trò đăng nhập sẽ kích hoạt tài khoản mẫu, không cấp quyền thật. Có thể đổi về Chưa xác minh hoặc Bị hạn chế để thử màn hình giới hạn.

Luồng thông thường ở `/dang-nhap` dùng tên/email mẫu, OTP **123456**. Chọn kết quả eKYC giả lập; không mở camera hoặc nhận CCCD. `/admin` có bước xác nhận vào không gian vận hành demo. Tất cả quyền là mô phỏng frontend, không dùng để bảo vệ dữ liệu production.

## Các trang

| URL | Nội dung |
| --- | --- |
| `/` | Trang chủ, tìm nhanh, lối vào người thuê/chủ trọ |
| `/tim-phong` | Autocomplete địa điểm, parser quy tắc, bộ lọc URL, nhóm đạt/cần cân nhắc |
| `/phong/[id]` | Ảnh, nội quy, phí theo đơn vị, cọc, Trust Score và khoảng giá mẫu |
| `/dang-nhap`, `/xac-minh` | Tài khoản và xác minh mô phỏng |
| `/roommatch/ho-so` | Hồ sơ nhiều bước, tự lưu bản nháp, mức quan trọng từng tiêu chí |
| `/roommatch` | Thẻ, điểm hai chiều, quan tâm/bỏ qua, Match, chặn và báo cáo |
| `/tin-nhan` | Lịch sử chat local, gợi ý mở đầu, kết thúc/chặn |
| `/quan-ly-tin`, `/dang-tin` | Dashboard, nháp/gửi duyệt, chỉnh sửa và đánh dấu đã thuê |
| `/admin` | Duyệt/từ chối, báo cáo, ẩn/khôi phục và nhật ký |
| `/tai-khoan`, `/yeu-thich` | Tài khoản, tin đã lưu và reset |
| `/hop-dong` | Dán/chọn văn bản, rà soát từ khóa, đối chiếu đúng đoạn |

## Kịch bản trình diễn 5–7 phút

1. **Tìm phòng (1 phút):** vào `/tim-phong`, gõ `UIT`, nhấn mũi tên xuống và Enter; cũng có thể chạm gợi ý. Thử `trường`, `metro`, `siêu thị`, `chợ`, `bệnh viện` hoặc không dấu. Câu `Gần UIT, dưới 3 triệu, cho nuôi mèo, thuê 10 tháng` tạo 4 chip. Xóa/sửa chip, đổi bộ lọc rồi refresh/Back để kiểm tra URL.
2. **Chi phí (1 phút):** mở phòng, đổi số người và kWh/phòng. Nước theo người không bị chia lần nữa; cọc ở khoản ban đầu. Phòng gần KTX thiếu giá điện nên không được xác nhận đạt ngân sách tổng. Mở giải thích Trust Score; giá tham khảo là số giả lập, có cụm chưa đủ mẫu.
3. **RoomMatch (2 phút):** chọn vai trò Người thuê hoặc đăng nhập bằng OTP mẫu. Tạo hồ sơ mặc định nữ, gần UIT, ngân sách 1–3 triệu, vào tháng 11/2026, thời hạn 10 tháng. Bản nháp tự giữ khi tải lại. Chọn mức quan trọng rồi bật hồ sơ. Quan tâm Thảo Vy chỉ lưu một chiều; Ngọc Linh đã quan tâm bạn theo seed nên tạo Match. Gửi tin, refresh rồi kết thúc/chặn để thấy quyền gửi đóng.
4. **Chủ trọ và vận hành (1 phút):** chọn Chủ trọ, tạo tin với ảnh sẵn có và bảng phí. Gửi duyệt chưa công khai. Chọn Admin, duyệt kèm lý do; tìm thấy tin mới. Thử báo cáo/ẩn tin và xem tin biến mất. Quyết định không đủ cơ sở sau rà soát có thể khôi phục trạng thái trước.
5. **Hợp đồng (1 phút):** mở `/hop-dong`, chọn mẫu có điều khoản cần chú ý. Rà soát, bấm “Xem đúng đoạn văn bản” ở tăng phí/hoàn cọc/chấm dứt để đối chiếu đoạn được tô. Đây là dò từ khóa, không phải kết luận pháp lý.

## Dữ liệu gọn và lưu trạng thái

Theo cập nhật mới nhất của chủ dự án, giữ **3 phòng công khai + 1 tin chờ duyệt và 3 hồ sơ RoomMatch**, thay cho yêu cầu 18/10 ban đầu. Có trường hợp đủ phí, thiếu giá điện, khác nhịp sống, quan tâm một/hai chiều và báo cáo mẫu. Có thể tạo thêm phòng qua giao diện; không cần sinh thêm seed.

`localStorage['antro-demo-v2']` lưu `{ version: 2, data: ... }`. Kiểm tra schema cả dữ liệu lồng nhau trước khi nạp; dữ liệu hỏng/khác version được khôi phục về seed kèm thông báo. Bộ nhớ bị chặn hoặc đầy sẽ có cảnh báo, vẫn dùng được trong phiên. Phiên bản v1 cũ không tự nạp; khóa cũ được giữ nguyên. Không lưu File/Blob, chỉ tham chiếu ảnh local.

**Reset:** mở Vai trò demo → Đặt lại dữ liệu demo → Xác nhận đặt lại. Hoặc dùng nút xác nhận ở `/tai-khoan`. Reset xóa tiến trình của bản v2, không tác động tệp ảnh hoặc mã nguồn.

## Cấu trúc và nơi thay khi nối backend

- `src/app`: route/layout mỏng, CSS thiết kế chung.
- `src/features`: màn hình theo tính năng, mock phòng/người/địa điểm và bộ parser.
- `src/shared/components`: UI chung, modal, Lucide, công cụ demo và Trust Score.
- `src/shared/lib/models.ts`: kiểu dữ liệu dùng chung.
- `src/shared/lib/demo-store.tsx`: adapter React nhận dữ liệu/service và phát thay đổi; cần thay bằng cache/store kết nối API.
- `src/services/demo-data.ts`: load local bất đồng bộ, schema version và persistence; thay bằng API/session thật.
- `src/services/search.ts`: lọc bắt buộc và ưu tiên; `searchService.search` có độ trễ giả lập.
- `src/services/roommatch.ts`: lọc hai chiều, chấm điểm, deck và giao dịch quan tâm; thay bằng backend để enforce ở server.
- `src/services/messages.ts`: kiểm tra quyền gửi và mã chống trùng; thay bằng messaging API/WebSocket.
- `src/services/trust.ts`: điểm/giá giả lập có thể giải thích; thay bằng dữ liệu đã được vận hành kiểm chứng.
- `src/features/contract/services/reader.ts`: rà soát văn bản bằng quy tắc, không gửi ra ngoài.

Các cập nhật form/quản lý tin/Admin dùng chung adapter trạng thái, phản ánh ngay giữa các route. Hành động tương tác RoomMatch/chat có độ trễ ngắn và kiểm tra trạng thái mới nhất; không tạo hai Match cho một cặp. Không đồng bộ giữa các trình duyệt hoặc người dùng thật.

## Quyết định và giả định triển khai

Đã đọc hai tài liệu Word v2.0, bản prototype 10 ngày và sơ đồ tech stack/luồng người dùng trong cuộc trò chuyện. **Chưa tìm thấy `Feature AISC.pdf` trong workspace**, nên không khẳng định đã đọc tệp đó.

- Giữ Next.js thay vì tạo dự án Vite mới. Next.js quản lý URL trang; HashRouter chỉ quản lý bước trong công cụ hợp đồng.
- Cùng giới dựa trên thông tin tự khai; không bật ghép khác giới trong demo. Chưa xác minh thông tin này.
- Khu vực, ngân sách, ngày và thời hạn là lọc cứng. Mặc định một khu vực/hồ sơ và thời hạn cụ thể. Hai người đã có phòng không ghép nhau. Người có phòng cần liên kết tin đang hiển thị và đủ thông tin chi phí.
- Điểm `√(S(A→B) × S(B→A))`, trọng số theo đặc tả. Mức Quan trọng ×1,5; Bình thường ×1; Không quan tâm ×0; Bắt buộc kiểm tra hai chiều và không cộng lại vào điểm mềm. Tổng trọng số bằng 0 hiển thị chưa đủ tiêu chí chấm điểm. Ma trận giờ giấc và ngưỡng độ tương đồng là giả định demo cần hiệu chỉnh. Điểm không phải xác suất sống chung thành công.
- Bộ thói quen prototype gồm giờ ngủ, gọn gàng, hút thuốc, khách, tiếng ồn, ăn uống và thú cưng; chưa tách riêng rượu bia hoặc thêm mọi tiêu chí phòng trong đặc tả rộng.
- Tìm quanh địa điểm bằng cụm, không dựng khoảng cách/thời gian di chuyển chính xác. Điều kiện ưu tiên chỉ xếp thứ tự; không âm thầm nới bắt buộc.
- Điểm tin và khoảng giá chỉ minh họa. Không tuyên bố đã kiểm tra ảnh hoặc xác minh quyền cho thuê. Khoản phí cọc mẫu bằng một tháng tiền phòng.
- Chưa triển khai API/database, OAuth, SMS/eKYC thật, AI thật, upload file, thanh toán, lịch tự động 7/14 ngày, revision bất biến, nhóm nhiều người, CI/CD hoặc hosting. Không cần API key.

## Kiểm tra

```sh
npm run lint
npm run typecheck
npm run test:unit
npm run build
npm start
# Terminal khác, với server production đang chạy:
npm run test:e2e
```

Unit test kiểm tra đơn vị tiền, parser/alias, lọc bắt buộc/ưu tiên, chấm hai chiều, zero denominator, Match duy nhất, quyền gửi/chống trùng, schema lưu và đoạn trích hợp đồng.

Playwright dùng Chrome có sẵn trên macOS tại đường dẫn trong `playwright.config.ts`; máy khác cần cấu hình lại executable hoặc dùng browser do Playwright cài. Kiểm thử route trực tiếp, refresh/Back, draft, xác minh, chat, duyệt/ẩn/khôi phục tin và ảnh chụp 390px/1440px ở `test-results/`. Danh sách kiểm tra này mô tả bộ test, không tự khẳng định mọi lần chạy đều đạt.

Ảnh phòng/nhân vật chỉ minh họa, dùng local. Nguồn ở [public/images/SOURCES.md](public/images/SOURCES.md).
