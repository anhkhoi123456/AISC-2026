# AnTro 3.0 — Tài liệu tính năng website

**Phiên bản hợp nhất ngày 22/10/2026**  
**Phạm vi:** định hướng tính năng sản phẩm và yêu cầu thể hiện trên web demo.

Tài liệu tổng hợp các nội dung đã trao đổi giữa chủ dự án và trợ lý, bao gồm góc nhìn sinh viên, lợi ích người đăng, cuộc trao đổi Gemini và các bản mô tả trước. Khi có khác biệt, các quy tắc hợp nhất trong tài liệu này là định hướng đề xuất cho phiên bản 3.0.

Đây là **bản mô tả sản phẩm mục tiêu**, không phải xác nhận website hiện tại đã triển khai đầy đủ. Các trọng số, ngưỡng điểm, thời hạn và cơ chế chưa được kiểm chứng được ghi là đề xuất cho demo; cần đánh giá trước khi áp dụng thực tế.

## Mục lục

1. Tổng quan sản phẩm
2. Đối tượng và quyền sử dụng
3. Nguyên tắc xuyên suốt
4. Cấu trúc thông tin nền tảng
5. Tài khoản và xác minh
6. Trang chủ và điều hướng
7. Tìm phòng theo nhu cầu sinh viên
8. Chi tiết phòng và chi phí minh bạch
9. Lưu phòng, so sánh và liên hệ
10. Đăng tin và quản lý phòng
11. RoomMatch
12. Quyền tìm thêm người ở ghép
13. Tin nhắn và an toàn tương tác
14. Xác nhận thuê và bàn giao
15. Hồ sơ thuê và hợp đồng
16. Khoản phải trả, thanh toán và tiền cọc
17. Thay đổi thông tin và thông báo
18. Rời phòng và kết thúc lượt ở
19. Đánh giá từ người từng ở
20. Điểm minh bạch và Trust Score
21. Vòng đời bài đăng và lịch sử căn phòng
22. Báo cáo, khiếu nại và Admin
23. Dễ sử dụng, tài khoản và dữ liệu
24. Phạm vi web demo và phát triển sau
25. Điều kiện hoàn thành demo

## 1. Tổng quan sản phẩm

AnTro là nền tảng web giúp sinh viên quanh Làng Đại học Quốc gia tìm phòng, tìm bạn ở ghép và theo dõi thông tin nơi ở trong suốt quá trình thuê.

| Giá trị | Cách thể hiện |
| --- | --- |
| Tìm nơi ở phù hợp | Tìm theo trường học, tiện ích, ngân sách tổng và điều kiện sinh hoạt |
| Tìm người ở cùng phù hợp | RoomMatch dựa trên nhu cầu, thói quen và điều kiện bắt buộc hai chiều |
| Minh bạch trong suốt lượt thuê | Chi phí rõ, thay đổi có thông báo, lịch sử được giữ và đánh giá từ lượt ở đã xác nhận |

**Câu định vị:** AnTro giúp sinh viên tìm phòng và bạn ở ghép phù hợp, hiểu rõ chi phí và có thêm căn cứ để lựa chọn nơi ở.

Phạm vi ban đầu là Làng Đại học Quốc gia và khu vực lân cận. Website ưu tiên tiếng Việt, responsive và dễ sử dụng trên điện thoại. Sinh viên là nhóm trọng tâm; người đi làm trong vùng có thể tham gia theo cùng quy tắc, không bắt buộc phải có email sinh viên chỉ để tìm phòng.

## 2. Đối tượng và quyền sử dụng

| Đối tượng | Quyền chính |
| --- | --- |
| Khách | Tìm kiếm, xem phòng, chi phí, lịch sử và đánh giá công khai |
| Người thuê | Lưu phòng, liên hệ, tạo RoomMatch, quản lý lượt ở, gửi yêu cầu và đánh giá khi đủ điều kiện |
| Người đăng tin | Quản lý phòng, đăng tin, khai phí, xác nhận lượt thuê, quản lý chỗ và phản hồi đánh giá |
| Admin | Duyệt thông tin, xử lý báo cáo, xem xét bất đồng và quản lý dữ liệu |

Một tài khoản có thể vừa tìm phòng vừa đăng tin. Người đang thuê cũng có thể tìm thêm roommate nếu được phép. Người đăng có thể là chủ sở hữu, người có quyền cho thuê lại hoặc người đang thuê tìm thêm bạn; tư cách phải được hiển thị đúng.

Vai trò giao diện không thay thế quyền đối với dữ liệu: chủ tin chỉ sửa phòng thuộc quyền của mình; người thuê chỉ truy cập hồ sơ thuê và hội thoại thuộc quyền của mình. Trong demo cục bộ, nút đổi vai trò là công cụ mô phỏng, không phải cơ chế phân quyền bảo mật.

