import * as fs from "fs";

const readFolderFiles = (folderPath, fileTypesList) => {
   if (!folderPath) throw new Error("Folder not specified");
   if (!Array.isArray(fileTypesList))
      throw new Error("An array of extensions was expected");

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
