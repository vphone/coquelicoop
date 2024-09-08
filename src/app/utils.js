export function keyEAN(s) {
  const v = new Array(13)
  for (let i = 0; i < 13; i++) v[i] = s.charCodeAt(i) - 48
  let x = 0
  for (let i = 10; i >= 0; i = i - 2) {
    x += v[i]
  }
  let y = 0
  for (let i = 11; i >= 0; i = i - 2) {
    y += v[i]
  }
  const z = 3 * y + x
  const r = z % 10
  let c = 0
  if (r !== 0) {
    const q = Math.floor(z / 10) + 1
    c = q * 10 - z
  }
  return String.fromCharCode(48 + c)
}
export function createWeightBarcode(skuDigit, weight) {
  const firstTwoDigits = '20'
  const digits = firstTwoDigits + transformSku(skuDigit) + transformWeight(weight)
  return digits + keyEAN(digits)
}
export function createPriceBarcode(skuDigit, price) {
  const firstTwoDigits = '21'
  const digits = firstTwoDigits + transformSku(skuDigit) + transformPrice(price)
  return digits + keyEAN(digits)
}
function transformWeight(weight) {
  let weightStr = weight.toString()
  while (weightStr.length < 5) {
    weightStr = '0' + weightStr
  }
  return weightStr
}
function transformPrice(price) {
  let priceStr = price.toString().replace('.', '')
  while (priceStr.length < 5) {
    priceStr = '0' + priceStr
  }
  return priceStr
}
function transformSku(sku) {
  while (sku.length < 5) {
    sku = '0' + sku
  }
  return sku
}

export function formatPoids(p) {
  if (!p) return '0'
  if (p < 1000) {
    return `${p} g`
  }
  return `${p / 1000} Kg`
}

// return 08/09/24
export function getDateNow() {
  const options = { year: '2-digit', month: '2-digit', day: '2-digit' }
  const date = new Date().toLocaleDateString('fr-FR', options).replace(/\./g, '/')
  return date
}