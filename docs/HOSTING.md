# Host thử nghiệm riêng cho team

## Framework và cấu hình của repo

- Next.js **16.4.2 App Router**, React 19, TypeScript; Node **24.x** (`.nvmrc`, `engines` và môi trường kiểm tra local).
- `npm ci` → `npm run build` → `npm start`. Vercel dùng preset Next.js và tự quản lý runtime, không cần tự cấu hình start command.
- `vercel.json` chỉ chọn framework/install/build. Giữ Output Directory mặc định của preset; không chọn `dist`, `out` hoặc thêm rewrite mọi URL về `/index.html`.
- `/roommatch`, `/dang-nhap`, `/phong/[id]` là route Next.js. `/login` redirect 307 tới `/dang-nhap`, giữ query như `?next=%2Froommatch`.
- Route chi tiết động hỗ trợ cả ID tin demo do người dùng tạo trong cùng trình duyệt. Không dùng static export/GitHub Pages cho cấu hình hiện tại.
- HashRouter chỉ dùng fragment trong công cụ hợp đồng `/hop-dong#/ket-qua`; không quản lý routing toàn website.

## Các bước bạn thực hiện trên tài khoản hosting

1. Commit/push code vào repo GitHub riêng mà bạn muốn dùng. Chưa cần kết nối auto-deploy khi chưa đặt bảo vệ.
2. Trên Vercel, **trước deployment đầu tiên**, đặt mặc định của team cho dự án mới: **Deployment Protection → Vercel Authentication → All Deployments**. Xác nhận cấu hình thực sự được lưu. Nếu tài khoản không cho đặt mặc định, tạo project chưa có deployment và cấu hình bảo vệ project trước; đừng bấm Deploy trong luồng import nếu chưa bảo vệ được deployment đầu.
3. Import repo vào project. Framework **Next.js**; Root Directory là thư mục chứa `package.json` này: `AnTro` nếu repo gốc là AISC, `.` nếu repo gốc đã là AnTro. Node **24.x**; install `npm ci`; build `npm run build`; giữ output mặc định. **Không cần biến môi trường** cho demo.
4. Kiểm tra lại project **Settings → Deployment Protection**: Vercel Authentication bật, phạm vi **All Deployments** (cả Preview và Production/domain). Standard Protection vẫn chừa production domain không bảo vệ. Chỉ sau đó mới deploy bản thử nghiệm/nhánh preview.
5. Cấp quyền xem cho từng tài khoản Vercel của team qua project/team membership phù hợp hoặc duyệt access request. Hobby hiện chỉ cho một external user/account; team nhiều người cần xem giới hạn/quyền và gói phù hợp trên dashboard trước khi chọn. Không cần mua gói tự động từ repo này.
6. Mở URL bằng cửa sổ ẩn danh chưa đăng nhập: phải gặp cổng Vercel, chưa được thấy AnTro hoặc ảnh private deployment. Thử thêm tài khoản không được cấp quyền: không được vào; thành viên được cấp quyền phải vào được. Kiểm tra cả URL deployment, branch và production domain nếu có. Không bật shareable bypass link hoặc ngoại lệ công khai khi muốn giới hạn theo người.
7. Sau khi kiểm tra, gửi URL thường cho team. Mỗi người đăng nhập Vercel trước, sau đó dùng tài khoản/OTP **demo của AnTro**. Hai lớp đăng nhập có mục đích khác nhau.

Quyền hosting phải được bật trên tài khoản; `vercel.json` trong repo không tự bật Deployment Protection. Không dùng cờ vai trò localStorage hoặc mật khẩu `NEXT_PUBLIC_*` để thay thế cổng này. Metadata `noindex, nofollow` đã thêm để hạn chế lập chỉ mục, nhưng không phải cơ chế chặn truy cập.

Tài liệu chính thức đã đối chiếu ngày 19/10/2026:
- [Next.js trên Vercel](https://vercel.com/docs/frameworks/full-stack/nextjs)
- [Phạm vi Deployment Protection, All Deployments và mặc định của team](https://vercel.com/docs/deployment-protection)
- [Vercel Authentication, cấp quyền và giới hạn external user](https://vercel.com/docs/deployment-protection/methods-to-protect-deployments/vercel-authentication)
- [Node.js runtime](https://vercel.com/docs/functions/runtimes/node-js/node-js-versions)

## Asset, môi trường và dữ liệu demo

Ảnh nằm trong `public/images`, truy cập bằng `/images/...`; không cần CDN/API key. Chữ hoa/thường của tên file phải giữ đúng khi commit. Commit ảnh cùng mã nguồn; không upload riêng `.next` hoặc `node_modules`. Không có fetch API/backend hay URL localhost trong mã runtime hiện tại.

`.env.example` chỉ ghi chú các biến backend tương lai; demo không đọc chúng. Không cần copy `.env` để build/chạy. `NEXT_PUBLIC_*` sẽ công khai trong bundle nếu được sử dụng, không dùng cho bí mật. Đổi biến public sau này cần build/deploy lại.

Tương tác và seed giữ nguyên. Dữ liệu nằm ở `localStorage['antro-demo-v2']`, theme ở `antro-theme`. Team **không chia sẻ chung dữ liệu**: mỗi browser/origin có trạng thái riêng. Đổi URL preview có thể tạo bộ dữ liệu riêng; tải lại cùng URL giữ trạng thái. Chuyển vai trò demo để thử các luồng, OTP `123456`. Tin tự tạo trên máy bạn không tự xuất hiện trên máy đồng đội.

## Kiểm tra lại local trước khi deploy

```sh
nvm use
npm ci
npm run lint
npm run build
npm start -- --hostname 127.0.0.1 --port 3100
# Terminal khác:
PLAYWRIGHT_BASE_URL=http://127.0.0.1:3100 npm run test:e2e
```

Bộ `hosting.spec.ts` kiểm tra vào trực tiếp/refresh, `/login` redirect giữ query, route không tồn tại, ảnh production và MIME. Các bộ test demo hiện có kiểm tra đăng nhập/OTP, lưu tin, RoomMatch/chat, quản lý/duyệt tin và hợp đồng. Danh sách lệnh là cách tái kiểm tra, không tự xác nhận kết quả trên hosting.

## Trạng thái triển khai

**Đã kiểm tra local ngày 19/10/2026:** Node v24.15.0; `npm run lint` và production build đạt (bao gồm bước TypeScript của Next.js). Chạy bằng `next start` cổng 3100 không có `.env` riêng: **20/20 Playwright test đạt**, gồm vào trực tiếp/refresh ba URL nêu trên, redirect giữ query, ảnh HTTP 200/MIME đúng và các luồng demo. Kiểm tra đường dẫn ảnh chính xác chữ hoa/thường không có tệp thiếu. Đây chưa phải kết quả chạy trên Vercel.

**Đã chuẩn bị:** preset Vercel, Node 24, redirect `/login`, noindex, ví dụ môi trường và test production. Kết quả chạy local được báo trong phản hồi bàn giao.

**Chưa thực hiện:** đăng nhập/kết nối Vercel hoặc GitHub, push code, tạo project/deployment, cấu hình quyền thật, mời thành viên, gắn domain hoặc kiểm tra HTTPS/CDN và cổng truy cập từ Internet. Chỉ chia sẻ sau khi bạn hoàn tất kiểm tra quyền ở bước 6.
