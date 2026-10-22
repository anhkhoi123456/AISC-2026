import { finishDemoLogin, publishProfile, switchActor } from "./helpers";
import { test, expect } from "@playwright/test";
let runtimeErrors: string[] = [];
test.beforeEach(async ({ page }) => {
  runtimeErrors = [];
  page.on("pageerror", (error) => runtimeErrors.push(error.message));
});
test.afterEach(() => {
  expect(runtimeErrors).toEqual([]);
});
async function activate(page: import("@playwright/test").Page) {
  await page.goto("/dang-nhap");
  await finishDemoLogin(page);
  await expect(
    page.getByRole("heading", { name: "Chào Minh Anh," }),
  ).toBeVisible();
}
test("guest sees rooms, budget respects unknown costs, and money uses per-person units", async ({
  page,
}) => {
  await page.goto("/tim-phong");
  await expect(page.locator(".room-card")).toHaveCount(3);
  await page
    .getByLabel("Tổng ước tính / người / tháng")
    .selectOption("2000000");
  await expect(
    page.locator(".search-results > .room-grid .room-card"),
  ).toHaveCount(1);
  await expect(
    page.getByText("Chưa khai báo giá điện, chưa thể xác nhận ngân sách."),
  ).toBeVisible();
  await page.goto("/phong/studio-cua-so");
  await expect(page.locator(".cost-total strong")).toHaveText("1.840.000đ");
  await page
    .getByRole("combobox", { name: "Số người", exact: true })
    .selectOption("1");
  await expect(page.locator(".cost-total strong")).toHaveText("3.520.000đ");
  await page.getByRole("button", { name: "Lưu phòng", exact: true }).click();
  await expect(page).toHaveURL(/dang-nhap/);
});
test("verification, saved listing, mutual match, persistent chat and block", async ({
  page,
}) => {
  await activate(page);
  await page.goto("/phong/phong-ban-cong");
  await page.getByRole("button", { name: "Lưu phòng", exact: true }).click();
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Đã lưu phòng", exact: true }),
  ).toBeVisible();
  await page.goto("/roommatch/ho-so");
  await publishProfile(page);
  const linh = page.locator(".person-card").filter({ hasText: "Ngọc Linh" });
  await linh.getByRole("button", { name: "Quan tâm", exact: true }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByRole("link", { name: "Nhắn tin" }).click();
  await page
    .getByLabel("Nội dung tin nhắn")
    .fill("Chào Linh, mình cùng xem phòng nhé!");
  await page.getByRole("button", { name: "Gửi tin nhắn", exact: true }).click();
  await expect(
    page
      .locator(".chat-messages")
      .getByText("Chào Linh, mình cùng xem phòng nhé!"),
  ).toBeVisible();
  await page.reload();
  await expect(
    page
      .locator(".chat-messages")
      .getByText("Chào Linh, mình cùng xem phòng nhé!"),
  ).toBeVisible();
  await page.getByRole("button", { name: "Chặn", exact: true }).click();
  await page.getByRole("button", { name: "Xác nhận", exact: true }).click();
  await expect(
    page.getByText("Kết nối đã kết thúc. Không thể gửi tin mới."),
  ).toBeVisible();
});
test("listing submission stays private until approved with audit reason", async ({
  page,
}) => {
  await activate(page);
  await page.goto("/dang-tin");
  await page
    .getByLabel("Tiêu đề", { exact: true })
    .fill("Căn phòng kiểm thử gần trường");
  await page
    .getByLabel("Địa chỉ phòng")
    .fill("Địa chỉ minh họa quanh Làng Đại học");
  await page.getByLabel("Xác nhận vị trí đã khai báo").check();
  await page.getByRole("button", { name: "Tiếp tục", exact: true }).click();
  await page.getByRole("button", { name: "Điền bảng phí tham khảo" }).click();
  await page.getByRole("button", { name: "Tiếp tục", exact: true }).click();
  await page.getByRole("button", { name: "Tiếp tục", exact: true }).click();
  await page.getByRole("button", { name: "Gửi duyệt", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Tin phòng đã được lưu." }),
  ).toBeVisible();
  await page.goto("/tim-phong");
  await expect(
    page.getByRole("link", {
      name: "Căn phòng kiểm thử gần trường",
      exact: true,
    }),
  ).toHaveCount(0);
  await page.goto("/admin");
  await switchActor(page, "Admin mẫu");
  await page.getByRole("button", { name: "Mở bảng vận hành demo" }).click();
  const row = page
    .locator(".table-row")
    .filter({ hasText: "Căn phòng kiểm thử gần trường" });
  await row.getByRole("button", { name: "Duyệt", exact: true }).click();
  await page
    .getByLabel("Lý do quyết định")
    .fill("Đã kiểm tra đủ thông tin mẫu cho demo.");
  await page.getByRole("button", { name: "Lưu quyết định" }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.goto("/tim-phong");
  await expect(
    page
      .getByRole("link", { name: "Căn phòng kiểm thử gần trường", exact: true })
      .last(),
  ).toBeVisible();
});
for (const width of [390, 1440])
  test(`responsive pages do not overflow at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    for (const route of [
      "/",
      "/tim-phong",
      "/phong/phong-ban-cong",
      "/dang-nhap",
      "/admin",
    ]) {
      await page.goto(route);
      await expect(page.locator("main")).toBeVisible();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
      ).toBeTruthy();
      expect(
        await page
          .locator("img")
          .evaluateAll((imgs) =>
            imgs.every(
              (i) =>
                (i as HTMLImageElement).complete &&
                (i as HTMLImageElement).naturalWidth > 0,
            ),
          ),
      ).toBeTruthy();
    }
    await page.goto("/");
    await page.screenshot({
      path: `test-results/home-${width}.png`,
      fullPage: true,
    });
  });

test("moderation hides a reported listing and restores it after review", async ({
  page,
}) => {
  await activate(page);
  await page.goto("/phong/phong-gan-ktx");
  const base = await page.locator(".trust-number").textContent();
  /* No aggregate Trust score is manufactured for a room without valid reviews. */
  const legacyBase = Number(
    await page
      .locator(".trust-number")
      .evaluate((el) => el.childNodes[0].textContent),
  );
  await page.goto("/admin");
  await switchActor(page, "Admin mẫu");
  await page.getByRole("button", { name: "Mở bảng vận hành demo" }).click();
  await page.getByRole("button", { name: "Báo cáo & khiếu nại" }).click();
  await page.getByRole("button", { name: "Có vi phạm", exact: true }).click();
  await page
    .getByLabel("Lý do quyết định")
    .fill("Đã kiểm tra mẫu và tạm ẩn tin để bổ sung.");
  await page.getByRole("button", { name: "Lưu quyết định" }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.goto("/tim-phong");
  await expect(page.locator(".room-card")).toHaveCount(2);
  await page.goto("/phong/phong-gan-ktx");
  expect(
    Number(
      await page
        .locator(".trust-number")
        .evaluate((el) => el.childNodes[0].textContent),
    ),
  ).toBeNaN();
  await expect(page.locator(".trust-number")).toHaveText(base!);
  await page.goto("/admin");
  await switchActor(page, "Admin mẫu");
  await page.getByRole("button", { name: "Mở bảng vận hành demo" }).click();
  await page.getByRole("button", { name: "Báo cáo & khiếu nại" }).click();
  await page
    .getByRole("button", { name: "Không đủ cơ sở", exact: true })
    .click();
  await page
    .getByLabel("Lý do quyết định")
    .fill("Rà soát lại dữ liệu mẫu, khôi phục trạng thái trước.");
  await page.getByRole("button", { name: "Lưu quyết định" }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.goto("/tim-phong");
  await expect(page.locator(".room-card")).toHaveCount(3);
  await page.goto("/phong/phong-gan-ktx");
  expect(
    Number(
      await page
        .locator(".trust-number")
        .evaluate((el) => el.childNodes[0].textContent),
    ),
  ).toBeNaN();
  await expect(page.locator(".trust-number")).toHaveText(base!);
  void legacyBase;
});
