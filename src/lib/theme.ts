export const THEME_KEY = "gx-theme";
export type Theme = "light" | "dark";

export function scheduledTheme(date = new Date()): Theme {
  const hour = date.getHours();
  return hour >= 6 && hour < 18 ? "light" : "dark";
}

export function millisecondsUntilThemeBoundary(date = new Date()) {
  const next = new Date(date);
  const hour = date.getHours();

  if (hour < 6) {
    next.setHours(6, 0, 0, 0);
  } else if (hour < 18) {
    next.setHours(18, 0, 0, 0);
  } else {
    next.setDate(next.getDate() + 1);
    next.setHours(6, 0, 0, 0);
  }

  return Math.max(0, next.getTime() - date.getTime());
}

/** Applies the stored preference or local-time schedule before React hydration. */
export function applyInitialTheme() {
  let stored: string | null = null;
  try {
    stored = localStorage.getItem(THEME_KEY);
  } catch {
    // The schedule remains available when browser storage is blocked.
  }

  const theme = stored === "light" || stored === "dark" ? stored : scheduledTheme();
  const root = document.documentElement;
  root.setAttribute("data-theme", theme);
  root.style.colorScheme = theme;
  document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')
    ?.setAttribute("content", theme === "light" ? "#f3f6fc" : "#07090f");
}
