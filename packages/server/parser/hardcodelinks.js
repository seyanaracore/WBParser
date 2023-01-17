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
            soldQuantity: "none",
            price: "none",
         };

         document
            .querySelectorAll(".swiper-wrapper > li.active > a.img-plug")
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
         window.productData.price = parseInt(
            document.querySelector(".price-block__final-price")?.textContent.replace(/\s+/g,"") ||
               0
         );
         window.productData.soldQuantity =
            document
               .querySelector(".product-order-quantity > span")
               ?.textContent.trim() || "none";
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
   const getRejectedLength = () => rejectedProducts.length;
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
let productsLinksList = ['https://www.wildberries.ru/catalog/90575876/detail.aspx',
'https://www.wildberries.ru/catalog/90576806/detail.aspx',
'https://www.wildberries.ru/catalog/90575877/detail.aspx',
'https://www.wildberries.ru/catalog/90575909/detail.aspx',
'https://www.wildberries.ru/catalog/90576807/detail.aspx',
'https://www.wildberries.ru/catalog/110124209/detail.aspx',
'https://www.wildberries.ru/catalog/70326756/detail.aspx',
'https://www.wildberries.ru/catalog/70326757/detail.aspx',
'https://www.wildberries.ru/catalog/78592474/detail.aspx',
'https://www.wildberries.ru/catalog/79703289/detail.aspx',
'https://www.wildberries.ru/catalog/79712310/detail.aspx',
'https://www.wildberries.ru/catalog/79714212/detail.aspx',
'https://www.wildberries.ru/catalog/79714213/detail.aspx',
'https://www.wildberries.ru/catalog/79714214/detail.aspx',
'https://www.wildberries.ru/catalog/79715857/detail.aspx',
'https://www.wildberries.ru/catalog/79717270/detail.aspx',
'https://www.wildberries.ru/catalog/79717271/detail.aspx',
'https://www.wildberries.ru/catalog/79717272/detail.aspx',
'https://www.wildberries.ru/catalog/79718333/detail.aspx',
'https://www.wildberries.ru/catalog/79718334/detail.aspx',
'https://www.wildberries.ru/catalog/87035212/detail.aspx',
'https://www.wildberries.ru/catalog/87035215/detail.aspx',
'https://www.wildberries.ru/catalog/110124208/detail.aspx',
'https://www.wildberries.ru/catalog/70326752/detail.aspx',
'https://www.wildberries.ru/catalog/70326753/detail.aspx',
'https://www.wildberries.ru/catalog/70326754/detail.aspx',
'https://www.wildberries.ru/catalog/70326755/detail.aspx',
'https://www.wildberries.ru/catalog/70326758/detail.aspx',
'https://www.wildberries.ru/catalog/78140703/detail.aspx',
'https://www.wildberries.ru/catalog/78374585/detail.aspx',
'https://www.wildberries.ru/catalog/78566793/detail.aspx',
'https://www.wildberries.ru/catalog/78592472/detail.aspx',
'https://www.wildberries.ru/catalog/78592473/detail.aspx',
'https://www.wildberries.ru/catalog/79700543/detail.aspx',
'https://www.wildberries.ru/catalog/79715858/detail.aspx',
'https://www.wildberries.ru/catalog/79715859/detail.aspx',
'https://www.wildberries.ru/catalog/79718335/detail.aspx',
'https://www.wildberries.ru/catalog/87035213/detail.aspx',
'https://www.wildberries.ru/catalog/87035214/detail.aspx',
'https://www.wildberries.ru/catalog/87035216/detail.aspx',
'https://www.wildberries.ru/catalog/87035217/detail.aspx',
'https://www.wildberries.ru/catalog/87035218/detail.aspx',
'https://www.wildberries.ru/catalog/87035219/detail.aspx',
'https://www.wildberries.ru/catalog/90297804/detail.aspx',
'https://www.wildberries.ru/catalog/72328098/detail.aspx',
'https://www.wildberries.ru/catalog/72327560/detail.aspx',
'https://www.wildberries.ru/catalog/70029962/detail.aspx',
'https://www.wildberries.ru/catalog/72327298/detail.aspx',
'https://www.wildberries.ru/catalog/85273444/detail.aspx',
'https://www.wildberries.ru/catalog/74417624/detail.aspx',
'https://www.wildberries.ru/catalog/72327272/detail.aspx',
'https://www.wildberries.ru/catalog/72326043/detail.aspx',
'https://www.wildberries.ru/catalog/72328023/detail.aspx',
'https://www.wildberries.ru/catalog/87068158/detail.aspx',
'https://www.wildberries.ru/catalog/87067009/detail.aspx',
'https://www.wildberries.ru/catalog/86070790/detail.aspx',
'https://www.wildberries.ru/catalog/79490118/detail.aspx',
'https://www.wildberries.ru/catalog/86070263/detail.aspx',
'https://www.wildberries.ru/catalog/79493327/detail.aspx',
'https://www.wildberries.ru/catalog/79494596/detail.aspx',
'https://www.wildberries.ru/catalog/79495760/detail.aspx',
'https://www.wildberries.ru/catalog/79496986/detail.aspx',
'https://www.wildberries.ru/catalog/79497442/detail.aspx',
'https://www.wildberries.ru/catalog/79498060/detail.aspx',
'https://www.wildberries.ru/catalog/79498615/detail.aspx',
'https://www.wildberries.ru/catalog/79499120/detail.aspx',
'https://www.wildberries.ru/catalog/79500201/detail.aspx',
'https://www.wildberries.ru/catalog/86071354/detail.aspx',
'https://www.wildberries.ru/catalog/86069261/detail.aspx',
'https://www.wildberries.ru/catalog/75637785/detail.aspx',
'https://www.wildberries.ru/catalog/75639097/detail.aspx',
'https://www.wildberries.ru/catalog/76760290/detail.aspx',
'https://www.wildberries.ru/catalog/76764393/detail.aspx',
'https://www.wildberries.ru/catalog/72952857/detail.aspx',
'https://www.wildberries.ru/catalog/72952858/detail.aspx',
'https://www.wildberries.ru/catalog/72952859/detail.aspx',
'https://www.wildberries.ru/catalog/72952860/detail.aspx',
'https://www.wildberries.ru/catalog/72952861/detail.aspx',
'https://www.wildberries.ru/catalog/75014903/detail.aspx',
'https://www.wildberries.ru/catalog/75017570/detail.aspx',
'https://www.wildberries.ru/catalog/75637293/detail.aspx',
'https://www.wildberries.ru/catalog/75638318/detail.aspx',
'https://www.wildberries.ru/catalog/75639896/detail.aspx',
'https://www.wildberries.ru/catalog/75640459/detail.aspx',
'https://www.wildberries.ru/catalog/75641116/detail.aspx',
'https://www.wildberries.ru/catalog/75641514/detail.aspx',
'https://www.wildberries.ru/catalog/75648834/detail.aspx',
'https://www.wildberries.ru/catalog/75649628/detail.aspx',
'https://www.wildberries.ru/catalog/76333681/detail.aspx',
'https://www.wildberries.ru/catalog/76755666/detail.aspx',
'https://www.wildberries.ru/catalog/76768107/detail.aspx',
'https://www.wildberries.ru/catalog/77541948/detail.aspx',
'https://www.wildberries.ru/catalog/77543371/detail.aspx',
'https://www.wildberries.ru/catalog/85978841/detail.aspx',
'https://www.wildberries.ru/catalog/85306594/detail.aspx',
'https://www.wildberries.ru/catalog/85306809/detail.aspx',
'https://www.wildberries.ru/catalog/85307368/detail.aspx',
'https://www.wildberries.ru/catalog/85307647/detail.aspx',
'https://www.wildberries.ru/catalog/85307872/detail.aspx',
'https://www.wildberries.ru/catalog/85308119/detail.aspx',
'https://www.wildberries.ru/catalog/85979323/detail.aspx',
'https://www.wildberries.ru/catalog/85312055/detail.aspx',
'https://www.wildberries.ru/catalog/85309909/detail.aspx',
'https://www.wildberries.ru/catalog/85309052/detail.aspx',
'https://www.wildberries.ru/catalog/85309250/detail.aspx',
'https://www.wildberries.ru/catalog/85309784/detail.aspx',
'https://www.wildberries.ru/catalog/85285589/detail.aspx',
'https://www.wildberries.ru/catalog/74419976/detail.aspx',
'https://www.wildberries.ru/catalog/71709625/detail.aspx',
'https://www.wildberries.ru/catalog/71709626/detail.aspx',
'https://www.wildberries.ru/catalog/74418496/detail.aspx',
'https://www.wildberries.ru/catalog/85286621/detail.aspx',
'https://www.wildberries.ru/catalog/85287548/detail.aspx',
'https://www.wildberries.ru/catalog/85304154/detail.aspx',
'https://www.wildberries.ru/catalog/85303987/detail.aspx',
'https://www.wildberries.ru/catalog/85304290/detail.aspx',
'https://www.wildberries.ru/catalog/85305580/detail.aspx',
'https://www.wildberries.ru/catalog/83266522/detail.aspx',
'https://www.wildberries.ru/catalog/83266523/detail.aspx',
'https://www.wildberries.ru/catalog/83266524/detail.aspx',
'https://www.wildberries.ru/catalog/83266525/detail.aspx',
'https://www.wildberries.ru/catalog/83266526/detail.aspx',
'https://www.wildberries.ru/catalog/83266527/detail.aspx',
'https://www.wildberries.ru/catalog/72291556/detail.aspx',
'https://www.wildberries.ru/catalog/72291557/detail.aspx',
'https://www.wildberries.ru/catalog/72291558/detail.aspx',
'https://www.wildberries.ru/catalog/72291559/detail.aspx',
'https://www.wildberries.ru/catalog/72291560/detail.aspx',
'https://www.wildberries.ru/catalog/83265977/detail.aspx',
'https://www.wildberries.ru/catalog/83265974/detail.aspx',
'https://www.wildberries.ru/catalog/83265975/detail.aspx',
'https://www.wildberries.ru/catalog/83265976/detail.aspx',
'https://www.wildberries.ru/catalog/83265978/detail.aspx',
'https://www.wildberries.ru/catalog/83265979/detail.aspx',
'https://www.wildberries.ru/catalog/71880671/detail.aspx',
'https://www.wildberries.ru/catalog/71880672/detail.aspx',
'https://www.wildberries.ru/catalog/71880673/detail.aspx',
'https://www.wildberries.ru/catalog/71880674/detail.aspx',
'https://www.wildberries.ru/catalog/71880675/detail.aspx',
'https://www.wildberries.ru/catalog/71880676/detail.aspx',
'https://www.wildberries.ru/catalog/71880677/detail.aspx',
'https://www.wildberries.ru/catalog/71880678/detail.aspx',
'https://www.wildberries.ru/catalog/82735025/detail.aspx',
'https://www.wildberries.ru/catalog/77983538/detail.aspx',
'https://www.wildberries.ru/catalog/77983545/detail.aspx',
'https://www.wildberries.ru/catalog/82734609/detail.aspx',
'https://www.wildberries.ru/catalog/82734610/detail.aspx',
'https://www.wildberries.ru/catalog/82734611/detail.aspx',
'https://www.wildberries.ru/catalog/75914386/detail.aspx',
'https://www.wildberries.ru/catalog/77983537/detail.aspx',
'https://www.wildberries.ru/catalog/77983539/detail.aspx',
'https://www.wildberries.ru/catalog/77983540/detail.aspx',
'https://www.wildberries.ru/catalog/77983541/detail.aspx',
'https://www.wildberries.ru/catalog/77983542/detail.aspx',
'https://www.wildberries.ru/catalog/77983543/detail.aspx',
'https://www.wildberries.ru/catalog/77983544/detail.aspx',
'https://www.wildberries.ru/catalog/82735022/detail.aspx',
'https://www.wildberries.ru/catalog/82735023/detail.aspx',
'https://www.wildberries.ru/catalog/82735024/detail.aspx',
'https://www.wildberries.ru/catalog/82740477/detail.aspx',
'https://www.wildberries.ru/catalog/72292976/detail.aspx',
'https://www.wildberries.ru/catalog/82740475/detail.aspx',
'https://www.wildberries.ru/catalog/82740476/detail.aspx',
'https://www.wildberries.ru/catalog/72292973/detail.aspx',
'https://www.wildberries.ru/catalog/72292974/detail.aspx',
'https://www.wildberries.ru/catalog/72292975/detail.aspx',
'https://www.wildberries.ru/catalog/72292977/detail.aspx',
'https://www.wildberries.ru/catalog/72292978/detail.aspx',
'https://www.wildberries.ru/catalog/82740474/detail.aspx',
'https://www.wildberries.ru/catalog/82740478/detail.aspx',
'https://www.wildberries.ru/catalog/81794982/detail.aspx',
'https://www.wildberries.ru/catalog/73160757/detail.aspx',
'https://www.wildberries.ru/catalog/77250965/detail.aspx',
'https://www.wildberries.ru/catalog/78741400/detail.aspx',
'https://www.wildberries.ru/catalog/78741404/detail.aspx',
'https://www.wildberries.ru/catalog/70032628/detail.aspx',
'https://www.wildberries.ru/catalog/72135244/detail.aspx',
'https://www.wildberries.ru/catalog/72135245/detail.aspx',
'https://www.wildberries.ru/catalog/72290968/detail.aspx',
'https://www.wildberries.ru/catalog/73160758/detail.aspx',
'https://www.wildberries.ru/catalog/74351079/detail.aspx',
'https://www.wildberries.ru/catalog/74351080/detail.aspx',
'https://www.wildberries.ru/catalog/77444833/detail.aspx',
'https://www.wildberries.ru/catalog/77593329/detail.aspx',
'https://www.wildberries.ru/catalog/77593330/detail.aspx',
'https://www.wildberries.ru/catalog/78394969/detail.aspx',
'https://www.wildberries.ru/catalog/78597365/detail.aspx',
'https://www.wildberries.ru/catalog/78597366/detail.aspx',
'https://www.wildberries.ru/catalog/78597367/detail.aspx',
'https://www.wildberries.ru/catalog/78597368/detail.aspx',
'https://www.wildberries.ru/catalog/78597369/detail.aspx',
'https://www.wildberries.ru/catalog/78741397/detail.aspx',
'https://www.wildberries.ru/catalog/78741398/detail.aspx',
'https://www.wildberries.ru/catalog/78741399/detail.aspx',
'https://www.wildberries.ru/catalog/78741401/detail.aspx',
'https://www.wildberries.ru/catalog/78741402/detail.aspx',
'https://www.wildberries.ru/catalog/78741403/detail.aspx',
'https://www.wildberries.ru/catalog/78741405/detail.aspx',
'https://www.wildberries.ru/catalog/81794983/detail.aspx',
'https://www.wildberries.ru/catalog/81794984/detail.aspx',
'https://www.wildberries.ru/catalog/82231228/detail.aspx',
'https://www.wildberries.ru/catalog/74778668/detail.aspx',
'https://www.wildberries.ru/catalog/74614895/detail.aspx',
'https://www.wildberries.ru/catalog/74616328/detail.aspx',
'https://www.wildberries.ru/catalog/74779385/detail.aspx',
'https://www.wildberries.ru/catalog/74780969/detail.aspx',
'https://www.wildberries.ru/catalog/74781517/detail.aspx',
'https://www.wildberries.ru/catalog/74784765/detail.aspx',
'https://www.wildberries.ru/catalog/74784766/detail.aspx',
'https://www.wildberries.ru/catalog/78035359/detail.aspx',
'https://www.wildberries.ru/catalog/78032749/detail.aspx',
'https://www.wildberries.ru/catalog/78032860/detail.aspx',
'https://www.wildberries.ru/catalog/78034984/detail.aspx',
'https://www.wildberries.ru/catalog/78035159/detail.aspx',
'https://www.wildberries.ru/catalog/77902259/detail.aspx',
'https://www.wildberries.ru/catalog/77902187/detail.aspx',
'https://www.wildberries.ru/catalog/77902306/detail.aspx',
'https://www.wildberries.ru/catalog/77902418/detail.aspx',
'https://www.wildberries.ru/catalog/77902478/detail.aspx',
'https://www.wildberries.ru/catalog/77902529/detail.aspx',
'https://www.wildberries.ru/catalog/78031418/detail.aspx',
'https://www.wildberries.ru/catalog/78032192/detail.aspx',
'https://www.wildberries.ru/catalog/79463893/detail.aspx',
'https://www.wildberries.ru/catalog/79463363/detail.aspx',
'https://www.wildberries.ru/catalog/79463361/detail.aspx',
'https://www.wildberries.ru/catalog/79049371/detail.aspx',
'https://www.wildberries.ru/catalog/78852632/detail.aspx',
'https://www.wildberries.ru/catalog/78852629/detail.aspx',
'https://www.wildberries.ru/catalog/78620247/detail.aspx',
'https://www.wildberries.ru/catalog/78620246/detail.aspx',
'https://www.wildberries.ru/catalog/78620243/detail.aspx',
'https://www.wildberries.ru/catalog/78620253/detail.aspx',
'https://www.wildberries.ru/catalog/78620239/detail.aspx',
'https://www.wildberries.ru/catalog/78620254/detail.aspx',
'https://www.wildberries.ru/catalog/78620252/detail.aspx',
'https://www.wildberries.ru/catalog/78620250/detail.aspx',
'https://www.wildberries.ru/catalog/78620255/detail.aspx',
'https://www.wildberries.ru/catalog/78620249/detail.aspx',
'https://www.wildberries.ru/catalog/78620236/detail.aspx',
'https://www.wildberries.ru/catalog/78620242/detail.aspx',
'https://www.wildberries.ru/catalog/78620241/detail.aspx',
'https://www.wildberries.ru/catalog/78620248/detail.aspx',
'https://www.wildberries.ru/catalog/78620238/detail.aspx',
'https://www.wildberries.ru/catalog/78620244/detail.aspx',
'https://www.wildberries.ru/catalog/78620240/detail.aspx',
'https://www.wildberries.ru/catalog/78620245/detail.aspx',
'https://www.wildberries.ru/catalog/77968789/detail.aspx',
'https://www.wildberries.ru/catalog/77968776/detail.aspx',
'https://www.wildberries.ru/catalog/77968783/detail.aspx',
'https://www.wildberries.ru/catalog/77968780/detail.aspx',
'https://www.wildberries.ru/catalog/77968787/detail.aspx',
'https://www.wildberries.ru/catalog/77968786/detail.aspx',
'https://www.wildberries.ru/catalog/77630479/detail.aspx',
'https://www.wildberries.ru/catalog/77630461/detail.aspx',
'https://www.wildberries.ru/catalog/76688618/detail.aspx',
'https://www.wildberries.ru/catalog/76688617/detail.aspx',
'https://www.wildberries.ru/catalog/76688616/detail.aspx',
'https://www.wildberries.ru/catalog/76688613/detail.aspx',
'https://www.wildberries.ru/catalog/76688608/detail.aspx',
'https://www.wildberries.ru/catalog/76688606/detail.aspx',
'https://www.wildberries.ru/catalog/76688604/detail.aspx',
'https://www.wildberries.ru/catalog/76688602/detail.aspx',
'https://www.wildberries.ru/catalog/76688603/detail.aspx',
'https://www.wildberries.ru/catalog/72819826/detail.aspx',
'https://www.wildberries.ru/catalog/72997885/detail.aspx',
'https://www.wildberries.ru/catalog/74433377/detail.aspx',
'https://www.wildberries.ru/catalog/72819257/detail.aspx',
'https://www.wildberries.ru/catalog/72820409/detail.aspx',
'https://www.wildberries.ru/catalog/72821505/detail.aspx',
'https://www.wildberries.ru/catalog/72996411/detail.aspx',
'https://www.wildberries.ru/catalog/74242473/detail.aspx',
'https://www.wildberries.ru/catalog/74432817/detail.aspx',
'https://www.wildberries.ru/catalog/66101086/detail.aspx',
'https://www.wildberries.ru/catalog/66101087/detail.aspx',
'https://www.wildberries.ru/catalog/66101088/detail.aspx',
'https://www.wildberries.ru/catalog/66101090/detail.aspx',
'https://www.wildberries.ru/catalog/66101091/detail.aspx',
'https://www.wildberries.ru/catalog/66101092/detail.aspx',
'https://www.wildberries.ru/catalog/66101085/detail.aspx',
'https://www.wildberries.ru/catalog/66101089/detail.aspx',
'https://www.wildberries.ru/catalog/72811127/detail.aspx',
'https://www.wildberries.ru/catalog/72803370/detail.aspx',
'https://www.wildberries.ru/catalog/72808600/detail.aspx',
'https://www.wildberries.ru/catalog/72809072/detail.aspx',
'https://www.wildberries.ru/catalog/72811367/detail.aspx',
'https://www.wildberries.ru/catalog/72811886/detail.aspx',
'https://www.wildberries.ru/catalog/72812348/detail.aspx',
'https://www.wildberries.ru/catalog/72812582/detail.aspx',
'https://www.wildberries.ru/catalog/72813012/detail.aspx',
'https://www.wildberries.ru/catalog/72816771/detail.aspx',
'https://www.wildberries.ru/catalog/72817724/detail.aspx',
'https://www.wildberries.ru/catalog/74922901/detail.aspx',
'https://www.wildberries.ru/catalog/71120849/detail.aspx',
'https://www.wildberries.ru/catalog/71120167/detail.aspx',
'https://www.wildberries.ru/catalog/69213436/detail.aspx',
'https://www.wildberries.ru/catalog/73664765/detail.aspx',
'https://www.wildberries.ru/catalog/73670902/detail.aspx',
'https://www.wildberries.ru/catalog/73670903/detail.aspx',
'https://www.wildberries.ru/catalog/73670904/detail.aspx',
'https://www.wildberries.ru/catalog/73664577/detail.aspx',
'https://www.wildberries.ru/catalog/73664574/detail.aspx',
'https://www.wildberries.ru/catalog/73664575/detail.aspx',
'https://www.wildberries.ru/catalog/73664576/detail.aspx',
'https://www.wildberries.ru/catalog/72134449/detail.aspx',
'https://www.wildberries.ru/catalog/70689714/detail.aspx',
'https://www.wildberries.ru/catalog/70689715/detail.aspx',
'https://www.wildberries.ru/catalog/70689716/detail.aspx',
'https://www.wildberries.ru/catalog/70689708/detail.aspx',
'https://www.wildberries.ru/catalog/70689709/detail.aspx',
'https://www.wildberries.ru/catalog/70689710/detail.aspx',
'https://www.wildberries.ru/catalog/70689711/detail.aspx',
'https://www.wildberries.ru/catalog/70689713/detail.aspx',
'https://www.wildberries.ru/catalog/71150162/detail.aspx',
'https://www.wildberries.ru/catalog/70029296/detail.aspx',
'https://www.wildberries.ru/catalog/8809225/detail.aspx',
'https://www.wildberries.ru/catalog/7552243/detail.aspx'];
const sellerName =
   settings.sellerUrl.split("seller/")[1]?.split("/")[0]?.split("?")[0] ||
   sellerUrl.split("brands/")[1]?.split("/")[0]?.split("?")[0] ||
   "WBGlobal";
const fetchedData = [];
const rejectedProducts = [];
const productsDataParams = {
   path: "./out/",
   fileFormat: ".csv",
   initialValue: "sep=," + os.EOL + "Photos,Urls,Images,SellerName,Price,Sold" + os.EOL,
   dataHandler: (product) => {
      let handledData = "";
      for (let i = 0; i < product.codes.length; i++) {
         handledData += `,${product.codes[i]},${product.images[i]},${product.sellerName},${product.price},${product.soldQuantity}${os.EOL}`;
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
