import { createReadStream } from "fs";
import csvParser from "csv-parser";
import iconv from "iconv-lite";
import { Transform } from "stream";

const defaultDelimiter = ";";

const decodeStream = new Transform({
   transform(chunk, encoding, callback) {
      callback(null, iconv.decode(chunk, "win1251"));
   },
});

const readCsv = async (path, delimiter = defaultDelimiter) => {
   const csvData = [];
   await new Promise((res) => {
      createReadStream(path)
         .pipe(decodeStream)
         .pipe(csvParser({ separator: delimiter }))
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
