<template>
  <div class="product col-2 q-px-md q-pb-md">
    <q-card class="my-card" @click="printZPL">
      <q-img :src="product.image" :ratio="1" class="image" spinner-color="white">
        <div class="absolute-bottom text-body1 text-weight-bold">{{ product.price }} €</div>
      </q-img>
      <q-card-section class="text-body2">
        {{ product.label }}
      </q-card-section>
    </q-card>
  </div>
</template>

<script>
import { createWeightBarcode, createPriceBarcode } from '../app/utils'
import { generateBarcodeLabel } from '../app/zpl'

const WEIGHT_SELECT = 'Au poids'
const PRICE_SELECT = 'Au prix'
const ORIGIN_SELECT = "code barre d'origine"

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
    isAdmin() {
      return this.$store.state.admin.status
    },
    productWeight() {
      return this.isAdmin ? this.adminWeight : this.$store.state.weights.product
    },
    totalWeight() {
      return this.isAdmin ? this.adminWeight : this.$store.state.weights.total
    },
    packagingWeight() {
      return this.$store.state.weights.packaging
    },
    adminWeight() {
      return this.$store.state.admin.weight
    },
    adminNumber() {
      return this.$store.state.admin.number
    },
    adminType() {
      return this.$store.state.admin.type
    },
  },
  methods: {
    generateBarcode() {
      if (this.adminType === ORIGIN_SELECT) return this.product.barcode
      if (this.adminType === PRICE_SELECT)
        return createPriceBarcode(this.product.ref, this.product.price)
      return createWeightBarcode(this.product.ref, this.productWeight)
    },
    async printZPL() {
      let hasError = false
      if (this.isAdmin) hasError = this.checkData()
      else hasError = this.checkWeights()
      if (hasError) return
      try {
        const item = this.getItem()
        const code = this.generateBarcode()
        await generateBarcodeLabel(item, code, this.adminNumber)
        if (!this.isAdmin) this.resetWeights()
      } catch (err) {
        this.errorMessage = `L'impression de l'étiquette a échoué (problème d'imprimante) : ${err}`
        this.displayErrorMessage(this.errorMessage)
      }
    },
    resetWeights() {
      this.$store.dispatch('setTotalWeight', 0)
      this.$store.dispatch('setProductWeight', 0)
    },
    checkData() {
      let hasError = false
      if (this.adminNumber === 0) {
        this.displayErrorMessage('Veuillez indiquer le nombre')
        hasError = true
      }
      if (this.adminWeight === 0 && this.adminType === WEIGHT_SELECT) {
        this.displayErrorMessage('Veuillez indiquer le poids')
        hasError = true
      }
      if (this.adminType === null) {
        this.displayErrorMessage("Veuillez indiquer le type de l'étiquette au poids ou au prix")
        hasError = true
      }
      return hasError
    },
    checkWeights() {
      let hasError = false
      if (this.productWeight === 0) {
        this.displayErrorMessage()
        hasError = true
      }
      if (this.totalWeight === this.packagingWeight) {
        this.displayErrorMessage('Le poids du contenant et brut sont identiques')
        hasError = true
      }
      return hasError
    },
    displayErrorMessage(err) {
      this.$q.notify.setDefaults({
        position: 'bottom',
        timeout: 9000,
        textColor: 'white',
      })
      this.$q.notify({
        message: err || `Veuillez poser votre produit sur la balance`,
        color: 'primary',
        actions: [{ icon: 'close', color: 'white', round: true, handler: () => {} }],
      })
    },
    getItem() {
      let item = {
        label: this.product.label,
        ref: this.product.ref,
        price: this.product.price,
        totalWeight: this.totalWeight,
        packagingWeight: this.packagingWeight,
        productWeight: this.productWeight,
      }

      item.unite = this.adminType === WEIGHT_SELECT || !this.isAdmin ? 'kg' : ''

      return item
    },
  },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
.product .q-card__section--vert,
.product .q-img__content > div {
  padding: 8px;
}

.product .image img {
  padding: 18px;
}
</style>
