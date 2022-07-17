import chalk from "chalk";
import { validateLinksList } from "./validators";

function filterProductsLinks(linksList, sellerName) {
   validateLinksList(linksList);
   if (!sellerName || typeof sellerName !== "string")
      throw new Error("Seller name excepted as string");

   const checkedProductsCodes = getSellerFetchedProducts(sellerName);

   linksList = [...new Set(linksList)];
   const checkedLinks = linksList
      .filter((productLink) => !checkedProductsCodes.includes(productLink))
      .filter((link) => link);

   console.log(
      chalk.green("New products for parse:" + checkedLinks.length + "\n")
   );
   return checkedLinks;
}

export default filterProductsLinks;
