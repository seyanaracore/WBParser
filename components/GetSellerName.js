import settings from "../utils/settings.js";

export default () => settings.url.split("seller/")[1]?.split("/")[0]?.split("?")[0] ||
   settings.url.split("brands/")[1]?.split("/")[0]?.split("?")[0] ||
   "WBGlobal";
