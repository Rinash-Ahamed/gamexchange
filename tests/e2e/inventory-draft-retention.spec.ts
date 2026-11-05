import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";

// Source guards supplement authenticated browser fault injection, not replace it.
test("inventory create/edit return save failures instead of navigating away", () => {
  const source = readFileSync("src/app/admin/actions.ts", "utf8");
  const create = source.slice(source.indexOf("export async function createInventoryAction"), source.indexOf("export async function updateInventoryAction"));
  const update = source.slice(source.indexOf("export async function updateInventoryAction"), source.indexOf("export async function deleteInventoryAction"));
  for (const action of [create, update]) {
    expect(action).toContain("await getAdminSession()");
    expect(action).toContain("if (!actor) return { error:");
    expect(action.indexOf("if (!actor)")).toBeLessThan(action.indexOf("await prepareInventoryGallery"));
    expect(action).toContain("return { error: inventoryErrors");
    expect(action).toContain("await cleanRejectedUploads(error, uploaded)");
    expect(action).toContain("return { redirectTo:");
    expect(action).not.toContain("redirect(");
  }
});

test("preserved forms capture files before disabling fields and never reset on returned failure", () => {
  const form = readFileSync("src/components/admin/ConfirmSubmit.tsx", "utf8");
  expect(form).toContain("if (preserveOnError)");
  expect(form).toContain("event.preventDefault()");
  expect(form.indexOf("new FormData(event.currentTarget)")).toBeLessThan(form.indexOf("startTransition(async"));
  expect(form).toContain("await submitAction(data)");
  expect(form).toContain("setFailure({ message: result.error })");
  expect(form).toContain("router.push(result.redirectTo)");
  expect(form).not.toContain(".reset()");
  expect(form).toContain("if (saving.current)");
  expect(form).toContain("AdminPendingContext.Provider value={pending}");
  const page = readFileSync("src/app/admin/(protected)/inventory/page.tsx", "utf8");
  expect(page).toContain("preserveOnError submitAction={createInventoryAction}");
  expect(page).toContain("preserveOnError submitAction={updateInventoryAction}");
  expect(page).not.toContain("preserveOnError submitAction={deleteInventoryAction}");
});
