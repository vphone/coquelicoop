<template>
  <div class="products q-px-lg q-pt-lg">
    <div class="row" v-if="productsLength > 0">
      <ProductItem v-for="product in products" :key="product.id" :product="product" />
    </div>
    <div v-else>Pas de résultat</div>
  </div>
</template>

<script>
import ProductItem from './ProductItem.vue'
export default {
  name: 'ProductsList',
  components: {
    ProductItem,
  },
  computed: {
    products() {
      if (this.isBulk) {
        return this.$store.state.products['vrac'] || []
      }
      return this.$store.state.products[this.$store.state.keyword] || []
    },
    productsLength() {
      return this.products.length
    },
    isBulk() {
      return this.$store.state.isBulk
    },
  },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
