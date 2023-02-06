import Puppeteer from 'puppeteer'
import UserAgent from 'user-agents'
import { errorNotify, successNotify } from '../../utils/consoleNotify.js'
import {
  DELAY_UPPER,
  MAX_DELAY,
  PAGE_TIMEOUT,
  PRODUCTS_PER_PAGE_MAX,
  PRODUCT_ITERATION_DELAY,
} from '../../utils/constants.js'
import settings from '../../utils/settings.js'
import getCodeFromUrl from '../GetCodeFromUrl.js'
import pageHandler from './ProductsParser.js'
import { validateLinksList } from '../../utils/validators.js'

const checkPageInRange = (i, settings) => {
  const { productsCountPerPage, pagesHandlingCount } = settings
  const getMin = () => (Math.ceil(i / PRODUCTS_PER_PAGE_MAX) - 1) * PRODUCTS_PER_PAGE_MAX
  const getMax = () =>
    getMin() +
    Math.min(
      productsCountPerPage * pagesHandlingCount || PRODUCTS_PER_PAGE_MAX,
      PRODUCTS_PER_PAGE_MAX
    )

  return i > getMin() && i <= getMax()
}

const isParsedCode = (productsData, url) =>
  productsData.find(product => product.codes.includes(getCodeFromUrl(url)))

async function productsHandler(productsLinks, dataHandler) {
  validateLinksList(productsLinks)

  if (!dataHandler) throw Error('Excepted data handler')

  const productsData = []
  const rejectedProducts = []

  let delay = PRODUCT_ITERATION_DELAY

  const browser = await Puppeteer.launch({
    headless: true,
    defaultViewport: null,
  })
  const page = await browser.newPage()

  await page.waitForTimeout(delay * 1000)
  await page.setUserAgent(UserAgent.toString())
  page.setDefaultTimeout(PAGE_TIMEOUT * 1000)

  let i = 0

  for (const url of productsLinks) {
    i++
    //Пропуск уже полученных SKU
    if (isParsedCode(productsData, url)) continue
    //Проверка вхождения страницы в допустимый диапазон
    if (!checkPageInRange(i, settings)) continue

    await page.goto(url, { waitUntil: 'networkidle2' })

    const productData = await pageHandler(page)

    if (!productData) {
      //Если страница отклонена
      rejectedProducts.push(url)
      delay += DELAY_UPPER
      if (delay > MAX_DELAY) delay = MAX_DELAY
      errorNotify(
        'rejected product:',
        i,
        'page:',
        Math.ceil(i / PRODUCTS_PER_PAGE_MAX),
        'url:',
        url
      )
    } else {
      delay = PRODUCT_ITERATION_DELAY
      successNotify(
        'codes:',
        productData.codes.length,
        'images:',
        productData.images.length,
        'product:',
        i,
        'of',
        productsLinks.length,
        'current page:',
        Math.ceil(i / PRODUCTS_PER_PAGE_MAX),
        'seller:',
        productData.sellerName
      )
      const productsArray = productData.codes.map((code, idx) => {
        return {
          codes: code,
          images: productData.images[idx],
          sellerName: productData.sellerName,
        }
      })

      dataHandler(productsArray)
      productsData.push(productData)
    }
  }
  await page.close()

  await browser.close()

  if (rejectedProducts.length) {
    errorNotify('\nProducts rejected count:', rejectedProducts.length + '\n')
  }

  console.log(productsData, rejectedProducts)

  return { productsData, rejectedProducts }
}

export default productsHandler
