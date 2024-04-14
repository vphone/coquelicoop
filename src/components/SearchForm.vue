<template>
  <div class="search">
    <label for="keyword" class="text-body1">Nom du produit </label>
    <input
      type="text"
      id="keyword"
      name="keyword"
      class="input"
      v-model="keyword"
      required
      minlength="1"
      @input="onInputChange"
      placeholder="Tapper ici"
      @click="open = true"
    />

<Teleport to="body">
  <div v-if="open" class="modal row q-pa-lg">
    <SimpleKeyboard class=".shadow-24" @onChange="onChange" @onKeyPress="onKeyPress" :input="keyword" />
    <q-btn color="white" text-color="black" label="FERMER" @click="open = false"/>
  </div>
</Teleport>
    
  </div>
</template>

<script>
import SimpleKeyboard from './SimpleKeyboard'

export default {
  name: 'SearchForm',
  components: {
    SimpleKeyboard,
  },
  data() {
    return {
      open:false,
      keyword: null,
    }
  },
  methods: {
    async searchKeyword() {
      this.open = false
      this.$emit('loading', true)
      await this.$store.dispatch('setProducts', this.keyword)
      this.$emit('loading', false)
    },
    onChange(input) {
      this.keyword = input
    },
    async onKeyPress(button) {
      console.log('button', button)
      if (button === '{ent}' && this.keyword) {
        await this.searchKeyword()
      }
    },
    onInputChange(input) {
      this.keyword = input.target.value
    },
  },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
.simple-keyboard {
  max-width: 850px;
  text-align:center
}
.modal {
  position: fixed;
  z-index: 999;
  bottom: 10%;
  width: 100%;
}
</style>
