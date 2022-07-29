import iconv from "iconv-lite";
import fs from "fs";
import * as nPath from "path";
import { createObjectCsvStringifier } from "csv-writer";
import { DEFAULT_DELIMITER, DEFAULT_ENCODE } from "../constants.js";

const validateHeaders = (headers) => {
   return (
      Array.isArray(headers) &&
      !!headers.length &&
      !headers.some((el) => {
         return !(
            typeof el === "object" &&
            el.hasOwnProperty("id") &&
            el.hasOwnProperty("title")
         );
      })
   );
};

class writeCSVStream {
   constructor(path, headers, del = DEFAULT_DELIMITER) {
      if (!validateHeaders(headers))
         throw new Error("Excepting headers [{id: ''; titile: ''}]");
      const dir = path
         .split(nPath.sep)
         .slice(0, path.split(nPath.sep).length - 1)
         .join(nPath.sep);

      if (!fs.existsSync(dir)) {
         fs.mkdirSync(dir, { recursive: true });
      }
      this.ws = fs.createWriteStream(path, {
         flags: "a",
      });

      this.csvStringifier = createObjectCsvStringifier({
         header: headers,
         fieldDelimiter: del,
      });
      this.ws.write(this.csvStringifier.getHeaderString());
   }
   static getHeaders(obj) {
      return Object.keys(obj).map((el) => ({ id: el, title: el }));
   }
   write(data) {
      const formatted = this.csvStringifier.stringifyRecords(data);
      const encoded = iconv.encode(formatted, DEFAULT_ENCODE);
      this.ws.write(encoded);
   }
}

export default writeCSVStream;
