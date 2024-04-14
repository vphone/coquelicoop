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
  const digits = firstTwoDigits + transformSku(skuDigit) + price
  return digits + keyEAN(digits)
}
function transformWeight(weight) {
  let weightStr = `${weight * 1000}`
  while (weightStr.length < 5) {
    weightStr = '0' + weightStr
  }
  return weightStr
}
function transformSku(sku) {
  while (sku.length < 5) {
    sku = '0' + sku
  }
  return sku
}
