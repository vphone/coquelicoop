<template>
  <div class="q-px-xl q-pt-xl">
    <div class="row">
      <ProductItem v-for="product in products" :key="product.id" :product="product" />
    </div>
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
    isBulk() {
      return this.$store.state.isBulk
    },
  },
  data() {
    return {}
  },
  async mounted() {},
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
