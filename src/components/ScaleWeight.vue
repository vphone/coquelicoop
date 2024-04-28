<template>
  <div>
    <q-list bordered separator>
      <q-item>
        <q-item-section class="text-h6">Poids du contenant :</q-item-section>
        <q-item-section class="text-h5 text-right">
          <q-input
            filled
            type="text"
            id="weight"
            name="weight"
            class="input text-h5 col"
            v-model="jarWeightSaved"
            required
            minlength="1"
            placeholder=""
          />
        </q-item-section>
      </q-item>
      <q-item>
        <q-item-section class="text-h6"> Poids du brut :</q-item-section>
        <q-item-section class="text-h5 text-right row">
          <q-input
            filled
            type="text"
            id="weight"
            name="weight"
            class="input text-h5 col"
            v-model="totalWeightSaved"
            required
            minlength="1"
            placeholder=""
          />
        </q-item-section>
      </q-item>
    </q-list>
    <SelectJar
      :display-dialog="displayDialog"
      @define-weight="defineWeight"
      @hide="displayDialog = false"
    />
  </div>
</template>

<script>
import { Balance } from '../app/portbalance'
import SelectJar from './SelectJar.vue'

export default {
  name: 'ScaleWeight',
  components: { SelectJar },
  computed: {
    productWeightSaved() {
      return this.$store.state.weights.product
    },
    jarWeightSaved() {
      return this.$store.state.weights.jar
    },
    totalWeightSaved() {
      return this.$store.state.weights.total
    },
  },
  data() {
    return {
      scale: null,
      errorScale: false,
      ecouteBalance: null,
      totalWeight: 0,
      productWeight: 0,
      jarWeight: 0,
      displayDialog: false,
      weight: 0,
    }
  },
  async mounted() {
    try {
      this.scale = new Balance(process.env.VUE_APP_SCALE, this.getWeight)
      await this.connectScale()
      // await this.disconnectScale()
    } catch (err) {
      console.log(err)
    }
  },
  methods: {
    async disconnectScale() {
      this.raz()
      await this.scale.finEcoute()
    },

    async connectScale() {
      await this.scale.debutEcoute()
    },
    getWeight(ecoute, err, poids) {
      console.log(poids)
      if (err) {
        this.errorScale = err
        this.displayErrorMessage(err)
      } else {
        this.ecouteBalance = ecoute
        this.weight = poids
        this.errorScale = false
        if (this.weight === 0) {
          this.displayDialog = false
        } else if (ecoute) {
          this.openDialog()
        }
      }
    },
    raz() {
      this.$store.dispatch('setTotalWeight', 0)
      this.$store.dispatch('setProductWeight', 0)
      this.$store.dispatch('setJarWeight', 0)
    },
    displayErrorMessage(err) {
      this.$q.notify({
        message: err,
        color: 'primary',
        actions: [{ icon: 'close', color: 'white', round: true, handler: () => {} }],
      })
    },
    openDialog() {
      this.displayDialog = true
    },
    defineWeight(value) {
      this.displayDialog = false
      if (value === 'ALL') {
        this.$store.dispatch('setProductWeight', this.weight - this.jarWeightSaved)
        this.$store.dispatch('setTotalWeight', this.weight)
      } else {
        this.$store.dispatch('setJarWeight', this.weight)
      }
    },
  },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.q-list--bordered {
  border: none;
}
.q-field__input {
  color: white;
}
</style>