## 3. Các nguyên tắc xuyên suốt

1. Không biến thông tin chưa rõ thành miễn phí hoặc đã xác minh.
2. Không dùng Match để kết luận đã thuê hoặc đã vào ở.
3. Không xóa lịch sử người thuê khi họ rời phòng.
4. Không cấp quyền đánh giá chỉ vì có tin nhắn, lượt quan tâm hoặc mã nhập.
5. Không tự trừ điểm chỉ vì có báo cáo chưa kiểm chứng.
6. Không tự đổi giá đã ghi nhận trong lượt ở khi chủ trọ sửa giá chào.
7. Không cho điểm minh bạch thay thế xác minh danh tính hoặc quyền cho thuê.
8. Không bắt người dùng dùng AI hoặc thao tác vuốt để hoàn thành chức năng chính.
9. Dữ liệu mẫu và chức năng mô phỏng phải được nhận biết rõ.
10. Các con số khởi điểm là cấu hình có thể điều chỉnh, không phải cam kết hiệu quả đã được đo lường.

## 4. Cấu trúc thông tin nền tảng

| Đối tượng | Ý nghĩa | Quy tắc lưu giữ |
| --- | --- | --- |
| Căn phòng | Phòng/căn hộ vật lý có mã riêng | Giữ lịch sử qua nhiều đợt đăng |
| Bài đăng | Một đợt tuyển người thuê cho căn phòng | Có thể đóng, ẩn hoặc mở đợt mới |
| Phiên bản thông tin | Giá, phí, nội quy tại một thời điểm | Không ghi đè làm mất thông tin quan trọng cũ |
| Lượt thuê/lượt ở | Quan hệ giữa người thuê và căn phòng | Có trạng thái xác nhận, vào ở và kết thúc |
| Hồ sơ RoomMatch | Nhu cầu và thói quen của một người | Có thể bật, ẩn hoặc sửa |
| Match | Kết nối sau khi hai người cùng quan tâm | Chỉ mở quyền chat RoomMatch |
| Quyền đánh giá | Quyền của tài khoản đối với lượt ở hợp lệ | Không phát lại khi phòng đăng tin mới |
| Đánh giá | Trải nghiệm gắn phòng và lượt ở | Giữ qua đăng lại, trừ xử lý kiểm duyệt có căn cứ |

Ví dụ: phòng R001 có tin L001 và lượt ở S001. L001 đóng thì R001 và S001 vẫn tồn tại. Tin mới L002 của R001 tiếp tục hiển thị đánh giá hợp lệ trước đó.

Không tự gộp phòng chỉ vì cùng địa chỉ: một dãy trọ có thể có nhiều phòng. Demo dùng danh mục phòng mẫu và thao tác “Đăng lại phòng này”. Phát hiện cùng phòng qua nhiều tin trùng ngoài hệ thống là hướng phát triển sau.

## 5. Tài khoản và xác minh

### 5.1. Tài khoản

Người dùng đăng nhập bằng phương thức phù hợp với nguồn lực triển khai, có thể dùng Google hoặc phương thức khác đã chọn. Demo được phép dùng tài khoản mẫu, không cần thu thông tin cá nhân thật.

Tài khoản chứa thông tin hiển thị/liên hệ, tin đã lưu, hồ sơ RoomMatch, hội thoại, lượt ở hiện tại và đã kết thúc, thông báo, yêu cầu và đánh giá của mình.

### 5.2. Xác minh theo từng loại

| Loại | Điều được xác nhận |
| --- | --- |
| Liên hệ | Người dùng kiểm soát phương thức liên hệ tương ứng |
| Danh tính | Danh tính được kiểm tra theo quy trình đã chọn |
| Tư cách/quyền cho thuê | Căn cứ cho việc đăng cho thuê căn phòng |
| Sinh viên/nơi làm việc | Thông tin bổ sung tự nguyện |
| Lượt ở | Mối liên hệ giữa tài khoản và căn phòng |

Huy hiệu có tên, trạng thái và thời điểm kiểm tra. Xác minh sinh viên không chứng minh đã thuê; xác minh danh tính không tự chứng minh quyền sở hữu.

Trong demo, dùng hồ sơ và quyết định duyệt mẫu. Người đăng chưa đạt điều kiện vẫn lưu nháp được nhưng chưa công khai tin mới. Không thu CCCD thật hoặc gọi duyệt mẫu là eKYC thật.

## 6. Trang chủ và điều hướng

Trang chủ tập trung vào hai hành động: **Tìm phòng** và **Tìm bạn ở ghép**.

Thành phần chính: ô tìm theo nhu cầu và ngân sách; gợi ý gần trường/metro/chợ/tiện ích; phòng mẫu có giá thuê và tổng phí/người; giới thiệu ngắn RoomMatch; lối vào người cho thuê; giải thích ngắn về chi phí, lịch sử và đánh giá.

