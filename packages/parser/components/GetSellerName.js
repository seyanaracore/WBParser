import settings from '../utils/settings.js'

/**
 * Название продавца
 * @returns {string}
 */
const getSellerName = () => {
  const targetUrl = settings.url

  return (
    targetUrl.split('seller/')[1]?.split('/')[0]?.split('?')[0] ||
    targetUrl.split('brands/')[1]?.split('/')[0]?.split('?')[0] ||
    'WBGlobal'
  )
}
export default getSellerName
