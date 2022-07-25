import { PRODUCT_ITERATION_DELAY } from "../utils/constants";
import pageHandler from "./pageHandler";

async function retryParseProducts(rejectedProducts) {
   const getRejectedLength = () => rejectedProducts.length;
   if (!rejectedProducts.length) return;

   console.log("\n" + "fetch rejected products links start" + "\n");
	let delay = PRODUCT_ITERATION_DELAY;

   while (getRejectedLength()) {
      await pageHandler(rejectedProducts[0]);
      rejectedProducts.shift();
      delay += delayUpper;
      if (delay > maxDelay) delay = maxDelay;
   }
}

export default retryParseProducts