Điều hướng gồm Tìm phòng, RoomMatch, Tin nhắn, Nơi ở của tôi, Thông báo và Không gian người đăng. Các chức năng tài khoản có thể gom thành tab, không cần tạo quá nhiều trang rời.

## 7. Tìm phòng theo nhu cầu sinh viên

### 7.1. Vị trí và điểm đến

Người đăng cung cấp địa chỉ và xác nhận vị trí căn phòng. Hệ thống dùng vị trí đó tính khoảng cách tới trường đại học, chợ, ga metro, cửa hàng thiết yếu/siêu thị, cây xăng; có thể bổ sung trạm xe buýt và cơ sở y tế.

Các tên “UIT”, “ĐH CNTT” được chuẩn hóa về cùng điểm đến. Chỉ nhập phường/khu phố chưa đủ xác định tọa độ chính xác của phòng. Nếu dùng tâm khu vực phải ghi mức ước lượng.

Demo dùng tọa độ mẫu và Haversine tính đường chim bay, không suy ra phút di chuyển. Không có tọa độ thì không gán 0 km. Tính lại khi vị trí phòng hoặc điểm đến đổi.

### 7.2. Bộ lọc

| Nhóm | Tiêu chí |
| --- | --- |
| Vị trí | Khu vực, điểm đến, bán kính |
| Chi phí | Giá phòng hoặc tổng ước tính/người, số người chia phòng |
| Phòng | Loại, diện tích, tầng, thang máy, cửa sổ/view, mức ồn |
| Tiện nghi | WC, bếp, máy lạnh, nội thất, chỗ để xe |
| Sinh hoạt | Thú cưng, nấu ăn, giờ giấc, chung chủ, khách |
| Thời gian | Ngày dự kiến vào, thời hạn thuê |
| Trạng thái | Còn chỗ, lần xác nhận gần nhất |
| Tham khảo | Huy hiệu theo loại, đánh giá, mức minh bạch |

Tiêu chí thích hợp có mức Bắt buộc hoặc Ưu tiên. Bắt buộc loại tin không đạt khỏi nhóm chính; Ưu tiên ảnh hưởng xếp hạng. Bộ lọc nâng cao có thể triển khai dần, nhưng phải ghi đúng phần demo đã hỗ trợ.

### 7.3. Câu tự nhiên

Ví dụ: “Gần UIT dưới 2 km, gần metro dưới 1 km, tổng dưới 2 triệu/người, cho nuôi mèo”. Hệ thống tạo chip để kiểm tra, sửa và xóa. Phần không hiểu được phải nêu rõ; không vừa nhận đúng vừa báo chưa hiểu cùng điều kiện.

Các điều kiện bắt buộc khác nhau áp đồng thời. “Gần một ga metro” dùng ga phù hợp gần nhất; “gần UIT và gần chợ A” kiểm tra riêng cả hai. Demo có thể dùng quy tắc, không bắt buộc LLM. Luôn có bộ lọc thủ công khi phân tích không thành công.

### 7.4. Kết quả

Hiển thị nhóm đạt đầy đủ; nhóm gần phù hợp riêng có lý do; hoặc trạng thái không có kết quả. Không tự nới ngân sách/bỏ điều kiện.

Sắp xếp theo độ phù hợp, tổng phí, khoảng cách, thông tin tham khảo hoặc mới cập nhật. Tin nổi bật nếu phát triển sau phải có nhãn riêng và không làm sai điều kiện lọc.

Định hướng bổ sung: lưu tìm kiếm, thông báo tin phù hợp và chia sẻ URL bộ lọc sau khi trạng thái tìm kiếm chính đã ổn định.

## 8. Chi tiết phòng và chi phí minh bạch

Trang phòng gồm thông tin cơ bản, ảnh, tiện nghi, nội quy, số chỗ, người đăng, phí, điểm đến, lịch sử và đánh giá.

### 8.1. Trạng thái từng khoản

Mỗi khoản chọn Có phí / Đã gồm trong khoản khác / Không thu / Chưa rõ. “Đã gồm” cần chỉ ra đã gồm ở đâu. “Chưa rõ” không thành 0.

### 8.2. Cách tính

| Loại khoản | Xử lý |
| --- | --- |
| Theo phòng/tháng | Chia theo số người cùng chịu |
| Theo người/tháng | Cộng trực tiếp cho người đó |
| Theo mức dùng | Đơn giá × mức dùng, nêu của phòng hay cá nhân |
| Theo số lượng | Đơn giá × số xe/lượt |
| Trả ban đầu | Cọc, trả trước trình bày riêng |
| Có điều kiện | Nêu tình huống, không cộng vào tháng bình thường |

Người thuê chỉnh số người, điện ước tính và số xe. Hiển thị riêng giá thuê, tổng phí ước tính/người/tháng, tiền chuẩn bị ban đầu và khoản có điều kiện.

