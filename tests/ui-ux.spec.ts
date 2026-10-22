import { test, expect, type Page } from "@playwright/test";
import { finishDemoLogin, publishProfile } from "./helpers";
const internal = process.env.ANTRO_INTERNAL_TOOLS === "1";
async function readable(page: Page) {
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  expect(
    await page.locator("img").evaluateAll((images) =>
      images
        .filter((i): i is HTMLImageElement => i instanceof HTMLImageElement)
        .filter((i) => i.complete && i.naturalWidth === 0)
        .map((i) => i.src),
    ),
  ).toEqual([]);
}
for (const theme of ["light", "dark"] as const)
  for (const width of [360, 390, 768, 1440])
    test(`UI ${theme} ${width}: search, account and task screens`, async ({
      page,
    }) => {
      test.setTimeout(180000);
      page.setDefaultTimeout(15000);
      await page.setViewportSize({ width, height: 900 });
      await page.addInitScript(
        (t) => localStorage.setItem("antro-theme", t),
        theme,
      );
      const errors: string[] = [];
      page.on("pageerror", (e) => errors.push(e.message));
      page.on("console", (message) => {
        if (message.type() === "error")
          errors.push(`${message.text()} (${message.location().url})`);
      });
      await page.goto("/");
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(
        "Tìm phòng gần trường, vừa túi tiền",
      );
      await expect(page.locator(".demo-strip")).toHaveCount(0);
      await expect(page.locator(".demo-tools-toggle")).toHaveCount(
        internal ? 1 : 0,
      );
      await expect(page.locator(".actor-demo")).toHaveCount(0);
      await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
      const search = page.locator(".hero-search-form button[type=submit]");
      await expect(search).toBeInViewport();
      const intro = await page.locator(".hero-roommatch-link").boundingBox(),
        note = await page.locator(".hero-image-note").boundingBox();
      expect(note!.y).toBeGreaterThanOrEqual(intro!.y + intro!.height);
      await readable(page);
      await page.screenshot({
        path: `test-results/ux-home-${theme}-${width}.png`,
        fullPage: true,
      });
      await page
        .getByRole("button", { name: "Gần trường", exact: true })
        .click();
      const suggestions = page.getByRole("listbox");
      await expect(suggestions).toBeVisible();
      expect(
        await suggestions.evaluate((el) => {
          const r = el.getBoundingClientRect();
          const hit = document.elementFromPoint(
            r.left + r.width / 2,
            Math.min(r.bottom - 10, innerHeight - 1),
          );
          return !!hit && el.contains(hit);
        }),
      ).toBe(true);
      await page.screenshot({
        path: `test-results/ux-suggestions-${theme}-${width}.png`,
      });
      const input = page.getByRole("combobox", { name: "Bạn muốn ở đâu?" });
      await input.press("Escape");
      await input.fill("UIT");
      await expect(page.getByRole("listbox")).toBeVisible();
      const list = await page.getByRole("listbox").boundingBox();
      expect(list!.x).toBeGreaterThanOrEqual(0);
      expect(list!.x + list!.width).toBeLessThanOrEqual(width);
      await input.press("ArrowDown");
      await input.press("Enter");
      await search.click();
      await expect(page).toHaveURL(/place=uit/);
      await expect(page.locator(".room-card").first()).toBeVisible();
      await readable(page);
      if (width <= 768)
        await page.getByRole("button", { name: "Bộ lọc", exact: true }).click();
      await expect(
        page.getByLabel("Tổng ước tính / người / tháng"),
      ).toBeVisible();
      await page
        .getByLabel("Tổng ước tính / người / tháng")
        .selectOption("2000000");
      await readable(page);
      await page.screenshot({
        path: `test-results/ux-search-${theme}-${width}.png`,
        fullPage: true,
      });
      if (width <= 768)
        await page.getByRole("button", { name: "Đóng", exact: true }).click();
      await page.goto("/dang-nhap");
      await expect(page.getByLabel("Mật khẩu", { exact: true })).toBeVisible();
      await expect(page.locator(".login-demo")).toHaveCount(0);
      await readable(page);
      await page.screenshot({
        path: `test-results/ux-login-${theme}-${width}.png`,
        fullPage: true,
      });
      await page.getByRole("button", { name: "Quên mật khẩu?" }).click();
      await readable(page);
      await page.keyboard.press("Escape");
      await expect(page.getByRole("dialog")).toHaveCount(0);
      await finishDemoLogin(page);
      await page.goto("/roommatch/ho-so");
      await publishProfile(page);
      await expect(page.locator(".person-card")).toHaveCount(1);
      expect(
        await page
          .locator(".why-match .money")
          .first()
          .evaluate((el) => el.getClientRects().length),
      ).toBe(1);

      await readable(page);
      await page.evaluate(() => scrollTo(0, 0));
      await page.screenshot({
        path: `test-results/ux-roommatch-${theme}-${width}.png`,
        fullPage: true,
      });
      for (const route of [
        "/phong/phong-ban-cong",
        "/tin-nhan",
        "/noi-o",
        "/dang-tin",
        "/quan-ly-tin",
        "/yeu-thich",
        "/thong-bao",
        "/tai-khoan",
      ]) {
        await page.goto(route);
        await expect(page.locator("main h1").first()).toBeVisible();
        await expect(page.locator(".actor-demo")).toHaveCount(0);
        await readable(page);
        if (["/phong/phong-ban-cong", "/dang-tin", "/noi-o"].includes(route))
          await page.screenshot({
            path: `test-results/ux-${route.replaceAll("/", "-")}-${theme}-${width}.png`,
            fullPage: true,
          });
      }
      await expect(
        page.getByRole("button", { name: "Đặt lại dữ liệu demo", exact: true }),
      ).toHaveCount(0);
      expect(errors).toEqual([]);
    });
test("public build has no operation controls, even for a stored Admin role", async ({
  page,
}) => {
  test.skip(internal, "Production-only gate check");
  await page.goto("/dang-nhap");
  await finishDemoLogin(page);
  await page.evaluate(() => {
    const v = JSON.parse(localStorage.getItem("antro-demo-v2")!);
    v.data.role = "admin";
    localStorage.setItem("antro-demo-v2", JSON.stringify(v));
  });
  await page.goto("/admin");
  await expect(
    page.getByRole("heading", { name: "Khu vực nội bộ" }),
  ).toBeVisible();
  await expect(page.locator(".demo-tools-toggle")).toHaveCount(0);
  await expect(page.locator(".actor-demo")).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Mở bảng vận hành demo" }),
  ).toHaveCount(0);
});
