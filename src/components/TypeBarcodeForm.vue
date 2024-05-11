<template>
  <div class="select-type-barcode q-pa-md">
    <div class="text-h6 title">
      Sélectionner le type de code barre<br />que vous souhaitez imprimer
    </div>
    <div class="form">
      <q-select
        filled
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
        id="weight"
        name="weight"
        class="input text-h5 col"
        v-model="weight"
        label="Poids en g"
        label-color="white"
        required
        minlength="1"
        placeholder="poids"
        @click="onClickWeight()"
      />
      <q-input
        filled
        type="text"
        id="number"
        name="number"
        class="input text-h5 col"
        v-model="number"
        label="Nombres d'étiquettes à imprimer"
        label-color="white"
        required
        minlength="1"
        placeholder="nombres"
        @click="onClickUnit()"
      />
    </div>
    <q-dialog ref="dialogKeyboard" @hide="onDialogHide" class="">
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
const WEIGHT_SELECT = 'Au poids'
const PRICE_SELECT = 'Au prix'
const WEIGHT_BUTTON = 'WEIGHT_BUTTON'
const NUMBER_BUTTON = 'NUMBER_BUTTON'
export default {
  name: 'TypeBarcodeForm',
  components: {
    NumberKeyboard,
  },
  props: {},
  data() {
    return {
      model: null,
      options: [
        {
          label: WEIGHT_SELECT,
          value: WEIGHT_SELECT,
        },
        {
          label: PRICE_SELECT,
          value: PRICE_SELECT,
        },
      ],
      text: null,
      inputName: null,
    }
  },
  computed: {
    weight() {
      return this.$store.state.admin.weight
    },
    number() {
      return this.$store.state.admin.number
    },
    title() {
      return this.inputName === WEIGHT_BUTTON
        ? `Saissez le poids en gramme`
        : `Saisissez le nombre d'étiquette à imprimer`
    },
  },
  emits: ['hide', 'defineWeight'],
  methods: {
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
            break
          case NUMBER_BUTTON:
            this.$store.dispatch('setAdminNumber', this.text)
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
<style scoped></style>
