import UserAgent from 'user-agents'
import {PAGE_TIMEOUT, PRODUCT_ITERATION_DELAY} from '../../utils/constants.js'

const newPage = async (url, browser, delay = PRODUCT_ITERATION_DELAY) => {
  if (!url || typeof url !== 'string') throw Error('Url was expected as a string')
  if (!delay || typeof delay !== 'number') throw Error('Delay was expected as a number')
  if (!browser) throw Error('Expected browser')

  const page = await browser.newPage()
  await page.setUserAgent(UserAgent.toString())
  await page.setDefaultTimeout(PAGE_TIMEOUT * 1000)
  await page.waitForTimeout(delay * 1000)
  await page.goto(url, {waitUntil: 'networkidle2'})

  return page
}

async function parseProductsLinks(url, browser) {
  const page = await newPage(url, browser, PRODUCT_ITERATION_DELAY)

  const pageLinks = await page.evaluate(async () => {
    const sleep = (sec = 0.5) => {
      return new Promise(res => {
        setTimeout(() => res(), sec * 1000)
      })
    }
    const toBottomElement = async (elementSelector = 'html', offset = 0) => {
      const element = document.querySelector(elementSelector)
      return new Promise(async res => {
        let actualScroll = 1
        let maxScroll = 0
        while (actualScroll !== maxScroll) {
          await sleep(0.8)
          actualScroll = element.scrollTop
          element.scrollTop += 500
          maxScroll = element.scrollTop
        }
        element.scrollTop -= offset
        res()
      })
    }

    await toBottomElement()
    const goods = document.querySelectorAll('.product-card-list div.product-card__wrapper')
    const links = []
    const errorBlock =
      document.querySelector('#divGoodsNotFoundBackMain') ||
      document.querySelector('#divGoodsNotFound')
    const pageError = !errorBlock?.classList?.contains('hide')

    if (pageError) {
      return null
    }

    for (let good of goods) {
      const link = good?.children[0].href
      links.push(link)
    }
    return links
  })

  await page.close()

  return pageLinks
}

export default parseProductsLinks
