import Puppeteer from "puppeteer";
import UserAgent from "user-agents";
import { errorNotify, succesNotify } from "../utils/consoleNotify.js";
import {
   DELAY_UPPER,
   MAX_DELAY,
   PAGE_TIMEOUT,
   PRODUCTS_PER_PAGE_MAX,
   PRODUCT_ITERATION_DELAY,
} from "../utils/constants.js";
import log from "../utils/logWriter.js";
import settings from "../utils/settings.js";
import pageHandler from "./pageHandler.js";
import { validateLinksList } from "./validators.js";

const checkPageInRange = (i, productsCountPerPage, productsPerPageMax) => {
   const getMin = () =>
      (Math.ceil(i / productsPerPageMax) - 1) * productsPerPageMax;
   const getMax = () =>
      getMin() +
      Math.min(productsCountPerPage || productsPerPageMax, productsPerPageMax);
   return i > getMin() && i <= getMax();
};

const getCodeFromUrl = (url) => url.split("/")[4];

const isParsedCode = (productsData, url) => {
   return productsData.find((product) => {
      const productCode = getCodeFromUrl(url);
      const isMatch = product.codes.includes(productCode);
      log(
         `[isPardedCode]: product code - ${productCode} / isMatch - ${isMatch}`
      );
      return isMatch;
   });
};

async function linksHandler(productsLinks, dataHandler) {
   validateLinksList(productsLinks);
   if (!dataHandler) throw new Error("Excepted data handler");
   const productsData = [];
   const rejectedProducts = [];

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
      if (isParsedCode(productsData, url)) {
         continue;
      }
      //Проверка вхождения страницы в допустимый диапазон
      if (
         !checkPageInRange(
            i,
            settings.productsCountPerPage,
            PRODUCTS_PER_PAGE_MAX
         )
      ) {
         continue;
      }
      await page.goto(url, { waitUntil: "networkidle2" });

      const productData = await pageHandler(page);

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
   return { productsData, rejectedProducts };
}

export default linksHandler;
