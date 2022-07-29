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

const { productsLinks, rejectedLinks } = await getProductsLinksList((data) =>
   linksWriter.write(data)
);

const filteredLinks = await filterProductsLinks(productsLinks, sellerName);

const { parsedData, rejectedProducts } = await linksHandler(
   filteredLinks,
   (data) => dataWriter.write(data)
);

console.log(parsedData);
process.exit(1);
