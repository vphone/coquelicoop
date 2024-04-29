<template>
  <div class="col-2 q-px-md">
    <q-card class="my-card" @click="printZPL">
      <q-img :src="product.image" spinner-color="white">
        <div class="absolute-bottom text-body1 text-weight-bold">{{ product.price }} €</div>
      </q-img>
      <q-card-section class="text-body1">
        {{ product.label }}
      </q-card-section>
    </q-card>
  </div>
</template>

<script>
import JsBarcode from 'jsbarcode'
import { jsPDF } from 'jspdf'
import { createWeightBarcode } from '../utils'
import { generateBarcodeLabel } from '../app/zpl'

export default {
  name: 'ProductItem',
  props: {
    product: Object,
  },
  data() {
    return {
      open: true,
      canvas: null,
      errorMessage: '',
    }
  },
  computed: {
    productWeight() {
      return this.$store.state.weights.product
    },
    totalWeight() {
      return this.$store.state.weights.total
    },
    jarWeight() {
      return this.$store.state.weights.jar
    },
  },
  methods: {
    generateWeightBarcode() {
      const code = createWeightBarcode(this.product.ref, this.productWeight)
      return code
    },
    generateBarcodeImage(code) {
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
    generatePDF(barcodeImage) {
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
      const doc = new jsPDF()
      doc.setFontSize(9)
      // const x1 = config.g + config.dx - 2
      // const y1 = config.h + config.dy + 2
      doc.addImage(barcodeImage, 'JPEG', 10, 2, config.cbl, config.dy - 2, 'IMG1', 'NONE', 0)
      doc.text(this.product.ref + ' | ' + this.productWeight / 1000 + ' kg', 10, 20)
      doc.text(this.product.label, 10, 24)
      doc.text(`Prix / kg : ${this.product.price} €`, 10, 28)
      doc.text(`Prix à payer : ${(this.product.price * this.productWeight) / 1000} €`, 10, 32)
      const blob = doc.output('blob')

      return URL.createObjectURL(blob)
    },
    async printPDF() {
      if (this.productWeight === 0) {
        this.displayErrorMessage()
        return
      } else if (this.totalWeight === this.jarWeight) {
        this.displayErrorMessage('pas de poids pour le produit')
        return
      }
      const code = this.generateWeightBarcode()
      this.barcodeImage = this.generateBarcodeImage(code)
      await this.$nextTick()
      const url = this.generatePDF(this.barcodeImage)
      this.resetWeights()
      window.open(url)
    },
    async printZPL() {
      if (this.productWeight === 0) {
        this.displayErrorMessage()
        return
      } else if (this.totalWeight === this.jarWeight) {
        this.displayErrorMessage('pas de poids pour le produit')
        return
      }
      const item = {
        label: this.product.label,
        ref: this.product.ref,
        unite: 'kg',
        price: this.product.price,
      }
      const code = this.generateWeightBarcode()
      try {
        await generateBarcodeLabel(true, item, this.totalWeight, this.jarWeight, code)
      } catch (err) {
        if (err === '99999') {
          this.errorMessage =
            "Le poids a été mal récupéré. Repeser le produit, l'enlever du plateau et recommencer"
        } else {
          this.errorMessage =
            "L'impression de l'étiquette a échoué (problème 'imprimante)\nAppeler le coordonnateur.\n" +
            err
        }
        this.displayErrorMessage(this.errorMessage)
      }
      this.resetWeights()
    },
    resetWeights() {
      this.$store.dispatch('setTotalWeight', 0)
      this.$store.dispatch('setProductWeight', 0)
      this.$store.dispatch('setJarWeight', 0)
    },
    displayErrorMessage(err) {
      this.$q.notify({
        message: err || `Il n'y a pas de poids`,
        color: 'primary',
        actions: [{ icon: 'close', color: 'white', round: true, handler: () => {} }],
      })
    },
  },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.q-card__section--vert,
.q-img__content > div {
  padding: 8px;
}
</style>
