import Puppeteer from "puppeteer";
import { errorNotify, succesNotify } from "../utils/consoleNotify.js";
import { DELAY_UPPER, MAX_DELAY, PRODUCT_ITERATION_DELAY} from "../utils/constants.js";
import defaultSettings from "../utils/settings.js";
import parseProductsLinks from "./parseProductsLinks.js";

async function getProductsLinksList(dataHandler, settings = {}) {
   const browser = await Puppeteer.launch({
      headless: true,
      defaultViewport: null,
   });
	settings = {...settings, ...defaultSettings}
   let delay = PRODUCT_ITERATION_DELAY;
   const pagesProductsLinks = [];
   const rejectedLinks = [];
	const targetUrl = settings.url.at(-1) === "/" ? settings.url.slice(0, settings.url.length - 1) : settings.url

	//Сбор ссылок на каждой странице
   for (let i = settings.initialIterationPage || 1; i < Infinity; i++) {
      if (//Проверка количества страниц к обработке
         settings.pagesHandlingCount &&
         i === settings.pagesHandlingCount + (settings.initialIterationPage || 1)
      ) {
         break;
      }

      const pageUrl = targetUrl + `?sort=${settings.sorting}&page=${i}`;

      let linksList;
      try {
         linksList = await parseProductsLinks(pageUrl, browser);
      } catch (err) {
         errorNotify(err)
         linksList = [];
      }

      if (!linksList) {
         break; //null - товаров нет и страниц больше тоже
      }

      if (!linksList.length) { //Если пустой массив - страница была откланена
         errorNotify("page:", i, "rejected");
         rejectedLinks.push(pageUrl);
         delay += DELAY_UPPER;
         if (delay > MAX_DELAY) delay = MAX_DELAY;
      } else {
         succesNotify(pageUrl, "page:", i, "products:", linksList.length);
         dataHandler(linksList.map(el => ({url: el})));
         pagesProductsLinks.push(...linksList);
         delay = PRODUCT_ITERATION_DELAY;
      }
   }
	succesNotify(
      "\nSuccesful products links fetched:",
      pagesProductsLinks.length
   );
	errorNotify("Rejected pages:", rejectedLinks.length, "\n");

   await browser.close();
   const productsLinks = [...new Set(pagesProductsLinks)];
   succesNotify("Products list count:", productsLinks.length);
   return {productsLinks, rejectedLinks};
}
export default getProductsLinksList