import { createReadStream } from "fs";
import csvParser from "csv-parser";
import iconv from "iconv-lite";

const defaultDelimiter = ";";

const readCsv = async (path, delimiter = defaultDelimiter) => {
   const csvData = [];
   await new Promise((res) => {
      createReadStream(path)
         .pipe((data) => iconv.decode(data, "win1251"))
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
