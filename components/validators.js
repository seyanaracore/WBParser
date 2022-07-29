export const validateLinksList = (linksList) => {
   if (!linksList || !Array.isArray(linksList))
      throw new Error("List of links was expected as an array of strings");
   if (!linksList.length) throw new Error("List of links is empty");
};
export const validateSellerName = (sellerName) => {
   if (!sellerName || typeof sellerName !== "string")
   throw new Error("Seller name excepted as string");
}