<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated class="row">
      <div class="column col-2">
      <q-img
        src="./assets/logo.png"

        spinner-color="white"
        style="height: 80px; max-width: 200px"
      />
      <q-btn class="text-h5 q-mt-xl" color="white" text-color="black" label="RAZ" @click="raz" />
      </div>
      <div class="column col-4 q-pa-md">
        <q-btn
          class="text-h6 col"
          color="white"
          text-color="black"
          label="LE VRAC"
          @click="displayBulkProducts"
        />
        <ScaleWeight class="col-8" />
      </div>
      <div class="col-6 q-pa-md">
        <SearchForm @loading="loading" />
      </div>
    </q-header>

    <q-page-container>
      <ProductsList v-if="typeof isLoading !== 'undefined' && !isLoading" />
      <div v-else-if="isLoading" class="fullscreen">
        <q-spinner class="fixed-center" color="primary" size="4em" />
      </div>
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
    raz() {
      this.$store.dispatch('setTotalWeight', 0)
      this.$store.dispatch('setProductWeight', 0)
      this.$store.dispatch('setJarWeight', 0)
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
