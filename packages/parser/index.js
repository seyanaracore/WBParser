import { Server } from 'socket.io'

import { getDataWriter, getLinksWriter } from './components/FS/writeStreams.js'
import getProductsLinksList from './components/Links/ParseProductsLinks.js'
import filterProductsLinks from './components/Links/LinksFilter.js'
import productsHandler from './components/Products/ParseProducts.js'
import getSellerName from './components/GetSellerName.js'
import settings from './utils/settings.js'

import { errorNotify, successNotify } from './utils/consoleNotify.js'
import { SOCKET_PORT } from '../server/constants/index.js'
import removeFile from './utils/removeFile.js'

// Сокеты для логов
const io = await new Server()
await io.listen(SOCKET_PORT)
export const socket = io.sockets

const startParse = async () => {
  const sellerName = getSellerName()
  const dataWriter = getDataWriter(sellerName)
  const linksWriter = getLinksWriter(sellerName)

  try {
    const { productsLinks } = await getProductsLinksList(data => linksWriter.write(data))

    const filteredLinks = settings.includePrevProducts
      ? await filterProductsLinks(productsLinks, sellerName)
      : productsLinks

    const { rejectedProducts, productsData } = await productsHandler(filteredLinks, data =>
      dataWriter.write(data)
    )
    successNotify(`Result file: ${dataWriter.filePath}`)

    return { rejectedProducts, productsData }
  } catch (e) {
    await removeFile(dataWriter.filePath)
    throw Error(e.message)
  }
}

successNotify('Started!')

startParse()
  .then(({ rejectedProducts, productsData }) => {
    successNotify(
      `Finish! Parsed links count: ${productsData.length}. Rejected links count: ${rejectedProducts.length}.`
    )

    socket.emit('finish', true)
  })
  .catch(e => {
    errorNotify(e.message)
    socket.emit('finish', true)
  })
