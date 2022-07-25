import {
   DEFAULT_OUT_PATH,
   DEFAULT_TYPE_OUT_FILES,
} from "../../utils/constants.js";
import readCsv from "../../utils/CSV/readCsv.js";
import readFolderFiles from "../../utils/readFolder.js";
import path from "path";

const getFetchedProducts = async (id) => {
   const filesPath = path.join(DEFAULT_OUT_PATH, id, "/");
   const filesList = readFolderFiles(filesPath, [DEFAULT_TYPE_OUT_FILES]);

   const filesData = await Promise.all(
      filesList.map((fileName) => readCsv(path.join(filesPath, fileName), ","))
   );

   return filesData;
};

export default getFetchedProducts;
