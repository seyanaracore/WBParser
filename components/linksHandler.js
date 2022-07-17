import chalk from "chalk";
import {
   PAGE_TIMEOUT,
   PRODUCTS_COUNT_PER_PAGE,
   PRODUCTS_PER_PAGE_MAX,
   PRODUCT_ITERATION_DELAY,
} from "../utils/constants";
import { errorNotify, succesNotify } from "../utils/consoleNotify";
import pageHandler from "./pageHandler";
import { validateLinksList } from "./validators";

const DEFAULT_HANDLER_PARAMS = {
   productIteratationDelay: PRODUCT_ITERATION_DELAY,
   pageTimeout: PAGE_TIMEOUT,
   productsPerPageMax: PRODUCTS_PER_PAGE_MAX,
   productsCountPerPage: PRODUCTS_COUNT_PER_PAGE,
   pageWaitUntil: "networkidle2",
};

const checkPageInRange = (i, productsCountPerPage, productsPerPageMax) => {
   const getMin = () =>
      (Math.ceil(i / productsPerPageMax) - 1) * productsPerPageMax;
   const getMax = () =>
      getMin() +
      Math.min(productsCountPerPage || productsPerPageMax, productsPerPageMax);
   return i > getMin() && i <= getMax();
};

const handleParsedData = (productData, dataHandler) => {
   if (!productData) {
      //If returned page rejected
      rejectedProducts.push(url);
      delay += delayUpper;
      if (delay > maxDelay) delay = maxDelay;
      console.error(
         errorNotify(
            "product:",
            i,
            "current page:",
            Math.ceil(i / productsPerPageMax),
            url,
            "rejected"
         )
      );
   } else {
      delay = productIteratationDelay;
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
         Math.ceil(i / productsPerPageMax),
         "seller:",
         productData.sellerName,
      ];

      fetchedData.push(productData);
      succesNotify(pageInfo);
      dataHandler(productData);
   }
};

const getCodeFromUrl = (url) => url.split("/")[4];

async function linksHandler(productsLinks, params = {}, dataHandler) {
   validateLinksList(productsLinks);

   const fetchedData = [];
   const {
      pageTimeout,
      pageWaitUntil,
      productIteratationDelay,
      productsPerPageMax,
      productsCountPerPage,
   } = {
      DEFAULT_HANDLER_PARAMS,
      ...params,
   };

   let delay = productIteratationDelay;
   const browser = await Puppeteer.launch({
      headless: true,
      defaultViewport: null,
   });

   const page = await browser.newPage();
   await page.waitForTimeout(delay * 1000);
   await page.setUserAgent(UserAgent.toString());
   page.setDefaultTimeout(pageTimeout * 1000);

   let i = 1;
   for (const url of productsLinks) {
      //Пропуск уже полученных SKU
      if (
         fetchedData.some((productData) =>
            productData.codes.includes(getCodeFromUrl(url))
         )
      ) {
         continue;
      }
      if (!checkPageInRange(i, productsCountPerPage, productsPerPageMax)) {
         continue;
      }
      await page.goto(url, { waitUntil: pageWaitUntil });

      const productData = pageHandler(page);
      handleParsedData(productData, dataHandler);
      i++;
   }
   page.close();

   await browser.close();

   if (rejectedProducts.length) {
      errorNotify([
         "\n",
         "Rejected product urls count:",
         rejectedProducts.length,
         "\n",
      ]);
   }
   return fetchedData;
}

export default linksHandler;
