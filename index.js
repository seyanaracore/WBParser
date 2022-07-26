import { getDataWriter, getLinksWriter } from "./components/FS/writeStreams.js";
import getProductsLinksList from "./components/getProductsLinks.js";
import filterProductsLinks from "./components/linksFilter.js";
import linksHandler from "./components/linksHandler.js";
import settings from "./utils/settings.js";

const sellerName =
   settings.url.split("seller/")[1]?.split("/")[0]?.split("?")[0] ||
   settings.url.split("brands/")[1]?.split("/")[0]?.split("?")[0] ||
   "WBGlobal";
const dataWriter = getDataWriter(sellerName);
const linksWriter = getLinksWriter(sellerName);

const { productsLinks, rejectedLinks } = getProductsLinksList(
   linksWriter.write
);
console.log(productsLinks);
process.exit(1);

const filteredLinks = filterProductsLinks(productsLinks, sellerName);
const { parsedData, rejectedProducts } = await linksHandler(
   filteredLinks,
   dataWriter.write
);
