<template>
  <q-dialog ref="dialog" @hide="onDialogHide">
    <q-card class="q-dialog-plugin">
      <div class="text-h6 q-pa-lg title"> Sélectionner le contenant </div>
      <div class="jar row q-pa-lg">
        <q-btn class="col-4" color="white" text-color="black" label="Vide" @click="$emit('defineWeight', 'JAR')">
          <q-img src="../assets/jar-empty.png" class="empty"/>
        </q-btn>
        <q-btn class="col-4 q-ml-lg" color="white" text-color="black" label="Plein" @click="$emit('defineWeight', 'ALL')">
          <q-img src="../assets/jar-full.png" class="full"/>
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
  name: 'SelectJar',
  props: {
    displayDialog: Boolean
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
  border-bottom:1px solid
}
</style>