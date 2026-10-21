# Đối chiếu và sửa prototype — 19/10/2026

Nguồn: ba tài liệu Word trong thư mục AISC (mô tả sản phẩm, đặc tả Web v2.0, prototype 10 ngày) và các yêu cầu bổ sung trong cuộc trò chuyện. Chủ dự án xác nhận dùng ba tài liệu này thay cho một báo cáo đối chiếu riêng. Nội dung tài liệu được dùng làm đặc tả tham khảo; không thực hiện các lời đề nghị mở rộng vượt phạm vi frontend.

## Bảng trước khi sửa

| Phân loại | Bằng chứng |
| --- | --- |
| Đã tái hiện | `parseQuery('Tìm phòng gần UIT dưới 3 triệu cho nuôi mèo')` nhận UIT nhưng trả `unknown=['tim phong gan uit']`. |
| Đã tái hiện | Ma trận giờ ngủ Bình thường/Dậy sớm trả 0,8 nhưng lý do ghi “phù hợp” và không ghi khác biệt. |
| Đã tái hiện | Gửi `0901234567` và email qua mock service: giao diện hiển thị nguyên văn, chưa có consent. |
| Đã tái hiện | Listing Trust ban đầu dùng nhóm 25/30/10/20/15; tin đầu được 100 dù chưa có bằng chứng quyền cho thuê/kiểm tra ảnh. |
| Xác nhận bằng code | Hồ sơ chỉ có một `area`; giới tính tự sửa; thiếu stack/undo/swipe; có dropdown kích hoạt tài khoản; footer có Admin; phí 0 gộp nhiều nghĩa; cọc cố định. |
| Đúng phạm vi | Service đã dùng trung bình nhân, lọc nhiều điều kiện hai chiều, chống match trùng và chống gửi sau khi kết thúc. Không có AI/eKYC/OAuth thật. |
| Chưa đủ bằng chứng | Chưa có dữ liệu bản đồ, bằng chứng danh tính/quyền cho thuê thật, khảo sát kiểm chứng trọng số hay mức giá thị trường. Không biến các giả định này thành nhãn đã kiểm chứng. |

## Quyết định triển khai

- Giữ Next.js/React, mock service, giao diện hiện tại và theme. Không thay kiến trúc để SSR/SEO; xác định yêu cầu SSR/SEO, index dữ liệu công khai và phân quyền phía server khi xây sản phẩm thật.
- Khu vực tối đa 5, thứ tự được lưu và công khai trong lý do. Điểm khu vực A→B đúng công thức số cụm chung/số cụm A, không thêm trọng số ưu tiên vị trí vào công thức 20 điểm. Điểm neo trường/nơi làm việc độc lập với khu vực muốn thuê.
- Thời gian đi lại mỗi cụm là **số phút mẫu do người dùng khai**. Lọc yêu cầu có ít nhất một cụm chung đáp ứng giới hạn của cả hai. Không tính thời gian từ tên trường, không tuyên bố đo bản đồ. Bộ seed có cụm khác nhau và thời gian 10/12/15/20/25 phút để minh họa.
- Ngân sách và thời hạn thuê theo khoảng, ngày dọn vào theo khoảng. Mọi điều kiện bắt buộc được xét cả hai phía; thời hạn cùng khoảng = 1, chỉ giao linh hoạt = 0,5. Ngân sách là điểm được xử lý không chia cho 0. Hai người đã có phòng không tự ghép. Phòng liên kết phải đang hiển thị, có chỗ trống, đáp ứng yêu cầu phòng và chi phí của người tìm; chia theo số người dự kiến sau khi thêm một người, không giả định các chỗ trống còn lại đã có người thuê.
- Giờ ngủ: cùng loại 1; có Bình thường 0,8; Dậy sớm/Cú đêm 0,1. Khách dựa trên mức chấp nhận tối đa; tiếng ồn dựa trên mức cần yên tĩnh; thú cưng/hút thuốc có điều kiện hai chiều. Đây là ma trận **giả định demo**, không phải nghiên cứu dự đoán hòa hợp. Các trường mở rộng (nấu ăn, chế độ ăn, chia việc, ca đêm, tính cách, sở thích) được lưu và xem khi trao đổi; chưa thêm trọng số ngoài 10 nhóm đã được tài liệu chỉ định. Mức rượu bia tối đa là giới hạn chấp nhận hai chiều. Không tuyên bố các trường chưa chấm đã phù hợp.
- `√(A→B × B→A)` chỉ làm tròn ở điểm cuối. Giữ điểm 100 nếu dữ liệu thực sự cho 100. Lý do và phần trăm hai chiều dùng cùng `signals`; phần giao khu vực luôn hiển thị. Không thêm điểm trang trí.
- Seed chỉ có ba hồ sơ (một đã có phòng, hai chưa có phòng) và ba tin công khai, một tin chờ duyệt. Các địa điểm trường, metro, chợ, siêu thị, bệnh viện vẫn là cụm mẫu; không đảm bảo mỗi cụm luôn có tin đạt điều kiện.
- Một thẻ hoạt động trong khám phá, chỉ báo số thẻ phía sau; trái/bỏ qua, phải/quan tâm, pointer swipe và phím mũi tên. Không bắt phím trong input/select/textarea/contenteditable hoặc khi modal mở. Hoàn tác một lượt chưa gửi tin, không khôi phục match đã kết thúc hoặc người đã chặn. Quan tâm lặp là idempotent; nút Đã quan tâm không gửi lại thao tác. Bỏ qua ở tab Đã quan tâm rút lượt một chiều, hoàn tác khôi phục đúng snapshot; không dùng bỏ qua để hủy Match đang hoạt động. Chỉ mutual seed mới tạo một hội thoại.
- Danh tính mẫu riêng với nhu cầu; chỉ đọc trong form RoomMatch. Chọn vai trò không kích hoạt tài khoản. Đăng nhập demo → OTP 123456 → thẻ danh tính/chân dung mẫu → kết quả mô phỏng. Mẫu giới tính/tên chỉ đổi trong Công cụ demo, yêu cầu xác minh lại và ẩn hồ sơ. Mặc định cùng giới theo danh tính **mẫu**, chính sách cho dữ liệu giới tính sản phẩm thật vẫn mở.

