<template>
  <div class="weights q-my-sm">
    <div class="container">
      <div class="row">
        <div class="col-6 q-pa-xs weights_packaging">
          <q-btn @click="fillWeight" :color="typeWeight === 'PACKAGE' ? 'blue-grey-8' : ''"
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
      <q-dialog ref="dialogKeyboard" @hide="onDialogHide">
      <q-card class="q-dialog-plugin">
        <div class="text-h6 q-px-md q-py-sm">Saisir le poids pour la tare ou [fermer] pour peser votre contenant</div>
        <q-input
          filled
          type="text"
          id="text"
          name="text"
          class="input text-h5 col"
          v-model="text"
          required
          minlength="1"
        />
        <NumberKeyboard @onChange="onChange" @onKeyPress="onKeyPress" :input="text" />
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import { Scale } from '../app/scaleSerialPort'
import NumberKeyboard from './keyboard/NumberKeyboard'

export default {
  name: 'ScaleWeight',
  components: { NumberKeyboard },
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
      weight: 0,
      timeout: null,
      typeWeight: 'ALL',
      text: null
    }
  },
  async mounted() {
    try {
      this.scale = new Scale(process.env.VUE_APP_SCALE, this.getWeight)
      await this.connectScale()
      // await this.disconnectScale()
      // this.resetWeights()
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
      } else if (ecoute && weight > 0) {
        this.ecouteBalance = ecoute
        this.weight = weight
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
    show() {
      this.$refs.dialogKeyboard.show()
    },
    hide() {
      this.$refs.dialogKeyboard.hide()
    },
    onDialogHide() {
      this.$emit('hide')
    },
    onChange(input) {
      this.text = input
    },
    onKeyPress(button) {
      if (button === '{ent}' && this.text) {
        this.$store.dispatch('setPackagingWeight', Number.parseInt(this.text))
        this.text = null
        this.hide()
      } else if (button === '{close}') {
        this.hide()
      }
    },
    fillWeight(){
      this.show()
      this.setTypeWeight('PACKAGE')
    }
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
