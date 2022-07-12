import readFolderFiles from "./utils/readFolder.js";
import readCsv from "./utils/CSV/readCsv.js";

const readFilesTypes = ["csv"];
const path = "./old/out/Книга1.csv";

//const files = readFolderFiles(path, readFilesTypes);

const fileData = await readCsv(path);

console.log(/*files,*/ fileData);
