import { getDataWriter, getLinksWriter } from "./components/FS/writeStreams.js";
import getProductsLinksList from "./components/getProductsLinks.js";
import linksHandler from "./components/linksHandler.js";
import settings from "./components/settings.js";

const sellerName =
   settings.url.split("seller/")[1]?.split("/")[0]?.split("?")[0] ||
   settings.url.split("brands/")[1]?.split("/")[0]?.split("?")[0] ||
   "WBGlobal";
const dataWriter = getDataWriter(sellerName)
const linksWriter = getLinksWriter(sellerName)

const {productsLinks, rejectedLinks} = getProductsLinksList(linksWriter)
const {parsedData, rejectedProducts} = linksHandler(productsLinks,dataWriter)




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

//______________________________________________________________________________

let parseSuccesful = false;
let productsLinksList = false;


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
