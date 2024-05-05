<template>
  <div class="q-pa-md select-type-barcode">
    <div class="text-h6 q-pa-lg title">
      Sélectionner le type de code barre<br />que vous souhaitez imprimer
    </div>

    <div class="q-gutter-md">
      <q-select filled v-model="model" :options="options" emit-value @update:model-value="onUpdateValue" label="type code barre" />
    </div>
    <div>
      <q-input
        filled
        type="text"
        id="weight"
        name="weight"
        class="input text-h5 col"
        v-model="weight"
        label="Poids en g"
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
        required
        minlength="1"
        placeholder="nombres"
        @click="onClickUnit()"
      />
    </div>
    <q-dialog ref="dialogKeyboard" @hide="onDialogHide" class="">
      <q-card class="q-dialog-plugin">
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
import NumberKeyboard from './NumberKeyboard'
const WEIGHT_SELECT = 'Au poids'
const PRICE_SELECT = 'Au prix'
const WEIGHT_BUTTON = 'WEIGHT_BUTTON'
const NUMBER_BUTTON = 'NUMBER_BUTTON'
export default {
  name: 'SelectTypeBarcode',
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
      number: 0,
      weight: 0,
      text: null,
      inputName: null,
    }
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
            this.weight = this.text
            this.$store.dispatch('setAdminWeight', this.weight)
            break
          case NUMBER_BUTTON:
            this.number = this.text
            this.$store.dispatch('setAdminNumber', this.number)
            break
        }
        this.text = null
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
    onUpdateValue(value){
      this.$store.dispatch('setAdminType', value)
    }
  },
}
</script>
<style>

</style>
