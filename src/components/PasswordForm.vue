<template>
  <div>
    <q-toggle v-model="toogleAdmin" label="Admin" @click="displayPasswordDialog" />
    <q-dialog ref="dialogKeyboard" @hide="onDialogHide" class="">
      <q-card class="q-dialog-plugin">
        <div class="text-h6 q-px-md q-py-sm">Saissez le code pour accéder à l'espace admin</div>
        <q-input filled :type="isPassword ? 'password' : 'text'" id="password" name="password" class="input text-h5 col"
          v-model="password" required minlength="1">
          <template v-slot:append>
            <q-icon :name="isPassword ? 'visibility_off' : 'visibility'" class="cursor-pointer"
              @click="isPassword = !isPassword" />
          </template>
        </q-input>
        <NumberKeyboard keyboardClass="password-keyboard" @onChange="onChange" @onKeyPress="onKeyPress"
          :input="password" />
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import NumberKeyboard from './keyboard/NumberKeyboard'
export default {
  name: 'LoginForm',
  components: {
    NumberKeyboard,
  },
  computed: {
    isAdmin() {
      return this.$store.state.admin.status
    },
  },
  data() {
    return {
      password: null,
      toogleAdmin: false,
      isPasswordOk: false,
      isPassword: true,
    }
  },
  methods: {
    show() {
      this.$refs.dialogKeyboard.show()
    },
    hide() {
      this.$refs.dialogKeyboard.hide()
    },
    onDialogHide() {
      if (!this.isPasswordOk) {
        this.toogleAdmin = false
      }
      this.$emit('hide')
    },
    onChange(input) {
      this.password = input
    },
    onKeyPress(button) {
      if (button === '{ent}' && this.password === process.env.VUE_APP_ADMIN_PASSWORD) {
        this.password = null
        this.isPasswordOk = true
        this.toogleAdmin = true
        this.$store.dispatch('setIsAdmin', true)
        this.hide()
      }
      else if (button === '{ent}' && this.password !== process.env.VUE_APP_ADMIN_PASSWORD) {
        this.$q.notify.setDefaults({
          position: 'top',
          timeout: 9000,
          textColor: 'white',
        })
        this.$q.notify({
          message: 'Error de mot de passe incorrect',
          color: 'primary',
          actions: [{ icon: 'close', color: 'white', round: true, handler: () => { } }],
        })
      }
      else if (button === '{close}') {
        this.hide()
        this.toogleAdmin = false
      } else {
        this.toogleAdmin = false
      }
    },
    displayPasswordDialog() {
      if (this.toogleAdmin) {
        this.show()
      } else if (this.isAdmin) {
        this.$store.dispatch('setIsAdmin', false)
        this.isPasswordOk = false
      }
    },
  },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.password-keyboard {
  max-width: 850px;
  font-size: 24px;
  text-align: center;
  width: 100%;
  color: black;
}
</style>
