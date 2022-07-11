import Puppeteer from "puppeteer";
import UserAgent from "user-agents";
import settings from "./components/settings.js";
import FileStream from "./utils/WriteData.js";
import * as os from "os";
import getSellerFetchedProducts from "./utils/getSellerFetchedProducts.js";

async function fetchProductsLinks(
   url,
   delay = productIteratationDelay,
   browser
) {
   const page = await browser.newPage();
   await page.setUserAgent(UserAgent.toString());
   await page.setDefaultTimeout(pageTimeout * 1000);
   await page.waitForTimeout(delay * 1000);
   await page.goto(url, { waitUntil: "networkidle2" });
   let pageLinks = await page.evaluate(() => {
      const goods = document.querySelectorAll(
         ".product-card-list > div.product-card"
      );
      const links = [];
      const errorBlock = document.querySelector("#divGoodsNotFound");
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

async function fetchProductsDataOnPage(
   productsLinks,
   delay = productIteratationDelay,
   fileStream
) {
   const browser = await Puppeteer.launch({
      headless: true,
      defaultViewport: null,
   });
   const urls = Array.isArray(productsLinks)
      ? checkProductsLinks(productsLinks).filter((url) => url)
      : [productsLinks];
   if (!urls.length) {
      await browser.close();
      return fetchedData;
   }
   for (let i = 1; i <= urls.length; i++) {
      let url = urls[i - 1];
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
            document.querySelector(".seller-info__name")?.textContent ||
            "none";
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
   console.error(
      "\n" + "Rejected product urls count:",
      rejectedProducts.length
   );
   return fetchedData;
}

function checkProductsLinks(pageLinks) {
   const checkedProductsCodes = getSellerFetchedProducts(
      sellerName,
      productsDataParams.path
   );
   pageLinks = [...new Set(pageLinks)];
   let checkedLinks = pageLinks
      .filter((productLink) => {
         return !checkedProductsCodes.includes(productLink);
      })
      .filter((link) => link);
   console.log("New products for fetch:", checkedLinks.length, "\n");
   return checkedLinks;
}

async function getProductsLinksList(sellerUrl, fileStream) {
   const browser = await Puppeteer.launch({
      headless: true,
      defaultViewport: null,
   });
   let delay = productIteratationDelay;
   const pagesProductsLinks = [];
   const rejectedLinks = [];
   for (let i = initialIterationPage || 1; i < 999; i++) {
      if (
         pagesHandlingCount &&
         i === pagesHandlingCount + (initialIterationPage || 1)
      ) {
         break;
      }
      if (sellerUrl.at(-1) === "/")
         sellerUrl = sellerUrl.slice(0, sellerUrl.length - 1);
      let pageUrl = sellerUrl + `?sort=${sortingTypes[sortBy]}&page=${i}`;
      let linksList;
      try {
         linksList = await fetchProductsLinks(pageUrl, delay, browser);
      } catch (err) {
         console.log(err);
         linksList = [];
      }
      if (!linksList) {
         break;
      }
      if (!linksList.length) {
         console.error("page:", i, "rejected");
         rejectedLinks.push({ pageUrl, i });
         delay += delayUpper;
         if (delay > maxDelay) delay = maxDelay;
      } else {
         console.log(pageUrl, "page:", i, "products:", linksList.length);
         fileStream.writeData(linksList);
         pagesProductsLinks.push(...linksList);
         delay = productIteratationDelay;
      }
   }
   console.log(
      "\nSuccesful products links fetched:",
      pagesProductsLinks.length
   );
   console.error("Rejected links:", rejectedLinks.length, "\n");
   while (rejectedLinks.length) {
      let pageUrl = rejectedLinks[0].pageUrl;
      let linksList;
      try {
         linksList = await fetchProductsLinks(pageUrl, delay, browser);
      } catch (err) {
         console.log(err);
         linksList = [];
      }
      if (!linksList) {
         break;
      }
      if (linksList.length) {
         console.error(
            rejectedLinks[0].pageUrl,
            "page:",
            rejectedLinks[0].i,
            "products:",
            linksList.length,
            "rejected link"
         );
         fileStream.writeData(linksList);
         rejectedLinks.shift();
         pagesProductsLinks.push(...linksList);
         delay = productIteratationDelay;
      } else {
         delay += delayUpper;
         if (delay > maxDelay) delay = maxDelay;
      }
   }
   await browser.close();
   const productsLinks = [...new Set(pagesProductsLinks)];
   console.log("Products list count:", productsLinks.length);
   return productsLinks;
}

async function retryFetchRejectedProducts(fileStream) {
   const getRejectedLength = () => rejectedProducts.length
   if (!getRejectedLength()) return;
   console.log("\n" + "fetch rejected products links start" + "\n");
   while (getRejectedLength()) {
      let delay = productIteratationDelay;
      await fetchProductsDataOnPage(rejectedProducts[0], delay, fileStream);
      rejectedProducts.shift();
      delay += delayUpper;
      if (delay > maxDelay) delay = maxDelay;
   }
}
function openStreams(sellerName) {
   const productsDataStream = new FileStream(
      sellerName,
      productsDataParams.path,
      productsDataParams.fileFormat,
      productsDataParams.dataHandler,
      productsDataParams.initialValue
   );
   const productsLinksStream = new FileStream(
      sellerName,
      productsLinksParams.path,
      productsLinksParams.fileFormat,
      productsLinksParams.dataHandler
   );
   return { productsDataStream, productsLinksStream };
}
function closeStreams(streams) {
   streams.forEach((stream) => stream.closeStream());
}

//______________________________________________________________________________
const {
   sellerUrl,
   productIteratationDelay,
   productsCountPerPage,
   pagesHandlingCount,
   initialIterationPage,
   maxDelay,
   productsPerPageMax,
   delayUpper,
   sortBy,
   pageTimeout,
   sortingTypes,
} = settings;
let parseSuccesful = false;
let productsLinksList = false;
const sellerName =
   settings.sellerUrl.split("seller/")[1]?.split("/")[0]?.split("?")[0] ||
   sellerUrl.split("brands/")[1]?.split("/")[0]?.split("?")[0] ||
   "WBGlobal";
const fetchedData = [];
const rejectedProducts = [];
const productsDataParams = {
   path: "./out/",
   fileFormat: ".csv",
   initialValue: "sep=," + os.EOL + "Photos,Urls,Images,SellerName" + os.EOL,
   dataHandler: (product) => {
      let handledData = "";
      for (let i = 0; i < product.codes.length; i++) {
         handledData += `,${product.codes[i]},${product.images[i]},${product.sellerName}${os.EOL}`;
      }
      return handledData;
   },
};
const productsLinksParams = {
   path: "./out/_links/",
   fileFormat: ".txt",
   dataHandler: (productLinks) => {
      let handledLinks = "";
      productLinks.forEach((link) => (handledLinks += link + os.EOL));
      return handledLinks;
   },
};
//_____________________________________________________________________________
const startParse = async () => {
   const { productsDataStream, productsLinksStream } = openStreams(sellerName);
   try {
      if (!productsLinksList) {
         productsLinksList = await getProductsLinksList(
            sellerUrl,
            productsLinksStream
         );
      }
      await fetchProductsDataOnPage(
         productsLinksList,
         productIteratationDelay,
         productsDataStream
      );
      await retryFetchRejectedProducts(productsDataStream);
      closeStreams([productsDataStream, productsLinksStream]);
      console.log("\n" + "Finished");
      parseSuccesful = true;
   } catch (err) {
      console.error(err);
   }
};
//________________________________
while (!parseSuccesful) {
   await startParse();
}
