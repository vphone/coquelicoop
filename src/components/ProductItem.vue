<template>
  <div class="product">
    <div>{{ product.label }}</div>
    <div>{{ product.price }}</div>
    
    <img :src="product.image" width="160px"/>

    <button @click="generateBarcode">imprimer l'étiquette</button>
  </div>
</template>

<script>
export default {
  name: 'ProductItem',
  props: {
    product: Object,
  },
  methods:{
    generateBarcode(){
      console.log(this.product.barcode, this.product.ref)
    }
  }
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
.product {
  width: 160px;
  border: solid 1px black;
}
</style>
