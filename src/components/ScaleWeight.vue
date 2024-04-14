<template>
  <div>poids du contenant : {{ jarWeight }} g poids du produit : {{ productWeight }} g</div>
</template>

<script>
export default {
  name: 'ScaleWeight',
  components: {},
  computed: {
    productWeight() {
      return this.$store.state.weights.product
    },
    jarWeight() {
      return this.$store.state.weights.jar
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