Thiếu dữ liệu thì dùng “Tổng các khoản đã biết”, không khẳng định chắc chắn đạt ngân sách. Cùng dữ liệu phải cho cùng kết quả ở thẻ, chi tiết, tìm kiếm và xem trước.

Ví dụ chuẩn: phòng 3 triệu; hai người; internet 100 nghìn/phòng; vệ sinh 40 nghìn/phòng; điện 120 kWh/phòng × 3.500đ; nước 60 nghìn/người; một xe 100 nghìn/người → **1.940.000đ/người/tháng**. Cọc một tháng tiền phòng chia đều **1.500.000đ/người**. Tháng đầu cộng cọc **3.440.000đ/người**. Khoản trả trước phải tránh cộng trùng kỳ thuê đã tính.

## 9. Lưu phòng, so sánh và liên hệ

Người dùng lưu/bỏ lưu, xem trạng thái mới nhất, bật theo dõi thay đổi, liên hệ người đăng trong web và báo cáo thông tin.

So sánh tối đa ba phòng là chức năng bổ sung sau luồng chính, ưu tiên tổng phí, cọc, khoảng cách, nội quy và khoản chưa rõ. Lịch xem phòng, checklist và email để giai đoạn tiếp theo.

## 10. Đăng tin và quản lý phòng

### 10.1. Form

| Bước | Nội dung |
| --- | --- |
| 1. Phòng và vị trí | Chọn phòng có sẵn/tạo mới; địa chỉ, vị trí, loại, diện tích, sức chứa |
| 2. Chi phí | Giá, phí, cọc, hoàn cọc, trả trước, khoản có điều kiện |
| 3. Điều kiện và ảnh | Thời hạn, nội quy, tiện nghi, ảnh, chỗ tuyển, quyền ở ghép |
| 4. Xem trước | Giao diện người thuê, tổng phí và phần còn thiếu |

Lưu nháp mọi bước. Lưu nháp được thiếu; gửi duyệt cần đủ trường tối thiểu và trạng thái phí; công khai sau điều kiện xác minh/duyệt. Không ép nhập 0: cho chọn Chưa rõ và giữ cảnh báo. Ảnh mẫu không được gọi là ảnh đã kiểm chứng.

### 10.2. Quản lý

Người đăng sửa/ẩn/đóng/mở đợt mới, xem yêu cầu, quản lý sức chứa, xác nhận bàn giao và vào/rời, xử lý việc cần làm, phản hồi/kháng nghị review và sao chép dữ liệu khi đăng lại.

Lợi ích dự kiến là giảm hỏi lặp, giúp người tìm cân nhắc trước và hỗ trợ tuyển chỗ trống; không hứa tỷ lệ lấp phòng hoặc lượng khách khi chưa đo.

## 11. RoomMatch

### 11.1. Kịch bản

Chưa có phòng: tìm bạn rồi cùng tìm phòng. Đã có phòng: tìm người vào chỗ được phép tuyển. Hai người đều đã có phòng không gợi ý nhau trong demo cơ bản.

### 11.2. Hồ sơ

Gồm kịch bản, khu vực/điểm đến, ngân sách tổng, ngày vào và thời hạn, giờ ngủ/dậy, gọn gàng/dọn dẹp, hút thuốc, thú cưng/khả năng chấp nhận, khách, tiếng ồn, ăn uống/đồ dùng chung, giới thiệu/sở thích tự nguyện.

Tách bản thân với yêu cầu đối phương. Mức quan trọng: Bắt buộc / Quan trọng / Bình thường / Không quan tâm. Giới tính tự khai trong demo có nhãn đúng mức; quy tắc cùng giới không dùng để chấm uy tín.

### 11.3. Thuật toán

1. Kiểm tra hồ sơ đủ điều kiện và đang hiển thị; chặn/trạng thái kết nối.
2. Lọc bắt buộc hai chiều theo khu vực, ngân sách, thời gian và nhu cầu. Thiếu dữ liệu không mặc định đạt.
3. Chấm các ưu tiên bằng cùng quy tắc; tiêu chí không quan tâm không làm giảm điểm.
4. Điểm chung là trung bình nhân: **S = √(S(A→B) × S(B→A))**. S(A→B) là mức B đáp ứng yêu cầu của A; chiều ngược lại tương tự. Ví dụ 84 và 64 cho khoảng 73.
5. Nêu tối đa ba điểm hợp và hai điểm lệch từ dữ liệu đã tính.

Trọng số là giả định, không phải xác suất thành công. Không dùng vẻ ngoài, quê quán hoặc suy luận tính cách ngoài dữ liệu khai báo để chấm điểm. Hồ sơ qua điều kiện nhưng điểm thấp có thể nằm trong nhóm cần trao đổi thêm; không tự bỏ yêu cầu để có thêm thẻ.

