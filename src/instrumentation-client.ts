import { applyInitialBootState } from "@/lib/boot-screen";
import { applyInitialTheme } from "@/lib/theme";

try {
  applyInitialTheme();
  applyInitialBootState();
} catch {
  document.documentElement.setAttribute("data-theme", "dark");
}
