import {
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

   if (!filesList.length) return;
   const filesData = await Promise.all(
      filesList.map(
         (fileName) => {
            const fileData = readCsv(path.join(filesPath, fileName), ",")

            return fileData.codes
         }
      )
   );

   // console.log(filesData)
   log(`[previous codes]: ${filesData.length}, ${filesData.join()}`)
   return filesData;
};

export default getParsedCodes;
