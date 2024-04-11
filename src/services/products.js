const baseUrl = process.env.VUE_APP_API_URL

const headers = {
  DOLAPIKEY: process.env.VUE_APP_DOLAPIKEY,
}
export async function getProducts(keyword) {
  const url = `${baseUrl}products?sortfield=t.label&sortorder=ASC&limit=10&sqlfilters=t.label:like:'%${keyword}%'`
  const response = await fetch(url, {
    headers,
  })
  const products = await response.json()
  return await Promise.all(products.map(async (item) => {
    const { label, barcode, price_min_ttc, id, ref } = item

    const image = await getImage(id)
    const priceSplitted = (price_min_ttc).split('.')

const price = priceSplitted[0] + '.' + priceSplitted[1].split('')[0]+ priceSplitted[1].split('')[1]
    return { label, barcode, price, id, image, ref }
  }))
}

export async function getBulkProducts() {
  const url = `${baseUrl}categories/71/objects?type=product`
  const response = await fetch(url, {
    headers,
  })
  const products = await response.json()
  return await Promise.all(products.map(async (item) => {
    const { label, barcode, price_min_ttc, id } = item
    
    const image = await getImage(id)
    const priceSplitted = (price_min_ttc).split('.')

    const price = priceSplitted[0] + '.' + priceSplitted[1].split('')[0]+ priceSplitted[1].split('')[1]
    return { label, barcode, price, id, image }
  }))
}

async function getImage(id) {
  const urlDocument = `${baseUrl}documents?modulepart=product&id=${id}`
    const response = await fetch(urlDocument, {
      headers,
    })
    const document = await response.json()
    const { level1name, relativename } = document.length ? document[0] : {}
    let image=''
    if (level1name) {
      const encoded = encodeURI(level1name + '/' + relativename)
      const urlImage = `${baseUrl}documents/download?modulepart=product&original_file=${encoded}`
      const responseImage = await fetch(urlImage, {
        headers,
      })
      const images = await responseImage.json()
      image = 'data:image/png;base64, ' + images.content
    }
    return image
}
