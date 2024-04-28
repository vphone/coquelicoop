<template>
  <div class="search column">
    <label for="keyword" class="text-subtitle1 col">Nom du produit </label>
    <q-input
      filled
      type="text"
      id="keyword"
      name="keyword"
      class="input text-h5 col"
      v-model="keyword"
      required
      minlength="1"
      placeholder=""
    />
    <SimpleKeyboard class="col" @onChange="onChange" @onKeyPress="onKeyPress" :input="keyword" />
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
      keyword: null,
    }
  },
  methods: {
    async searchKeyword() {
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
        this.keyword = ''
      }
    },
  },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
.search {
  .q-field__input {
    color: white;
  }
}
</style>
