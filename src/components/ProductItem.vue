<template>
  <div class="col-2 q-px-md">
    <q-card class="my-card" @click="printZPL">
      <q-img :src="product.image" spinner-color="white">
        <div class="absolute-bottom text-body1">{{ product.price }} €</div>
      </q-img>
      <q-card-section>
        {{ product.label }}
      </q-card-section>
    </q-card>
  </div>
</template>

<script>
import JsBarcode from 'jsbarcode'
import { jsPDF } from 'jspdf'
import { createWeightBarcode } from '../utils'
import { etiquette } from '../app/zpl'

export default {
  name: 'ProductItem',
  props: {
    product: Object,
  },
  data() {
    return {
      open: true,
      canvas: null,
      hasError: false,
      errorMessage: '',
    }
  },
  computed: {
    productWeight() {
      return this.$store.state.weights.product
    },
    jarWeight() {
      return this.$store.state.weights.jar
    },
  },
  methods: {
    generateWeightBarcode() {
      const code = createWeightBarcode(this.product.id, this.productWeight / 1000)
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
      const code = this.generateWeightBarcode()
      this.barcodeImage = this.generateBarcodeImage(code)
      await this.$nextTick()
      const url = this.generatePDF(this.barcodeImage)
      window.open(url)
    },

    async printZPL() {
      const article = {
        nom1: this.product.label,
        nom2: this.product.ref,
        unite: 'kg',
        prixN: this.product.price,
      }
      const code = createWeightBarcode(this.product.id, this.productWeight / 1000)
      try {
        let err = await etiquette(true, article, this.productWeight, this.jarWeight, code)
        if (err) {
          if (err === '99999') {
            this.errorMessage =
              "Le poids a été mal récupéré. Repeser le produit, l'enlever du plateau et recommencer."
          } else {
            this.errorMessage =
              "L'impression de l'étiquette a échoué (problème 'imprimante)\nAppeler le coordonnateur.\n" +
              err
          }
          this.hasError = true
          console.log('ERR : ' + err)
        }
      } catch (err) {
        if (err === '99999') {
          this.errorMessage =
            "Le poids a été mal récupéré. Repeser le produit, l'enlever du plateau et recommencer"
        } else {
          this.errorMessage =
            "L'impression de l'étiquette a échoué (problème 'imprimante)\nAppeler le coordonnateur.\n" +
            err
        }
        this.hasError = true
        console.log(err.message)
      }
    },
  },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
