import { succesNotify } from "../utils/consoleNotify.js";
import log from "../utils/logWriter.js";
import getParsedCodes from "./FS/getParsedCodes.js";
import { validateLinksList } from "./validators.js";

const getCodeFromUrl = (url) => url.split("/")[4];

async function filterProductsLinks(linksList, sellerName) {
   validateLinksList(linksList);
   if (!sellerName || typeof sellerName !== "string")
      throw new Error("Seller name excepted as string");

   const checkedProductsCodes = await getParsedCodes(sellerName);

   if (!checkedProductsCodes) return linksList;

   log(`[already parsed products]: ${checkedProductsCodes.join()}`);
   linksList = [...new Set(linksList)];
   const checkedLinks = linksList.filter(
      (productLink) =>
         productLink &&
         !checkedProductsCodes.includes(getCodeFromUrl(productLink))
   );
   // .filter((link) => link);

   succesNotify("New products for parse:", checkedLinks.length, "\n");
   return checkedLinks;
}

export default filterProductsLinks;
