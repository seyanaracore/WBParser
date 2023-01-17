import { createReadStream } from "fs";
import csvParser from "csv-parser";
import iconv from "iconv-lite";
import { Transform } from "stream";
import { DEFAULT_DELIMITER, DEFAULT_ENCODE } from "../constants.js";

const decodeStream = new Transform({
   transform(chunk, encoding, callback) {
      callback(null, iconv.decode(chunk, DEFAULT_ENCODE));
   },
});

const readCsv = async (path, del = DEFAULT_DELIMITER) => {
   const csvData = [];
   await new Promise((res) => {
      createReadStream(path)
         .pipe(decodeStream)
         .pipe(csvParser({ separator: del }))
         .on("data", (data) => {
            csvData.push(data);
         })
         .on("end", () => {
            res();
         });
   });
   return csvData;
};

export default readCsv;
