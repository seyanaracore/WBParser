import { DEFAULT_OUT_PATH } from "../../utils/constants"
import writeCSVStream from "../../utils/CSV/writeCsv"
import {join} from "path"

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

const dataHeaders = writeCSVStream.getHeaders([codes, images, sellerName])
export const getDataWriter = (sellerName) => new writeCSVStream(join(DEFAULT_OUT_PATH, sellerName,getDateAndTime()+"_data"),dataHeaders)
const errorsHeaders = writeCSVStream.getHeaders([url])
export const getErrorWriter = (sellerName) => new writeCSVStream(join(DEFAULT_OUT_PATH, sellerName,getDateAndTime()+"_errors"),errorsHeaders)
const linksHeaders = writeCSVStream.getHeaders([url])
export const getLinksWriter = (sellerName) => new writeCSVStream(join(DEFAULT_OUT_PATH, sellerName,getDateAndTime()+"_links"),linksHeaders)