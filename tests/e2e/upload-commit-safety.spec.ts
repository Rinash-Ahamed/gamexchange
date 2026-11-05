import { readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";

// Source guards supplement, but do not replace staging fault injection after a committed write.
test("ambiguous image saves retain uploads instead of deleting potentially referenced objects", () => {
  const banners = readFileSync("src/lib/admin/banners.ts", "utf8");
  const franchise = readFileSync("src/lib/admin/franchise.ts", "utf8");
  const homepage = readFileSync("src/lib/admin/homepage-images.ts", "utf8");
  expect(banners).toContain("uploaded && error instanceof BannerError");
  expect(franchise).toContain("error instanceof FranchiseSaveRejected");
  expect(homepage).not.toContain("await removeAsset(uploaded?.path)");
  for (const source of [banners, franchise, homepage]) expect(source).toContain("uploaded image retained for review");
});
