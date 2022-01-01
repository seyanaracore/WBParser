import * as fs from "fs"
const defaultPath = "./out/"
const sellerName = "bronks"

let dir = defaultPath + sellerName;

if (!fs.existsSync(dir)){
    fs.mkdirSync(dir, { recursive: true });
}
let filesData = []

const filesList = fs.readdirSync(dir + "/", { withFileTypes: true })

const readFiles = () => {
	filesList.forEach((file)=> {
		let fileData = fs.readFileSync(dir + "/" + file.name, {encoding: "utf8"})
		let codes = fileData.split("/catalog/").forEach((str, idx) => {
			let code = str.split(",")[0]
			if (code !== "sep=") filesData.push(code)
		})
	})
}
const readFiles1 = () => {
	filesList.forEach((file)=> {
		let fileData = fs.readFileSync(dir + "/" + file.name, {encoding: "utf8"})
		let codes = fileData.split("\n").forEach((str, idx) => {
			str.split(",")[1]?.includes("https") ? console.log(str.split(",")[1]) : false
		})
	})
}
readFiles1()
console.log(filesData, filesData.length)
filesData.forEach(data=>console.log(data))