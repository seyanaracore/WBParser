import { getDataWriter, getLinksWriter } from "./components/FS/writeStreams.js";
import getProductsLinksList from "./components/Links/ParseProductsLinks.js";
import filterProductsLinks from "./components/Links/LinksFilter.js";
import productsHandler from "./components/Products/ParseProducts.js";
import getSellerName from "./components/GetSellerName.js";

const sellerName = getSellerName();
const dataWriter = getDataWriter(sellerName);
const linksWriter = getLinksWriter(sellerName);

const { productsLinks, rejectedLinks } = await getProductsLinksList((data) =>
   linksWriter.write(data)
);

const filteredLinks = await filterProductsLinks(productsLinks, sellerName);

const { parsedData, rejectedProducts } = await productsHandler(
   filteredLinks,
   (data) => dataWriter.write(data)
);

console.log(parsedData);
