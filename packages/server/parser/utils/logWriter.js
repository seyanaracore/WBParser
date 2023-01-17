import getDateAndTime from "./currentDate.js";
import fs from "fs";
import { EOL } from "os";
import { join } from "path";
import { DEFAULT_LOGS_PATH } from "./constants.js";

const stream = fs.createWriteStream(join(DEFAULT_LOGS_PATH, getDateAndTime() + ".log"));

const log = (data) => stream.write(data + EOL);

export default log;
