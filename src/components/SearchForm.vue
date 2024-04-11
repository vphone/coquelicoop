<template>
  <div class="search">
    <label for="keyword">Nom du produit </label>
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
  <div v-if="open" class="modal">
    <SimpleKeyboard @onChange="onChange" @onKeyPress="onKeyPress" :input="keyword" />
    <input type="button" class="button" value="Search" @click="searchKeyword" :disabled="!keyword"/>
    <button @click="open = false">Fermer</button>
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
    onKeyPress(button) {
      console.log('button', button)
    },
    onInputChange(input) {
      this.keyword = input.target.value
    },
  },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>

h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
.simple-keyboard {
  max-width: 850px;
}
.modal {
  position: fixed;
  z-index: 999;
  bottom: 10%;
  left: 10%;
  width: 100%;
  margin-left: 0px;
}
</style>
