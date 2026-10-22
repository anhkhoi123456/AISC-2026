import { test, expect } from "@playwright/test";
import { finishDemoLogin, switchActor } from "./helpers";
for (const width of [390, 1440])
  test(`3.0 journey ${width}: agreement, handover, frozen price, bill, exit, review and relist`, async ({
    page,
  }) => {
    test.setTimeout(180000);
    page.setDefaultTimeout(15000);
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/dang-nhap");
    await finishDemoLogin(page);
    await page.goto("/phong/phong-ban-cong");
    await page.getByText("Xem thông tin thuê", { exact: true }).click();
    await page
      .getByRole("button", { name: "Tạo yêu cầu thuê", exact: true })
      .click();
    await page.getByRole("link", { name: "Xem yêu cầu thuê" }).click();
    const picker = page.getByRole("combobox", { name: "Chọn lượt thuê" });
    const id = await picker
      .locator("option")
      .filter({ hasText: "Minh Anh" })
      .first()
      .getAttribute("value");
    await picker.selectOption(id!);
    const card = page.locator(".stay-card");
    await expect(card).toContainText("Chờ thống nhất thuê");
    await switchActor(page, "Người đăng mẫu");
    await card
      .getByRole("button", { name: "Đồng ý thông tin thuê", exact: true })
      .click();
    await expect(card).toContainText("Chờ nhận phòng");
    await card
      .getByRole("button", { name: "Xác nhận bàn giao nhận phòng" })
      .click();
    await switchActor(page, "Người thuê mẫu");
    await card
      .getByRole("button", { name: "Xác nhận bàn giao nhận phòng" })
      .click();
    await expect(
      card.getByRole("button", { name: "Xin phép tìm roommate" }),
    ).toBeDisabled();
    await expect(card).toContainText("2/2 người đã ghi nhận");
    await page.reload();
    await picker.selectOption(id!);
    await expect(card).toContainText("Đang ở");
    await switchActor(page, "Người đăng mẫu");
    await card.getByText("Lập bảng phí kỳ thuê", { exact: true }).click();
    await card.getByRole("button", { name: "Lập bảng phí" }).click();
    await expect(card).toContainText("Chi phí tháng 2026-11: 2.040.000đ");
    await card
      .getByText("Đề xuất thay đổi cho lượt ở hiện tại", { exact: true })
      .click();
    await card
      .getByLabel("Lý do thay đổi", { exact: true })
      .fill("Đề xuất giá kỳ tiếp theo để đối chiếu mẫu");
    await card.getByRole("button", { name: "Gửi đề xuất thay đổi" }).click();
    await switchActor(page, "Người thuê mẫu");
    await page.goto("/thong-bao");
    await page.getByRole("button", { name: "Đánh dấu đã đọc" }).first().click();
    await page.goto("/noi-o");
    await picker.selectOption(id!);
    await expect(card).toContainText("Giá đã ghi nhận: 3.200.000đ");
    await expect(card).toContainText("Chưa đồng ý");
    await card
      .getByRole("button", { name: "Không đồng ý đề xuất", exact: true })
      .click();
    await card
      .getByRole("button", { name: "Khai đã thanh toán", exact: true })
      .first()
      .click();
    await expect(card).toContainText("Người thuê khai đã trả");
    await switchActor(page, "Người đăng mẫu");
    await card
      .getByRole("button", { name: "Xác nhận đã nhận tiền", exact: true })
      .click();
    await expect(card).toContainText("Người nhận xác nhận");
    await switchActor(page, "Người thuê mẫu");
    await card.getByText("Yêu cầu rời phòng", { exact: true }).click();
    await card.getByLabel("Ngày rời dự kiến").fill("2026-12-01");
    await card
      .getByLabel("Lý do trả phòng")
      .fill("Kết thúc học kỳ mẫu, bàn giao lại phòng");
    await card.getByRole("button", { name: "Gửi yêu cầu rời phòng" }).click();
    await switchActor(page, "Người đăng mẫu");
    await card
      .getByRole("button", { name: "Xác nhận đã bàn giao trả phòng" })
      .click();
    await expect(card).toContainText("Đã kết thúc");
    await switchActor(page, "Người thuê mẫu");
    await card
      .getByLabel("Nhận xét", { exact: true })
      .fill(
        "Chi phí mẫu rõ, bàn giao được hai phía xác nhận và lịch sử vẫn còn.",
      );
    await card
      .getByRole("button", { name: "Gửi đánh giá", exact: true })
      .click();
    await expect(
      card.getByRole("button", { name: "Cập nhật đánh giá", exact: true }),
    ).toBeVisible();
    await page.goto("/phong/phong-ban-cong");
    await expect(
      page.getByText(
        "Chi phí mẫu rõ, bàn giao được hai phía xác nhận và lịch sử vẫn còn.",
        { exact: true },
      ),
    ).toBeVisible();
    await page.goto("/noi-o");
    await switchActor(page, "Người đăng mẫu");
    await page.goto("/quan-ly-tin");
    await page.locator(".room-management > summary").click();
    const room = page
      .locator(".room-management section")
      .filter({ hasText: "Mã phòng phong-ban-cong" });
    await room
      .getByRole("button", { name: "Đăng lại phòng này", exact: true })
      .click();
    await expect(
      page.locator(".manage-card").filter({ hasText: "Bản nháp" }),
    ).toHaveCount(1);
    await page.reload();
    const draft = page
      .locator(".manage-card")
      .filter({ hasText: "Phòng 28 m² có ban công và bếp riêng" })
      .filter({ hasText: "Bản nháp" });
    await expect(draft).toHaveCount(1);
    await draft.getByRole("button", { name: /^Gửi duyệt/ }).click();
    await expect(draft).toHaveCount(0);
    await expect(
      page
        .locator(".manage-card")
        .filter({ hasText: "Phòng 28 m² có ban công và bếp riêng" })
        .filter({ hasText: "Chờ duyệt" }),
    ).toHaveCount(1);
    await page.goto("/admin");
    await switchActor(page, "Admin mẫu");
    await page.getByRole("button", { name: "Mở bảng vận hành demo" }).click();
    const row = page
      .locator(".table-row")
      .filter({ hasText: "Phòng 28 m² có ban công và bếp riêng" });
    await row.getByRole("button", { name: "Duyệt", exact: true }).click();
    await page
      .getByLabel("Lý do quyết định")
      .fill("Đã đối chiếu phòng mẫu và thông tin đợt tuyển mới.");
    await page
      .getByRole("button", { name: "Lưu quyết định", exact: true })
      .click();
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await page.goto("/tim-phong");
    await page
      .locator(".room-card h3")
      .getByRole("link", {
        name: "Phòng 28 m² có ban công và bếp riêng",
        exact: true,
      })
      .click();
    await expect(
      page.getByText(
        "Chi phí mẫu rõ, bàn giao được hai phía xác nhận và lịch sử vẫn còn.",
        { exact: true },
      ),
    ).toBeVisible();
    await expect(page.getByText(/2 đợt đăng/)).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({
      path: `test-results/antro3-relisted-${width}.png`,
      fullPage: true,
    });
    expect(errors).toEqual([]);
  });