## An toàn chat

- `chat-safety.ts` che số điện thoại/email được nhận diện ở tin nhắn và xem trước đến khi `mine && theirs`. Chặn/kết thúc đóng chia sẻ và quyền gửi ở mock service; kiểm tra quyền gửi và consent dùng chung một hàm. Thu hồi một phía che lại ngay, kể cả sau reload.
- Nhân vật mẫu không có trình duyệt riêng: phản hồi consent của họ được thao tác rõ trong Công cụ demo, không tự đồng ý khi người xem bấm nút của mình.
- Quy tắc nhắc khi yêu cầu chuyển cọc trước/gấp, trao đổi liên hệ ra ngoài hoặc có URL; hỏi giá điện/cọc thông thường không tự bị coi là lừa đảo. Không tự mở link; không chặn tất cả lời nhắc Zalo.
- **Giới hạn:** nội dung gốc còn trong localStorage; che trên frontend không phải mã hóa hoặc kiểm soát truy cập backend. Regex không bắt mọi cách viết né số/email, không xác minh link an toàn và không phân loại lừa đảo. Toast chỉ báo trạng thái, không nhúng tin nguyên văn. Chưa có push/email notification.

## Trust và chi phí

- User Trust riêng: 30 xác thực nền, 10 bổ sung, 10 hoàn thiện, 20 hành vi, 20 đánh giá, 10 thâm niên/giao dịch; có khoản trừ/trần lừa đảo đã xác nhận và ẩn khi bị khóa. Thẻ hiển thị bằng chứng mẫu tối thiểu, không gán uy tín thật cho ảnh nhân vật. Công thức điều chỉnh đánh giá dùng prior 3 đánh giá ở mức 3/5; dưới 3 đánh giá nhân thêm `n/3`. Đây là giả định đã ghi rõ, không phải công thức đã được khảo sát.
- Listing Trust riêng đúng tối đa 30/25/20/15/10. Chủ tin từ User Trust mẫu; đầy đủ dựa trên trường và trạng thái phí; ảnh chỉ có 15 khi **kết quả mẫu** ghi ít nhất 5 ảnh đạt kiểm tra, video +5, không suy từ ảnh hiện có. Quyền cho thuê +15 khi bằng chứng mẫu duyệt. Seed không được tặng điểm ảnh/giấy tờ. Độ tươi dùng ngày kiểm tra: 10 trong 7 ngày, giảm tuyến tính về 0 ở ngày 14. Trừ cờ giá 10, ảnh 15, nội dung 20, báo cáo hợp lệ 10/lần. Quyết định Admin xác nhận vi phạm gắn mã báo cáo vào tin: xử lý lại không trừ thêm, đảo quyết định gỡ đúng mã và hoàn điểm. Không tự trừ từ báo cáo chưa được xác nhận và không dùng ngưỡng phân loại User Trust cho tin.
- Modal hiện số thành phần, khoản trừ và tổng làm tròn. Khoảng giá chỉ từ `priceBenchmark`: đủ mẫu thì khoảng + số mẫu giả lập, thiếu thì duy nhất “Chưa đủ dữ liệu giá khu vực”. Không còn đoạn tĩnh mâu thuẫn.
- Phí có bốn trạng thái: Có phí / Đã gồm / Không có / Chưa khai báo. Tiền thuê theo phòng, điện theo kWh/phòng, nước theo người, xe theo xe. Quản lý/vệ sinh/internet theo phòng; phụ thu khách/giặt là khoản ước tính theo người/tháng; chuyển nhượng một lần tách ngoài tổng tháng. Cọc số tháng tự chọn, tách ngoài tổng tháng. Các đơn vị phức tạp hơn cần thêm khi phát triển sản phẩm.
- Mèo, chó, thú cưng chung được phân biệt trong parser/filter và form đăng tin. Các tiện ích và loại phòng dùng cùng giá trị giữa lọc và đăng tin.

