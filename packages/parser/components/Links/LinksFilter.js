import { successNotify } from '../../utils/consoleNotify.js'
import getParsedCodes from '../FS/getParsedCodes.js'
import getCodeFromUrl from '../GetCodeFromUrl.js'
import { validateLinksList, validateSellerName } from '../../utils/validators.js'

async function filterProductsLinks(linksList, sellerName) {
  validateLinksList(linksList)
  validateSellerName(sellerName)

  const parsedCodes = await getParsedCodes(sellerName)

  if (!parsedCodes.length) return linksList

  linksList = [...new Set(linksList)]

  const checkedLinks = linksList.filter(
    productLink => productLink && !parsedCodes.includes(getCodeFromUrl(productLink))
  )

  successNotify('New products for parse:', checkedLinks.length, '\n')
  return checkedLinks
}

export default filterProductsLinks
