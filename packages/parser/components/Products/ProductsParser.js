const pageHandler = async page => {
  return await page.evaluate(async () => {
    const variants = document.querySelectorAll('.swiper-wrapper > li > a.img-plug')
    const productData = {
      codes: [],
      images: [],
      sellerName: '',
    }

    variants.forEach(link => {
      if (link?.href) {
        const imageSrc = link.childNodes[1].src
        const imgBigSize = imageSrc.replace(imageSrc.split('/')[3], 'big')
        const imageFormat = imgBigSize.split('.').at(-1)

        const imageLink = imageSrc.replace(imageFormat, 'jpg')
        const productCode = link.href.split('/')[4]
        productData.codes.push(productCode)
        productData.images.push(imageLink)
      }
    })

    productData.sellerName = document.querySelector('.seller-info__name')?.textContent || 'none'

    return productData.codes.length ? productData : null
  })
}

export default pageHandler
