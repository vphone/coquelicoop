<template>
  <div class="weights q-my-sm">
    <div class="container">
      <div class="row">
        <div class="col-6 q-pa-xs weights_packaging">
          <q-btn @click="setTypeWeight('PACKAGE')" :color="typeWeight === 'PACKAGE' ? 'blue-grey-8' : ''"
            :text-color="typeWeight === 'PACKAGE' ? 'white' : 'black'">
            <div class=" text-body1 text-center">Poids du contenant :
            </div>
            <div class="text-h6 text-center">{{ packagingWeight }} g</div>
          </q-btn>
        </div>
        <div class="col-6 q-pa-sm weights_product">
          <div class="text-body1 text-center">Poids du produit :</div>
          <div class="text-h6 text-center">{{ productWeight }} g</div>
        </div>
      </div>
      <div class="weights_total q-pa-xs">
        <q-btn class="fit" @click="setTypeWeight('ALL')" :color="typeWeight === 'ALL' ? 'blue-grey-8' : ''"
        :text-color="typeWeight === 'ALL' ? 'white' : 'black'">
          <div class="text-body1 text-left">Poids du brut : </div>
          <div class="text-h6 text-right"> {{ totalWeight }} g</div>
        </q-btn>
      </div>
    </div>
    <SelectPackaging :display-dialog="displayDialog" :weight="weight" @define-weight="defineWeight"
      @hide="displayDialog = false" />
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
      typeWeight: 'ALL'
    }
  },
  async mounted() {
    try {
      this.scale = new Scale(process.env.VUE_APP_SCALE, this.getWeight)
      await this.connectScale()
      // await this.disconnectScale()
      // this.resetWeights()
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
        // this.displayDialog = true
        this.defineWeight()
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
        actions: [{ icon: 'close', color: 'white', round: true, handler: () => { } }],
      })
    },
    setTypeWeight(value) {
      this.typeWeight = value
    },
    defineWeight() {
      this.displayDialog = false
      if (this.typeWeight === 'ALL') {
        this.$store.dispatch('setProductWeight', this.weight - this.packagingWeight)
        this.$store.dispatch('setTotalWeight', this.weight)
      } else if (this.typeWeight === '-10') {
        this.$store.dispatch('setProductWeight', this.weight - 10)
        this.$store.dispatch('setTotalWeight', this.weight)
        this.$store.dispatch('setPackagingWeight', 10)
      } else {
        this.$store.dispatch('setPackagingWeight', this.weight)
      }
    },
  },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
.weights {
  background-color: #7294a1;
}

.weights .div--bordered {
  border: none;
}

.weights .q-field__native {
  color: white;
}

.weights_product {
  border-left: solid 1px black;
}

.weights_total {
  border-top: solid 1px black;
}

button.q-btn {
  text-transform: none;
}
</style>
