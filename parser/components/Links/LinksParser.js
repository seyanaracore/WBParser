import UserAgent from "user-agents";
import {
   PAGE_TIMEOUT,
   PRODUCT_ITERATION_DELAY,
} from "../../utils/constants.js";

const newPage = async (url, browser, delay = PRODUCT_ITERATION_DELAY) => {
   if (!url || typeof url !== "string")
      throw new Error("Url was expected as a string");
   if (!delay || typeof delay !== "number")
      throw new Error("Delay was expected as a number");
   if (!browser) throw new Error("Expected browser");

   const page = await browser.newPage();
   await page.setUserAgent(UserAgent.toString());
   await page.setDefaultTimeout(PAGE_TIMEOUT * 1000);
   await page.waitForTimeout(delay * 1000);
   await page.goto(url, { waitUntil: "networkidle2" });

   return page;
};

async function parseProductsLinks(url, browser) {
   const page = await newPage(url, browser, PRODUCT_ITERATION_DELAY);

   const pageLinks = await page.evaluate(() => {
      const goods = document.querySelectorAll(
         ".product-card-list > div.product-card"
      );
      const links = [];
      const errorBlock =
         document.querySelector("#divGoodsNotFoundBackMain") ||
         document.querySelector("#divGoodsNotFound");
      const pageError = !errorBlock?.classList?.contains("hide");

      if (pageError) {
         return null;
      }

      for (let good of goods) {
         const link = good?.childNodes[1]?.childNodes[1]?.href;
         links.push(link);
      }
      return links;
   });

   await page.close();

   return pageLinks;
}

export default parseProductsLinks;
