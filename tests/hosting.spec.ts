import { test, expect } from "@playwright/test";
import { readdir } from "node:fs/promises";
import path from "node:path";

test("production routes support direct entry and refresh, including login alias", async ({
  page,
  request,
}) => {
  const redirect = await request.get("/login?next=%2Froommatch", {
    maxRedirects: 0,
  });
  expect(redirect.status()).toBe(307);
  expect(redirect.headers().location).toBe("/dang-nhap?next=%2Froommatch");
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  const failed: string[] = [];
  page.on("response", (r) => {
    if (r.status() >= 400) failed.push(`${r.status()} ${r.url()}`);
  });
  for (const route of [
    "/roommatch",
    "/login?next=%2Froommatch",
    "/phong/phong-ban-cong",
  ]) {
    const response = await page.goto(route);
    expect(response?.status()).toBe(200);
    await expect(page.locator("main")).toBeVisible();
    if (route.startsWith("/login")) {
      await expect(page).toHaveURL(/\/dang-nhap\?next=%2Froommatch/);
      await expect(
        page.getByRole("heading", { name: "Đăng nhập" }),
      ).toBeVisible();
    }
    if (route.startsWith("/phong"))
      await expect(
        page.getByRole("heading", { name: "Phòng 28 m² có ban công và bếp riêng" }),
      ).toBeVisible();
    expect((await page.reload())?.status()).toBe(200);
    await expect(page.locator("main")).toBeVisible();
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      "content",
      "noindex, nofollow",
    );
    expect(
      await page
        .locator("main img")
        .evaluateAll((imgs) =>
          imgs.every(
            (img) =>
              (img as HTMLImageElement).complete &&
              (img as HTMLImageElement).naturalWidth > 0,
          ),
        ),
    ).toBe(true);
  }
  expect(errors).toEqual([]);
  expect(failed).toEqual([]);
  expect((await request.get("/this-route-does-not-exist")).status()).toBe(404);
});

test("all shipped image assets are served by production with correct MIME types", async ({
  request,
}) => {
  const files = await readdir(path.join(process.cwd(), "public/images"));
  const images = files.filter((f) =>
    /\.(jpg|jpeg|png|webp|svg|avif)$/i.test(f),
  );
  expect(images.length).toBeGreaterThan(0);
  for (const file of images) {
    const response = await request.get("/images/" + encodeURIComponent(file));
    expect(response.status(), file).toBe(200);
    expect(response.headers()["content-type"], file).toMatch(/^image\//);
    expect((await response.body()).byteLength, file).toBeGreaterThan(0);
  }
});
