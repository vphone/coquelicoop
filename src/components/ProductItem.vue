<template>
  <div class="col-2 q-px-xs">
    <div>{{ product.label }}</div>
    <div>{{ product.price }}</div>
    <q-img :src="product.image" spinner-color="white" style="max-width: 120px" />
    <button @click="print">imprimer l'étiquette</button>

    <svg class="barcode"></svg>
  </div>
</template>

<script>
import JsBarcode from 'jsbarcode'
import { jsPDF } from 'jspdf'
import { createWeightBarcode } from '../utils'
const config = {
  nx: 5,
  ny: 16,
  h: 12,
  g: 14,
  dx: 38,
  dy: 17,
  cbl: 32,
  cbh: 10,
}

export default {
  name: 'ProductItem',
  props: {
    product: Object,
  },
  data() {
    return {
      open: true,
      canvas: null,
    }
  },
  computed: {
    productWeight() {
      return this.$store.state.weights.product
    },
  },
  methods: {
    generateWeightBarcode() {
      const code = createWeightBarcode(this.product.id, this.productWeight / 1000)
      return this.generateBarcode(code)
    },
    generateBarcode(code) {
      if (!this.canvas) this.canvas = document.createElement('canvas')
      JsBarcode(this.canvas, code, {
        format: 'EAN13',
        flat: false,
        height: 100,
        width: 3,
        textMargin: 0,
        fontOptions: 'bold',
        fontSize: 32,
      })
      return this.canvas.toDataURL('image/jpg')
    },
    async print() {
      this.barcodeImage = this.generateWeightBarcode()
      await this.$nextTick()
      const doc = new jsPDF()

      doc.setFontSize(9)
      // const x1 = config.g + config.dx - 2
      // const y1 = config.h + config.dy + 2
      doc.addImage(this.barcodeImage, 'JPEG', 10, 2, config.cbl, config.dy - 2, 'IMG1', 'NONE', 0)
      doc.text(this.product.ref + ' | ' + this.productWeight + ' g', 10, 20)
      doc.text(this.product.label, 10, 24)
      doc.text(`Prix au kg : ${this.product.price}`, 10, 28)
      doc.text(`Prix : ${(this.product.price * this.productWeight) / 1000}`, 10, 32)
      const blob = doc.output('blob')
      const url = URL.createObjectURL(blob)
      window.open(url)
    },
  },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
