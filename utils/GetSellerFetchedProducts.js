import * as fs from "fs";

const defaultPath = "../out/";
const readFilesTypes = ".csv";

const getSellerFetchedProducts = (sellerName, path = defaultPath) => {
   let readedData = [];
   const dir = path + sellerName + "/";
   const filesList = fs
      .readdirSync(dir, { withFileTypes: true })
      .filter((file) =>
         file.name.includes(readFilesTypes ? readFilesTypes : "")
      );
   filesList.forEach((file) => {
      let fileData = fs.readFileSync(dir + "/" + file.name, {
         encoding: "utf8",
      });
      fileData.split("\n").forEach((str) => {
         let url = str.split(",")[1];
         if (url?.includes("https")) {
            readedData.push(url);
         }
      });
   });
   readedData = [...new Set(readedData)];
   console.log(
      "Seller already fetched products codes getted:",
      readedData.length,
      "\n"
   );
   return readedData;
};

export default getSellerFetchedProducts;
