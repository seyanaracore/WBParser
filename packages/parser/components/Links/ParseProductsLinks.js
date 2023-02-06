import Puppeteer from 'puppeteer'
import { errorNotify, successNotify } from '../../utils/consoleNotify.js'
import {
  DELAY_UPPER,
  MAX_DELAY,
  PRODUCTS_PER_PAGE_MAX,
  PRODUCT_ITERATION_DELAY,
} from '../../utils/constants.js'
import defaultSettings from '../../utils/settings.js'
import linksParser from './LinksParser.js'

const pageNotInRange = (pageNum, settings) => {
  const initPage = settings.initialIterationPage || 1
  const { pagesHandlingCount, productsCountPerPage } = settings

  return (
    (pagesHandlingCount && pageNum === pagesHandlingCount + initPage) ||
    (productsCountPerPage &&
      pagesHandlingCount &&
      pageNum >= Math.ceil(productsCountPerPage / PRODUCTS_PER_PAGE_MAX) + initPage)
  )
}

async function getProductsLinksList(dataHandler, settings = {}) {
  const browser = await Puppeteer.launch({
    headless: true,
    defaultViewport: null,
  })
  settings = { ...defaultSettings, ...settings }

  let delay = PRODUCT_ITERATION_DELAY

  const pagesProductsLinks = []
  /**@type string[]*/
  const rejectedLinks = []
  const targetUrl =
    settings.url.at(-1) === '/' ? settings.url.slice(0, settings.url.length - 1) : settings.url

  //Сбор ссылок на каждой странице
  for (let i = settings.initialIterationPage || 1; i < Infinity; i++) {
    if (pageNotInRange(i, settings)) break //Проверка количества страниц к обработке

    const pageUrl = targetUrl + `?sort=${settings.sorting}&page=${i}`
    let linksList

    try {
      linksList = await linksParser(pageUrl, browser)
    } catch (err) {
      errorNotify(err)
      linksList = []
    }

    if (!linksList) break //null - товаров нет и страниц больше тоже

    if (!linksList.length) {
      //Если пустой массив - страница была отклонена
      errorNotify('page:', i, 'rejected')
      rejectedLinks.push(pageUrl)
      delay += DELAY_UPPER
      if (delay > MAX_DELAY) delay = MAX_DELAY
    } else {
      successNotify(pageUrl, 'page:', i, 'products:', linksList.length)

      dataHandler(linksList.map(el => ({ url: el })))
      pagesProductsLinks.push(...linksList)
      delay = PRODUCT_ITERATION_DELAY
    }
  }
  successNotify('\nSuccessful products links fetched:', pagesProductsLinks.length)

  if (rejectedLinks.length) errorNotify('Rejected pages:', rejectedLinks.length, '\n')

  await browser.close()

  /**@type string[]*/
  const productsLinks = [...new Set(pagesProductsLinks)]

  successNotify('Products list count:', productsLinks.length)

  return { productsLinks, rejectedLinks }
}

export default getProductsLinksList
