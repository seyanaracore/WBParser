import chalk from "chalk";

export const errorNotify = (content) => {
   if (!content) return;
   console.log(
      content
         .map((str) => {
            if (typeof str === "number") {
               return chalk.redBright(str);
            } else {
               return chalk.red(str);
            }
         })
         .join(" ")
   );
};
export const succesNotify = (content) => {
   if (!content) return;
   console.log(
      content
         .map((str) => {
            if (typeof str === "number") {
               return chalk.greenBright(str);
            } else {
               return chalk.green(str);
            }
         })
         .join(" ")
   );
};