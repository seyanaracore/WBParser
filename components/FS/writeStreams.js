import {
   DEFAULT_OUT_PATH,
   DEFAULT_TYPE_OUT_FILES,
} from "../../utils/constants.js";
import writeCSVStream from "../../utils/CSV/writeCsv.js";
import { join } from "path";
import getDateAndTime from "../../utils/currentDate.js";
import log from "../../utils/logWriter.js";

const dataHeaders = writeCSVStream.getHeaders({
   codes: "codes",
   images: "images",
   sellerName: "sellerName",
});
export const getDataWriter = (sellerName) => {
   const path = join(
      DEFAULT_OUT_PATH,
      sellerName,
      getDateAndTime() + "_data." + DEFAULT_TYPE_OUT_FILES
   );
   return new writeCSVStream(path, dataHeaders);
};

const errorsHeaders = writeCSVStream.getHeaders({ url: "url" });
export const getErrorWriter = (sellerName) =>
   new writeCSVStream(
      join(
         DEFAULT_OUT_PATH,
         "_errors",
         sellerName +
            "_" +
            getDateAndTime() +
            "_errors." +
            DEFAULT_TYPE_OUT_FILES
      ),
      errorsHeaders
   );
const linksHeaders = writeCSVStream.getHeaders({ url: "url" });
export const getLinksWriter = (sellerName) =>
   new writeCSVStream(
      join(
         DEFAULT_OUT_PATH,
         "_links",
         sellerName +
            "_" +
            getDateAndTime() +
            "_links." +
            DEFAULT_TYPE_OUT_FILES
      ),
      linksHeaders
   );