### 11.4. Tương tác

Có nút Quan tâm/Bỏ qua/Xem chi tiết; vuốt là tùy chọn. Hai bên cùng quan tâm mới tạo Match và chat. Dừng tìm, hủy kết nối, chặn và báo cáo được hỗ trợ. Match không tạo lượt thuê, giữ chỗ hoặc quyền review.

## 12. Quyền tìm thêm người ở ghép

Sức chứa và sự cho phép là hai điều riêng. Người đăng xác định tối đa người, số đang ở được ghi nhận, chỗ tuyển, có cho ở ghép không và cần xin phép mỗi lần hay cho phép mở tìm trước.

Người đang ở chỉ mở tìm trong phạm vi được phép. Nếu chưa cho phép, gửi yêu cầu. Khi có ứng viên vẫn cần xác nhận người vào và bàn giao; không thêm cư dân từ Match.

Hết chỗ hoặc phòng chỉ cho một người thì không mở tuyển thêm vào phòng đó; người dùng vẫn được tìm chỗ khác. Đã tìm đủ bạn phải có thao tác dừng tìm, không tự ẩn chỉ vì vừa match một người.

Hệ thống quản lý thông tin trên AnTro, không tuyên bố phát hiện mọi trường hợp ở ngoài hệ thống. Vụ việc phải được xử lý theo bằng chứng và phản hồi, không tạo cơ chế tự động loại người khỏi cơ hội tìm nhà.

## 13. Tin nhắn và an toàn tương tác

Chat người thuê–người đăng mở từ tin phòng; chat RoomMatch chỉ sau quan tâm hai chiều. Có lịch sử, kết thúc, chặn và báo cáo. Kết thúc thì không gửi tiếp hoặc tự mở lại từ quan tâm cũ.

Gợi ý câu hỏi theo điểm khác biệt có thể dùng mẫu câu. Cảnh báo từ khóa cọc/link lạ là hỗ trợ, không là kết luận lừa đảo. Demo không cần gửi ảnh, AI đọc chat hoặc tự chia sẻ liên hệ.

## 14. Xác nhận thuê và bàn giao

### 14.1. Yêu cầu thuê

Một bên tạo, bên kia kiểm tra phòng/người dự kiến, ngày nhận, giá/cọc/phí, số chỗ, thời hạn và nội quy. Thống nhất tạo lượt thuê **Chờ nhận phòng**.

### 14.2. Nhận phòng

Ghi xác nhận hai bên, ngày thực tế, tình trạng/đồ dùng, chỉ số điện nước và ảnh nếu có. Sau xác nhận hợp lệ, chuyển **Đang ở**, cập nhật số người/chỗ. Gửi lặp không nhân dữ liệu hoặc giảm chỗ hai lần.

Mỗi thành viên muốn quyền theo lượt ở cần được ghi nhận riêng; tài khoản đứng tên không tự cấp quyền cho toàn nhóm. Nếu có giữ chỗ, cần trạng thái riêng; giữ chỗ chưa phải vào ở.

### 14.3. Khách ngoài hệ thống

Chủ trọ có thể mời xác nhận lượt ở. Nếu chỉ đánh dấu có khách ngoài AnTro, tin đóng theo khai báo nhưng không tự cấp review cho tài khoản chưa được xác nhận.

## 15. Hồ sơ thuê và hợp đồng

Hồ sơ lượt ở liên kết phòng, các bên, thời gian, giá/phí đã ghi nhận, hợp đồng/tài liệu mẫu, bàn giao, khoản phải trả, thay đổi, trả phòng và cọc.

Hai hướng: đã ký giấy thì lưu bản chụp và tóm tắt; hợp đồng điện tử thì tạo nháp, xem lại, xác nhận/ký bằng phương thức phù hợp khi triển khai thật. Bản xác nhận có phiên bản cố định, sửa đổi thành đề xuất/phụ lục riêng.

Trong demo, hợp đồng/chữ ký là mô phỏng, không tuyên bố tạo hiệu lực thật. Công cụ đọc điều khoản là phụ; dò từ khóa phải gọi đúng tên. Nếu phát triển AI sau, cần chỉ đoạn nguồn và giới hạn kết quả.

## 16. Khoản phải trả, thanh toán và tiền cọc

### 16.1. Bảng phí kỳ thuê

Gồm tiền thuê, điện/nước với chỉ số hoặc mức khoán, phí khác, điều chỉnh có lý do, tổng/hạn trả/trạng thái. Dùng điều kiện đã thống nhất, không dùng giá chào mới thay thế.

### 16.2. Trạng thái thanh toán

