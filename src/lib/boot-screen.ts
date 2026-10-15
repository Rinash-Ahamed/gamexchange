export const BOOT_SCREEN_KEY = "gx-boot-seen";

/** Runs before paint so returning visitors in the same browser session never see a loader flash. */
export const bootScreenScript = `(function(){try{if(sessionStorage.getItem("${BOOT_SCREEN_KEY}")==="1")document.documentElement.classList.add("boot-seen")}catch(e){}})();`;
