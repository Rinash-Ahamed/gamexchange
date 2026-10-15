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

/**
 * Runs inline in <head> before first paint so the correct theme is applied
 * without a flash. A stored choice wins; otherwise local time controls the theme.
 */
export const themeBootScript = `(function(){try{var k="${THEME_KEY}",s=null;try{s=localStorage.getItem(k)}catch(e){}
var h=(new Date()).getHours(),a=(h>=6&&h<18)?"light":"dark",t=(s==="light"||s==="dark")?s:a;
var d=document.documentElement;d.setAttribute("data-theme",t);d.style.colorScheme=t;
var m=document.querySelector('meta[name="theme-color"]');if(m)m.setAttribute("content",t==="light"?"#f3f6fc":"#07090f")}catch(e){document.documentElement.setAttribute("data-theme","dark")}})();`;
