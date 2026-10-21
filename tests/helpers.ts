import { expect, type Page } from "@playwright/test";
export async function finishDemoLogin(page: Page) {
  await expect(page).toHaveURL(/dang-nhap/);
  await page.getByText("Trải nghiệm demo", { exact: true }).click();
  await page.getByLabel("Email dùng trong demo").fill("demo@example.com");
  await page
    .getByRole("button", { name: "Tiếp tục với tài khoản demo" })
    .click();
  await page.getByLabel("Mã OTP demo").fill("123456");
  await page.getByRole("button", { name: "Xác nhận và tiếp tục" }).click();
  await page.getByRole("button", { name: "Xem kết quả mô phỏng" }).click();
  await page.getByRole("button", { name: "Tiếp tục sử dụng demo" }).click();
}
export async function publishProfile(page: Page) {
  for (let i = 0; i < 4; i++)
    await page.getByRole("button", { name: "Tiếp tục", exact: true }).click();
  await page.getByRole("button", { name: "Bật hiển thị hồ sơ" }).click();
}
