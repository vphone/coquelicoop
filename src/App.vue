<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated class="glossy">
      <div class="row">
        <img alt="Coquelicoop logo" src="./assets/logo.png" style="width: 200px" />
        <q-btn
          color="white"
          text-color="black"
          label="PRODUIT EN VRAC"
          @click="displayBulkProducts"
        />
        <SearchForm @loading="loading" />
        <ScaleWeight />
      </div>
    </q-header>

    <q-page-container>
      <ProductsList v-if="typeof isLoading !== 'undefined' && !isLoading" />
      <div v-else-if="isLoading">chargement en cours</div>
    </q-page-container>
  </q-layout>
</template>

<script>
import ProductsList from './components/ProductsList.vue'
import SearchForm from './components/SearchForm.vue'
import ScaleWeight from './components/ScaleWeight.vue'

export default {
  name: 'App',
  components: {
    ProductsList,
    SearchForm,
    ScaleWeight,
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
body {
  background-color: white;
}
</style>
