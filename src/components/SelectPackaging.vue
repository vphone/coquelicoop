<template>
  <q-dialog ref="dialog" @hide="onDialogHide" class="packagings">
    <q-card class="q-dialog-plugin">
      <div class="text-h6 q-pa-lg title"> Sélectionner ce qui vous pesez : {{ weight }} g</div>
      <div class="packagings row q-pa-lg justify-center">
        <q-btn class="col-4" color="white" text-color="black" label="Contenant vide"
          @click="$emit('defineWeight', 'PACKAGE')">
          <q-img src="../assets/jar-empty.png" />
        </q-btn>
        <q-btn class="col-4 q-ml-lg" color="white" text-color="black" label="Contenant plein"
          @click="$emit('defineWeight', 'ALL')">
          <q-img src="../assets/jar-full.png" />
        </q-btn>
      </div>
      <div class="packagings row justify-center">__ OU __</div>
      <div class="packagings row q-pa-lg justify-center">
        <q-btn class="col-4" color="white" text-color="black" label="Produit emballé (-10g)"
          @click="$emit('defineWeight', '-10')">
          <q-img src="../assets/plastic.png" />
        </q-btn>
      </div>
      <q-card-actions align="right">
        <q-btn color="primary" label="Annuler" @click="onCancelClick" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
export default {
  name: 'SelectPackaging',
  props: {
    displayDialog: Boolean,
    weight: Number,
  },
  emits: [
    'hide',
    'defineWeight'
  ],
  watch: {
    displayDialog(value) {
      if (value) {
        this.show()
      } else {
        this.hide()
      }
    }
  },
  methods: {
    show() {
      this.$refs.dialog.show()
    },
    hide() {
      this.$refs.dialog.hide()
    },
    onDialogHide() {
      this.$emit('hide')
    },
    onOKClick() {
      this.$emit('ok')
      this.hide()
    },
    onCancelClick() {
      this.hide()
    },
  },
}
</script>
<style scoped>
.title {
  border-bottom: 1px solid grey;
}

button.q-btn {
  text-transform: none;
}
</style>