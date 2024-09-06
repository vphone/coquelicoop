<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated class="row" :class="isAdmin ? 'admin' : 'user'">
      <div class="menu column col-2">
        <q-img
          src="./assets/logo.png"
          spinner-color="white"
          style="height: 80px; max-width: 200px"
        />
        <PasswordForm class="col-2" />
      </div>
      <div v-if="!isAdmin" class="column col-4 q-pa-md">
        <q-btn
          class="text-h6 col-2"
          color="white"
          text-color="black"
          label="LE VRAC"
          @click="displayBulkProducts"
        />
        <ScaleWeight class="col-8" />
        <q-btn
          class="text-h5 col-2"
          color="white"
          text-color="black"
          label="Effacer"
          @click="resetWeights"
        />
      </div>
      <div v-else>
        <TypeBarcodeForm />
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
import TypeBarcodeForm from './components/TypeBarcodeForm.vue'
import PasswordForm from './components/PasswordForm.vue'

export default {
  name: 'App',
  components: {
    ProductsList,
    SearchForm,
    ScaleWeight,
    TypeBarcodeForm,
    PasswordForm,
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
      this.$store.dispatch('setPackagingWeight', 0)
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
.menu {
  background-color: white;
  color: black;
}
.q-layout__section--marginal.admin {
  background-color: var(--q-primary);
  color: #fff;
}
.q-layout__section--marginal.user {
  background-color: #607d8b !important;
  color: black !important;
}
</style>
