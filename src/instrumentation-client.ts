import { applyInitialTheme } from "@/lib/theme";

try {
  applyInitialTheme();
} catch {
  document.documentElement.setAttribute("data-theme", "dark");
}
