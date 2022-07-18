import getFetchedProducts from "./components/getFetchedProducts.js";
import { errorNotify, succesNotify } from "./utils/consoleNotify.js";

// const filesData = await getFetchedProducts("goorin-brothers");

// console.log(filesData);
succesNotify("New products for parse:", 2, "\n");
errorNotify("New products for parse:", 2, "\n");
// succesNotify(["New products for parse:", 2, "\n"]);
