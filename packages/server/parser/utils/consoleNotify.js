import chalk from "chalk";
import log from "./logWriter.js";

export const errorNotify = (...content) => {
   if (!content) return;
   
   log("[error]: " + content.join(" "));
   console.log(
      content
         .map((str) =>
            typeof str === "number" ? chalk.blue(str) : chalk.red(str)
         )
         .join(" ")
   );
};
export const succesNotify = (...content) => {
   if (!content) return;

   log("[notify]: " + content.join(" "));
   console.log(
      content
         .map((str) =>
            typeof str === "number" ? chalk.green(str) : chalk.blueBright(str)
         )
         .join(" ")
   );
};
