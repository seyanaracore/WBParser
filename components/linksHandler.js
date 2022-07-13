import chalk from "chalk";
import { PRODUCT_ITERATION_DELAY } from "../utils/constants";
import filterProductsLinks from "./linksFilter";
import { validateLinksList } from "./validators";

async function linksHandler(
   productsLinks,
   delay = PRODUCT_ITERATION_DELAY,
   dataHandler
) {
   validateLinksList(productsLinks);

   const browser = await Puppeteer.launch({
      headless: true,
      defaultViewport: null,
   });

   for (let i = 1; i <= urls.length; i++) {
      let url = productsLinks[i - 1];
      if (fetchedData.some((productData) => productData.codes.includes(url))) {
         continue;
      }
      const getMin = () =>
         (Math.ceil(i / productsPerPageMax) - 1) * productsPerPageMax;
      const getMax = () =>
         getMin() +
         Math.min(
            productsCountPerPage || productsPerPageMax,
            productsPerPageMax
         );
      if (!(i > getMin() && i <= getMax())) {
         continue;
      }
      const page = await browser.newPage();
      await page.waitForTimeout((delay - 1) * 1000);
      await page.setUserAgent(UserAgent.toString());
      page.setDefaultTimeout(pageTimeout * 1000);
      await page.goto(url, { waitUntil: "networkidle2" });
      const productData = await page.evaluate(async () => {
         window.productData = {
            codes: [],
            images: [],
            sellerName: "",
         };

         document
            .querySelectorAll(".swiper-wrapper > li > a.img-plug")
            .forEach((link) => {
               if (link?.href) {
                  window.productData.codes.push(link.href);
                  let imageSrc = link.childNodes[1].src;
                  imageSrc = imageSrc.replace(imageSrc.split("/")[3], "big");
                  let imageFormat =
                     imageSrc.split(".")[imageSrc.split(".").length - 1];
                  imageSrc = imageSrc.replace(imageFormat, "jpg");
                  window.productData.images.push(imageSrc);
               }
            });

         window.productData.sellerName =
            document.querySelector(".seller-info__name")?.textContent || "none";
         return window.productData.codes.length ? window.productData : null;
      });
      if (!productData) {
         rejectedProducts.push(url);
         delay += delayUpper;
         if (delay > maxDelay) delay = maxDelay;
         console.error(
            "product:",
            i,
            "current page:",
            Math.ceil(i / productsPerPageMax),
            url,
            "rejected"
         );
      } else {
         delay = productIteratationDelay;
         fetchedData.push(productData);
         console.log(
            "codes:",
            productData.codes.length,
            "images:",
            productData.images.length,
            "product:",
            i,
            "of",
            urls.length,
            "current page:",
            Math.ceil(i / productsPerPageMax),
            "seller:",
            productData.sellerName
         );
         if (productData.codes.length) {
            fileStream.writeData(productData);
         } else {
            console.log(urls[i - 1]);
         }
      }
      page.close();
   }

   await browser.close();

   if (rejectedProducts.length) {
      console.error(
         chalk.red(
            "\n" + "Rejected product urls count:",
            rejectedProducts.length
         )
      );
   }
   return fetchedData;
}

export default linksHandler;
