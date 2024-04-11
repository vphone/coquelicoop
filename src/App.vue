<template>
  <img alt="Coquelicoop logo" src="./assets/logo.png" />
  <div>
    <button @click="displayBulkProducts">PRODUIT EN VRAC</button>
    <SearchForm @loading="loading" />
  </div>
  <ProductsList v-if="typeof isLoading !== 'undefined' && !isLoading" />
  <div v-else-if="isLoading">chargement en cours</div>
</template>

<script>
import ProductsList from './components/ProductsList.vue'
import SearchForm from './components/SearchForm.vue'

export default {
  name: 'App',
  components: {
    ProductsList,
    SearchForm,
  },
  data() {
    return {
      isLoading: undefined,
    }
  },
  methods: {
    loading(state) {
      this.isLoading = state
    },
    async displayBulkProducts() {
      await this.$store.dispatch('setBulkProducts')
    },
  },
  async mounted() {
    this.isLoading = true
    await this.$store.dispatch('setBulkProducts')
    this.isLoading = false
  },
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
