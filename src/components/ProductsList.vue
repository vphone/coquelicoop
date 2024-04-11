<template>
  <div class="products">
    <h1>{{ keyword }}</h1>
    <ProductItem v-for="product in products" :key="product.id" :product="product" />
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
      if(this.isBulk) {
        return this.$store.state.products['vrac'] || []
      }
      return this.$store.state.products[this.$store.state.keyword] || []
    },
    isBulk() {
      return this.$store.state.isBulk
    }
  },
  data() {
    return {}
  },
  async mounted() {},
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
.products {
  display: flex;
  width: 1024px;
  flex-wrap: wrap;
}
</style>
