# Rà soát nội dung và bố cục — 20/10/2026

Trang chủ giữ một thông điệp nhận diện: “Tìm nơi ở, gặp người hợp.” Phần tìm kiếm và ngân sách nằm ngay bên dưới. Danh sách phòng theo sau, bỏ ảnh hero lớn, các khối lợi ích và hình trang trí RoomMatch. Lối vào ở ghép và đăng tin vẫn được giữ.

| Trước | Sau |
| --- | --- |
| Góc nhỏ, nhiều điều mới. | Phòng quanh trường |
| Phòng vừa ý, sống thảnh thơi. | Tìm phòng |
| Những nơi bạn muốn về. | Tin đã lưu |
| Một góc bình yên, đầy ánh sáng | Phòng 28 m² có ban công và bếp riêng |
| Chi phí được kể rõ. | Chi phí mỗi tháng |
| Một người bạn. Một khởi đầu. | Tìm bạn ở ghép |
| Rất vui gặp lại bạn. | Đăng nhập |

Thẻ phòng hiển thị giá thuê, ước tính mỗi người, thời hạn, điều kiện thú cưng và mức dùng tính phí. Khoản chưa khai báo vẫn được ghi là khoản đã biết, kèm lời nhắc; không gọi đó là tổng đầy đủ. Chi tiết phòng lấy mô tả từ dữ liệu diện tích, sức chứa, tiện ích và thời hạn; không khẳng định ánh sáng tự nhiên cho mọi tin. Bỏ tuổi gán chung cho mọi hồ sơ. Nội dung tài khoản, chat, đăng tin, hợp đồng và vận hành cũng đổi sang tên tác vụ.

Ảnh vẫn là ảnh minh họa, không phải ảnh phòng thực. Hiện dùng hai ảnh có sẵn và có dùng lại giữa các tin mẫu. Không bổ sung địa chỉ, khoảng cách, phản hồi hoặc số người dùng. Trang chi tiết bỏ các ảnh căn hộ bổ sung không liên quan; địa chỉ mẫu được ghi rõ chưa xác nhận vị trí thực.

`presentListing` chỉ đổi cách hiển thị tên mẫu cũ đã nhận diện và ảnh cũ không phù hợp. Không sửa localStorage, không reset hồ sơ, tin đã lưu hoặc hội thoại, chỉ đổi tên khi khớp cả ID tin mẫu và nguyên văn tiêu đề cũ; các tên khác được giữ nguyên. Không thay schema hoặc các thuật toán tìm kiếm, ghép đôi, Trust và chat.

Kiểm tra kỹ thuật và ảnh chụp được thực hiện trên bản production cục bộ, desktop 1440×900 và mobile 390×900, Light/Dark. Các ảnh kiểm tra nằm trong `test-results/` (không đưa vào Git). Không triển khai lên hosting. Kiểm tra mobile bằng trình duyệt mô phỏng kích thước, chưa kiểm tra trên thiết bị iOS/Android thực.

Kết quả: lint, typecheck và production build đạt; 17 unit test và toàn bộ 23 kiểm thử Playwright đạt. Chạy lại riêng 4 tổ hợp desktop/mobile × Light/Dark sau khi chờ dữ liệu tải xong và toast đóng: 4/4 đạt. Đã mở và tự xem ảnh của trang chủ, tìm phòng, chi tiết, đăng nhập và thẻ RoomMatch ở các tổ hợp trên.
