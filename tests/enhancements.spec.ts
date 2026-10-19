import { test, expect, type Page } from "@playwright/test";
async function role(page: Page, value: string) {
  await page.getByRole("button", { name: /Vai trò demo:/ }).click();
  await page
    .getByRole("combobox", { name: "Vai trò demo", exact: true })
    .selectOption(value);
  await expect(page.getByRole("dialog")).toHaveCount(0);
}
test("UIT autocomplete, URL persistence, Back and four parsed chips", async ({
  page,
}) => {
  await page.goto("/tim-phong");
  const input = page.getByRole("combobox", { name: "Mô tả nhu cầu tìm phòng" });
  await input.fill("UIT");
  await expect(page.getByRole("listbox")).toBeVisible();
  await input.press("ArrowDown");
  await input.press("Enter");
  await expect(page).toHaveURL(/place=uit/);
  await page
    .getByLabel("Tổng ước tính / người / tháng")
    .selectOption("3000000");
  await page.reload();
  await expect(page.getByLabel("Tổng ước tính / người / tháng")).toHaveValue(
    "3000000",
  );
  await page.goBack();
  await expect(page.getByLabel("Tổng ước tính / người / tháng")).toHaveValue(
    "",
  );
  await page
    .getByRole("combobox", { name: "Mô tả nhu cầu tìm phòng" })
    .fill("Gần UIT, dưới 3 triệu, cho nuôi mèo, thuê 10 tháng");
  await page.getByRole("button", { name: "Gợi ý bộ lọc" }).click();
  await expect(page.locator(".editable-chips > span")).toHaveCount(4);
  await expect(page).toHaveURL(/months=10/);
  await page
    .getByRole("button", { name: "Xóa Thuê 10 tháng", exact: true })
    .click();
  await expect(page).not.toHaveURL(/months=/);
});
test("draft survives reload and one-way interest does not open a chat", async ({
  page,
}) => {
  await page.goto("/");
  await role(page, "tenant");
  await page.goto("/roommatch/ho-so");
  await page.getByLabel("Ngân sách tối đa / người").fill("2500000");
  await page.getByRole("button", { name: "Tiếp tục", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Nhịp sống của bạn thế nào?" }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Nhịp sống của bạn thế nào?" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Quay lại", exact: true }).click();
  await expect(page.getByLabel("Ngân sách tối đa / người")).toHaveValue(
    "2500000",
  );
  await page.getByRole("button", { name: "Tiếp tục", exact: true }).click();
  await page.getByRole("button", { name: "Tiếp tục", exact: true }).click();
  await page.getByRole("button", { name: "Bật hiển thị hồ sơ" }).click();
  const vy = page.locator(".person-card").filter({ hasText: "Thảo Vy" });
  await vy.getByRole("button", { name: "Quan tâm", exact: true }).click();
  await page.getByRole("button", { name: "Đã quan tâm", exact: true }).click();
  await expect(
    page.locator(".person-card").filter({ hasText: "Thảo Vy" }),
  ).toBeVisible();
  await page.goto("/tin-nhan");
  await expect(
    page.getByRole("heading", { name: "Chưa có cuộc trò chuyện nào" }),
  ).toBeVisible();
});
test("trust breakdown and insufficient price data are explicitly illustrated", async ({
  page,
}) => {
  await page.goto("/phong/phong-ban-cong");
  const score = await page.locator(".trust-number").textContent();
  await page.getByRole("button", { name: "Vì sao điểm này?" }).click();
  await expect(page.getByRole("dialog")).toContainText("Đầy đủ các khoản phí");
  await page.getByRole("button", { name: "Đóng", exact: true }).click();
  await page.reload();
  await expect(page.locator(".trust-number")).toHaveText(score!);
  await page.goto("/phong/phong-gan-ktx");
  await expect(
    page.getByText("Chưa đủ dữ liệu giá khu vực", { exact: true }),
  ).toBeVisible();
});
for (const width of [390, 1440])
  test(`contract warnings target the exact excerpt and UI fits ${width}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/hop-dong");
    await page
      .getByRole("button", { name: "Mẫu có điều khoản cần chú ý", exact: true })
      .click();
    await page.getByRole("button", { name: "Rà soát điều khoản" }).click();
    const fee = page
      .locator(".finding-card")
      .filter({ hasText: "Điều chỉnh giá và phí" });
    await expect(fee).toContainText("bất kỳ lúc nào");
    await fee.getByRole("button", { name: "Xem đúng đoạn văn bản" }).click();
    await expect(page.locator(".highlighted-clause.selected")).toContainText(
      "Bên cho thuê được tăng giá",
    );
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    await page.screenshot({
      path: `test-results/contract-${width}.png`,
      fullPage: false,
    });
    await page.reload();
    await expect(
      page.getByRole("heading", { name: "Văn bản bạn cung cấp" }),
    ).toBeVisible();
    await page.goBack();
    await expect(page.getByLabel("Nội dung hợp đồng")).toContainText(
      "HỢP ĐỒNG THUÊ PHÒNG",
    );
  });
test("broken local storage recovers and reset requires confirmation", async ({
  page,
}) => {
  await page.addInitScript(() => {
    localStorage.setItem(
      "antro-demo-v2",
      '{"version":2,"data":{"profile":null}}',
    );
  });
  await page.goto("/");
  await expect(page.getByRole("status")).toContainText("không hợp lệ");
  await page.getByRole("button", { name: /Vai trò demo:/ }).click();
  await page
    .getByRole("button", { name: "Đặt lại dữ liệu demo", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Xác nhận đặt lại" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Hủy", exact: true }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
});
