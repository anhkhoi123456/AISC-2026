import { createInitialState } from "../src/services/demo-data";
import { test, expect } from "@playwright/test";
import { finishDemoLogin, publishProfile } from "./helpers";
for (const width of [390, 1440])
  test(`review ${width}: verified sample, ordered preferences, deck undo and two-sided contact consent`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.addInitScript(
      (t) => localStorage.setItem("antro-theme", t),
      width === 390 ? "dark" : "light",
    );
    await page.goto("/dang-nhap");
    await finishDemoLogin(page);
    await page.goto("/roommatch/ho-so");
    await expect(
      page.getByText(/Danh tính mẫu đã xác minh \(chỉ đọc\)/),
    ).toBeVisible();
    await expect(page.getByLabel("Giới tính tự khai")).toHaveCount(0);
    await page
      .getByLabel("Trường / nơi làm việc (điểm neo)")
      .selectOption("hcmut");
    await expect(
      page.getByRole("checkbox", {
        name: "Gần ĐH Công nghệ Thông tin",
        exact: true,
      }),
    ).toBeChecked();
    await page
      .getByRole("checkbox", { name: "Gần ĐH Bách Khoa", exact: true })
      .check();
    await page
      .getByRole("button", { name: "Ưu tiên cao hơn Gần ĐH Bách Khoa" })
      .click();
    await expect(page.locator(".area-priority").first()).toContainText(
      "Gần ĐH Bách Khoa",
    );
    await page.reload();
    await expect(page.locator(".area-priority").first()).toContainText(
      "Gần ĐH Bách Khoa",
    );
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await publishProfile(page);
    const card = page.locator(".person-card");
    await expect(card).toHaveCount(1);
    await expect(card).toContainText("Ngọc Linh");
    await expect(card).toContainText("User Trust:");
    await expect(card).toContainText("Khu vực giao nhau:");
    await page.screenshot({
      path: `test-results/review-deck-${width}.png`,
      fullPage: true,
    });
    await card.getByRole("button", { name: "Báo cáo", exact: true }).click();
    await page
      .getByRole("dialog")
      .getByRole("textbox")
      .fill("Nội dung mẫu đang được nhập");
    await page.keyboard.press("ArrowLeft");
    await page.getByRole("button", { name: "Đóng", exact: true }).click();
    await expect(card).toContainText("Ngọc Linh");
    await page.keyboard.press("ArrowLeft");
    await expect(card).toContainText("Thảo Vy");
    await page.getByRole("button", { name: "Hoàn tác lượt gần nhất" }).click();
    await expect(card).toContainText("Ngọc Linh");
    await card.dispatchEvent("pointerdown", {
      clientX: 300,
      clientY: 500,
      pointerType: "touch",
    });
    await card.dispatchEvent("pointerup", {
      clientX: 80,
      clientY: 505,
      pointerType: "touch",
    });
    await expect(card).toContainText("Thảo Vy");
    await page.getByRole("button", { name: "Hoàn tác lượt gần nhất" }).click();
    await expect(card).toContainText("Ngọc Linh");
    await card.getByRole("button", { name: "Quan tâm", exact: true }).click();
    await page.getByRole("link", { name: "Gửi lời chào đầu tiên" }).click();
    const secret = "Gọi 0901234567 hoặc demo@example.com";
    await page.getByLabel("Nội dung tin nhắn").fill(secret);
    await page
      .getByRole("button", { name: "Gửi tin nhắn", exact: true })
      .click();
    await expect(page.locator(".message").last()).toContainText(
      "[Liên hệ đã che]",
    );
    await expect(page.locator(".message").last()).not.toContainText(
      "0901234567",
    );
    await page.reload();
    await expect(page.locator(".message").last()).not.toContainText(
      "demo@example.com",
    );
    await page
      .getByRole("button", { name: "Chia sẻ liên hệ", exact: true })
      .click();
    await page.getByRole("button", { name: "Xác nhận", exact: true }).click();
    await expect(page.locator(".message").last()).not.toContainText(
      "0901234567",
    );
    await page.getByRole("button", { name: /Vai trò demo:/ }).click();
    await page
      .getByText("Mô phỏng phản hồi chia sẻ liên hệ", { exact: true })
      .click();
    await page
      .getByRole("button", {
        name: "Đối phương đồng ý · Ngọc Linh",
        exact: true,
      })
      .click();
    await page.getByRole("button", { name: "Đóng", exact: true }).click();
    await expect(page.locator(".message").last()).toContainText(secret);
    await page.getByRole("button", { name: "Thu hồi đồng ý" }).click();
    await expect(page.locator(".message").last()).not.toContainText(
      "0901234567",
    );
    await page.screenshot({ path: `test-results/review-chat-${width}.png` });
    await page.getByRole("button", { name: "Chặn", exact: true }).click();
    await page.getByRole("button", { name: "Xác nhận", exact: true }).click();
    await expect(page.getByLabel("Nội dung tin nhắn")).toHaveCount(0);
    await page.goto("/tai-khoan");
    await page
      .getByRole("button", { name: "Xóa dữ liệu tài khoản demo", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Xác nhận xóa dữ liệu tài khoản" })
      .click();
    await expect
      .poll(() => page.evaluate(() => JSON.stringify(localStorage)))
      .not.toContain("0901234567");
  });

test("legacy migration keeps messages and original raw backup, even when backup storage is full", async ({
  page,
}) => {
  const legacy = JSON.parse(JSON.stringify(createInitialState()));
  legacy.status = "active";
  legacy.name = "Tài khoản cũ";
  delete legacy.identity;
  delete legacy.profile.areas;
  delete legacy.profile.commuteSamples;
  legacy.conversations = [
    {
      id: "listing-legacy",
      name: "Chủ tin mẫu",
      avatar: "/images/person-1.jpg",
      type: "listing",
      ended: false,
      messages: [
        {
          id: "old-message",
          mine: false,
          text: "Liên hệ 0901234567",
          time: "09:00",
        },
      ],
    },
  ];
  const raw = JSON.stringify({ version: 2, data: legacy });
  await page.addInitScript((raw) => {
    if (!localStorage.getItem("antro-demo-v2"))
      localStorage.setItem("antro-demo-v2", raw);
    const original = Storage.prototype.setItem;
    Storage.prototype.setItem = function (key, value) {
      if (key === "antro-demo-before-v3")
        throw new DOMException("full", "QuotaExceededError");
      return original.call(this, key, value);
    };
  }, raw);
  await page.goto("/tin-nhan");
  await expect(page.locator(".message").last()).toContainText(
    "[Liên hệ đã che]",
  );
  await expect(page.locator(".message").last()).not.toContainText("0901234567");
  await expect(page.getByRole("status")).toContainText(
    "Không tạo được bản sao lưu",
  );
  await expect
    .poll(() =>
      page.evaluate(
        () => JSON.parse(localStorage.getItem("antro-demo-v2")!).version,
      ),
    )
    .toBe(4);
  const restored = await page.evaluate(
    () => JSON.parse(localStorage.getItem("antro-demo-v2")!).data,
  );
  expect(restored.conversations[0].messages[0].text).toBe("Liên hệ 0901234567");
  expect(restored.name).toBe("Tài khoản cũ");
});
