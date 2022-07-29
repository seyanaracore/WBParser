import {
   DEFAULT_DELIMITER,
   DEFAULT_OUT_PATH,
   DEFAULT_TYPE_OUT_FILES,
} from "../../utils/constants.js";
import readCsv from "../../utils/CSV/readCsv.js";
import readFolderFiles from "../../utils/readFolder.js";
import path from "path";
import log from "../../utils/logWriter.js";

const getParsedCodes = async (id) => {
   const filesPath = path.join(DEFAULT_OUT_PATH, id, "/");
   const filesList = readFolderFiles(filesPath, [DEFAULT_TYPE_OUT_FILES]);

   if (!filesList.length) return [];
   const filesData = await Promise.all(
      filesList.map((fileName) =>
         readCsv(path.join(filesPath, fileName), DEFAULT_DELIMITER)
      )
   );
   const flatData = filesData.flat();
   const productsCodes = flatData
      .slice(1, flatData.length) //Удаление заголовков
      .map((el) => el.codes);

   log(`[previous codes]: cnt - ${productsCodes.length}, codes - ${productsCodes.join()}`);
   return productsCodes;
};

export default getParsedCodes;