test("3.0 mobile dark: permission before recruiting, cash deposit and Admin dispute resolution", async ({
  page,
}) => {
  test.setTimeout(180000);
  page.setDefaultTimeout(15000);
  await page.setViewportSize({ width: 390, height: 900 });
  await page.addInitScript(() => localStorage.setItem("antro-theme", "dark"));
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/dang-nhap");
  await finishDemoLogin(page);
  await page.goto("/phong/studio-cua-so");
  await page.getByText("Xem thông tin thuê", { exact: true }).click();
  await page
    .getByRole("button", { name: "Tạo yêu cầu thuê", exact: true })
    .click();
  await page.getByRole("link", { name: "Xem yêu cầu thuê" }).click();
  const picker = page.getByRole("combobox", { name: "Chọn lượt thuê" }),
    id = await picker
      .locator("option")
      .filter({ hasText: "Minh Anh" })
      .first()
      .getAttribute("value");
  await picker.selectOption(id!);
  const card = page.locator(".stay-card");
  await switchActor(page, "Người đăng mẫu");
  await card
    .getByRole("button", { name: "Đồng ý thông tin thuê", exact: true })
    .click();
  await card
    .getByRole("button", { name: "Xác nhận bàn giao nhận phòng" })
    .click();
  await switchActor(page, "Người thuê mẫu");
  await card
    .getByRole("button", { name: "Xác nhận bàn giao nhận phòng" })
    .click();
  await expect(card).toContainText("1/2 người đã ghi nhận");
  await expect(card).toContainText(
    "Chưa đủ điều kiện hoặc chưa được phép tuyển thêm",
  );
  await card.getByRole("button", { name: "Xin phép tìm roommate" }).click();
  await switchActor(page, "Người đăng mẫu");
  await card.getByRole("button", { name: "Cho phép tuyển roommate" }).click();
  await expect(card).toContainText("Được phép mở tìm trong phạm vi chỗ trống");
  await switchActor(page, "Người thuê mẫu");
  await card
    .getByRole("combobox", { name: "Phương thức thanh toán" })
    .selectOption("Tiền mặt mẫu");
  await card
    .getByRole("button", { name: "Khai đã thanh toán", exact: true })
    .click();
  await switchActor(page, "Người đăng mẫu");
  await card
    .getByRole("button", { name: "Xác nhận đã nhận tiền", exact: true })
    .click();
  await expect(card).toContainText("Người nhận xác nhận");
  await switchActor(page, "Người thuê mẫu");
  await card.getByText("Yêu cầu rời phòng", { exact: true }).click();
  await card.getByLabel("Ngày rời dự kiến").fill("2026-12-01");
  await card
    .getByLabel("Lý do trả phòng")
    .fill("Kết thúc lượt thuê mẫu và đối chiếu cọc");
  await card.getByRole("button", { name: "Gửi yêu cầu rời phòng" }).click();
  await switchActor(page, "Người đăng mẫu");
  await card
    .getByRole("button", { name: "Xác nhận đã bàn giao trả phòng" })
    .click();
  await card.getByLabel("Khấu trừ cọc (VNĐ)").fill("100000");
  await card
    .getByLabel("Lý do đối chiếu cọc")
    .fill("Vệ sinh theo biên bản mẫu, chờ người thuê phản hồi");
  await card.getByRole("button", { name: "Gửi đối chiếu cọc" }).click();
  await switchActor(page, "Người thuê mẫu");
  await card.getByRole("button", { name: "Chưa đồng ý khoản cọc" }).click();
  await card.getByText("Yêu cầu xem xét", { exact: true }).click();
  await card.getByLabel("Loại yêu cầu").selectOption("deposit");
  await card
    .getByLabel("Thông tin và bằng chứng")
    .fill(
      "Biên bản mẫu ghi phòng bàn giao sạch; xin đối chiếu khoản khấu trừ.",
    );
  await card
    .getByRole("button", { name: "Gửi yêu cầu xem xét", exact: true })
    .click();
  await expect(page.locator(".case-card")).toContainText("Đã tiếp nhận");
  await switchActor(page, "Admin mẫu");
  await page.goto("/admin");
  await page.getByRole("button", { name: "Mở bảng vận hành demo" }).click();
  const caseCard = page.locator(".housing-admin .case-card");
  await caseCard.getByLabel("Kết luận").selectOption("accepted");
  await caseCard.getByLabel("Khấu trừ cuối cùng (VNĐ)").fill("0");
  await caseCard
    .getByLabel("Lý do và căn cứ quyết định")
    .fill("Đối chiếu bằng chứng mẫu, không có căn cứ khấu trừ.");
  await caseCard
    .getByRole("button", { name: "Lưu quyết định vụ việc" })
    .click();
  await expect(
    caseCard.getByRole("heading", {
      name: "Tiền cọc · Có căn cứ",
      exact: true,
    }),
  ).toBeVisible();
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({
    path: "test-results/antro3-admin-dark-mobile.png",
    fullPage: true,
  });
  await page.goto("/noi-o");
  await switchActor(page, "Người đăng mẫu");
  await picker.selectOption(id!);
  await card.getByRole("button", { name: "Khai đã hoàn cọc" }).click();
  await switchActor(page, "Người thuê mẫu");
  await card.getByRole("button", { name: "Xác nhận đã nhận lại cọc" }).click();
  await expect(card).toContainText("Người thuê xác nhận đã nhận");
  await page.reload();
  await picker.selectOption(id!);
  await expect(card).toContainText("Người thuê xác nhận đã nhận");
  await expect(
    card.getByRole("button", { name: "Gửi đánh giá", exact: true }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({
    path: "test-results/antro3-deposit-dark-mobile.png",
    fullPage: true,
  });
  expect(errors).toEqual([]);
});

test("3.0 Admin sample destination edits persist and update listing distances", async ({
  page,
}) => {
  await page.goto("/dang-nhap");
  await finishDemoLogin(page);
  await page.goto("/admin");
  await switchActor(page, "Admin mẫu");
  await page.getByRole("button", { name: "Mở bảng vận hành demo" }).click();
  await page.getByText("Quản lý điểm đến mẫu", { exact: true }).click();
  await page.getByLabel("Vĩ độ điểm đến mẫu").fill("30");
  await page
    .getByRole("button", { name: "Lưu điểm đến mẫu", exact: true })
    .click();
  await expect(
    page.getByRole("status").filter({ hasText: "Đã lưu điểm đến mẫu" }),
  ).toBeVisible();
  await page.reload();
  await page.getByRole("button", { name: "Mở bảng vận hành demo" }).click();
  await page.getByText("Quản lý điểm đến mẫu", { exact: true }).click();
  await expect(page.getByLabel("Vĩ độ điểm đến mẫu")).toHaveValue("30");
  await page.goto("/phong/phong-ban-cong");
  await expect(
    page.locator("li").filter({ hasText: "Đại học Công nghệ Thông tin:" }),
  ).toContainText(/2\d{3}\.\d{2} km/);
  await page.goto(
    "/tim-phong?destinations=" +
      encodeURIComponent(
        JSON.stringify([{ placeId: "uit", radiusKm: 2, mode: "must" }]),
      ),
  );
  await expect(
    page.getByText("Cần cân nhắc thêm", { exact: false }),
  ).toBeVisible();
});
