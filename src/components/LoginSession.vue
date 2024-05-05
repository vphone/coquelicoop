<template>
  <div class="">
    <q-toggle v-model="toogleAdmin" label="Admin" @click="displayPasswordDialog" />
    <q-dialog ref="dialogKeyboard" @hide="onDialogHide" class="">
      <q-card class="q-dialog-plugin">
        <q-input
          filled
          :type="isPassword ? 'password' : 'text'"
          id="password"
          name="password"
          class="input text-h5 col"
          v-model="password"
          required
          minlength="1"
        >
          <template v-slot:append>
            <q-icon
              :name="isPassword ? 'visibility_off' : 'visibility'"
              class="cursor-pointer"
              @click="isPassword = !isPassword"
            />
          </template>
        </q-input>
        <NumberKeyboard
          keyboardClass="login"
          @onChange="onChange"
          @onKeyPress="onKeyPress"
          :input="password"
        />
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import NumberKeyboard from './NumberKeyboard'
export default {
  name: 'ProductsList',
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
<style scoped></style>
