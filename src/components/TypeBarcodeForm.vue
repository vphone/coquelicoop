<template>
  <div class="select-type-barcode">
    <div class="text-h6 title q-mb-sm">
      Sélectionner le type de code barre que vous souhaitez imprimer
    </div>
    <div class="form">
      <q-select
        filled
        class="q-mb-sm"
        v-model="model"
        :options="options"
        emit-value
        @update:model-value="onUpdateValue"
        label="type code barre"
        label-color="white"
      />
      <q-input
        filled
        type="text"
        id="number"
        name="number"
        class="input text-h5 col q-mb-sm"
        v-model="number"
        label="Nombres d'étiquettes à imprimer"
        label-color="white"
        required
        minlength="1"
        placeholder="nombres"
        @click="onClickUnit()"
      />
      <q-input
        v-if="isWeightSelected"
        filled
        type="text"
        id="weight"
        name="weight"
        class="input text-h5 col q-mb-sm"
        v-model="weight"
        label="Poids en g"
        label-color="white"
        required
        minlength="1"
        placeholder="poids"
        @click="onClickWeight()"
      />
    </div>
    <q-dialog ref="dialogKeyboard" @hide="onDialogHide">
      <q-card class="q-dialog-plugin">
        <div class="text-h6 q-px-md q-py-sm">{{ title }}</div>
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
import NumberKeyboard from './keyboard/NumberKeyboard'
import { Scale } from '../app/scaleSerialPort'
const WEIGHT_SELECT = 'Au poids'
const PRICE_SELECT = 'Au prix'
const ORIGIN_SELECT = "code barre d'origine"
const WEIGHT_BUTTON = 'WEIGHT_BUTTON'
const NUMBER_BUTTON = 'NUMBER_BUTTON'
export default {
  name: 'TypeBarcodeForm',
  components: {
    NumberKeyboard,
  },
  data() {
    return {
      scale: null,
      model: WEIGHT_SELECT,
      options: [
        {
          label: WEIGHT_SELECT,
          value: WEIGHT_SELECT,
        },
        {
          label: PRICE_SELECT,
          value: PRICE_SELECT,
        },
        {
          label: ORIGIN_SELECT,
          value: ORIGIN_SELECT,
        },
      ],
      text: null,
      inputName: null,
      weight: 0,
      number: 1,
    }
  },
  computed: {
    isWeightSelected() {
      return this.model === WEIGHT_SELECT
    },
    adminWeight() {
      return this.$store.state.admin.weight
    },
    adminNumber() {
      return this.$store.state.admin.number
    },
    title() {
      return this.inputName === WEIGHT_BUTTON
        ? `Saissez le poids en gramme`
        : `Saisissez le nombre d'étiquette à imprimer`
    },
  },
  watch: {
    adminWeight(value) {
      this.weight = value
    },
    adminNumber(value) {
      this.number = value
    },
  },
  emits: ['hide', 'defineWeight'],
  async mounted() {
    try {
      this.scale = new Scale(process.env.VUE_APP_SCALE, this.getWeight)
      await this.connectScale()
    } catch (err) {
      console.log(err)
    }
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
        this.$store.dispatch('setAdminWeight', this.weight)
      }
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
      if (button === '{ent}' && this.inputName && this.text) {
        switch (this.inputName) {
          case WEIGHT_BUTTON:
            this.$store.dispatch('setAdminWeight', this.text)
            this.weight = this.text
            break
          case NUMBER_BUTTON:
            this.$store.dispatch('setAdminNumber', this.text)
            this.number = this.text
            break
        }
        this.text = null
        this.hide()
      } else if (button === '{close}') {
        this.hide()
      }
    },
    onClickWeight() {
      this.inputName = WEIGHT_BUTTON
      this.show()
    },
    onClickUnit() {
      this.inputName = NUMBER_BUTTON
      this.show()
    },
    onUpdateValue(value) {
      this.$store.dispatch('setAdminType', value)
    },
  },
}
</script>
<style>
.select-type-barcode {
  color: black;
  background-color: #f46c62;
  padding: 8px;
}
.field {
  margin-bottom: 8px;
}
.q-field__label {
  font-weight: bold;
}
</style>
