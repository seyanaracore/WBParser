import { CsvWriter } from "csv-writer/src/lib/csv-writer";

CsvWriter.createWriteStream()
const writeCsv = (path, data, del = ";") => {
   const writableStream = fs.createWriteStream(filename);
   const stringifier = stringify({ header: true, columns: Object.keys(data) });

	for (const po)
	.each(`select * from migration`, (error, row) => {
		if (error) {
		  return console.log(error.message);
		}
		stringifier.write(row);
	 });
	 stringifier.pipe(writableStream);
	 console.log("Finished writing data");
};

export default writeCsv;
