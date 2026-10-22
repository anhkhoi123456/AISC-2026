import { expect, type Page } from "@playwright/test";
export async function finishDemoLogin(page: Page) {
  await expect(page).toHaveURL(/dang-nhap/);
  await page.getByLabel("Email", { exact: true }).fill("demo@example.com");
  await page.getByLabel("Mật khẩu", { exact: true }).fill("Antro123!");
  await page.getByRole("button", { name: "Đăng nhập", exact: true }).click();
  await page.getByLabel("Mã xác nhận").fill("123456");
  await page.getByRole("button", { name: "Xác nhận và tiếp tục" }).click();
  await page.getByRole("button", { name: "Xem kết quả" }).click();
  await page.getByRole("button", { name: "Tiếp tục" }).click();
}
export async function publishProfile(page: Page) {
  for (let i = 0; i < 4; i++)
    await page.getByRole("button", { name: "Tiếp tục", exact: true }).click();
  await page.getByRole("button", { name: "Bật hiển thị hồ sơ" }).click();
}
export async function switchActor(
  page: Page,
  name: "Người thuê mẫu" | "Người đăng mẫu" | "Admin mẫu",
) {
  await page.getByRole("button", { name: /Vai trò demo:/ }).click();
  const controls = page.getByRole("dialog").locator(".actor-demo");
  if (!(await controls.evaluate((el) => el.hasAttribute("open"))))
    await controls.locator("summary").click();
  await controls.getByRole("button", { name, exact: true }).click();
  await page.getByRole("button", { name: "Đóng", exact: true }).click();
}
