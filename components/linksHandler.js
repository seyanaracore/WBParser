import {
   DELAY_UPPER,
   MAX_DELAY,
   PAGE_TIMEOUT,
   PRODUCTS_COUNT_PER_PAGE,
   PRODUCTS_PER_PAGE_MAX,
   PRODUCT_ITERATION_DELAY,
} from "../utils/constants";
import { errorNotify, succesNotify } from "../utils/consoleNotify";
import pageHandler from "./pageHandler";
import { validateLinksList } from "./validators";

const checkPageInRange = (i, productsCountPerPage, productsPerPageMax) => {
   const getMin = () =>
      (Math.ceil(i / productsPerPageMax) - 1) * productsPerPageMax;
   const getMax = () =>
      getMin() +
      Math.min(productsCountPerPage || productsPerPageMax, productsPerPageMax);
   return i > getMin() && i <= getMax();
};

const getCodeFromUrl = (url) => url.split("/")[4];

async function linksHandler(productsLinks, dataHandler) {
   validateLinksList(productsLinks);
   if(!dataHandler) throw new Error("Excepted data handler")
   const productsData = [];

   let delay = PRODUCT_ITERATION_DELAY;
   const browser = await Puppeteer.launch({
      headless: true,
      defaultViewport: null,
   });

   const page = await browser.newPage();
   await page.waitForTimeout(delay * 1000);
   await page.setUserAgent(UserAgent.toString());
   page.setDefaultTimeout(PAGE_TIMEOUT * 1000);

   let i = 1;
   for (const url of productsLinks) {
      //Пропуск уже полученных SKU
      if (
         productsData.some((productData) =>
            productData.codes.includes(getCodeFromUrl(url))
         )
      ) {
         continue;
      }
      //Проверка вхождения страницы в допустимый диапазон
      if (!checkPageInRange(i, PRODUCTS_COUNT_PER_PAGE, PRODUCTS_PER_PAGE_MAX)) {
         continue;
      }
      await page.goto(url, { waitUntil: "networkidle2" });

      const productData = pageHandler(page);
      
      if (!productData) {
         //If returned page rejected
         rejectedProducts.push(url);
         delay += DELAY_UPPER;
         if (delay > MAX_DELAY) delay = MAX_DELAY;
         console.error(
            errorNotify(
               "product:",
               i,
               "current page:",
               Math.ceil(i / PRODUCTS_PER_PAGE_MAX),
               url,
               "rejected"
            )
         );
      } else {
         delay = PRODUCT_ITERATION_DELAY;
         const pageInfo = [
            "codes:",
            productData.codes.length,
            "images:",
            productData.images.length,
            "product:",
            i,
            "of",
            productsLinks.length,
            "current page:",
            Math.ceil(i / PRODUCTS_PER_PAGE_MAX),
            "seller:",
            productData.sellerName,
         ];
   
         productsData.push(productData);
         succesNotify(...pageInfo);
         dataHandler(productData);
      }

      i++;
   }
   page.close();

   await browser.close();

   if (rejectedProducts.length) {
      errorNotify(
         "\n",
         "Rejected product urls count:",
         rejectedProducts.length,
         "\n"
      );
   }
   return {rejectedProducts, productsData};
}

export default linksHandler;
