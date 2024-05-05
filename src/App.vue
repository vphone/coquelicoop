<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated class="row" :class="isAdmin ? 'admin': 'user'">
      <div class="column col-2">
        <q-img
          src="./assets/logo.png"
          spinner-color="white"
          style="height: 80px; max-width: 200px"
        />
        <LoginSession />
        <q-btn
          v-if="!isAdmin"
          class="text-h5 q-mt-xl"
          color="white"
          text-color="black"
          label="RAZ"
          @click="resetWeights"
        />
      </div>
      <div v-if="!isAdmin" class="column col-4 q-pa-md">
        <q-btn
          class="text-h6 col"
          color="white"
          text-color="black"
          label="LE VRAC"
          @click="displayBulkProducts"
        />
        <ScaleWeight class="col-8" />
      </div>
      <div v-else>
        <SelectTypeBarcode />
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
import SelectTypeBarcode from './components/SelectTypeBarcode.vue'
import LoginSession from './components/LoginSession.vue'

export default {
  name: 'App',
  components: {
    ProductsList,
    SearchForm,
    ScaleWeight,
    SelectTypeBarcode,
    LoginSession,
  },
  data() {
    return {
      isLoading: undefined,
    }
  },
  computed: {
    isAdmin() {
      return this.$store.state.admin.status
    },
  },
  methods: {
    loading(state) {
      this.isLoading = state
    },
    async displayBulkProducts() {
      await this.$store.dispatch('setBulkProducts')
    },
    resetWeights() {
      this.$store.dispatch('setTotalWeight', 0)
      this.$store.dispatch('setProductWeight', 0)
      this.$store.dispatch('setJarWeight', 0)
    },
  },
  async mounted() {
    if (!this.isAdmin) {
      this.isLoading = true
      await this.displayBulkProducts()
      this.isLoading = false
    }
  },
}
</script>

<style>
body {
  background-color: white;
}
.q-layout__section--marginal.admin {
    background-color: var(--q-primary);
    color: #fff;
}
.q-layout__section--marginal.user {
    background-color: #607d8b!important;
    color: black!important;
}
</style>
