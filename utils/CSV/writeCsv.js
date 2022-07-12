import * as csv from "fast-csv";
import iconv from "iconv-lite";
import fs from "fs";
import { Transform } from "stream";

const encodeStream = new Transform({
   transform(chunk, encoding, callback) {
      callback(null, iconv.encode(chunk, "win1251"));
   },
});

class writeCSVStream {
   constructor(path, del = ";") {
      this.ws = fs.createWriteStream(path, {
         flags: "a",
      });
      this.csvStream = csv.format({
         headers: true,
         delimiter: del,
         includeEndRowDelimiter: true,
      });
      this.csvStream.pipe(encodeStream).pipe(this.ws);
   }
   write(data) {
      if (Array.isArray(data)) {
         data.forEach((el) => this.csvStream.write(el));
      } else {
         this.csvStream.write(data);
      }
   }
}

export default writeCSVStream;