| Trạng thái | Ý nghĩa |
| --- | --- |
| Chưa thanh toán | Chưa ghi nhận trả |
| Người thuê khai đã trả | Một phía khai báo |
| Chờ xác nhận/đối soát | Đang kiểm tra |
| Người nhận xác nhận | Có xác nhận nhận tiền |
| Đối soát thành công | Có kết quả tích hợp phù hợp, nếu được triển khai |
| Có bất đồng | Cần trao đổi/xem xét |

Ảnh chuyển khoản hoặc nút đã trả không phải xác nhận ngân hàng. Cho ghi chuyển khoản/tiền mặt. Demo không nhận, giữ hoặc chuyển tiền thật.

### 16.3. Cọc và hoàn cọc

Ghi tiền cọc thống nhất, khai trả/nhận, điều kiện hoàn, khấu trừ/lý do/phản hồi, tiền dự kiến hoàn và trạng thái. Số hóa hồ sơ không đồng nghĩa bảo đảm lấy lại cọc. Giữ cọc/phân xử tiền là phạm vi riêng sau demo.

## 17. Thay đổi thông tin và thông báo

Thay đổi quan trọng gồm giá, phí, nội quy, điều kiện thuê, chỗ và thông tin ảnh hưởng quyết định. Có trước/sau, người làm, thời gian, lý do và phạm vi áp dụng.

Giá chào đợt mới không tự đổi giá người đang ở. Đề xuất cho lượt hiện tại cần luồng riêng, ngày dự kiến và phản hồi. Đã đọc không có nghĩa chấp thuận.

Thông báo đúng người đang ở, theo dõi tin, chủ tin và bên có yêu cầu. Sửa chính tả nhỏ không gây nhiễu. Một sự kiện không tạo thông báo trùng do nhấn/tải lại. Demo cần thông báo trong web; email/push làm sau.

## 18. Rời phòng và kết thúc lượt ở

Người thuê hoặc chủ trọ khởi tạo yêu cầu với ngày và lý do nếu cần. Hai bên xác nhận hoặc Admin xem xét bất đồng. Không xóa lịch sử để tránh review; người thuê cũng không tự kết luận đã hoàn tất mọi nghĩa vụ.

Tách đã rời/bàn giao lại, tiền cần đối chiếu, cọc đang xử lý và lượt ở đã kết thúc. Tranh chấp tiền cọc không tự khóa quyền phản hồi về cư trú đã xác nhận.

Kết thúc hợp lệ thì cập nhật số người/chỗ, giữ lịch sử, mở review và gợi ý chủ trọ mở tuyển nếu muốn. Người ở đã kết thúc không tiếp tục có quyền của cư dân hiện tại.

## 19. Đánh giá từ người từng ở

### 19.1. Điều kiện

Quyền gắn tài khoản, phòng, lượt ở xác nhận và trạng thái đủ điều kiện sau kết thúc. Mã chỉ để tra cứu, không là bằng chứng duy nhất.

Giao dịch ngoài hệ thống hoặc bên kia không xác nhận thì có đường gửi bằng chứng cho Admin; không mặc định một ảnh hợp đồng/biên lai đủ cho mọi trường hợp. Chủ trọ không là người duy nhất có thể mở quyền phản hồi.

### 19.2. Nội dung và kiểm soát

Review gồm sao, nhận xét và tiêu chí chi phí khớp khai báo, tình trạng phòng, tiếng ồn/tiện ích, trải nghiệm người quản lý. Một người/mỗi lượt ở có một đánh giá gốc; chỉnh sửa không tăng số lượt.

Chủ trọ trả lời/kháng nghị, không tự sửa/xóa review bất lợi. Báo cáo không tự ẩn review; Admin xử lý có căn cứ, log và trạng thái. Không công khai hợp đồng, mã quyền, liên hệ hay danh sách cư dân. Nhận xét về người quản lý gắn đúng giai đoạn.

Xác nhận hai bên vẫn có nguy cơ thông đồng; demo chứng minh quy trình quyền, không hứa chống review giả tuyệt đối.

## 20. Điểm minh bạch và Trust Score

| Loại | Ý nghĩa |
| --- | --- |
| Điểm minh bạch | Mức rõ ràng của tin hiện tại |
| Đánh giá người từng ở | Trải nghiệm từ lượt ở hợp lệ |
| Trust Score căn phòng | Chỉ số tổng hợp tham khảo, giải thích được |

Huy hiệu xác minh đứng riêng. Công thức demo đề xuất: **T = làm tròn(0,4 M + 0,4 R + 0,2 H)**, mỗi thành phần 0–100.

- M: thông tin, chi phí và điều kiện rõ đến đâu; Chưa rõ không được điểm như đã cung cấp đủ.
- R: sao phòng từ lượt ở hợp lệ; có thể quy đổi **R = 25 × (sao trung bình − 1)**.
- H: sự kiện vận hành đã xác nhận, không phải tổng số report hoặc số lần bấm nút.

