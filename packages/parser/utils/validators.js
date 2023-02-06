export const validateLinksList = linksList => {
  if (!linksList || !Array.isArray(linksList))
    throw Error('List of links was expected as an array of strings')
  if (!linksList.length) throw Error('List of links is empty')
}
export const validateSellerName = sellerName => {
  if (!sellerName || typeof sellerName !== 'string') throw Error('Seller name excepted as string')
}
export const validateCSVHeaders = headers => {
  const isNotEmptyArray = Array.isArray(headers) && !!headers.length
  const isValidFields = !headers.some(
    el => !(typeof el === 'object' && el.hasOwnProperty('id') && el.hasOwnProperty('title'))
  )
  if (!(isNotEmptyArray && isValidFields)) throw Error("Excepting headers [{id: '', title: ''}]")
}
