<template>
  <div class="weights">
    <q-list bordered separator>
      <q-item class="row">
        <q-item-section class="text-h6 col-8"> Poids du produit :</q-item-section>
        <q-item-section class="text-h6 text-right row">
          {{ productWeight }}
        </q-item-section>
      </q-item>
      <q-item class="row">
        <q-item-section class="text-h6 col-8">Poids du contenant :</q-item-section>
        <q-item-section class="text-h6 text-right">
          <q-input
            filled
            type="text"
            id="weight"
            name="weight"
            class="input text-h6 col"
            v-model="packagingWeight"
            required
            minlength="1"
            placeholder=""
          />
        </q-item-section>
      </q-item>
      <q-item class="row">
        <q-item-section class="text-h6 col-8"> Poids du brut :</q-item-section>
        <q-item-section class="text-h6 text-right row">
          <q-input
            filled
            type="text"
            id="weight"
            name="weight"
            class="input text-h6 col"
            v-model="totalWeight"
            required
            minlength="1"
            placeholder=""
          />
        </q-item-section>
      </q-item>
    </q-list>
    <SelectPackaging
      :display-dialog="displayDialog"
      :weight="weight"
      @define-weight="defineWeight"
      @hide="displayDialog = false"
    />
  </div>
</template>

<script>
import { Scale } from '../app/scaleSerialPort'
import SelectPackaging from './SelectPackaging.vue'

export default {
  name: 'ScaleWeight',
  components: { SelectPackaging },
  computed: {
    productWeight() {
      return this.$store.state.weights.product
    },
    packagingWeight() {
      return this.$store.state.weights.packaging
    },
    totalWeight() {
      return this.$store.state.weights.total
    },
  },
  data() {
    return {
      scale: null,
      ecouteBalance: null,
      displayDialog: false,
      weight: 0,
      timeout: null,
    }
  },
  async mounted() {
    try {
      this.scale = new Scale(process.env.VUE_APP_SCALE, this.getWeight)
      await this.connectScale()
      //await this.disconnectScale()
      //this.resetWeights()
      // this.displayDialog = true
    } catch (err) {
      console.log(err)
    }
  },
  async unmounted() {
    this.resetWeights()
    await this.disconnectScale()
  },
  methods: {
    async disconnectScale() {
      await this.scale.finEcoute()
    },
    async connectScale() {
      await this.scale.debutEcoute()
    },
    getWeight(ecoute, err, weight) {
      if (err) {
        this.displayErrorMessage(err)
      } else if (weight === 0) {
        this.displayDialog = false
      } else if (ecoute && weight > 0) {
        this.ecouteBalance = ecoute
        this.weight = weight
        this.displayDialog = true
      }
    },
    resetWeights() {
      this.$store.dispatch('setTotalWeight', 0)
      this.$store.dispatch('setProductWeight', 0)
      this.$store.dispatch('setPackagingWeight', 0)
    },
    displayErrorMessage(err) {
      this.$q.notify.setDefaults({
        position: 'bottom',
        timeout: 6000,
        textColor: 'white',
      })
      this.$q.notify({
        message: err,
        color: 'primary',
        actions: [{ icon: 'close', color: 'white', round: true, handler: () => {} }],
      })
    },
    defineWeight(value) {
      this.displayDialog = false
      if (value === 'ALL') {
        this.$store.dispatch('setProductWeight', this.weight - this.packagingWeight)
        this.$store.dispatch('setTotalWeight', this.weight)
      } else if (value === '-10') {
        this.$store.dispatch('setProductWeight', this.weight - 10)
        this.$store.dispatch('setTotalWeight', this.weight)
        this.$store.dispatch('setPackagingWeight', 10)
      } else if (value === '-5') {
        this.$store.dispatch('setProductWeight', this.weight - 5)
        this.$store.dispatch('setTotalWeight', this.weight)
        this.$store.dispatch('setPackagingWeight', 2)
      } else {
        this.$store.dispatch('setPackagingWeight', this.weight)
      }
    },
  },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
.weights .q-list--bordered {
  border: none;
}
.weights .q-field__native {
  color: white;
}
</style>
