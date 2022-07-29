import chalk from "chalk";
import log from "./logWriter.js";

export const errorNotify = (...content) => {
   if (!content) return;
   log("[error]: " + content.join(" "));
   console.log(
      content
         .map((str) => {
            if (typeof str === "number") {
               return chalk.blue(str);
            } else {
               return chalk.red(str);
            }
         })
         .join(" ")
   );
};
export const succesNotify = (...content) => {
   if (!content) return;
   log("[notify]: " + content.join(" "));
   console.log(
      content
         .map((str) => {
            if (typeof str === "number") {
               return chalk.blue(str);
            } else {
               return chalk.magenta(str);
            }
         })
         .join(" ")
   );
};
