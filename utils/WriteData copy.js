import * as fs from "fs";
import * as os from "os";
const defaultFileFormat = ".csv";
const defaultPath = "./out/undefined/";

const getDateAndTime = () => {
  let date_ob = new Date();
  let date = ("0" + date_ob.getDate()).slice(-2);
  let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
  let year = date_ob.getFullYear();
  let hours = date_ob.getHours();
  let minutes = date_ob.getMinutes();
  let seconds = date_ob.getSeconds();
  const name =
    date +
    "-" +
    month +
    "-" +
    year +
    "_" +
    hours +
    "h" +
    minutes +
    "m" +
    seconds +
    "s";
  return name;
};

const openStreamWriting = (sellerName, path, fileFormat, initialValue) => {
  const dir = path + sellerName;
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  let filePath = `${dir}/${sellerName}_${getDateAndTime()}${fileFormat}`;
  let fileStream = fs.createWriteStream(filePath)
  let initialValueLength = 0
  if(initialValue) {
    fileStream.write(initialValue)
    initialValueLength = initialValue.split(os.EOL).length + 1
  }
  return {fileStream, filePath, initialValueLength};
};
class FileStream {
	constructor(sellerName, path=defaultPath, fileFormat = defaultFileFormat, dataHandler = false, initialValue = false) {
		const {fileStream, filePath, initialValueLength} = openStreamWriting(sellerName, path, fileFormat, initialValue)
    this.fileStream = fileStream
    this.filePath = filePath
    this.initialValueLength = initialValueLength
    this.dataHandler = dataHandler
	}
	writeData(data) {
    if(this.dataHandler) data = this.dataHandler(data)
		this.fileStream.write(data)
	}
	checkFileStringLength () {
		const data = fs.readFileSync(this.filePath).toString();
		if (data.split(os.EOL).length <= this.initialValueLength) {
		  fs.unlinkSync(this.filePath);
		  console.log("\nFile is empty, removed.\n");
		}
	  };
	closeStream() {
    console.log(this.filePath, "stream ended")
		this.fileStream.end()
		this.checkFileStringLength()
	}
}
export default FileStream