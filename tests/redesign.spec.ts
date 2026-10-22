import { finishDemoLogin, publishProfile } from "./helpers";
import { test, expect, type Page } from "@playwright/test";
async function noOverflow(page: Page) {
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
}
async function tenant(page: Page) {
  await page.getByRole("button", { name: /Vai trò demo:/ }).click();
  await page
    .getByRole("combobox", { name: "Vai trò demo", exact: true })
    .selectOption("tenant");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await finishDemoLogin(page);
}
for (const theme of ["light", "dark"] as const)
  for (const width of [390, 1440])
    test(`${theme} ${width}: homepage, login and shared demo screens`, async ({
      page,
    }) => {
      const errors: string[] = [];
      page.on("pageerror", (e) => errors.push(e.message));
      await page.setViewportSize({ width, height: 900 });
      await page.addInitScript(
        (value) => localStorage.setItem("antro-theme", value),
        theme,
      );
      await page.goto("/");
      await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
      const heroInput = page.getByRole("combobox", { name: "Bạn muốn ở đâu?" });
      await expect(heroInput).toBeVisible();
      const box = await heroInput.boundingBox();
      expect(box!.y + box!.height).toBeLessThan(900);
      const search = page.locator(".hero-search-form button[type=submit]");
      await expect(search).toBeInViewport();
      expect(
        (await page.locator(".site-header").boundingBox())!.height,
      ).toBeLessThanOrEqual(68);
      const demo = await page
        .getByRole("button", { name: /Vai trò demo:/ })
        .boundingBox();
      const header = await page.locator(".site-header").boundingBox();
      expect(demo!.y).toBeGreaterThanOrEqual(header!.y);
      expect(demo!.y + demo!.height).toBeLessThanOrEqual(
        header!.y + header!.height,
      );
      await noOverflow(page);
      await page.screenshot({
        path: `test-results/redesign-home-${theme}-${width}.png`,
      });
      const firstRoom = await page.locator(".room-card").first().boundingBox();
      if (width === 1440) expect(firstRoom!.y).toBeLessThan(850);
      await heroInput.fill("UIT");
      await expect(page.getByRole("listbox")).toBeVisible();
      await expect(
        page.getByRole("option", { name: /Đại học Công nghệ Thông tin/ }),
      ).toBeInViewport();
      const list = await page.getByRole("listbox").boundingBox();
      expect(list!.x).toBeGreaterThanOrEqual(0);
      expect(list!.x + list!.width).toBeLessThanOrEqual(width);
      await heroInput.press("ArrowDown");
      await heroInput.press("Enter");
      await search.click();
      await expect(page).toHaveURL(/place=uit/);
      await page.goto("/dang-nhap");
      await expect(
        page.getByRole("heading", { name: "Đăng nhập" }),
      ).toBeVisible();
      const card = await page.locator(".login-card").boundingBox();
      expect(card!.width).toBeLessThanOrEqual(442);
      expect(
        await page
          .getByLabel("Mật khẩu", { exact: true })
          .evaluate((el) => parseFloat(getComputedStyle(el).fontSize)),
      ).toBeGreaterThanOrEqual(16);
      await noOverflow(page);
      await page.screenshot({
        path: `test-results/redesign-login-${theme}-${width}.png`,
      });
      await tenant(page);
      for (const route of [
        "/tim-phong",
        "/roommatch",
        "/roommatch/ho-so",
        "/quan-ly-tin",
        "/admin",
        "/hop-dong",
      ]) {
        await page.goto(route);
        await expect(page.locator("main h1").first()).toBeVisible();
        await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
        if (route === "/tim-phong")
          await expect(page.locator(".room-card").first()).toBeVisible();
        await noOverflow(page);
        await page.screenshot({
          path: `test-results/task-${route.replaceAll("/", "-")}-${theme}-${width}.png`,
          fullPage: true,
        });
      }
      await page.goto("/roommatch/ho-so");
      await publishProfile(page);
      await expect(page.locator(".person-card")).toHaveCount(1);
      await expect(page.locator(".toast")).toBeHidden({ timeout: 10000 });
      await noOverflow(page);
      await page.screenshot({
        path: `test-results/task-deck-${theme}-${width}.png`,
        fullPage: true,
      });
      await page.goto("/phong/phong-ban-cong");
      await expect(page.locator(".detail-gallery img")).toHaveCount(1);
      await noOverflow(page);
      await page.screenshot({
        path: `test-results/task-detail-${theme}-${width}.png`,
        fullPage: true,
      });
      await page.getByRole("button", { name: "Liên hệ người đăng" }).click();
      await expect(page.getByLabel("Nội dung tin nhắn")).toBeVisible();
      await page
        .getByLabel("Nội dung tin nhắn")
        .fill("Mình muốn hỏi thêm về phòng mẫu.");
      await page
        .getByRole("button", { name: "Gửi tin nhắn", exact: true })
        .click();
      await expect(
        page
          .locator(".chat-messages")
          .getByText("Mình muốn hỏi thêm về phòng mẫu.", { exact: true }),
      ).toBeVisible();
      await noOverflow(page);
      await page.screenshot({
        path: `test-results/redesign-chat-${theme}-${width}.png`,
      });
      await page.getByRole("button", { name: "Báo cáo", exact: true }).click();
      await expect(page.getByRole("dialog")).toBeVisible();
      await page.screenshot({
        path: `test-results/redesign-modal-${theme}-${width}.png`,
      });
      expect(errors).toEqual([]);
    });
