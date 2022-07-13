export const validateLinksList = (linksList) => {
   if (!linksList || !Array.isArray(linksList))
      throw new Error("List of links was expected as an array of strings");
   if (!linksList.length) throw new Error("List of links is empty");
};
