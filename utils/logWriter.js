import getDateAndTime from "./currentDate.js";
import fs from "fs";
import {join} from "path"

const logPath = "./logs";

const stream = fs.createWriteStream(join(logPath, getDateAndTime() + ".log"));

const log = (data) => stream.write(data);

export default log;
