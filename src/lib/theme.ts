export const THEME_KEY = "gx-theme";
export type Theme = "light" | "dark";

/**
 * Runs inline in <head> before first paint so the correct theme is applied
 * without a flash. A stored choice wins; otherwise the system preference is used.
 */
export const themeBootScript = `(function(){try{var k="${THEME_KEY}",s=null;try{s=localStorage.getItem(k)}catch(e){}
var t=(s==="light"||s==="dark")?s:(window.matchMedia("(prefers-color-scheme: light)").matches?"light":"dark");
var d=document.documentElement;d.setAttribute("data-theme",t);d.style.colorScheme=t;
var m=document.querySelector('meta[name="theme-color"]');if(m)m.setAttribute("content",t==="light"?"#f3f6fc":"#07090f")}catch(e){document.documentElement.setAttribute("data-theme","dark")}})();`;
