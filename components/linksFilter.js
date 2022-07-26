import { succesNotify } from "../utils/consoleNotify";
import getFetchedProducts from "./FS/getFetchedProducts";
import { validateLinksList } from "./validators";

function filterProductsLinks(linksList, sellerName) {
   validateLinksList(linksList);
   if (!sellerName || typeof sellerName !== "string")
      throw new Error("Seller name excepted as string");

   const checkedProductsCodes = getFetchedProducts(sellerName);

   linksList = [...new Set(linksList)];
   const checkedLinks = linksList.filter(
      (productLink) => link && !checkedProductsCodes.includes(productLink)
   );
   // .filter((link) => link);

   succesNotify("New products for parse:", checkedLinks.length, "\n");
   return checkedLinks;
}

export default filterProductsLinks;