Ví dụ M = 80, R = 80, H = 70 thì T = 78. Đề xuất chỉ hiện tổng khi có ít nhất ba đánh giá hợp lệ từ các tài khoản/lượt ở khác nhau. Thiếu dữ liệu hiện Chưa đủ dữ liệu, không gán thấp. Đây là giả định, chưa có hiệu chỉnh thực nghiệm.

Không trừ vì tăng giá đúng quy trình; không thưởng lặp xác nhận; không trừ report chưa xác minh. Điểm cao không bảo đảm an toàn. Đăng lại thì giữ review và tính theo dữ liệu/phiên bản mới, không reset tùy ý. Hiển thị số mẫu, thời điểm và thành phần; xử lý điểm sai có đường khiếu nại.

Điểm uy tín cá nhân người thuê không là trọng tâm demo; không dùng để làm người dùng khó tìm nhà nơi khác.

## 21. Vòng đời bài đăng và lịch sử căn phòng

Bài đăng: **Nháp → Chờ duyệt → Đang hiển thị → Đã đủ chỗ / Tạm ẩn / Đóng**; thêm Cần bổ sung và Từ chối khi kiểm duyệt.

Số chỗ không âm/vượt sức chứa. Quan tâm/chat/Match không giảm chỗ. Hết chỗ thì dừng nhận khách mới; link cũ có trạng thái và lịch sử. Mở đợt mới giữ mã phòng và đánh giá.

Nhật ký gồm đổi giá/phí, bổ sung tiện ích, xác nhận chỗ, mở/đóng tuyển và xử lý có xác nhận. Không sửa mất sự kiện quan trọng; đính chính có dấu vết.

Định hướng nhắc xác nhận còn phòng sau 7 ngày và tạm ẩn sau 14 ngày chưa cập nhật là cấu hình đề xuất, không bảo đảm còn trống ngoài đời. Đổi người quản lý không xóa lịch sử phòng; hành vi quản lý gắn đúng giai đoạn.

## 22. Báo cáo, khiếu nại và Admin

Admin quản lý xác minh, tin, báo cáo phòng/người/hội thoại, bất đồng lượt ở, kháng nghị review/điểm, điểm đến và log.

Quy trình: Tiếp nhận → Xem xét → Cần bổ sung / Có căn cứ / Chưa đủ căn cứ → Thông báo. Quyết định có lý do, người làm và thời gian. Ẩn nội dung, điều chỉnh điểm hoặc mở quyền review cần căn cứ tương ứng.

Chặn cá nhân khác với xử lý toàn hệ thống. Không dùng cùng IP, cùng mạng ký túc xá hoặc nhiều report làm căn cứ duy nhất. Thời hạn xử lý thực tế cần được chốt trước khi ra mắt, không giả định đội có khả năng cam kết ngay trong demo.

## 23. Dễ sử dụng, tài khoản và dữ liệu

### 23.1. Giao diện

Từ ngữ trực tiếp; nút có chữ; form từng bước/lưu nháp; quay lại không mất dữ liệu; lỗi cạnh trường; xem trước trước việc quan trọng. Không chỉ dùng màu hoặc icon. Có tải/thất bại/trống/thử lại, responsive, bàn phím và dialog đóng được. Không buộc khai toàn bộ hồ sơ chỉ để xem phòng.

### 23.2. Tài khoản và riêng tư

Định hướng có mức công khai hồ sơ/vị trí, quản lý liên hệ, phiên đăng nhập và thu hồi phiên khi có xác thực thật, đổi số/email có kiểm tra quyền sở hữu, khôi phục khi mất phương thức cũ và yêu cầu xuất/sửa/xử lý dữ liệu theo chính sách.

Đổi số không mất mã tài khoản, lượt ở hay review. Không công khai giấy tờ và không thu dư dữ liệu chỉ để chạy demo.

### 23.3. Sự cố

Phân biệt web gián đoạn và dữ liệu mất. Hệ thống thật cần sao lưu, thử khôi phục và xử lý sự cố; cloud không tự bảo đảm không mất dữ liệu. Người dùng cần tải tài liệu quan trọng. Demo cục bộ nêu rõ có thể mất khi xóa dữ liệu trình duyệt; bản sao demo chỉ hỗ trợ thử nghiệm.

Các vấn đề pháp lý và bảo mật phải được rà soát trước ra mắt thật; bản thiết kế hoặc điều khoản miễn trách nhiệm không phải xác nhận đã đáp ứng mọi nghĩa vụ. Tài liệu này mô tả tính năng, không thay thế rà soát chuyên môn.

## 24. Phạm vi web demo và phát triển sau

