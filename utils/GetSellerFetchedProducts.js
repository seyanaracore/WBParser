import * as fs from "fs";

const defaultPath = "../out/";

const getSellerFetchedProducts = (sellerName, path = defaultPath) => {
  let filesData = [];
  const dir = path + sellerName + "/";
  const filesList = fs.readdirSync(dir, { withFileTypes: true });
  filesList.forEach((file) => {
    let fileData = fs.readFileSync(dir + "/" + file.name, { encoding: "utf8" });
    fileData.split("\n").forEach((str) => {
      let url = str.split(",")[1];
      if (url?.includes("https")) {
		  filesData.push(url)
	  };
    });
  });
  filesData = [...new Set(filesData)];
  console.log(
    "Seller already fetched products codes getted:",
    filesData.length,"\n"
  );
  return filesData;
};

export default getSellerFetchedProducts;