## Dữ liệu và quyền riêng tư

Envelope nâng từ v2 sang v3, giữ key `antro-demo-v2` để tìm dữ liệu cũ. Migration giữ tin, hội thoại, sở thích cũ và tạo các trường mở rộng; giới tính/tên cũ trở thành **mẫu**, không phải danh tính đã kiểm tra. Có thông báo nâng cấp; số 0 cũ chưa phân loại chuyển thành Chưa khai báo, không tự nhận đã gồm/không có. Trước khi thay dữ liệu cũ có thông báo hoặc dữ liệu lỗi, cố gắng giữ bản gốc ở `antro-demo-before-v3` nếu chưa có bản sao. Nếu hạn mức không cho lưu bản sao, vẫn giữ dữ liệu đã đọc trong phiên và báo rõ; không chuyển tài khoản hợp lệ thành seed. Không tự xóa key v1.

Account có thao tác xóa dữ liệu cục bộ với xác nhận: xóa các key `antro-demo*` (gồm bản sao lưu), khởi tạo lại seed khách; theme được giữ riêng. Không xóa dữ liệu trên trình duyệt khác. Lối Admin chỉ trong Công cụ demo; hợp đồng giữ nguyên như tiện ích phụ.

## Nghiệm thu

Các kiểm thử ở `tests/unit/review.test.ts` và `tests/review.spec.ts` bao phủ lọc hai phía, điểm/lý do, undo/mutual match, consent/che sau reload, Trust, parser và migration. Kết quả chạy thật được bổ sung ở phần bàn giao; không coi danh sách test là bằng chứng đã chạy trên hosting. Không deploy hoặc gọi dịch vụ trả phí trong đợt này.

Kết quả đã chạy trên code cuối (production local cổng 3100):

- `npm run lint`: đạt.
- `npm run typecheck`: đạt, chạy riêng sau build để tránh tranh chấp thư mục generated types.
- `npm run build`: đạt, đủ 15 route; không thêm backend.
- `npm run test:unit`: **16/16 đạt**.
- `PLAYWRIGHT_BASE_URL=http://127.0.0.1:3100 npm run test:e2e`: **23/23 đạt** (3,8 phút ở lượt cuối).
- Kiểm tra viewport 390×900 và 1440×900, Light/Dark/System, refresh, asset, hồ sơ nhiều bước, vuốt/phím/undo, quan tâm một chiều và mutual, consent/thu hồi/che sau reload, chặn, xóa dữ liệu và migration kể cả khi không tạo được backup do quota.
- Đã chụp và tự xem thẻ RoomMatch/chat ở desktop light và mobile dark; sửa lệch cột do chỉ báo stack và màu cảnh báo bị bubble ghi đè. Ảnh kiểm tra nằm trong `test-results/` (được gitignore).

Chưa kiểm tra thiết bị di động thật, hệ thống đa người dùng, bản đồ/thời gian đi lại thật, AI/eKYC/OAuth thật hoặc hosting Internet. Không deploy trong đợt này.