| Nhóm | Demo cần thể hiện | Chưa bắt buộc tích hợp thật |
| --- | --- | --- |
| Tài khoản/xác minh | Trạng thái, quyền thao tác, duyệt mẫu | OTP, eKYC, kiểm tra giấy tờ thật |
| Tìm kiếm | Bộ lọc, chip, khoảng cách từ tọa độ mẫu | Routing/giao thông thời gian thực |
| Chi phí | Tính đúng, xử lý chưa rõ | Hóa đơn/chỉ số thực tế |
| RoomMatch | Hồ sơ, lọc hai chiều, điểm, lý do, Match/chat | ML, AI phân tích chat |
| Đăng tin | Nháp, phí, xem trước, gửi/duyệt | Kiểm tra ảnh/quyền sở hữu ngoài đời |
| Lượt ở | Xác nhận thuê, bàn giao, vào/rời | Xác minh cư trú độc lập |
| Hợp đồng/thanh toán | Hồ sơ mẫu, phiên bản, trạng thái | Ký thật, nhận tiền, đối soát ngân hàng |
| Feedback/Trust | Quyền review, tính mẫu, giữ khi đăng lại | Chống thông đồng quy mô lớn |
| Vận hành | Thông báo web, báo cáo, Admin, log | Email/push/job nền đầy đủ |
| Dữ liệu | Lưu nhất quán trong phạm vi công bố | Hạ tầng và phục hồi production |

Phần để sau: nhóm nhiều người, sổ chi tiêu, lịch xem nâng cao, cộng đồng khu trọ, gói trả phí, dữ liệu giá thật, AI ảnh, thanh toán/giữ cọc, PWA và mở vùng.

Không cố định công nghệ trong tài liệu tính năng; công nghệ phải được xác nhận từ mã nguồn. Phân biệt tính toán thật trên dữ liệu mẫu, lưu cục bộ và trao đổi thật nhiều tài khoản. Nếu tuyên bố nhiều người dùng hoạt động thì cần server và kiểm tra quyền thực tế; công cụ đổi vai trò demo không chứng minh điều đó.

Ưu tiên triển khai: mô hình phòng/tin/lượt ở → chi phí/tìm kiếm → RoomMatch/chat → xác nhận vào/rời và quyền review → lịch sử/thông báo/điểm → UX và nghiệm thu. Giảm dữ liệu/trường phụ trước khi bỏ mất mắt xích trong hành trình chính.

## 25. Điều kiện hoàn thành demo

1. Tin mới không công khai trước bước xác minh/duyệt mẫu cần thiết.
2. Khoản phí có trạng thái; chưa rõ không thành 0.
3. Thẻ, chi tiết, tìm kiếm dùng cùng tổng chi phí.
4. Tìm kiếm kết hợp đúng các yêu cầu bắt buộc.
5. Khoảng cách ghi đúng phương pháp và nguồn mẫu.
6. RoomMatch lọc yêu cầu của cả hai phía.
7. Một phía quan tâm chưa mở chat RoomMatch.
8. Match không tự xác nhận thuê hoặc giảm chỗ.
9. Còn chỗ nhưng chưa cho phép thì chưa mở tuyển roommate.
10. Bàn giao hợp lệ mới cập nhật người ở.
11. Đủ chỗ thì dừng nhận khách mới.
12. Sửa giá chào không ghi đè giá lượt ở.
13. Đọc thông báo không thành đồng ý.
14. Rời đi không xóa lịch sử.
15. Người không có lượt ở hợp lệ không review được.
16. Gửi lặp không nhân lượt ở, Match, review hoặc thông báo.
17. Chủ trọ không tự xóa review bất lợi.
18. Đăng lại giữ review/lịch sử cùng căn phòng.
19. Thiếu review không bị mặc định kém tin cậy.
20. Nút bấm hoàn thành được luồng trên desktop/mobile.
21. Chức năng mô phỏng được mô tả đúng, không gọi thành tích hợp thật.

### Kịch bản trình diễn đề xuất

1. Tìm gần trường/metro, tổng ngân sách và điều kiện sinh hoạt.
2. Xem bảng phí và phòng thiếu thông tin để thấy cách xử lý.
3. Tạo RoomMatch, giải thích hợp/lệch và quan tâm hai chiều.
4. Thể hiện lượt thuê/nhận phòng riêng với Match.
5. Cập nhật giá, xem thông báo và giá đã ghi nhận không đổi.
6. Yêu cầu rời, xác nhận, viết review.
7. Đóng/mở đợt tuyển, kiểm tra lịch sử và điểm vẫn có căn cứ.

Dữ liệu và mốc thời gian được chuẩn bị sẵn cần nói rõ; có thể chia demo thành “tìm và vào ở” và “rời đi, tuyển lại”. Không cần đợi thời gian thuê thật để chứng minh quy trình.

**Hành trình chuẩn:** Tìm phòng hoặc bạn ở ghép → trao đổi → thống nhất thuê → bàn giao → theo dõi khi đang ở → xác nhận rời đi → đánh giá → phòng được tuyển lại với lịch sử được giữ.
