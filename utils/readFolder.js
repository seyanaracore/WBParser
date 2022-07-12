import * as fs from "fs";

const readFolderFiles = (folderPath, fileTypesList) => {
   if (!folderPath) throw new Error("Не указана папка для считывания.");
   if (!Array.isArray(fileTypesList))
      throw Error("Ожидался массив расширений файлов.");

   return (
      fs
         .readdirSync(folderPath, { withFileTypes: true })
         .filter((file) =>
            fileTypesList.some((type) => file.name.includes("." + type))
         )
         .map((el) => el.name) || []
   );
};

export default readFolderFiles;
