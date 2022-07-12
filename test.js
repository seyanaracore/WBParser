import readFolderFiles from "./utils/readFolder.js";
import readCsv from "./utils/CSV/readCsv.js";
import writeCSVStream from "./utils/CSV/writeCsv.js";

// const readFilesTypes = ["csv"];
const path = "./old/out/Книга1.csv";
const writePath = "./old/out/Книга2.csv";

// const files = readFolderFiles(path, readFilesTypes);

const fileData = await readCsv(path);
const writeCsv = new writeCSVStream(writePath);
writeCsv.write(fileData);
writeCsv.write(fileData);