test("theme selection persists, follows system changes, and initial document bootstraps dark", async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.emulateMedia({ colorScheme: "light" });
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await page.getByLabel("Chọn giao diện", { exact: true }).click();
  await page.getByRole("button", { name: "Tối", exact: true }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.goto("/dang-nhap");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  const html = await (await page.request.get("/")).text();
  expect(html).toContain("localStorage.getItem('antro-theme')");
  await page.getByLabel("Chọn giao diện", { exact: true }).click();
  await page
    .getByRole("button", { name: "Theo hệ thống", exact: true })
    .click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
});
test("login has working password toggle, reset guidance, registration and small-screen submit", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 560 });
  await page.goto("/dang-nhap");
  const pass = page.getByLabel("Mật khẩu", { exact: true });
  await pass.fill("Antro123!");
  await page
    .getByRole("button", { name: "Hiện mật khẩu", exact: true })
    .click();
  await expect(pass).toHaveAttribute("type", "text");
  await page.getByRole("button", { name: "Ẩn mật khẩu", exact: true }).click();
  await expect(pass).toHaveAttribute("type", "password");
  await page.getByRole("button", { name: "Quên mật khẩu?" }).click();
  await page.getByLabel("Email mẫu", { exact: true }).fill("demo@antro.vn");
  await page.getByRole("button", { name: "Xem hướng dẫn" }).click();
  await expect(page.getByRole("dialog")).toContainText(
    "Không có email nào được gửi",
  );
  await page
    .getByRole("button", { name: "Điền thông tin và quay lại" })
    .click();
  await expect(page.getByLabel("Email")).toHaveValue("demo@antro.vn");
  await page.getByRole("button", { name: "Đăng ký", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Đăng ký" })).toBeVisible();
  await page.getByLabel("Tên hiển thị", { exact: true }).fill("Sinh viên demo");
  await page
    .getByRole("button", { name: "Đăng ký", exact: true })
    .scrollIntoViewIfNeeded();
  await expect(
    page.getByRole("button", { name: "Đăng ký", exact: true }),
  ).toBeInViewport();
  await page.getByRole("button", { name: "Đăng ký", exact: true }).click();
  await expect(page).toHaveURL(/xac-minh/);
  await expect(page.getByLabel("Mã xác nhận")).toBeVisible();
});
